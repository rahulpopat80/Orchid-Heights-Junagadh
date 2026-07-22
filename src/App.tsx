/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { FlatOwner, UserSession } from './types';
import Login from './components/Login';
import Navbar from './components/Navbar';
import SecurityDashboard from './components/SecurityDashboard';
import ResidentDashboard from './components/ResidentDashboard';
import Directory from './components/Directory';
import AdminPage from './components/AdminPage';
import { api, detectServerEnvironment } from './lib/api';
import { registerFCMToken, subscribeToForegroundMessages } from './lib/firebase';
import firebaseConfig from '../firebase-applet-config.json';

export default function App() {
  const navigate = useNavigate();
  const lastRegisteredRef = useRef<string>('');

  // Session details stored in localStorage for persistent logins
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('orchid_gate_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });


  const [adminSession, setAdminSession] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('orchid_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Master owners list
  const [owners, setOwners] = useState<FlatOwner[]>([]);
  const [loadingOwners, setLoadingOwners] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('directory');

  // Load the full list of flat owners
  const loadOwners = async () => {
    setLoadingOwners(true);
    try {
      await detectServerEnvironment();
      const data = await api.getOwners();
      if (Array.isArray(data)) {
        setOwners(data);
      }
    } catch (error) {
      console.error('Failed to load owners directory:', error);
    } finally {
      setLoadingOwners(false);
    }
  };

  // Fetch owners directory when app boots or session loads, and subscribe in real-time
  useEffect(() => {
    loadOwners();
    
    const unsubscribe = api.subscribeOwners((data) => {
      if (Array.isArray(data)) {
        setOwners(data);
      }
    }, (err) => {
      console.warn('Real-time owners subscription failed, using manual reload fallback:', err);
    });

    return () => unsubscribe();
  }, []);

  // Register service worker and aggressively request Notification permission on startup
  useEffect(() => {
    const setupSW = async () => {
      if (!('serviceWorker' in navigator)) return;

      try {
        // Force-unregister old SW if project changed
        const currentProjectId = firebaseConfig.projectId;
        const cachedProject = localStorage.getItem('orchid_sw_project_id');

        if (cachedProject && cachedProject !== currentProjectId) {
          console.log('[SW] Project changed. Unregistering old service workers...');
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.unregister();
          }
          localStorage.setItem('orchid_sw_project_id', currentProjectId);
        }

        // Always register/update service worker on every page load
        const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          updateViaCache: 'none' // Always fetch fresh SW file, never use cache
        });

        // Force immediate update to pick up latest SW code
        await reg.update();
        console.log('[SW] Service worker registered and updated:', reg.scope);
        localStorage.setItem('orchid_sw_project_id', currentProjectId);

      } catch (err) {
        console.error('[SW] Service worker setup failed:', err);
      }

      // Aggressively request notification permission
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          console.log('[Notifications] Permission result:', perm);
        } else {
          console.log('[Notifications] Permission already:', Notification.permission);
        }
      }
    };

    setupSW();
  }, []);

  // Register FCM token on every app boot when owner is logged in
  // This ensures the device token is always fresh and registered
  useEffect(() => {
    if (session && (session.role === 'owner' || session.role === 'admin') && session.wing && session.flatNo) {
      const setupFCM = async () => {
        // Wait for SW to be ready
        await navigator.serviceWorker.ready;
        
        // Small delay to ensure SW is fully activated
        await new Promise(resolve => setTimeout(resolve, 1500));

        const token = await registerFCMToken(session.wing!, session.flatNo!);
        if (token) {
          console.log('[FCM] Token registered/refreshed for flat', session.wing, session.flatNo, '→', token.substring(0, 20) + '...');
        } else {
          console.warn('[FCM] Failed to get token - notifications may not work. Check browser permissions.');
        }
      };

      setupFCM().catch(err => console.warn('[FCM] Setup error:', err));

      // Subscribe to foreground FCM messages (when app is OPEN)
      const unsubFCM = subscribeToForegroundMessages((payload) => {
        console.log('[FCM Foreground] Message received:', payload);
        // Dispatch an event to update in-app UI badges
        window.dispatchEvent(new CustomEvent('in-app-notification', { detail: payload }));
      });

      // Listener for the 5-Second Undo from the Service Worker
      const handleSWMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'VISITOR_ACTION_UNDOABLE') {
          const { visitorId, status } = event.data;
          
          // 1. Instantly show a toast in your UI
          const toast = document.createElement('div');
          toast.className = "fixed bottom-5 right-5 bg-slate-900 text-white p-4 rounded-xl shadow-2xl z-50 flex items-center gap-4";
          toast.innerHTML = `
            <span>Visitor ${status === 'approved' ? 'Approved' : 'Declined'}.</span>
            <button id="undo-btn-${visitorId}" class="text-indigo-400 font-bold hover:text-indigo-300 transition cursor-pointer">UNDO</button>
            <div class="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-[5000ms] w-full" style="width: 0%;"></div>
          `;
          document.body.appendChild(toast);

          // Start progress bar animation
          setTimeout(() => { if (toast.querySelector('div')) toast.querySelector('div')!.style.width = '100%'; }, 50);

          let isUndone = false;
          document.getElementById(`undo-btn-${visitorId}`)?.addEventListener('click', () => {
            isUndone = true;
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          });

          // 2. Wait 5 seconds. If not undone, commit to DB.
          setTimeout(async () => {
            if (!isUndone && document.body.contains(toast)) {
              document.body.removeChild(toast);
              // Commit to database
              await api.respondToVisitor(visitorId, status);
            }
          }, 5000);
        }
      };

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', handleSWMessage);
      }

      return () => {
        unsubFCM();
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.removeEventListener('message', handleSWMessage);
        }
      };
    }
  }, [session]);

  // Set default tabs based on authenticated roles
  useEffect(() => {
    if (session) {
      if (session.role === 'security') {
        setActiveTab('security');
      } else if (session.role === 'owner' || session.role === 'admin') {
        setActiveTab('resident');
      }
    } else {
      setActiveTab('directory');
    }
  }, [session]);

  // Capture device details for security logs when residents log in
  useEffect(() => {
    if (session && (session.role === 'owner' || session.role === 'admin') && session.wing && session.flatNo) {
      const captureDevice = async () => {
        try {
          const flatKey = `${session.wing}_${session.flatNo}`;
          
          // 1. Get or create unique persistent physical device ID and IMEI SYNCHRONOUSLY first!
          // This absolutely prevents any race conditions during asynchronous public IP address lookups.
          let deviceId = localStorage.getItem('orchid_physical_device_id');
          if (!deviceId) {
            deviceId = `dev_${Math.random().toString(36).substring(2, 11)}_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
            localStorage.setItem('orchid_physical_device_id', deviceId);
          }
          
          // Keep a copy in the legacy keys for backward compatibility
          localStorage.setItem(`orchid_device_uuid_${flatKey}`, deviceId);
          localStorage.setItem('orchid_device_uuid', deviceId);

          let imei = localStorage.getItem('orchid_physical_device_imei');
          if (!imei) {
            imei = '358401' + Math.floor(100000 + Math.random() * 900000) + Math.floor(10 + Math.random() * 90);
            localStorage.setItem('orchid_physical_device_imei', imei);
          }
          localStorage.setItem(`orchid_imei_${deviceId}`, imei);
          localStorage.setItem(`orchid_device_imei_${flatKey}`, imei);

          // 2. Prevent redundant registrations for the exact same session configuration in the same app lifecycle
          const regKey = `${session.wing}_${session.flatNo}_${session.phone || 'no_phone'}_${deviceId}`;
          if (lastRegisteredRef.current === regKey) {
            console.log('[Device Register] Already registered/validated in this session, skipping redundant write.');
            return;
          }
          lastRegisteredRef.current = regKey;

          // 3. Fetch public IP address after synchronous variables are securely persisted in localStorage
          let ipAddress = '127.0.0.1';
          try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            if (data.ip) ipAddress = data.ip;
          } catch {
            try {
              const res = await fetch('https://api64.ipify.org?format=json');
              const data = await res.json();
              if (data.ip) ipAddress = data.ip;
            } catch (e) {
              console.warn('IP lookup failed, using local network IP:', e);
            }
          }

          // 4. Parse OS and Browser details elegantly
          const ua = navigator.userAgent;
          let os = 'Other Device';
          if (/android/i.test(ua)) os = 'Android';
          else if (/iPad|iPhone|iPod/.test(ua)) os = 'iOS';
          else if (/win/i.test(ua)) os = 'Windows';
          else if (/mac/i.test(ua)) os = 'MacOS';
          else if (/linux/i.test(ua)) os = 'Linux';

          let browser = 'Browser';
          if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr/i.test(ua)) browser = 'Chrome';
          else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
          else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
          else if (/edge|edg/i.test(ua)) browser = 'Edge';
          else if (/opr/i.test(ua)) browser = 'Opera';

          const devInfo = {
            deviceId,
            memberId: `mem_${session.wing}_${session.flatNo}_${session.phone || 'owner'}`,
            phoneNumber: session.phone || '',
            wing: session.wing,
            flatNo: session.flatNo,
            browser,
            os,
            imei,
            ipAddress,
            userAgent: ua,
            lastLogin: new Date().toISOString(),
            memberName: session.ownerName || `Flat ${session.wing}-${session.flatNo}`
          };

          await api.registerDevice(session.wing, session.flatNo, devInfo);
          
          // Refresh local directory data after logging device
          const updatedOwners = await api.getOwners();
          if (Array.isArray(updatedOwners)) {
            setOwners(updatedOwners);
          }
        } catch (err) {
          console.error('Device registration error:', err);
        }
      };

      captureDevice();
    }
  }, [session]);

  // Synchronize current user session details to Cache Storage for PWA Service Worker background access
  useEffect(() => {
    if ('caches' in window) {
      if (session && (session.role === 'owner' || session.role === 'admin') && session.wing && session.flatNo) {
        const data = JSON.stringify({
          wing: session.wing,
          flatNo: session.flatNo,
          role: session.role
        });
        caches.open('orchid-user-cache').then((cache) => {
          cache.put('/current-user.json', new Response(data));
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'USER_SESSION_UPDATED' });
          }
        }).catch((err) => console.warn('Cache write failed:', err));
      } else {
        caches.open('orchid-user-cache').then((cache) => {
          cache.delete('/current-user.json');
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'USER_SESSION_UPDATED' });
          }
        }).catch((err) => console.warn('Cache delete failed:', err));
      }
    }
  }, [session]);

  const handleLoginSuccess = (userSession: UserSession) => {
    setSession(userSession);
    localStorage.setItem('orchid_gate_session', JSON.stringify(userSession));
    loadOwners(); // reload fresh directory data
    if (userSession.role === 'security') navigate('/security');
    else if (userSession.role === 'admin') navigate('/admin');
    else navigate('/home');
  };

  const handleLogout = async () => {
    if (session && session.wing && session.flatNo) {
      const flatKey = `${session.wing}_${session.flatNo}`;
      const deviceId = localStorage.getItem('orchid_physical_device_id') || localStorage.getItem(`orchid_device_uuid_${flatKey}`);
      if (deviceId) {
        try {
          await (api as any).deregisterDevice(session.wing, session.flatNo, deviceId);
        } catch (err) {
          console.warn('Failed to deregister device on logout:', err);
        }
      }
    }
    setSession(null);
    localStorage.removeItem('orchid_gate_session');
    setActiveTab('directory');
  };

  // Validate active device registration state (handles admin remote signout)
  useEffect(() => {
    if (session && (session.role === 'owner' || session.role === 'admin') && session.wing && session.flatNo) {
      const validateDeviceSession = async () => {
        try {
          const flatKey = `${session.wing}_${session.flatNo}`;
          let deviceId = localStorage.getItem('orchid_physical_device_id');
          if (!deviceId) {
            deviceId = localStorage.getItem(`orchid_device_uuid_${flatKey}`) || localStorage.getItem('orchid_device_uuid');
          }
          
          if (deviceId) {
            const ownersList = await api.getOwners();
            const myOwner = ownersList.find((o: any) => o.wing === session.wing && o.flatNo === session.flatNo);
            
            if (myOwner) {
              const registeredDevices = myOwner.devices || [];
              const isDeviceRegistered = registeredDevices.some((d: any) => d.deviceId === deviceId);
              
              if (!isDeviceRegistered) {
                console.warn('[Session Security] This device has been signed out.');
                alert('Your session has expired or this device was signed out. Please log in again.');
                handleLogout();
              }
            }
          }
        } catch (err) {
          console.warn('[Session Security] Failed to validate device registration:', err);
        }
      };
      
      // Delay validation slightly to not block page loading
      const checkTimer = setTimeout(validateDeviceSession, 3000);
      return () => clearTimeout(checkTimer);
    }
  }, [session, owners]);

  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <AdminPage
            owners={owners}
            onRefreshOwners={loadOwners}
            adminSession={adminSession}
            setAdminSession={setAdminSession}
          />
        }
      />
      <Route
        path="/*"
        element={
          loadingOwners && owners.length === 0 ? (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center space-y-4">
                <div className="inline-block border-4 border-indigo-600 border-t-transparent rounded-full w-10 h-10 animate-spin"></div>
                <p className="text-sm font-semibold text-slate-600 font-display">Powering up Orchid Heights Gatekeeper...</p>
              </div>
            </div>
          ) : !session ? (
            location.pathname !== '/login' ? (
              <Navigate to="/login" replace />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key="login-page"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <Login onLoginSuccess={handleLoginSuccess} />
                </motion.div>
              </AnimatePresence>
            )
          ) : location.pathname === '/login' ? (
            <Navigate to="/" replace />
          ) : (
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
              {/* Navigation Header */}
              <Navbar
                session={session}
                onLogout={handleLogout}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              {/* Main Layout Stage */}
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                  >
                    {session.role === 'security' ? (
                      <SecurityDashboard
                        owners={owners}
                        onRefreshOwners={loadOwners}
                      />
                    ) : location.pathname === '/directory' ? (
                      <Directory
                        owners={owners}
                        session={session}
                      />
                    ) : (
                      <ResidentDashboard
                        session={session}
                        owners={owners}
                        onRefreshOwners={loadOwners}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </main>

              {/* Footer Branding Panel */}
              <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-500">
                    Orchid Heights Gatekeeper • Smart Visitor Protection Panel
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Developed in high-fidelity full stack. All rights reserved. 
                  </p>
                </div>
              </footer>
            </div>
          )
        }
      />
    </Routes>
  );
}
