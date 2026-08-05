import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShieldAlert, Check, X, ClipboardList, Clock, Trash2, Download , ArrowLeft, Search} from 'lucide-react';
import { Visitor } from '../../types';

interface VisitorsSectionProps {
  wing: string;
  flatNo: number;
  activePoll: Visitor[];
  guestHistory: Visitor[];
  loadingHistory: boolean;
  rejectingId: string | null;
  setRejectingId: (id: string | null) => void;
  rejectReasonText: string;
  setRejectReasonText: (text: string) => void;
  handleRespond: (id: string, status: 'approved' | 'rejected', customReason?: string) => void;
  handleDeleteHistoryRecord: (id: string, name: string) => void;
  handleDownloadVisitorReport: (filteredData: Visitor[]) => void;
  isAlarmActive: boolean;
  stopAlarm: () => void;
}

export default function VisitorsSection({
  wing,
  flatNo,
  activePoll,
  guestHistory,
  loadingHistory,
  rejectingId,
  setRejectingId,
  rejectReasonText,
  setRejectReasonText,
  handleRespond,
  handleDeleteHistoryRecord,
  handleDownloadVisitorReport,
  isAlarmActive,
  stopAlarm
}: VisitorsSectionProps) {

  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchStartTime, setSearchStartTime] = useState('');
  const [searchEndTime, setSearchEndTime] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchEntryMethod, setSearchEntryMethod] = useState('');

  const filteredHistory = guestHistory.filter(log => {
    let match = true;
    if (searchName && !log.fullName.toLowerCase().includes(searchName.toLowerCase())) match = false;
    if (searchType && log.guestType.toLowerCase() !== searchType.toLowerCase()) match = false;
    if (searchEntryMethod && log.entryMethod !== searchEntryMethod) match = false;
    if (searchDate) {
      const logDate = new Date(log.requestTime).toISOString().split('T')[0];
      if (logDate !== searchDate) match = false;
    }
    if (searchStartTime || searchEndTime) {
      const logTime = new Date(log.requestTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      if (searchStartTime && logTime < searchStartTime) match = false;
      if (searchEndTime && logTime > searchEndTime) match = false;
    }
    return match;
  });

  const getStats = () => {
    const today = new Date().toDateString();
    let todayCount = 0;
    
    guestHistory.forEach(log => {
       const d = new Date(log.requestTime);
       if (d.toDateString() === today) todayCount++;
    });
    
    return todayCount;
  };
  const todayVisitorsCount = getStats();

  return (
    <div className="space-y-6 text-left">
      {isAlarmActive && (
        <div className="bg-red-600 border border-red-700 text-white font-bold p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse shadow-lg">
          <div className="flex items-center space-x-3 text-left">
            <span className="w-3 h-3 bg-white rounded-full animate-ping shrink-0"></span>
            <div>
              <p className="text-sm font-black tracking-tight flex items-center gap-1.5">
                <span>🚨 VISITOR ALARM RINGING!</span>
              </p>
              <p className="text-[10px] text-red-100 font-medium">A high frequency emergency alert is playing to grab your attention.</p>
            </div>
          </div>
          <button
            onClick={stopAlarm}
            className="w-full sm:w-auto bg-white text-red-600 hover:bg-red-50 text-xs font-extrabold uppercase px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Silence Alarm
          </button>
        </div>
      )}

      {/* Active Pending Approvals alerts */}
      {activePoll.length > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-amber-600 rounded-3xl p-6 text-white shadow-2xl border-2 border-amber-400 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Bell className="w-40 h-40" />
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-amber-300 animate-bounce" />
            <span className="font-display font-bold text-xs uppercase tracking-widest text-amber-200">
              Visitor Waiting At Gate! (ઓર્કીડ સેક્યુરીટી ગેટ)
            </span>
          </div>

          <div className="space-y-4">
            {activePoll.map((visitor) => (
              <div
                key={visitor.id}
                className="bg-slate-900/90 border border-white/20 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-6 text-left"
              >
                <div className="w-28 h-28 bg-slate-800 rounded-xl overflow-hidden border-2 border-white/40 shadow-inner shrink-0">
                  <img src={visitor.photoUrl} alt={visitor.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>

                <div className="flex-1 space-y-2 min-w-0">
                  <div>
                    <span className="font-mono bg-amber-500/35 border border-amber-400/30 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {visitor.guestType}
                    </span>
                    <h3 className="font-display font-black text-xl text-white tracking-tight mt-1.5 uppercase truncate">
                      {visitor.fullName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-300 font-medium">
                    <p><span className="text-slate-400">Phone:</span> {visitor.mobileNumber}</p>
                    {visitor.email && <p><span className="text-slate-400">Email:</span> {visitor.email}</p>}
                    <p className="col-span-1 sm:col-span-2"><span className="text-slate-400">Purpose:</span> {visitor.reason}</p>
                  </div>

                  <p className="text-[10px] text-slate-400 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Awaiting approval since {new Date(visitor.requestTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full md:w-56 shrink-0 justify-center bg-slate-900/40 p-4 rounded-xl border border-white/5">
                  {rejectingId === visitor.id ? (
                    <div className="space-y-2 text-left w-full">
                      <p className="text-[10px] text-red-300 font-bold uppercase tracking-wider">Provide rejection reason:</p>
                      <input
                        type="text"
                        placeholder="e.g. Unknown person, wrong flat"
                        value={rejectReasonText}
                        onChange={(e) => setRejectReasonText(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 focus:border-red-400 text-white placeholder-slate-500 rounded-lg py-1.5 px-2.5 text-xs outline-none transition"
                      />
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => handleRespond(visitor.id, 'rejected', rejectReasonText)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-1 rounded-lg text-[10px] flex items-center justify-center space-x-1 shadow transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReasonText('');
                          }}
                          className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-2.5 rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRespond(visitor.id, 'approved')}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md cursor-pointer transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Entry</span>
                      </button>
                      <button
                        onClick={() => setRejectingId(visitor.id)}
                        className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md cursor-pointer transition-all"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject / Decline</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guest History & Reports log */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
              <h3 className="font-display font-bold text-base text-slate-800">Guest History & Reports</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">Logs populate as soon as visitors register at the security gate.</p>
          </div>
          <button
            onClick={() => handleDownloadVisitorReport(filteredHistory)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer select-none"
          >
            <Download className="w-4 h-4" />
            <span>Download Filtered Report</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-end gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="relative flex-1 w-full">
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">નામ શોધો (Search Name)</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by visitor name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 pl-9 pr-3 text-xs outline-none transition"
              />
            </div>
          </div>
          <div className="relative w-full md:w-auto">
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">તારીખ (Date)</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none transition text-slate-600"
            />
          </div>
          <div className="relative w-full md:w-auto">
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Entry Method</label>
            <select
              value={searchEntryMethod}
              onChange={(e) => setSearchEntryMethod(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none transition text-slate-600"
            >
              <option value="">All Entries</option>
              <option value="Pre-Entry">Pre-Entry</option>
              <option value="Call Entry">Call Entry</option>
              <option value="System-Auto Entry">System-Auto Entry</option>
              <option value="General Entry">General Entry</option>
            </select>
          </div>
          <div className="relative w-full md:w-auto col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">સમયગાળો (Time Duration)</label>
            <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg py-1 px-2 focus-within:border-indigo-500 transition">
              <span className="text-[10px] font-bold text-slate-400 uppercase">From</span>
              <input
                type="time"
                value={searchStartTime}
                onChange={(e) => setSearchStartTime(e.target.value)}
                className="bg-transparent text-xs outline-none text-slate-600 w-full"
              />
              <span className="text-[10px] font-bold text-slate-400 uppercase">To</span>
              <input
                type="time"
                value={searchEndTime}
                onChange={(e) => setSearchEndTime(e.target.value)}
                className="bg-transparent text-xs outline-none text-slate-600 w-full"
              />
            </div>
          </div>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-full md:w-auto bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none transition text-slate-600"
          >
            <option value="">All Visitor Types</option>
            <option value="Delivery">Delivery / Courier</option>
            <option value="Guest">Guest / Friend</option>
            <option value="Electrician">Electrician / Work</option>
            <option value="Milkman">Milkman</option>
            <option value="Maid">Maid</option>
            <option value="Vehicle Cleaner">Vehicle Cleaner</option>
            <option value="Newspaper">Newspaper</option>
            <option value="Care Taker">Care Taker</option>
            <option value="Cook">Cook</option>
            <option value="Other Helper">Other Helper</option>
            <option value="Cabinet">Service Agent</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {loadingHistory && guestHistory.length === 0 ? (
          <div className="py-12 flex items-center justify-center">
            <span className="inline-block border-2 border-indigo-600 border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
          </div>
        ) : guestHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 py-12 border-2 border-dashed border-slate-150 rounded-xl">
            <ClipboardList className="w-10 h-10 text-slate-200 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No Visitor Logs Available</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 py-12 border-2 border-dashed border-slate-150 rounded-xl">
            <Search className="w-10 h-10 text-slate-200 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No logs found matching criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[480px] overflow-y-auto pr-1">
            {filteredHistory.map((log) => (
              <div
                key={log.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3 hover:border-slate-300 transition relative overflow-hidden flex flex-col justify-between"
              >
                <button
                  onClick={() => handleDeleteHistoryRecord(log.id, log.fullName)}
                  title="Delete visitor log"
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500 hover:bg-slate-200/50 p-1 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 pr-6 text-left">
                    <img src={log.photoUrl} alt={log.fullName} className="w-11 h-11 rounded-lg object-cover border bg-slate-200 shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-800 truncate uppercase block">{log.fullName}</span>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <p className="text-[10px] text-slate-500 font-mono">{log.mobileNumber} • {log.guestType}</p>
                        {log.entryMethod && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700">
                            {log.entryMethod}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-white border border-slate-200/40 p-2 rounded-lg leading-relaxed text-left">
                    <p className="font-medium"><span className="text-slate-400 font-normal">Reason:</span> {log.reason}</p>
                    {log.respondedBy && (
                      <p className="font-medium mt-1 text-[10px] text-indigo-600"><span className="text-slate-400 font-normal">By:</span> {log.respondedBy}</p>
                    )}
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2">
                  <p className="flex items-center text-left">
                    <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
                    {new Date(log.requestTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {new Date(log.requestTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {log.isPreEntry && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        PRE-ENTRY
                      </span>
                    )}
                    {log.respondedBy?.includes('Through Call') && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                        CALL
                      </span>
                    )}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                      log.status === 'approved' || log.status === 'Entered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : log.status === 'expired'
                        ? 'bg-slate-50 text-slate-500 border border-slate-200'
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {log.exited ? 'EXITED' : log.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
