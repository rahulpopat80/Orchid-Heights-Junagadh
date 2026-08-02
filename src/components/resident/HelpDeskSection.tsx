import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  ClipboardList, 
  AlertCircle, 
  Plus, 
  Upload, 
  X, 
  Download, 
  MessageSquare, 
  Megaphone, 
  Bell, 
  Calendar,
  ChevronRight,
  ArrowLeft, Trash2,
  Check
} from 'lucide-react';
import { api } from '../../lib/api';
import ChunkedMedia from '../ChunkedMedia';

interface HelpDeskSectionProps {
  wing: string;
  flatNo: number;
  complaints: any[];
  loadingComplaints: boolean;
  financials: any[];
  loadingFinancials: boolean;
  onRefreshComplaints: () => void;
  announcements: any[];
  viewMode?: 'complaints' | 'helpdesk';

  // Form states
  compTitle: string;
  setCompTitle: (text: string) => void;
  compDesc: string;
  setCompDesc: (text: string) => void;
  compMedia: string;
  setCompMedia: (text: string) => void;
  compMediaName: string;
  setCompMediaName: (text: string) => void;
  compMediaType: string;
  setCompMediaType: (text: string) => void;
  compSuccess: string;
  setCompSuccess: (text: string) => void;
  compError: string;
  setCompError: (text: string) => void;
  handleFileChange: (file: File) => void;

  // Real-time tab override props from notifications clicks
  activeTabOverride?: 'notices' | 'complaints' | 'financials' | null;
  onClearOverride?: () => void;
}

export default function HelpDeskSection({
  wing,
  flatNo,
  complaints,
  loadingComplaints,
  financials,
  loadingFinancials,
  onRefreshComplaints,
  announcements,
  viewMode,
  compTitle,
  setCompTitle,
  compDesc,
  setCompDesc,
  compMedia,
  setCompMedia,
  compMediaName,
  setCompMediaName,
  compMediaType,
  setCompMediaType,
  compSuccess,
  setCompSuccess,
  compError,
  setCompError,
  handleFileChange,
  activeTabOverride,
  onClearOverride
}: HelpDeskSectionProps) {
  
  // Set initial screen
  const [activeSub, setActiveSub] = useState<'menu' | 'notices' | 'complaints' | 'financials'>(
    viewMode === 'complaints' ? 'complaints' : 'menu'
  );

  // Sync with URL and listen to popstate
  useEffect(() => {
    const handleLocationSync = () => {
      const path = window.location.pathname;
      if (path === '/help-desk/noticies') setActiveSub('notices');
      else if (path === '/help-desk/financial-ledger') setActiveSub('financials');
      else if (path === '/help-desk') setActiveSub(viewMode === 'complaints' ? 'complaints' : 'menu');
    };
    handleLocationSync();
    window.addEventListener('popstate', handleLocationSync);
    return () => window.removeEventListener('popstate', handleLocationSync);
  }, [viewMode]);

  const navigateToRoute = (path: string, sub: 'menu' | 'notices' | 'complaints' | 'financials') => {
    setActiveSub(sub);
    window.history.pushState(null, '', path);
  };

  // Monitor notification redirects
  useEffect(() => {
    if (activeTabOverride) {
      if (activeTabOverride === 'notices') navigateToRoute('/help-desk/noticies', 'notices');
      if (activeTabOverride === 'financials') navigateToRoute('/help-desk/financial-ledger', 'financials');
      if (onClearOverride) onClearOverride();
    }
  }, [activeTabOverride, onClearOverride]);

  const [noticesSearchText, setNoticesSearchText] = useState('');
  const [noticesSearchDate, setNoticesSearchDate] = useState('');
  const [ledgerSearchText, setLedgerSearchText] = useState('');
  const [ledgerSearchDate, setLedgerSearchDate] = useState('');
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [compAttachments, setCompAttachments] = useState<Array<{ url: string; name: string; type: string }>>([]);

  const addCompAttachment = (file: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setCompError('File is too large. Max size allowed is 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCompAttachments(prev => [
          ...prev,
          {
            url: e.target!.result as string,
            name: file.name,
            type: file.type
          }
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compTitle.trim() || !compDesc.trim()) {
      setCompError('Title and description are required.');
      return;
    }

    setCompError('');
    setCompSuccess('');
    setSubmitting(true);

    try {
      const payload: any = {
        title: compTitle.trim(),
        description: compDesc.trim(),
        wing,
        flatNo,
        attachments: compAttachments
      };

      if (compMedia) {
        payload.mediaUrl = compMedia;
        payload.mediaName = compMediaName;
        payload.mediaType = compMediaType;
      }

      const res = await api.createComplaint(payload);
      if (res && res.id) {
        // Dispatch general notification to society_notifications collection
        await api.createSocietyNotification({
          type: 'complaint',
          title: `📝 Ticket Raised: Flat ${wing}-${flatNo}`,
          message: `New ticket: "${compTitle.trim()}". Description: ${compDesc.trim().substring(0, 80)}`,
          metadata: { complaintId: res.id }
        });

        setCompSuccess('Complaint filed successfully!');
        setCompTitle('');
        setCompDesc('');
        setCompMedia('');
        setCompMediaName('');
        setCompMediaType('');
        setCompAttachments([]);
        onRefreshComplaints();
      } else {
        setCompError('Failed to file complaint.');
      }
    } catch (err: any) {
      setCompError('Connection error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter announcements matching wing & flatNo target criteria
  const filteredNotices = (announcements || []).filter(item => {
    const targetType = item.targetType || item.target || 'all';
    const targetWing = item.targetWing || item.wing || '';
    const targetFlat = item.targetFlat || item.flatNo || '';

    if (targetType === 'all') return true;
    if (targetType === 'wing') {
      return targetWing.toLowerCase() === wing.toLowerCase();
    }
    if (targetType === 'flat') {
      return targetWing.toLowerCase() === wing.toLowerCase() && Number(targetFlat) === Number(flatNo);
    }
    return true;
  });

  const filteredFinancials = (financials || []).filter(item => {
    if (ledgerSearchText) {
      const text = (item.title || item.description || item.reportType || '').toLowerCase();
      if (!text.includes(ledgerSearchText.toLowerCase())) return false;
    }
    if (ledgerSearchDate) {
      const d = new Date(item.createdAt || item.timestamp || 0).toISOString().split('T')[0];
      if (d !== ledgerSearchDate) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 text-left">
      {/* ==================== VIEW 1: SUB-BLOCKS MENU ==================== */}
      <AnimatePresence mode="wait">
      {activeSub === 'menu' && (
        <motion.div key="menu" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}} className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-600">
              Helpdesk, Notices & Ledger
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sub-Block 1: Society Notices */}
            <div
              onClick={() => navigateToRoute('/help-desk/noticies', 'notices')}
              className="bg-white rounded-none p-6 border shadow-sm flex flex-col items-center justify-center min-h-[140px] text-center hover:shadow-md transition cursor-pointer relative group border-slate-200/60"
            >
              <div className="w-14 h-14 rounded-none bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-sm mb-3 group-hover:scale-105 transition-transform duration-300">
                <Megaphone className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-slate-800 text-sm tracking-tight leading-snug">
                Society Notices
              </h4>
            </div>

            {/* Sub-Block 2: Financial Ledger */}
            <div
              onClick={() => navigateToRoute('/help-desk/financial-ledger', 'financials')}
              className="bg-white rounded-none p-6 border shadow-sm flex flex-col items-center justify-center min-h-[140px] text-center hover:shadow-md transition cursor-pointer relative group border-slate-200/60"
            >
              <div className="w-14 h-14 rounded-none bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm mb-3 group-hover:scale-105 transition-transform duration-300">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-slate-800 text-sm tracking-tight leading-snug">
                Financial Ledger
              </h4>
            </div>
          </div>
        </motion.div>
      )}

      {/* ==================== SCREEN: SOCIETY NOTICES ==================== */}
      {activeSub === 'notices' && (
        <motion.div key="notices" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              onClick={() => navigateToRoute('/help-desk', 'menu')}
              className="flex items-center space-x-2 text-sm font-black text-indigo-700 hover:text-indigo-900 cursor-pointer transition select-none bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-5 py-2.5 rounded-full shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 -ml-1" />
              <span className="uppercase tracking-widest text-[10px]">Back</span>
            </button>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Ledger Statements ({filteredFinancials.length})
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <input type="text" placeholder="Search Ledger..." value={ledgerSearchText} onChange={e => setLedgerSearchText(e.target.value)} className="flex-1 bg-white border border-slate-200 p-2.5 text-xs font-bold rounded-xl outline-none focus:border-indigo-500" />
            <div className="flex items-center space-x-2 w-full md:w-auto bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold">
               <span className="text-slate-500 uppercase text-[10px]">Date</span>
               <input type="date" value={ledgerSearchDate} onChange={e => setLedgerSearchDate(e.target.value)} className="outline-none" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2.5 text-left">
              Quarterly Financial Statements & Maintenance Audit Ledgers
            </h4>

            
            {loadingFinancials ? (
              <div className="py-8 text-center text-slate-400">Loading financial list...</div>
            ) : filteredFinancials.length === 0 ? (
              <div className="py-12 text-center text-slate-400 border border-dashed rounded-xl bg-slate-50/20">
                <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs">No ledger statements uploaded by secretary yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {filteredFinancials.map((report) => (
                  <div key={report.id} className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 transition shadow-sm text-left">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold bg-indigo-50 border border-indigo-150 text-indigo-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {report.reportType || report.type || 'Balance Sheet'}
                        </span>
                        <span className="text-xs font-black text-indigo-700 font-mono">
                          ₹ {report.totalExpense?.toLocaleString('en-IN') || 0}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-800 uppercase leading-snug">{report.title}</h5>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Date: {new Date(report.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      {report.description && (
                        <p className="text-[11px] text-slate-600 bg-white p-2.5 border border-slate-150 rounded leading-relaxed whitespace-pre-line">
                          {report.description}
                        </p>
                      )}
                    </div>

                    {/* Dynamic Chunked Attachments rendering for financials */}
                    {((report.attachments && report.attachments.length > 0) || report.mediaUrl) && (
                      <div className="border-t border-slate-200/60 pt-3 mt-3 space-y-1.5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Connected Attachments ({report.attachments?.length || 1}):
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {report.mediaUrl && !(report.attachments && report.attachments.some((a: any) => a.url === report.mediaUrl)) && (
                            <ChunkedMedia
                              fileId={report.mediaUrl}
                              type={report.fileType || 'application/pdf'}
                              fallbackName={report.mediaName || 'Statement_Report'}
                            />
                          )}

                          {report.attachments && report.attachments.map((att: any, idx: number) => (
                            <ChunkedMedia
                              key={idx}
                              fileId={att.url}
                              type={att.type}
                              fallbackName={att.name || 'Statement_File'}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}


