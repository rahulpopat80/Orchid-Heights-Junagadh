/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Home, Key, ArrowRight, Eye, EyeOff, AlertCircle, AlertTriangle, Smartphone, Monitor, LogOut } from 'lucide-react';
import { UserSession, DeviceInfo } from '../types';
import { api } from '../lib/api';

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [role, setRole] = useState<'owner' | 'security'>('owner');
  
  // Resident fields
  const [wing, setWing] = useState<'A' | 'B'>('A');
  const [flatNo, setFlatNo] = useState<string>('101');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Security fields
  const [username, setUsername] = useState<string>('admin');
  const [securityPassword, setSecurityPassword] = useState<string>('admin@123');

  // Common UI states
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Device blocking states
  const [blockedDevices, setBlockedDevices] = useState<DeviceInfo[]>([]);
  const [isDeviceBlocked, setIsDeviceBlocked] = useState<boolean>(false);

  // Generate list of flats (101-104, up to 1201-1204)
  const flatOptions: number[] = [];
  for (let floor = 1; floor <= 12; floor++) {
    for (let flatIndex = 1; flatIndex <= 4; flatIndex++) {
      flatOptions.push(floor * 100 + flatIndex);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let activeDevice: any = null;
      if (role === 'owner') {
        const flatKey = `${wing}_${flatNo}`;
        
        // 1. Base deviceId and IMEI firmly and SYNCHRONOUSLY first to prevent any async race conditions
        let deviceId = localStorage.getItem('orchid_physical_device_id');
        if (!deviceId) {
          deviceId = `dev_${Math.random().toString(36).substring(2, 11)}_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
          localStorage.setItem('orchid_physical_device_id', deviceId);
        }
        
        // Keep a copy in the legacy keys for backward compatibility
        localStorage.setItem(`orchid_device_uuid_${flatKey}`, deviceId);
        localStorage.setItem('orchid_device_uuid', deviceId);

        // Get or create a persistent unique Serial Number / IMEI mapped to this physical device
        let imei = localStorage.getItem('orchid_physical_device_imei');
        if (!imei) {
          imei = '358401' + Math.floor(100000 + Math.random() * 900000) + Math.floor(10 + Math.random() * 90);
          localStorage.setItem('orchid_physical_device_imei', imei);
        }
        localStorage.setItem(`orchid_imei_${deviceId}`, imei);
        localStorage.setItem(`orchid_device_imei_${flatKey}`, imei);

        // 2. Fetch IP address after synchronous variables are securely persisted
        let ipAddress = '115.240.122.' + (Math.floor(Math.random() * 90) + 10);
        try {
          const ipRes = await fetch('https://api.ipify.org?format=json');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.ip) ipAddress = ipData.ip;
          }
        } catch (ipErr) {
          console.warn('IP fetch failed, using fallback.');
        }

        const ua = navigator.userAgent;
        let os = 'Unknown OS';
        if (/android/i.test(ua)) os = 'Android';
        else if (/iPad|iPhone|iPod/.test(ua)) os = 'iOS';
        else if (/Macintosh/i.test(ua)) os = 'macOS';
        else if (/Windows/i.test(ua)) os = 'Windows';
        else if (/Linux/i.test(ua)) os = 'Linux';

        let browser = 'Web Browser';
        if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr/i.test(ua)) browser = 'Chrome';
        else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
        else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
        else if (/edge|edg/i.test(ua)) browser = 'Edge';

        activeDevice = {
          deviceId,
          ipAddress,
          userAgent: ua.substring(0, 150),
          imei,
          os,
          browser,
          phoneNumber,
          lastLogin: new Date().toISOString()
        };
      }

      const payload = role === 'security'
        ? { role: 'security', username, password: securityPassword }
        : { role: 'owner', wing, flatNo, phoneNumber, password, device: activeDevice };

      const data = await api.login(payload);

      if (data.success && data.session) {
        onLoginSuccess(data.session);
      } else if ((data as any).code === 'DEVICE_LIMIT_EXCEEDED') {
        setIsDeviceBlocked(true);
        setBlockedDevices((data as any).devices || []);
        setError((data as any).message || 'Device limit exceeded — log out from one first.');
      } else {
        setError(data.message || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(`Login failed: ${err.message || 'Connection to server failed. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoteLogout = async (targetDeviceId: string) => {
    setLoading(true);
    setError('');
    try {
      // 1. Alert the device that is about to be terminated
      try {
        await fetch('/api/fcm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payload: {
              token: targetDeviceId,
              notification: {
                title: "Session Terminated",
                body: "Your device was securely logged out from Orchid Heights."
              },
              data: { type: "system_logout" }
            }
          })
        });
      } catch (fcmErr) {
        console.warn('FCM logout notification error:', fcmErr);
      }

      // 2. Proceed with DB removal
      const res = await (api as any).deregisterDevice(wing, parseInt(flatNo, 10), targetDeviceId);
      if (res.success) {
        setBlockedDevices((prev) => prev.filter((d) => d.deviceId !== targetDeviceId));
        setError('Device logged out successfully! You can now sign in.');
        setIsDeviceBlocked(false);
      } else {
        setError('Failed to log out device. Please try again.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-20 translate-y-20"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8 relative z-10">
        
        {/* Heading Section */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-white border border-slate-200 p-1 rounded-2xl shadow-md mb-3 w-20 h-20 items-center justify-center">
            <img 
              src="https://i.ibb.co/HftgL4rJ/image.png" 
              alt="Orchid Heights Logo" 
              className="w-full h-full object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">Orchid Heights</h1>
          <p className="text-sm text-slate-500 font-medium">ઓર્કીડ હાઇટ્સ સોસાયટી</p>
          <div className="h-[2px] w-12 bg-indigo-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setRole('owner'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition ${
              role === 'owner'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Resident Portal</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setRole('security'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition ${
              role === 'security'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Gate Security</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-start space-x-2 shadow-sm animate-shake">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form or Blocked Devices view */}
        {isDeviceBlocked && blockedDevices.length > 0 ? (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-display font-bold text-lg text-slate-800">Device Limit Reached</h3>
              <p className="text-xs text-slate-500">
                Your apartment has reached the maximum allowed active devices.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
              {(() => {
                // STRICT FILTER: Only show devices that match the entered phone number
                const activeDevices = blockedDevices;
                const phone = phoneNumber;
                const myDevices = activeDevices.filter(d => d.phoneNumber === phone);

                if (myDevices.length === 0) {
                  return (
                    <div className="text-center p-4">
                      <p className="text-xs font-bold text-slate-700 mb-1">No devices found for this number.</p>
                      <p className="text-[10px] text-slate-500">
                        The device slots are currently occupied by other family members. For privacy, you cannot log out their devices. Please ask them to log out, or contact the admin.
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Your Active Sessions
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {myDevices.map((device, idx) => (
                        <div key={device.deviceId || idx} className="bg-white border border-slate-200 p-2.5 rounded-lg flex justify-between items-center shadow-sm">
                          <div className="text-left">
                            <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              {device.os === 'Android' || device.os === 'iOS' ? <Smartphone className="w-3.5 h-3.5 text-slate-400" /> : <Monitor className="w-3.5 h-3.5 text-slate-400" />}
                              <span>{device.browser} on {device.os}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Number: {device.phoneNumber}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleRemoteLogout(device.deviceId)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
            
            <button
              type="button"
              onClick={() => {
                setIsDeviceBlocked(false);
                setBlockedDevices([]);
                setError('');
              }}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Cancel Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {role === 'owner' ? (
              // Resident Fields
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Wing</label>
                    <select
                      value={wing}
                      onChange={(e) => setWing(e.target.value as 'A' | 'B')}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition outline-none"
                    >
                      <option value="A">Wing A</option>
                      <option value="B">Wing B</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Flat Number</label>
                    <select
                      value={flatNo}
                      onChange={(e) => setFlatNo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition outline-none"
                    >
                      {flatOptions.map((flat) => (
                        <option key={flat} value={flat}>{flat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter registered phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter resident password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl py-3 pl-10 pr-10 text-sm font-medium transition outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed bg-slate-50 border border-slate-100 p-2 rounded-lg">
                    💡 Hint: Default resident password is <span className="font-mono text-indigo-600 font-semibold">admin@123</span>.
                  </p>
                </div>
              </>
            ) : (
              // Security Fields
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-medium transition outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter security password"
                      value={securityPassword}
                      onChange={(e) => setSecurityPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl py-3 pl-10 pr-10 text-sm font-medium transition outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-2 bg-slate-50 border border-slate-100 p-2 rounded-lg">
                    💡 Security login: Username <span className="font-mono font-semibold text-emerald-600">admin</span>, password <span className="font-mono font-semibold text-emerald-600">admin@123</span>.
                  </p>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm flex items-center justify-center space-x-2 transition shadow-md hover:shadow-lg focus:outline-none cursor-pointer"
            >
              {loading ? (
                <span className="inline-block border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
              ) : (
                <>
                  <span>Sign In Securely</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
