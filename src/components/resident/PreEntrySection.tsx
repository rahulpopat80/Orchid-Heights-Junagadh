/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  QrCode, Plus, Clock, Download, Clipboard, CheckCircle, AlertCircle, 
  Trash2, ArrowRight, ShieldCheck, Share2, Calendar, User, Phone, 
  Layers, RefreshCw, FileText
} from 'lucide-react';
import { api } from '../../lib/api';
import { PreEntry, UserSession } from '../../types';
import WebcamCapture from '../WebcamCapture';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

interface PreEntrySectionProps {
  wing: 'A' | 'B';
  flatNo: number;
  session: UserSession;
}

export default function PreEntrySection({ wing, flatNo, session }: PreEntrySectionProps) {
  // Lists & State
  const [preEntries, setPreEntries] = useState<PreEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedPass, setSelectedPass] = useState<PreEntry | null>(null);
  const [selectedPassQR, setSelectedPassQR] = useState<string>('');

  // Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [guestType, setGuestType] = useState<string>('Guest');
  const [reason, setReason] = useState<string>('General Visit');
  const [visitorCount, setVisitorCount] = useState<number>(1);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<PreEntry | null>(null);

  // Device Info for Pre-Entry Metadata
  const [ipAddress, setIpAddress] = useState<string>('Unknown IP');
  const [deviceImei, setDeviceImei] = useState<string>('N/A');

  // Load IP and IMEI on mount
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => setIpAddress('Unknown IP'));

    const localImei = localStorage.getItem('orchid_physical_device_imei') || 
                      localStorage.getItem('orchid_device_uuid') || 
                      'N/A';
    setDeviceImei(localImei);
  }, []);

  // Set default reason based on visitor type
  useEffect(() => {
    switch (guestType) {
      case 'Delivery': setReason('To deliver products'); break;
      case 'Electrician': setReason('Electrical maintenance & repair'); break;
      case 'Guest': setReason('General Visit'); break;
      case 'Cabinet': setReason('Interior work & carpentry'); break;
      case 'Milkman': setReason('To deliver milk'); break;
      case 'Maid': setReason('Household Help'); break;
      default: setReason('General Visit'); break;
    }
  }, [guestType]);

  // Load pre-entry records
  const fetchRecords = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const records = await api.getPreEntries(wing, flatNo);
      // Sort by creation date descending
      records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPreEntries(records);
    } catch (err) {
      console.error('Failed to load pre-entry records:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [wing, flatNo]);

  // Live countdown update trigger
  const [timeTicker, setTimeTicker] = useState<number>(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTicker(prev => prev + 1);
    }, 30000); // refresh timer calculations every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Compute countdown timer string
  const getCountdownText = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    if (diff <= 0) return { expired: true, text: 'Expired' };
    
    const totalMinutes = Math.floor(diff / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return {
      expired: false,
      text: `${hours}h ${minutes}m left`
    };
  };

  // Generate a detailed text block to be encoded inside the QR code
  const getQRText = (entry: PreEntry) => {
    const expiresDate = new Date(entry.expiresAt);
    const expDateStr = expiresDate.toLocaleDateString('en-IN');
    const expTimeStr = expiresDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    return `ORCHID HEIGHTS GATE PASS
Pass ID: ${entry.id}
Visitor: ${entry.fullName}
Type: ${entry.guestType}
Reason: ${entry.reason}
Count: ${entry.visitorCount}
Flat: ${entry.wing}-${entry.flatNo}
Created By: ${entry.householdMemberName}
Expires: ${expDateStr} ${expTimeStr}`;
  };

  // Generate and set QR Data URI for selected/success pass
  const loadQR = async (entry: PreEntry) => {
    try {
      const qrText = getQRText(entry);
      const url = await QRCode.toDataURL(qrText, {
        width: 300,
        margin: 1,
        color: {
          dark: '#0f172a', // Slate 900
          light: '#ffffff'
        }
      });
      setSelectedPassQR(url);
    } catch (err) {
      console.error('Failed to generate QR Code:', err);
    }
  };

  const handleCreatePreEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!fullName.trim()) {
      setFormError('Please enter the visitor\'s full name. (કૃપા કરીને મુલાકાતીનું આખું નામ લખો.)');
      return;
    }
    if (!mobileNumber.trim()) {
      setFormError('Please enter a mobile number. (કૃપા કરીને મોબાઇલ નંબર લખો.)');
      return;
    }
    if (!reason.trim()) {
      setFormError('Please enter the reason to visit. (કૃપા કરીને મુલાકાતનું કારણ લખો.)');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        guestType,
        reason,
        visitorCount,
        photoUrl: photoUrl || '',
        wing,
        flatNo,
        ownerName: session.ownerName || `Flat ${wing}-${flatNo}`,
        householdMemberName: session.ownerName || `Flat ${wing}-${flatNo}`,
        ipAddress,
        deviceImei
      };

      const record = await api.createPreEntry(payload);
      if (record) {
        // Reset Form fields
        setFullName('');
        setMobileNumber('');
        setPhotoUrl('');
        setVisitorCount(1);
        
        // Show success modal & reload list
        setShowSuccessModal(record);
        await loadQR(record);
        fetchRecords(false);
      } else {
        setFormError('Failed to create Pre-Entry. Please try again.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to load logo image
  const getLogoBase64 = async (): Promise<string | null> => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      return await new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = 'https://i.ibb.co/zT5tpcdY/1000296229-1.png';
      });
    } catch (e) {
      return null;
    }
  };

  // Download pass as a clean styled PDF
  const downloadPDFPass = async (entry: PreEntry) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 160] // custom card dimensions (100mm wide, 160mm tall)
    });

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 100, 160, 'F');

    // Outer border decoration
    doc.setDrawColor(79, 70, 229); // indigo-600
    doc.setLineWidth(1.5);
    doc.roundedRect(4, 4, 92, 152, 4, 4, 'D');

    // Header strip background - Slate 900 for dark luxury contrast
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(5, 5, 90, 24, 3, 3, 'F');

    // Pink accent bar
    doc.setFillColor(216, 27, 96);
    doc.rect(5, 27, 90, 2, 'F');

    // Logo image
    const logoBase64 = await getLogoBase64();
    if (logoBase64) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(7, 6, 20, 20, 3, 3, 'F');
      doc.addImage(logoBase64, 'PNG', 8, 7, 18, 18);
    }

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('ORCHID HEIGHTS', logoBase64 ? 56 : 50, 14, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(226, 232, 240);
    doc.text('OFFICIAL VISIT PRE-ENTRY PASS', logoBase64 ? 56 : 50, 19, { align: 'center' });

    // Visitor Details
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(entry.fullName.toUpperCase(), 50, 36, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont('helvetica', 'normal');
    doc.text(`Mobile: ${entry.mobileNumber}`, 50, 41, { align: 'center' });

    // Key stats labels and values
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(10, 45, 90, 45);

    let currY = 51;
    const drawRow = (label: string, val: string) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(label, 12, currY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(val, 88, currY, { align: 'right' });
      currY += 6.5;
    };

    drawRow('Visitor Type:', entry.guestType.toUpperCase());
    drawRow('Reason for Visit:', entry.reason);
    drawRow('Visitors Count:', String(entry.visitorCount));
    drawRow('Target Flat:', `Wing ${entry.wing} - Flat ${entry.flatNo}`);
    drawRow('Invited By:', entry.householdMemberName);

    doc.line(10, currY - 2, 90, currY - 2);

    // QR Code rendering
    if (selectedPassQR) {
      doc.addImage(selectedPassQR, 'PNG', 30, currY + 2, 40, 40);
    }

    // Expiration Details
    const expiresDate = new Date(entry.expiresAt);
    const expDateStr = expiresDate.toLocaleDateString('en-IN');
    const expTimeStr = expiresDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38); // red-600
    doc.text(`VALID UNTIL: ${expDateStr} • ${expTimeStr}`, 50, currY + 46, { align: 'center' });

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`PASS ID: ${entry.id} | Orchid Heights Gatekeeper`, 50, currY + 51, { align: 'center' });

    doc.save(`GatePass_OrchidHeights_${entry.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  // Share pass as a clean styled PDF using navigator.share
  const sharePDFPass = async (entry: PreEntry) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 160] // custom card dimensions (100mm wide, 160mm tall)
    });

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 100, 160, 'F');

    // Outer border decoration
    doc.setDrawColor(79, 70, 229); // indigo-600
    doc.setLineWidth(1.5);
    doc.roundedRect(4, 4, 92, 152, 4, 4, 'D');

    // Header strip background - Slate 900
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(5, 5, 90, 24, 3, 3, 'F');

    // Pink accent bar
    doc.setFillColor(216, 27, 96);
    doc.rect(5, 27, 90, 2, 'F');

    // Logo image
    const logoBase64 = await getLogoBase64();
    if (logoBase64) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(7, 6, 20, 20, 3, 3, 'F');
      doc.addImage(logoBase64, 'PNG', 8, 7, 18, 18);
    }

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('ORCHID HEIGHTS', logoBase64 ? 56 : 50, 14, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(226, 232, 240);
    doc.text('OFFICIAL VISIT PRE-ENTRY PASS', logoBase64 ? 56 : 50, 19, { align: 'center' });

    // Visitor Details
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(entry.fullName.toUpperCase(), 50, 36, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont('helvetica', 'normal');
    doc.text(`Mobile: ${entry.mobileNumber}`, 50, 41, { align: 'center' });

    // Key stats labels and values
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(10, 45, 90, 45);

    let currY = 51;
    const drawRow = (label: string, val: string) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(label, 12, currY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(val, 88, currY, { align: 'right' });
      currY += 6.5;
    };

    drawRow('Visitor Type:', entry.guestType.toUpperCase());
    drawRow('Reason for Visit:', entry.reason);
    drawRow('Visitors Count:', String(entry.visitorCount));
    drawRow('Target Flat:', `Wing ${entry.wing} - Flat ${entry.flatNo}`);
    drawRow('Invited By:', entry.householdMemberName);

    doc.line(10, currY - 2, 90, currY - 2);

    // QR Code rendering
    if (selectedPassQR) {
      doc.addImage(selectedPassQR, 'PNG', 30, currY + 2, 40, 40);
    }

    // Expiration Details
    const expiresDate = new Date(entry.expiresAt);
    const expDateStr = expiresDate.toLocaleDateString('en-IN');
    const expTimeStr = expiresDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38); // red-600
    doc.text(`VALID UNTIL: ${expDateStr} • ${expTimeStr}`, 50, currY + 46, { align: 'center' });

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`PASS ID: ${entry.id} | Orchid Heights Gatekeeper`, 50, currY + 51, { align: 'center' });

    const filename = `GatePass_OrchidHeights_${entry.fullName.replace(/\s+/g, '_')}.pdf`;
    
    try {
      if (navigator.share) {
        const pdfBlob = doc.output('blob');
        const file = new File([pdfBlob], filename, { type: 'application/pdf' });
        
        const shareData = {
          files: [file],
          title: `Gate Pass - ${entry.fullName}`,
          text: `Hi ${entry.fullName}, here is your Pre-Approved Gate Entry Pass for Orchid Heights. Pass ID is ${entry.id}. Please show this to the security guard.`
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share(shareData);
          return;
        }
        
        // Fallback text sharing if file sharing is not supported by device
        await navigator.share({
          title: `Gate Pass - ${entry.fullName}`,
          text: `*ORCHID HEIGHTS GATE PASS*\nVisitor: ${entry.fullName}\nPass ID: ${entry.id}\nWing: ${entry.wing}, Flat No: ${entry.flatNo}\nValid Until: ${expDateStr} • ${expTimeStr}\n\nPlease show this Pass ID or QR code to the Security Guard.`
        });
      } else {
        throw new Error('Sharing not supported');
      }
    } catch (err) {
      console.log('Share fallback:', err);
      // Clipboard fallback
      navigator.clipboard.writeText(`*ORCHID HEIGHTS GATE PASS*\nVisitor: ${entry.fullName}\nPass ID: ${entry.id}\nWing: ${entry.wing}, Flat No: ${entry.flatNo}\nValid Until: ${expDateStr} • ${expTimeStr}`);
      alert(`Pass details copied to clipboard! (પાસની વિગતો ક્લિપબોર્ડ પર કોપી થઈ ગઈ છે)`);
    }
  };

  // Download pass as a beautiful shareable high-contrast image
  const downloadImagePass = (entry: PreEntry) => {
    // Generate styled pass card in canvas
    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = '#f8fafc'; // slate-50
    ctx.fillRect(0, 0, 450, 700);

    // Draw card background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(15, 15, 420, 670);

    // Card border
    ctx.strokeStyle = '#4f46e5'; // indigo-600
    ctx.lineWidth = 6;
    ctx.strokeRect(15, 15, 420, 670);

    // Top Header Banner
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(20, 20, 410, 90);

    // Header Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('ORCHID HEIGHTS', 225, 60);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('OFFICIAL VISIT PRE-ENTRY PASS', 225, 88);

    // Visitor Name
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(entry.fullName.toUpperCase(), 225, 160);

    // Phone
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`Phone: ${entry.mobileNumber}`, 225, 190);

    // Divider Line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 215);
    ctx.lineTo(410, 215);
    ctx.stroke();

    // Stats Grid
    const drawRowCanvas = (label: string, val: string, y: number) => {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = '15px sans-serif';
      ctx.fillText(label, 50, y);
      
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(val, 400, y);
    };

    drawRowCanvas('Visitor Type:', entry.guestType.toUpperCase(), 250);
    drawRowCanvas('Reason for Visit:', entry.reason, 280);
    drawRowCanvas('Visitors Count:', String(entry.visitorCount), 310);
    drawRowCanvas('Target Flat:', `Wing ${entry.wing} - Flat ${entry.flatNo}`, 340);
    drawRowCanvas('Invited By:', entry.householdMemberName, 370);

    // Second Divider
    ctx.beginPath();
    ctx.moveTo(40, 395);
    ctx.lineTo(410, 395);
    ctx.stroke();

    // Add QR Code
    if (selectedPassQR) {
      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 135, 415, 180, 180);

        // Expiration Text
        const expiresDate = new Date(entry.expiresAt);
        const expDateStr = expiresDate.toLocaleDateString('en-IN');
        const expTimeStr = expiresDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ef4444'; // red-500
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`VALID UNTIL: ${expDateStr} • ${expTimeStr}`, 225, 625);

        ctx.fillStyle = '#94a3b8'; // slate-400
        ctx.font = '11px sans-serif';
        ctx.fillText(`PASS ID: ${entry.id} | Generated on Resident Device`, 225, 650);

        // Download trigger
        const finalUrl = canvas.toDataURL('image/jpeg', 0.95);
        const a = document.createElement('a');
        a.href = finalUrl;
        a.download = `GatePass_OrchidHeights_${entry.fullName.replace(/\s+/g, '_')}.jpg`;
        a.click();
      };
      qrImg.src = selectedPassQR;
    }
  };

  const handleSelectPass = async (entry: PreEntry) => {
    setSelectedPass(entry);
    await loadQR(entry);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-slate-200 rounded-3xl p-6 shadow-xs gap-4 text-left">
        <div>
          <h1 className="font-display font-black text-2xl text-slate-800 tracking-tight flex items-center space-x-2">
            <QrCode className="w-7 h-7 text-indigo-600" />
            <span>Pre-Entry Gate Passes</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate instantly pre-approved QR codes for guests. Checked in securely on presentation.
          </p>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchRecords(true); }}
          className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold gap-2 transition"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Reload List</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Create Pre-Entry Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl shadow-xs p-6 text-left space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-800">New Pre-Approved Invite</h2>
              <p className="text-xs text-slate-500">Provide the guest details to generate pass</p>
            </div>
          </div>

          {formError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-xl text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreatePreEntry} className="space-y-5">
            {/* Webcam / Image upload */}
            <WebcamCapture onPhotoCaptured={setPhotoUrl} value={photoUrl} guestType={guestType} />

            {/* Guest Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Visitor Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Bhai Patel"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-3 pl-10 pr-4 text-sm font-semibold outline-none transition"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9898180810"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-3 pl-10 pr-4 text-sm font-semibold outline-none transition"
                />
              </div>
            </div>

            {/* Grid for Guest Type & Count */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Visitor Type
                </label>
                <select
                  value={guestType}
                  onChange={(e) => setGuestType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="Guest">👋 Guest / Relative</option>
                  <option value="Delivery">📦 Delivery Driver</option>
                  <option value="Electrician">⚡ Electrician / Tech</option>
                  <option value="Milkman">🥛 Milkman</option>
                  <option value="Maid">🧹 House Maid</option>
                  <option value="Other">👤 Other Visitor</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={visitorCount}
                  onChange={(e) => setVisitorCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Reason to Visit */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Reason to Visit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Guest visit, Courier delivery"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-3 px-4 text-sm font-semibold outline-none transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-sm transition flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <span className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  <span>Generate Approved Pass</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Active Passes list (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl shadow-xs p-6 text-left space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-slate-800">Your Active Passes</h2>
                <p className="text-xs text-slate-500">List of generated Pre-Entries</p>
              </div>
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-black px-3 py-1 rounded-full border border-indigo-150">
              {preEntries.length} Total
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <span className="inline-block border-4 border-indigo-600 border-t-transparent rounded-full w-8 h-8 animate-spin"></span>
              <p className="text-sm text-slate-500 font-bold">Loading pre-entry passes...</p>
            </div>
          ) : preEntries.length === 0 ? (
            <div className="py-20 text-center text-slate-400 space-y-4">
              <QrCode className="w-16 h-16 text-slate-200 mx-auto" />
              <div>
                <p className="text-base font-bold text-slate-700">No Pre-Entries Created Yet</p>
                <p className="text-xs text-slate-500 mt-1">Use the form on the left to pre-approve your first visitor.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
              {preEntries.map((entry) => {
                const { expired, text: countdownText } = getCountdownText(entry.expiresAt);
                const currentStatus = expired ? 'Expired' : entry.status;
                
                return (
                  <div
                    key={entry.id}
                    className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-slate-300 bg-slate-50/50 ${
                      selectedPass?.id === entry.id ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200/80'
                    }`}
                  >
                    {/* Visitor Details */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <img 
                        src={entry.photoUrl || 'https://i.ibb.co/zT5tpcdY/1000296229-1.png'} 
                        alt="visitor" 
                        className="w-12 h-12 rounded-xl object-cover bg-slate-200 shrink-0 shadow-xs border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{entry.fullName}</h4>
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0">
                            {entry.guestType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{entry.mobileNumber} • {entry.reason}</p>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className={`text-[10px] font-bold ${
                            currentStatus === 'Pending' ? 'text-indigo-600' :
                            currentStatus === 'Used' ? 'text-emerald-600' : 'text-slate-400'
                          }`}>
                            {currentStatus === 'Pending' ? countdownText : currentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        currentStatus === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                        currentStatus === 'Used' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                        'bg-slate-100 border-slate-200 text-slate-500'
                      }`}>
                        {currentStatus === 'Pending' ? 'Active' : currentStatus}
                      </span>

                      <button
                        onClick={() => handleSelectPass(entry)}
                        className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                        <span>View Pass</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* VIEW PASS MODAL (OR DRAWER OVERLAY) */}
      {selectedPass && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 p-6 shadow-2xl relative text-left space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-slate-800 text-base">Visitor Gate Pass</span>
              </div>
              <button
                onClick={() => { setSelectedPass(null); setSelectedPassQR(''); }}
                className="text-slate-400 hover:text-slate-600 font-mono text-lg font-black bg-slate-100 p-1 rounded-full w-8 h-8 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Pass Styled Layout */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative bg-slate-50/50">
              {/* Header block */}
              <div className="bg-indigo-600 text-white p-4 text-center">
                <h3 className="font-display font-black text-sm tracking-widest">ORCHID HEIGHTS</h3>
                <p className="text-[9px] uppercase tracking-widest opacity-80 mt-0.5">Pre-Approved Visitor Entry</p>
              </div>

              {/* Details card body */}
              <div className="p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={selectedPass.photoUrl || 'https://i.ibb.co/zT5tpcdY/1000296229-1.png'} 
                    alt="visitor" 
                    className="w-14 h-14 rounded-xl object-cover bg-slate-200 border shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm uppercase">{selectedPass.fullName}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Mobile: {selectedPass.mobileNumber}</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Type: {selectedPass.guestType.toUpperCase()}</p>
                  </div>
                </div>

                <div className="border-t border-b border-slate-200/60 py-2.5 grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="block text-slate-400 font-medium">Invited To</span>
                    <span className="font-bold text-slate-800">Flat {selectedPass.wing}-{selectedPass.flatNo}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium">Approved By</span>
                    <span className="font-bold text-slate-800 truncate block">{selectedPass.householdMemberName}</span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="block text-slate-400 font-medium">Reason</span>
                    <span className="font-bold text-slate-800 block">{selectedPass.reason} ({selectedPass.visitorCount} Visitors)</span>
                  </div>
                </div>

                {/* QR Code Graphic container */}
                <div className="flex flex-col items-center justify-center py-2 bg-white rounded-xl border border-slate-200">
                  {selectedPassQR ? (
                    <img src={selectedPassQR} alt="QR Code Pass" className="w-40 h-40" />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center">
                      <span className="border-2 border-indigo-600 border-t-transparent rounded-full w-6 h-6 animate-spin"></span>
                    </div>
                  )}
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Scan at security gate</p>
                </div>

                {/* Expiration warning banner */}
                <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-rose-700 block">
                    VALID UNTIL: {new Date(selectedPass.expiresAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Download and Share Button Triggers */}
            <div className="space-y-2 pb-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => downloadImagePass(selectedPass)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save Image</span>
                </button>
                <button
                  onClick={() => downloadPDFPass(selectedPass)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
              <button
                onClick={() => sharePDFPass(selectedPass)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Share PDF Pass (WhatsApp / All Apps)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATION SUCCESS MODAL WITH QR VIEW */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 p-6 shadow-2xl relative text-left space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-2xl">
                ✓
              </div>
              <h3 className="font-display font-black text-lg text-slate-800">Pass Created Successfully!</h3>
              <p className="text-xs text-slate-500">
                A pre-approved gate entry pass has been generated. Send the pass below to your visitor.
              </p>
            </div>

            {/* Pass preview strip */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
              <div className="bg-indigo-600 text-white p-3 text-center text-[10px] font-black tracking-widest">
                ORCHID HEIGHTS PASS
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-2.5 text-xs">
                  <img 
                    src={showSuccessModal.photoUrl || 'https://i.ibb.co/zT5tpcdY/1000296229-1.png'} 
                    alt="visitor" 
                    className="w-10 h-10 rounded-lg object-cover bg-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800">{showSuccessModal.fullName}</h4>
                    <p className="text-[10px] text-slate-500">{showSuccessModal.guestType} • {showSuccessModal.reason}</p>
                  </div>
                </div>

                <div className="bg-white p-3 border border-slate-200 rounded-xl flex justify-center">
                  {selectedPassQR ? (
                    <img src={selectedPassQR} alt="QR Code" className="w-36 h-36" />
                  ) : (
                    <span className="border-2 border-indigo-600 border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
                  )}
                </div>

                <p className="text-center text-[10px] font-bold text-rose-600">
                  Valid Until: {new Date(showSuccessModal.expiresAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => downloadImagePass(showSuccessModal)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save Image</span>
                </button>
                <button
                  onClick={() => downloadPDFPass(showSuccessModal)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
              <button
                onClick={() => sharePDFPass(showSuccessModal)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Share PDF Pass (WhatsApp / All Apps)</span>
              </button>
            </div>

            <button
              onClick={() => setShowSuccessModal(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs text-center transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
