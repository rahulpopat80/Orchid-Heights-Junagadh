/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Clock, Search, AlertCircle, CheckCircle2, Trash2, RefreshCw, Layers, Sparkles, QrCode, X, Camera, LogOut, Phone, Users, Dumbbell, XCircle, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FlatOwner, Visitor, DailyHelper } from '../types';
import WebcamCapture from './WebcamCapture';
import { api, detectServerEnvironment } from '../lib/api';
import { collection, onSnapshot, doc, setDoc, updateDoc, db, sendFCMPushToFlat, getDoc } from '../lib/firebase';
import { Html5Qrcode } from 'html5-qrcode';
import GymEntrySection from './GymEntrySection';

const playDecisionSound = (status: string) => {
  if (status === 'expired') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    if (status === 'approved') {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.3);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);
    } else {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220.00, now);
      osc1.frequency.linearRampToValueAtTime(146.83, now + 0.35);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);
    }
  } catch (err) {}
};

interface SecurityDashboardProps {
  owners: FlatOwner[];
  onRefreshOwners: () => void;
}

export default function SecurityDashboard({ owners, onRefreshOwners }: SecurityDashboardProps) {
  const navigate = useNavigate();
  const [dailyHelpers, setDailyHelpers] = useState<DailyHelper[]>([]);
  const [selectedHelperId, setSelectedHelperId] = useState<string | null>(null);

  const [fullName, setFullName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [wing, setWing] = useState<'A' | 'B'>('A');
  const [flatNo, setFlatNo] = useState<number>(101);
  const [reason, setReason] = useState<string>('To deliver products');
  const [guestType, setGuestType] = useState<string>('Delivery');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  useEffect(() => {
    switch(guestType) {
      case 'Delivery': setReason('To deliver products'); break;
      case 'Electrician': setReason('Electrical maintenance & repair'); break;
      case 'Guest': setReason('General Visit'); break;
      case 'Cabinet': setReason('Interior work & carpentry'); break;
      default: setReason('General Visit'); break;
    }
  }, [guestType]);
  const [visitorCount, setVisitorCount] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const [selectedFlats, setSelectedFlats] = useState<string[]>(['A-101']);
  const [flatSearchQuery, setFlatSearchQuery] = useState<string>('');
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState<boolean>(false);

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [logsSearch, setLogsSearch] = useState<string>('');
  const [showStatusAlert, setShowStatusAlert] = useState<Visitor | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [absenceLogs, setAbsenceLogs] = useState<any[]>([]);
  const [activeCallReq, setActiveCallReqState] = useState<{ visitorId: string; step: 'select_member' | 'action'; selectedMemberName?: string } | null>(() => {
    try {
      const stored = localStorage.getItem('security_active_call_req');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return null;
  });

  const setActiveCallReq = (val: { visitorId: string; step: 'select_member' | 'action'; selectedMemberName?: string } | null) => {
    setActiveCallReqState(val);
    if (val) {
      localStorage.setItem('security_active_call_req', JSON.stringify(val));
    } else {
      localStorage.removeItem('security_active_call_req');
    }
  };

  // Pre-Entry QR Scanner states
  const [activeSecTab, setActiveSecTab] = useState<'register' | 'qr_scan' | 'gym_entry'>('register');
  const [manualPassId, setManualPassId] = useState<string>('');
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'expired' | 'used' | 'invalid' | null;
    message: string;
    data?: any;
  }>({ status: null, message: '' });
  const [verifyingPass, setVerifyingPass] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [exitingId, setExitingId] = useState<string | null>(null);

  const handleExitVisitor = async (vId: string) => {
    setExitingId(vId);
    try {
      const res = await api.markVisitorExited(vId);
      if (res.success) {
        fetchVisitors();
      }
    } catch (e) {
      console.error('Failed to exit visitor:', e);
    } finally {
      setExitingId(null);
    }
  };

  const handleCallRespond = async (visitorId: string, status: 'approved' | 'rejected', memberName: string) => {
    try {
      const actionText = status === 'approved' ? 'Approved Through Call' : 'Declined Through Call';
      const respondedByText = `${actionText} (by ${memberName})`;
      const res = await api.respondToVisitor(visitorId, status, respondedByText, status === 'rejected' ? 'Security Call Decline' : '');
      if (res.success) {
        setActiveCallReq(null);
        // Relying on realtime subscription to update the UI
      } else {
        alert('Failed to respond. Please try again.');
      }
    } catch (error) {
      console.error("Call respond error:", error);
      alert('Failed to respond. Please try again.');
    }
  };

  // Helper to extract clean 6-digit numeric pass ID from any raw scanner string
  const extractPassIdFromRaw = (rawInput: string): string => {
    if (!rawInput) return '';
    let str = rawInput.trim();

    if (str.startsWith('{')) {
      try {
        const parsed = JSON.parse(str);
        if (parsed.passId) return String(parsed.passId).trim();
        if (parsed.id) return String(parsed.id).trim();
      } catch (e) {}
    }

    if (str.toUpperCase().includes('PASS:')) {
      str = str.split(/PASS:/i)[1].trim();
    } else if (str.toUpperCase().includes('PASS ID:')) {
      str = str.split(/PASS ID:/i)[1].trim();
    }

    if (str.includes('|')) {
      str = str.split('|')[0].trim();
    }

    const match6 = str.match(/\b\d{6}\b/);
    if (match6) return match6[0];

    return str;
  };

  // Verification Handler for Pre-Entry QR passes
  const handleVerifyPass = async (id: string) => {
    const cleanedId = extractPassIdFromRaw(id);
    if (!cleanedId) return;
    setVerifyingPass(true);
    setScanResult({ status: null, message: '' });
    try {
      const pass = await api.getPreEntryById(cleanedId);
      if (!pass) {
        setScanResult({
          status: 'invalid',
          message: 'ખોટો પાસ આઈડી: આ પાસ આપણી સિસ્ટમમાં નોંધાયેલ નથી! (Invalid Pass ID)'
        });
        playDecisionSound('rejected');
        return;
      }

      if (pass.status === 'Used') {
        setScanResult({
          status: 'used',
          message: `આ પાસ પહેલેથી જ વપરાઈ ચૂક્યો છે! (Pass already scanned and used)`,
          data: pass
        });
        playDecisionSound('rejected');
        return;
      }

      const expiresDate = new Date(pass.expiresAt);
      const isExpired = new Date() > expiresDate;

      if (isExpired || pass.status === 'Expired') {
        setScanResult({
          status: 'expired',
          message: `આ પાસની મર્યાદા પૂરી થઈ ગઈ છે! (Pass Expired) સમય: ${expiresDate.toLocaleString('en-IN')}`,
          data: pass
        });
        playDecisionSound('rejected');
        return;
      }

      // If valid, apply usage & save visitor log
      const ok = await api.usePreEntry(pass.id);
      if (ok) {
        setScanResult({
          status: 'success',
          message: `✅ એન્ટ્રી મંજૂર: ${pass.fullName} માટે પ્રવેશ સફળતાપૂર્વક સ્વીકારવામાં આવ્યો છે! (Access Granted)`,
          data: { ...pass, status: 'Approved' }
        });
        playDecisionSound('approved');
        fetchVisitors(); // refresh list
      } else {
        setScanResult({
          status: 'invalid',
          message: 'પાસ ચકાસવામાં નિષ્ફળતા. કૃપા કરીને ફરીથી પ્રયત્ન કરો.'
        });
        playDecisionSound('rejected');
      }
    } catch (err) {
      console.error(err);
      setScanResult({
        status: 'invalid',
        message: 'ભૂલ આવી. કૃપા કરીને ફરીથી પ્રયત્ન કરો.'
      });
      playDecisionSound('rejected');
    } finally {
      setVerifyingPass(false);
    }
  };

  // Camera scanner activation useEffect
  useEffect(() => {
    if (!isCameraActive || activeSecTab !== 'qr_scan') return;

    let html5QrCode: any = null;
    const timer = setTimeout(() => {
      try {
        html5QrCode = new Html5Qrcode('qr-reader');
        html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            let parsedId = decodedText;
            if (decodedText.includes('Pass ID:')) {
              const lines = decodedText.split('\n');
              const idLine = lines.find(l => l.startsWith('Pass ID:'));
              if (idLine) {
                parsedId = idLine.replace('Pass ID:', '').trim();
              }
            } else if (decodedText.startsWith('{')) {
              try {
                const parsed = JSON.parse(decodedText);
                if (parsed.passId) parsedId = parsed.passId;
                else if (parsed.id) parsedId = parsed.id;
              } catch (e) {}
            }
            
            setIsCameraActive(false);
            if (html5QrCode && html5QrCode.isScanning) {
              html5QrCode.stop().catch((e: any) => console.error(e));
            }
            
            handleVerifyPass(parsedId);
          },
          () => {}
        ).catch((err: any) => {
          console.error('Html5Qrcode start error:', err);
          setScanResult({
            status: 'invalid',
            message: 'કેમેરા શરૂ કરવામાં ભૂલ આવી. કૃપા કરીને પરવાનગી આપો. (Camera Error)'
          });
        });
      } catch (err) {
        console.error('Html5Qrcode init error:', err);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        try {
          html5QrCode.stop().catch((e: any) => console.error(e));
        } catch (e) {}
      }
    };
  }, [isCameraActive, activeSecTab]);

  // IP and IMEI tracking
  const [deviceIp, setDeviceIp] = useState<string>('');
  const [deviceImei, setDeviceImei] = useState<string>('');
  const [translatedMembersMap, setTranslatedMembersMap] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    import('../lib/transliterate').then(({ transliterateToGujarati }) => {
      const runTranslations = async () => {
        if (!owners || owners.length === 0) return;
        const newMap: Record<string, Record<string, string>> = {};
        for (const owner of owners) {
          const key = `${owner.wing}-${owner.flatNo}`;
          newMap[key] = {};
          if (owner.members) {
            for (const mStr of owner.members) {
              const match = mStr.match(/^(.*?)(?:\s*\((.*?)\))?$/);
              if (match) {
                const mName = match[1].trim();
                newMap[key][mName] = await transliterateToGujarati(mName);
              }
            }
          }
        }
        setTranslatedMembersMap(newMap);
      };
      runTranslations();
    }).catch(e => console.error("Could not load transliterate", e));
  }, [owners]);

  useEffect(() => {
    // Fetch public IP securely using ipify API
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(data => setDeviceIp(data.ip))
      .catch(() => setDeviceIp('Unknown IP'));

    // Generate/Retrieve persistent Device Serial Number (IMEI Mock) for browser
    let storedImei = localStorage.getItem('sec_device_imei');
    if (!storedImei) {
      storedImei = 'SN-' + Math.random().toString(36).substring(2, 12).toUpperCase();
      localStorage.setItem('sec_device_imei', storedImei);
    }
    setDeviceImei(storedImei);
  }, []);

  useEffect(() => {
    const unsubscribeHelpers = onSnapshot(collection(db, 'daily_helpers'), (snapshot) => {
      const list: DailyHelper[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as DailyHelper);
      });
      setDailyHelpers(list);
    });

    const unsubscribeAbsence = onSnapshot(collection(db, 'absence_logs'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setAbsenceLogs(list);
    });

    return () => {
      unsubscribeHelpers();
      unsubscribeAbsence();
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await detectServerEnvironment();
      onRefreshOwners();
      await fetchVisitors();
    } catch (error) {} 
    finally {
      setIsRefreshing(false);
    }
  };

  const allSocietyFlats: string[] = [];
  ['A', 'B'].forEach((w) => {
    for (let floor = 1; floor <= 12; floor++) {
      for (let fIdx = 1; fIdx <= 4; fIdx++) {
        allSocietyFlats.push(`${w}-${floor * 100 + fIdx}`);
      }
    }
  });

  const currentOwner = owners.find((o) => o.wing === wing && o.flatNo === flatNo);
  const flatOwnerName = currentOwner && !currentOwner.nameEn.toLowerCase().includes('vacant')
    ? `${currentOwner.nameGu || currentOwner.nameEn}`
    : `Flat ${wing}-${flatNo}`;

  useEffect(() => {
    if (!isMultiSelectOpen && selectedFlats.length <= 1) {
      setSelectedFlats([`${wing}-${flatNo}`]);
    }
  }, [wing, flatNo, isMultiSelectOpen]);

  const fetchVisitors = async () => {
    try {
      const data = await api.getVisitors();
      if (Array.isArray(data)) {
        setVisitors((prev) => {
          data.forEach((newVis: Visitor) => {
            const oldVis = prev.find((v) => v.id === newVis.id);
            if (oldVis && oldVis.status === 'pending' && newVis.status !== 'pending') {
              setShowStatusAlert(newVis);
              playDecisionSound(newVis.status);
            }
          });
          return data;
        });
      }
    } catch (error) {}
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchVisitors();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const unsubscribe = api.subscribeAllVisitors(
      (data) => {
        setVisitors((prev) => {
          data.forEach((newVis: Visitor) => {
            const oldVis = prev.find((v) => v.id === newVis.id);
            if (oldVis && oldVis.status === 'pending' && newVis.status !== 'pending') {
              setShowStatusAlert(newVis);
              playDecisionSound(newVis.status);
            }
          });
          return data;
        });
      },
      () => {}
    );
    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleDeleteVisitor = async (id: string, name: string) => {
    if (!window.confirm(`શું તમે ખરેખર "${name}" ની નોંધ ભૂંસી નાખવા માંગો છો?`)) return;
    try {
      await api.deleteVisitor(id);
      fetchVisitors();
    } catch (error) {
      alert('ભૂલ આવી. ફરી પ્રયાસ કરો.');
    }
  };

  const isDailyHelperType = ['Milkman', 'Maid', 'Vehicle Cleaner', 'Newspaper', 'Care Taker', 'Cook', 'Other Helper'].includes(guestType);

  const mappedHelpers = dailyHelpers.filter((h) => {
    if (guestType === 'Maid') return h.role === 'Maid';
    if (guestType === 'Milkman') return h.role === 'Milkman';
    if (guestType === 'Vehicle Cleaner') return h.role === 'Car Cleaner';
    if (guestType === 'Newspaper') return h.role === 'Newspaper Guy';
    if (guestType === 'Care Taker') return h.role === 'Care Taker';
    if (guestType === 'Cook') return h.role === 'Cook';
    if (guestType === 'Other Helper') return h.role === 'Other';
    return false;
  });

  const handleHelperSelectionChange = (helperId: string) => {
    setSelectedHelperId(helperId);
    if (!helperId || helperId === 'new') {
      setFullName('');
      setMobileNumber('');
      setPhotoUrl('');
      setSelectedFlats([`${wing}-${flatNo}`]);
      return;
    }
    const helper = dailyHelpers.find((h) => h.id === helperId);
    if (helper) {
      setFullName(helper.name);
      setMobileNumber(helper.phone);
      setPhotoUrl(helper.photoUrl || '');
      setSelectedFlats(helper.flats || []);
    }
  };

  const handleRegisterVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !mobileNumber.trim()) {
      setFormError('કૃપા કરીને બધી વિગતો ભરો.');
      return;
    }
    if (selectedFlats.length === 0) {
      setFormError('કૃપા કરીને ઓછામાં ઓછો એક ફ્લેટ પસંદ કરો.');
      return;
    }
    if (!photoUrl) {
      setFormError('મુલાકાતીનો ફોટો લેવો ફરજિયાત છે.');
      return;
    }

    setSubmitting(true);
    try {
      const isBypassed = selectedHelperId && selectedHelperId !== 'new';
      const statusVal = isBypassed ? 'approved' : 'pending';

      for (const flatId of selectedFlats) {
        const parts = flatId.split('-');
        const fWing = parts[0] as 'A' | 'B';
        const fNo = parseInt(parts[1], 10);
        const owner = owners.find((o) => o.wing === fWing && o.flatNo === fNo);
        const ownerName = owner && !owner.nameEn.toLowerCase().includes('vacant')
          ? `${owner.nameGu || owner.nameEn}`
          : `Flat ${fWing}-${fNo}`;

        const visitorId = 'v_' + Math.random().toString(36).substr(2, 9);
        const defaultReason = isDailyHelperType ? `${guestType} Entry` : reason.trim() || 'General Visit';

        const newVisitor: any = {
          id: visitorId,
          fullName: fullName.trim(),
          mobileNumber: mobileNumber.trim(),
          email: email.trim() || '',
          wing: fWing,
          flatNo: fNo,
          reason: defaultReason,
          guestType,
          photoUrl: photoUrl || '',
          status: statusVal,
          requestTime: new Date().toISOString(),
          flatOwnerName: ownerName,
          visitorCount: isDailyHelperType ? 1 : visitorCount,
          ipAddress: deviceIp,
          deviceImei: deviceImei
        };

        let redirectAlert = '';
        let targetWing = fWing;
        let targetFlatNo = fNo;

        try {
          const activeAbs = absenceLogs.find(a => {
            if (a.flatId !== flatId) return false;
            const now = new Date().getTime();
            const from = new Date(a.dateFrom).getTime();
            const to = new Date(a.dateTo).getTime();
            return now >= from && now <= to + (24 * 60 * 60 * 1000 - 1);
          });
          
          if (activeAbs) {
            let redirectFlat = '';
            const gTypeUpper = guestType.toUpperCase();
            if (gTypeUpper.includes('MILK')) {
              redirectFlat = activeAbs.milkRedirectFlat || '';
            } else if (gTypeUpper.includes('NEWSPAPER')) {
              redirectFlat = activeAbs.newspaperRedirectFlat || '';
            } else if (gTypeUpper.includes('DELIVERY') || gTypeUpper.includes('PARCEL') || gTypeUpper.includes('COURIER')) {
              redirectFlat = activeAbs.parcelRedirectFlat || '';
            }
            
            if (redirectFlat) {
              redirectAlert = `🚨 ALERT: Flat ${flatId} is ABSENT / OUT OF STATION!\n\nPlease redirect this ${guestType} to:\n➡️ Flat ${redirectFlat}`;
              const redirectedParts = redirectFlat.split('-');
              if (redirectedParts.length === 2) {
                targetWing = redirectedParts[0] as 'A' | 'B';
                targetFlatNo = parseInt(redirectedParts[1], 10);
              }
            } else {
              redirectAlert = `🚨 ALERT: Flat ${flatId} is ABSENT / OUT OF STATION!\n\nThey are currently marked as absent with no specific redirection for ${guestType}.`;
            }
          }
        } catch (e) {
          console.error("Failed to check absence for flat", flatId);
        }

        if (statusVal === 'approved') {
          newVisitor.respondedTime = new Date().toISOString();
          newVisitor.respondedBy = 'System Auto-Bypass';
        }

        await setDoc(doc(db, 'visitors', visitorId), newVisitor);

        if (redirectAlert) {
          setTimeout(() => alert(redirectAlert), 100);
        }

        if (statusVal === 'pending') {
          await setDoc(doc(db, 'notifications', visitorId), {
            id: visitorId,
            type: 'visitor_request',
            wing: targetWing,
            flatNo: targetFlatNo,
            originalTargetFlat: flatId,
            visitorName: fullName.trim(),
            guestType,
            timestamp: new Date().toISOString(),
            acknowledged: false,
            status: 'pending'
          });

          // Dispatch society-wide notification log for auditing
          api.createSocietyNotification({
            type: 'visitor_request',
            title: `🛡️ Gate Entry Request: ${guestType}`,
            message: `${fullName} requested entry to Flat ${targetWing}-${targetFlatNo}. Awaiting approval.`,
            wing: targetWing,
            flatNo: targetFlatNo
          }).catch(err => console.warn('Failed to log visitor society notification:', err));

          // 🔔 Send FCM push to ALL devices of this flat immediately
          // This is what makes notification arrive even when app is closed
          sendFCMPushToFlat(targetWing, targetFlatNo, {
            title: `🚨 Visitor Entry Request: ${fullName.trim()}`,
            body: `${guestType} - ${defaultReason}\nMobile: ${mobileNumber.trim()}`,
            icon: photoUrl || 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
            data: {
              visitorId: String(visitorId),
              type: 'visitor',
              wing: String(targetWing),
              flatNo: String(targetFlatNo),
              originalTargetFlat: String(flatId),
              fullName: String(fullName.trim()),
              guestType: String(guestType),
              mobileNumber: String(mobileNumber.trim()),
              reason: String(defaultReason)
            }
          }).catch((err: any) => console.warn('[FCM] Push failed for flat:', fWing, fNo, err));
        }
      }

      if (isBypassed && selectedHelperId && selectedHelperId !== 'new') {
        await updateDoc(doc(db, 'daily_helpers', selectedHelperId), {
          flats: selectedFlats
        });
        playDecisionSound('approved');
      }

      if (isDailyHelperType && selectedHelperId === 'new') {
        const newHelperId = 'dh_' + Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, 'daily_helpers', newHelperId), {
           id: newHelperId,
           name: fullName.trim(),
           phone: mobileNumber.trim(),
           role: guestType,
           flats: selectedFlats,
           photoUrl: photoUrl
        });
      }

      setFullName('');
      setMobileNumber('');
      setEmail('');
      setReason('');
      setPhotoUrl('');
      setVisitorCount(1);
      setSelectedHelperId(null);
      setSelectedFlats([`${wing}-${flatNo}`]);

      const trackerSection = document.getElementById('active-tracker');
      if (trackerSection) trackerSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error: any) {
      setFormError('ભૂલ આવી. ફરી પ્રયાસ કરો.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFlatSelection = (flatId: string) => {
    setSelectedFlats((prev) => {
      if (prev.includes(flatId)) return prev.filter((f) => f !== flatId);
      return [...prev, flatId];
    });
  };

  const pendingVisitors = visitors.filter((v) => {
    if (v.status === 'pending' && !v.deletedByResident) {
      const diffMins = (new Date().getTime() - new Date(v.requestTime).getTime()) / 60000;
      return diffMins <= 15;
    }
    return false;
  });
  const resolvedVisitors = visitors.filter((v) => {
    if (v.deletedByResident) return false;
    if (v.status !== 'pending') return true;
    const diffMins = (new Date().getTime() - new Date(v.requestTime).getTime()) / 60000;
    return diffMins > 15;
  });

  const filteredLogs = resolvedVisitors.filter((v) => {
    const q = logsSearch.toLowerCase().trim();
    if (q === '') return true;
    return (
      v.fullName.toLowerCase().includes(q) ||
      v.mobileNumber.includes(q) ||
      `${v.wing}-${v.flatNo}`.toLowerCase().includes(q) ||
      v.reason.toLowerCase().includes(q) ||
      v.guestType.toLowerCase().includes(q)
    );
  });

  const filteredFlatsChecklist = allSocietyFlats.filter((fId) => {
    if (!flatSearchQuery.trim()) return true;
    return fId.toLowerCase().includes(flatSearchQuery.toLowerCase().trim());
  });

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm gap-4">
        <div className="text-left">
          <h1 className="font-display font-bold text-2xl text-slate-800 tracking-tight flex items-center space-x-2">
            <span className="inline-block w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></span>
            <span>ગેટ સિક્યુરિટી કંટ્રોલ પેનલ</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">રહેવાસીઓની પરવાનગી મેળવવા માટેની લાઈવ સુરક્ષા સિસ્ટમ.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
          <button
            type="button"
            onClick={() => {
              setActiveSecTab('register');
              setIsCameraActive(false);
            }}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center space-x-2 transition shadow-sm ${
              activeSecTab === 'register' 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent' 
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>નવી એન્ટ્રી</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSecTab('qr_scan');
              setIsCameraActive(true);
            }}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center space-x-2 transition shadow-sm ${
              activeSecTab === 'qr_scan' 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent' 
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>QR સ્કેનર</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSecTab('gym_entry');
              setIsCameraActive(false);
            }}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center space-x-2 transition shadow-sm ${
              activeSecTab === 'gym_entry' 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent' 
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            <span>GYM એન્ટ્રી</span>
          </button>
          <button
            type="button"
            onClick={() => window.open('/directory', '_blank')}
            className="w-full sm:w-auto bg-slate-100 border border-slate-200 hover:bg-slate-200 active:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center space-x-2 transition shadow-sm"
          >
            <Users className="w-5 h-5" />
            <span>ફ્લેટ ધારકો ની વિગત</span>
          </button>
        </div>
      </div>
      <div className="w-full flex justify-end">
        <PWAInstallButton />
      </div>

      {showStatusAlert && (
        <div className={`fixed inset-x-0 top-16 z-50 p-4 border-b animate-bounce ${
          showStatusAlert.status === 'approved' 
            ? 'bg-emerald-500 border-emerald-600 text-white' 
            : 'bg-red-500 border-red-600 text-white'
        } shadow-lg flex items-center justify-between`}>
          <div className="max-w-4xl mx-auto flex items-center space-x-4 w-full">
            <div className="bg-white p-3 rounded-full text-slate-900 shrink-0 shadow-md text-2xl">
              {showStatusAlert.status === 'approved' ? '✅' : '❌'}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm uppercase font-bold tracking-widest opacity-80">રહેવાસીનો જવાબ</p>
              <h4 className="text-xl font-bold">
                ફ્લેટ {showStatusAlert.wing}-{showStatusAlert.flatNo} એ <span className="underline">{showStatusAlert.status === 'approved' ? 'પ્રવેશ મંજૂર' : 'પ્રવેશ અસ્વીકાર'}</span> કર્યો છે 
                મુલાકાતી: <span className="font-extrabold">{showStatusAlert.fullName}</span> માટે!
              </h4>
            </div>
            <button
              onClick={() => setShowStatusAlert(null)}
              className="bg-white/20 hover:bg-white/35 border border-white/20 text-white font-bold text-lg px-6 py-3 rounded-xl transition"
            >
              સમજાઈ ગયું - ગેટ ખોલો
            </button>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${activeSecTab === 'gym_entry' ? 'xl:grid-cols-1' : 'xl:grid-cols-2'} gap-6 xl:gap-8 items-start`}>
        
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 text-left">
          {activeSecTab === 'register' && (
            <>
              <div className="flex items-center space-x-4 mb-8 border-b border-slate-100 pb-5">
            <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-700">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-slate-800">નવી ગેટ એન્ટ્રી દાખલ કરો</h2>
              <p className="text-base text-slate-500">મુલાકાતીની વિગતો અહીં લખો.</p>
            </div>
          </div>

          {(() => {
            const currentFlatId = `${wing}-${flatNo}`;
            const activeAbs = absenceLogs.find(a => {
              if (a.flatId !== currentFlatId) return false;
              const now = new Date().getTime();
              const from = new Date(a.dateFrom).getTime();
              const to = new Date(a.dateTo).getTime();
              return now >= from && now <= to + (24 * 60 * 60 * 1000 - 1);
            });
            if (!activeAbs) return null;
            return (
              <div className="bg-amber-500 text-white p-4 rounded-2xl mb-6 shadow-md border-2 border-amber-600 space-y-2 animate-pulse">
                <div className="flex items-center space-x-2 font-bold text-lg">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <span>📦 ડિલિવરી નોટિસ: ફ્લેટ {currentFlatId} ગેરહાજર છે!</span>
                </div>
                <p className="text-xs font-semibold leading-relaxed">
                  રહેવાસી {activeAbs.dateFrom} થી {activeAbs.dateTo} સુધી બહાર ગયા છે.
                  {activeAbs.milkRedirectFlat && <span className="block mt-1">🥛 દૂધ ➔ ફ્લેટ {activeAbs.milkRedirectFlat} પર આપો</span>}
                  {activeAbs.newspaperRedirectFlat && <span className="block mt-0.5">📰 છાપું ➔ ફ્લેટ {activeAbs.newspaperRedirectFlat} પર આપો</span>}
                  {activeAbs.parcelRedirectFlat && <span className="block mt-0.5">📦 કુરિયર/પાર્સલ ➔ ફ્લેટ {activeAbs.parcelRedirectFlat} પર આપો</span>}
                </p>
              </div>
            );
          })()}

          {formError && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm flex items-start space-x-2 mb-6 font-bold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleRegisterVisitor} className="space-y-8">
            <WebcamCapture onPhotoCaptured={(base64) => setPhotoUrl(base64)} value={photoUrl} guestType={guestType} />

            {isDailyHelperType && (
              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl space-y-4">
                <div className="flex items-center space-x-2 text-indigo-800">
                  <Sparkles className="w-5 h-5 shrink-0" />
                  <span className="font-bold text-lg">રજિસ્ટર્ડ હેલ્પર ડાયરેક્ટરી</span>
                </div>
                <select
                  value={selectedHelperId || ''}
                  onChange={(e) => handleHelperSelectionChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-base font-bold outline-none"
                >
                  <option value="">-- રજિસ્ટર્ડ હેલ્પર પસંદ કરો --</option>
                  <option value="new" className="text-indigo-600">+ નવો હેલ્પર રજિસ્ટર કરો</option>
                  {mappedHelpers.map((h) => (
                    <option key={h.id} value={h.id}>{h.name} ({h.phone})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">મુલાકાતી નું નામ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="મુલાકાતીનું આખું નામ લખો"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">મોબાઇલ નંબર <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="૧૦-અંકનો મોબાઇલ નંબર લખો"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-lg font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">મુલાકાતી નો પ્રકાર <span className="text-red-500">*</span></label>
                <select
                  value={guestType}
                  onChange={(e) => setGuestType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-lg font-bold"
                >
                  <option value="Delivery">📦 ડિલિવરી / કુરિયર</option>
                  <option value="Guest">👋 મહેમાન / મિત્ર</option>
                  <option value="Electrician">⚡ ઇલેક્ટ્રિશિયન / કામકાજ</option>
                  <option value="Milkman">🥛 દૂધવાળો</option>
                  <option value="Maid">🧹 ઘરઘાટી / કામવાળા</option>
                  <option value="Vehicle Cleaner">🚗 ગાડી સાફ કરવાવાળા</option>
                  <option value="Newspaper">📰 પેપરવાળો</option>
                  <option value="Care Taker">🤝 કેર ટેકર (Care Taker)</option>
                  <option value="Cook">🍳 રસોઇયા (Cook)</option>
                  <option value="Other Helper">🛠️ અન્ય હેલ્પર (Other Helper)</option>
                  <option value="Cabinet">🛠️ સર્વિસ એજન્ટ</option>
                  <option value="Other">👤 અન્ય મુલાકાતી</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">વિંગ <span className="text-red-500">*</span></label>
                  <select
                    value={wing}
                    onChange={(e) => setWing(e.target.value as 'A' | 'B')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-lg font-bold"
                  >
                    <option value="A">વિંગ એ (Wing A)</option>
                    <option value="B">વિંગ બી (Wing B)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ફ્લેટ નંબર <span className="text-red-500">*</span></label>
                  <select
                    value={flatNo}
                    onChange={(e) => setFlatNo(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-lg font-bold"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).flatMap((floor) =>
                      Array.from({ length: 4 }, (_, j) => floor * 100 + (j + 1))
                    ).map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="border border-slate-300 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setIsMultiSelectOpen(!isMultiSelectOpen)}
                className="w-full bg-slate-100 hover:bg-slate-200 py-4 px-5 flex items-center justify-between text-base font-bold text-slate-800 transition"
              >
                <div className="flex items-center space-x-3">
                  <Layers className="w-6 h-6 text-indigo-600" />
                  <span>ફ્લેટ ની પસંદગી કરો</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-sm">{selectedFlats.length} પસંદ કરેલ</span>
                  <span>{isMultiSelectOpen ? '▲' : '▼'}</span>
                </div>
              </button>
              {isMultiSelectOpen && (
                <div className="p-5 space-y-5 bg-white text-left">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="ફ્લેટ શોધો..."
                        value={flatSearchQuery}
                        onChange={(e) => setFlatSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-12 pr-4 text-base outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-1.5 sm:gap-2 max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-2 sm:p-3 bg-slate-50">
                    {filteredFlatsChecklist.map((flatId) => {
                      const isChecked = selectedFlats.includes(flatId);
                      return (
                        <button
                          type="button"
                          key={flatId}
                          onClick={() => toggleFlatSelection(flatId)}
                          className={`py-2 rounded text-xs font-bold border transition-all text-center ${
                            isChecked ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-300 text-slate-700'
                          }`}
                        >
                          {flatId}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Show all selected flat owners */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 w-full sm:w-max sm:min-w-[50%]">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                {selectedFlats.length === 1 ? 'લક્ષ્ય ફ્લેટના માલિક' : `${selectedFlats.length} ફ્લેટ પસંદ - માલિક સૂચિ`}
              </p>
              {selectedFlats.length <= 1 ? (
                <p className="text-lg font-bold text-slate-800">{flatOwnerName}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {selectedFlats.map((fId) => {
                    const parts = fId.split('-');
                    const fWing = parts[0] as 'A' | 'B';
                    const fNo = parseInt(parts[1], 10);
                    const owner = owners.find((o) => o.wing === fWing && o.flatNo === fNo);
                    const oName = owner && !owner.nameEn.toLowerCase().includes('vacant')
                      ? (owner.nameGu || owner.nameEn)
                      : 'Vacant';
                    return (
                      <div key={fId} className="bg-white border border-indigo-100 rounded-xl px-3 py-2 flex items-center space-x-2">
                        <span className="text-[10px] font-black font-mono bg-indigo-600 text-white px-2 py-0.5 rounded">{fId}</span>
                        <span className="text-sm font-bold text-slate-800 truncate">{oName}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>


            {!isDailyHelperType && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">મુલાકાત નું કારણ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">મુલાકાતીઓ ની સંખ્યા <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={visitorCount}
                    onChange={(e) => setVisitorCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-lg font-bold"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg text-base shadow-sm transition flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <span className="inline-block border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
              ) : (
                <span>
                  {selectedHelperId && selectedHelperId !== 'new' ? 'પ્રવેશ મંજૂર કરો' : 'રહેવાસીને પરવાનગી માટે મોકલો'}
                </span>
              )}
            </button>
          </form>
            </>
          )}

          {activeSecTab === 'qr_scan' && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200/60 text-center space-y-4">
                <h3 className="text-xl font-bold text-slate-800">પ્રી-એન્ટ્રી પાસ સ્કેન કરો (Scan Pre-Entry Pass)</h3>
                <p className="text-sm text-slate-500 font-medium">રહેવાસી દ્વારા મોકલવામાં આવેલ સ્માર્ટ પાસનો QR કોડ કેમેરા સામે રાખો અથવા નીચે આઈડી ટાઈપ કરો.</p>
                
                {/* QR Camera Reader Box */}
                <div className="max-w-md mx-auto overflow-hidden rounded-2xl border-2 border-indigo-200 bg-white shadow-inner relative min-h-[250px] flex items-center justify-center">
                  {isCameraActive ? (
                    <div id="qr-reader" className="w-full" />
                  ) : (
                    <div className="py-8 px-4 flex flex-col items-center justify-center space-y-4 w-full">
                      <QrCode className="w-16 h-16 text-slate-300 animate-pulse shrink-0" />
                      <div className="flex flex-col gap-3 w-full max-w-xs">
                        <button
                          type="button"
                          onClick={() => setIsCameraActive(true)}
                          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold px-6 py-3.5 rounded-xl transition shadow text-base flex items-center justify-center space-x-2 w-full"
                        >
                          <QrCode className="w-5 h-5" />
                          <span>લાઈવ કેમેરા સ્કેનર (Live Camera Scanner)</span>
                        </button>
                      </div>
                    </div>
                  )}
                  {isCameraActive && (
                    <button
                      type="button"
                      onClick={() => setIsCameraActive(false)}
                      className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded-full shadow-md z-10"
                      title="કેમેરો બંધ કરો"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Manual Entry */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-left">
                <label className="block text-sm font-bold text-slate-700">મેન્યુઅલ પાસ આઈડી</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={manualPassId}
                    onChange={(e) => setManualPassId(e.target.value)}
                    placeholder="દા.ત. pass_xxxxxx"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-sm sm:text-lg font-bold font-mono w-full"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyPass(manualPassId)}
                    disabled={verifyingPass || !manualPassId.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition shadow flex items-center justify-center sm:min-w-[120px] w-full sm:w-auto"
                  >
                    {verifyingPass ? 'ચકાસણી...' : 'ચકાસો (Verify)'}
                  </button>
                </div>
              </div>

              {/* Scan Results Feedback Modal */}
              {scanResult.status && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl w-full max-w-md relative space-y-5">
                    {/* CLOSE BUTTON IN PASS VISITOR DETAILS */}
                    <button
                      onClick={() => setScanResult({ status: null, message: '' })}
                      className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition cursor-pointer flex items-center justify-center"
                      title="Close Visitor Details"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="text-center space-y-1 pr-8">
                      <span className={`${
                        scanResult.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      } text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase`}>
                        {scanResult.status === 'success' ? 'Verified Pass Details' : 'Pass Declined'}
                      </span>
                      <h3 className="text-lg font-black text-slate-800 uppercase mt-1">
                        {scanResult.data?.fullName || 'Unknown Visitor'}
                      </h3>
                      {scanResult.data && (
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          ફ્લેટની મુલાકાત (Visiting Flat) {scanResult.data.wing}-{scanResult.data.flatNo} ({scanResult.data.flatOwnerName || 'રહેવાસી'})
                        </p>
                      )}
                    </div>
                    
                    <div className="text-center font-bold text-sm text-slate-700 my-2">
                      {scanResult.message}
                    </div>

                    <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md flex items-center justify-center bg-slate-100">
                      {scanResult.data?.photoUrl ? (
                        <img src={scanResult.data.photoUrl} alt="Visitor" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>

                    {scanResult.data && (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2 font-medium">
                        <div className="flex justify-between">
                          <span className="text-slate-400">મુલાકાતીનો પ્રકાર:</span>
                          <span className="font-bold text-slate-800">{scanResult.data.guestType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">મુલાકાતીઓ (Count):</span>
                          <span className="font-bold text-slate-800">{scanResult.data.visitorCount || 1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">મોબાઇલ:</span>
                          <span className="font-mono font-bold text-slate-800">+91 {scanResult.data.mobileNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">કારણ:</span>
                          <span className="font-bold text-slate-800">{scanResult.data.reason || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">સ્થિતિ:</span>
                          <span className={`font-bold ${
                            scanResult.status === 'success' ? 'text-emerald-600' : 'text-red-600'
                          }`}>{scanResult.status === 'success' ? 'મંજૂર (Approved)' : (scanResult.data.status || 'નામંજૂર (Declined)')}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      {/* CLOSE BUTTON AT BOTTOM OF SECTION */}
                      <button
                        onClick={() => setScanResult({ status: null, message: '' })}
                        className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSecTab === 'gym_entry' && (
            <GymEntrySection owners={owners} />
          )}
        </div>

        {activeSecTab !== 'gym_entry' && (
          <div id="active-tracker" className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 text-left h-full">
            <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
            <div>
              <h3 className="font-display font-bold text-2xl text-slate-800">ચાલુ મંજૂરીઓનું લિસ્ટ</h3>
              <p className="text-base text-slate-500 mt-1">મોકલેલી વિનંતીઓની લાઈવ સ્થિતિ.</p>
            </div>
            <span className="bg-amber-100 text-amber-800 border border-amber-300 text-lg font-bold px-4 py-2 rounded-full flex items-center space-x-2">
              <span className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></span>
              <span>{pendingVisitors.length} બાકી</span>
            </span>
          </div>

          {pendingVisitors.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <CheckCircle2 className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
              <p className="text-xl font-bold text-slate-700">કોઈ બાકી વિનંતી નથી</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {pendingVisitors.map((v) => {
                const owner = owners.find(o => o.wing === v.wing && o.flatNo === v.flatNo);
                return (
                  <div key={v.id} className="bg-amber-50 border-l-8 border-amber-500 p-5 rounded-2xl relative animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-4 mb-4">
                        <img src={v.photoUrl} className="w-20 h-20 rounded-xl object-cover bg-slate-200 border-2 border-white shadow-sm" />
                        <div>
                          <span className="text-xl font-bold text-slate-900">{v.fullName}</span>
                          <p className="text-lg text-slate-600 font-bold">ફ્લેટ {v.wing}-{v.flatNo}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-amber-700 font-bold bg-amber-200 py-2 px-4 rounded-xl w-max animate-pulse">
                        <span>રાહ જુઓ...</span>
                      </div>
                    </div>
                    {owner && (
                      (() => {
                        const isOwnerActive = (owner.devices && owner.devices.length > 0) || (owner.members && owner.members.length > 0) || !!owner.secondaryContact;
                        if (!isOwnerActive) return <div className="text-rose-500 font-bold bg-rose-50 px-4 py-2 rounded-xl text-center text-sm border border-rose-100">ફ્લેટ હજુ સક્રિય નથી<br/><span className="text-xs font-normal">Not Signed In</span></div>;
                        const memberOptions: { name: string; phone: string; nameEn: string }[] = [];
                        
                        let ownerNameGu = owner.nameGu || owner.nameEn || 'Owner';
                        if (owner.nameGu || owner.nameEn) {
                          memberOptions.push({ name: ownerNameGu, phone: owner.phone, nameEn: owner.nameEn || ownerNameGu });
                        }
                        
                        const secPhone = owner.secondaryContact ? owner.secondaryContact.replace(/\D/g, '') : '';
                        let secMatchedIndex = -1;
                        
                        const tempMembers: { name: string; phone: string; nameEn: string }[] = [];
                        if (owner.members) {
                          owner.members.forEach((mStr) => {
                            const match = mStr.match(/^(.*?)(?:\s*\((.*?)\))?$/);
                            if (match) {
                              const mName = match[1].trim();
                              const mPhone = match[2]?.trim() || '';
                              tempMembers.push({ name: mName, phone: mPhone, nameEn: mName });
                            }
                          });
                        }
                        
                        if (secPhone) {
                          secMatchedIndex = tempMembers.findIndex(m => m.phone.replace(/\D/g, '') === secPhone);
                        }
                        
                        tempMembers.forEach((m, idx) => {
                          let finalName = m.name;
                          const translations = translatedMembersMap[`${owner.wing}-${owner.flatNo}`];
                          if (translations && translations[m.name]) {
                             finalName = translations[m.name];
                          }
                          if (idx === secMatchedIndex) {
                            finalName = `${finalName} (S)`;
                          }
                          memberOptions.push({ name: finalName, phone: m.phone, nameEn: m.nameEn });
                        });
                        
                        if (secPhone && secMatchedIndex === -1) {
                          memberOptions.push({ name: `${ownerNameGu} (Secondary)`, phone: owner.secondaryContact, nameEn: `${owner.nameEn || 'Owner'} (Secondary)` });
                        }

                        if (activeCallReq?.visitorId === v.id) {
                          const activeMem = memberOptions.find(m => m.name === activeCallReq.selectedMemberName);
                          return (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">સભ્ય પસંદ કરો (Select Member)</p>
                              {memberOptions.map((mem, idx) => {
                                const isSelected = activeCallReq.step === 'action' && activeCallReq.selectedMemberName === mem.name;
                                return (
                                  <a 
                                    key={idx}
                                    href={mem.phone ? `tel:${mem.phone}` : '#'} 
                                    target="_blank" rel="noopener noreferrer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!mem.phone) e.preventDefault();
                                      // Only set action state, let tel: link open the dialer
                                      setTimeout(() => {
                                        setActiveCallReq({ visitorId: v.id, step: 'action', selectedMemberName: mem.name });
                                      }, 300); // 300ms delay to prevent ghost clicks
                                    }}
                                    className={`px-3 py-2 rounded-lg font-semibold flex items-center justify-between transition shadow-sm text-sm ${
                                      isSelected 
                                        ? 'bg-indigo-600 text-white border-2 border-indigo-700' 
                                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                                    }`}
                                  >
                                    <span className="truncate max-w-[120px]">{mem.name}</span>
                                    <div className="flex items-center gap-1">
                                      <span className={`text-[10px] font-mono ${isSelected ? 'text-indigo-200' : 'text-indigo-400'}`}>
                                        {mem.phone || 'No Number'}
                                      </span>
                                      <Phone className="w-4 h-4" />
                                    </div>
                                  </a>
                                );
                              })}

                              {activeCallReq.step === 'action' && (
                                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-fade-in">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase text-center">
                                    રિસ્પોન્સ પસંદ કરો (Select Response)
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button 
                                      onClick={() => handleCallRespond(v.id, 'approved', activeMem ? activeMem.nameEn : 'Unknown')}
                                      className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-1 transition shadow-sm text-xs"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>મંજૂર કરો</span>
                                    </button>
                                    <button 
                                      onClick={() => handleCallRespond(v.id, 'rejected', activeMem ? activeMem.nameEn : 'Unknown')}
                                      className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-1 transition shadow-sm text-xs"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      <span>નામંજૂર</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              <button 
                                onClick={() => setActiveCallReq(null)}
                                className="text-xs text-slate-500 mt-2 underline text-center"
                              >
                                રદ કરો (Cancel)
                              </button>
                            </div>
                          );
                        }

                        // Default state
                        return (
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <button
                              onClick={() => setActiveCallReq({ visitorId: v.id, step: 'select_member' })}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition shadow-sm"
                            >
                              <Phone className="w-5 h-5" />
                              <span>કોલ કરો (Call)</span>
                            </button>
                          </div>
                        );
                      })()
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== TODAY'S COMPLETED GATE ENTRIES FOR SECURITY ===== */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-800">આજના પૂર્ણ થયેલ પ્રવેશ</h3>
                <p className="text-sm text-slate-500 mt-1">આજના બધા મંજૂર કે અસ્વીકાર થયેલ મુલાકાતીઓ.</p>
              </div>
              <span className="bg-indigo-150 text-indigo-800 border border-indigo-200 text-sm font-bold px-3 py-1.5 rounded-full">
                {filteredLogs.filter(v => {
                  const todayStr = new Date().toDateString();
                  return new Date(v.requestTime).toDateString() === todayStr;
                }).length} મુલાકાતીઓ
              </span>
            </div>

            {/* Logs Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="નામ, ફોન કે ફ્લેટ નંબરથી શોધો..."
                value={logsSearch}
                onChange={(e) => setLogsSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            {filteredLogs.filter(v => {
              const todayStr = new Date().toDateString();
              return new Date(v.requestTime).toDateString() === todayStr;
            }).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">આજે હજી સુધી કોઈ વિનંતી પૂરી થઈ નથી.</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {filteredLogs.filter(v => {
                  const todayStr = new Date().toDateString();
                  return new Date(v.requestTime).toDateString() === todayStr;
                }).map((v) => {
                  const isApprovedEntry = v.status === 'approved' || v.status === 'Entered' || v.isPreEntry;
                  const isExpired = v.status === 'pending';
                  return (
                    <div 
                      key={v.id} 
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm ${
                        isApprovedEntry ? 'border-emerald-200 bg-emerald-50/30' : 
                        isExpired ? 'border-amber-200 bg-amber-50/30' : 'border-red-200 bg-red-50/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img src={v.photoUrl || 'https://i.ibb.co/zT5tpcdY/1000296229-1.png'} className="w-12 h-12 rounded-lg object-cover bg-slate-200 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-slate-800 truncate">{v.fullName}</p>
                            {v.isPreEntry && (
                              <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                                Pass (Pre-Entry)
                              </span>
                            )}
                            {v.respondedBy?.includes('Through Call') && (
                              <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                                Call
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            ફ્લેટ {v.wing}-{v.flatNo} • {v.guestType} • {new Date(v.requestTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {v.respondedBy && (
                            <p className="text-[10px] text-indigo-600 font-bold mt-1">
                              Response: {v.respondedBy}
                            </p>
                          )}
                          {v.exited && (
                            <p className="text-[11px] text-slate-600 font-semibold mt-1 flex items-center gap-1">
                              <LogOut className="w-3 h-3 text-rose-500 inline shrink-0" />
                              બહાર આવ્યા: {new Date(v.exitTime!).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} (રોકાણ સમય: {v.duration || 'N/A'})
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          isApprovedEntry ? 'bg-emerald-100 text-emerald-800' : 
                          v.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isApprovedEntry ? 'મંજૂર' : v.status === 'pending' ? 'EXPIRED' : 'અસ્વીકાર'}
                        </span>

                        {isApprovedEntry && !v.exited && (
                          <button
                            type="button"
                            onClick={() => handleExitVisitor(v.id)}
                            disabled={exitingId === v.id}
                            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow flex items-center gap-1"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            {exitingId === v.id ? 'પ્રોસેસ...' : 'બહાર ગયા (Exit)'}
                          </button>
                        )}

                        {v.exited && (
                          <span className="bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            ✓ Exited
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}



function PWAInstallButton() {
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }
  }, []);

  if (isInstalled) return null;

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) {
      const isIos = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase());
      if (isIos) {
        alert("Apple iOS does not allow direct WebApp downloads. To install on iPhone/iPad, you MUST tap the Share icon at the bottom of your screen and select 'Add to Home Screen'.");
      } else {
        alert("Native install prompt is not available right now. This usually means the app is already installed, or you are viewing it inside a preview window. Please open the app in a new dedicated browser tab to download it, or use the browser menu 'Add to Home Screen'.");
      }
      return;
    }
    // Show the install prompt
    promptEvent.prompt();
    // Wait for the user to respond to the prompt
    await promptEvent.userChoice;
    // We've used the prompt, and can't use it again, throw it away
    (window as any).deferredPrompt = null;
  };

  return (
    <button
      onClick={handleInstallClick}
      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors shadow-sm flex items-center justify-center space-x-2 mt-4"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
      </svg>
      <span>Download WebApp (PWA)</span>
    </button>
  );
}
