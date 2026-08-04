import React, { useState } from 'react';
import { ArrowLeft, Download, FileText, Search, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { generateVisitorPDF } from '../../lib/pdfGenerator';
import { Visitor } from '../../types';

import { FlatOwner } from '../../types';

interface AdminVisitorRecordsProps {
  onBack: () => void;
  owners?: FlatOwner[];
}

export default function AdminVisitorRecords({ onBack, owners = [] }: AdminVisitorRecordsProps) {
  const [filterTime, setFilterTime] = useState<'today' | '1m' | '2m' | 'all'>('today');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStartTime, setFilterStartTime] = useState<string>('');
  const [filterEndTime, setFilterEndTime] = useState<string>('');
  const [filterWing, setFilterWing] = useState<'ALL' | 'A' | 'B'>('ALL');
  const [filterFlatNo, setFilterFlatNo] = useState<string>('');
  
  const [loading, setLoading] = useState(false);

  const fetchFilteredLogs = async (): Promise<Visitor[]> => {
    let list = await api.getVisitors({
      wing: filterWing !== 'ALL' ? filterWing : undefined,
      flatNo: filterFlatNo ? parseInt(filterFlatNo) : undefined,
      includeDeleted: true // Admin sees everything
    });

    const now = new Date();
    let cutoff = new Date();

    if (filterTime === 'today') {
      cutoff.setHours(0, 0, 0, 0);
    } else if (filterTime === '1m') {
      cutoff.setMonth(now.getMonth() - 1);
    } else if (filterTime === '2m') {
      cutoff.setMonth(now.getMonth() - 2);
    } else if (filterTime === 'all') {
      cutoff = new Date(0);
    }

    return list.filter(v => {
      let match = new Date(v.requestTime) >= cutoff;
      
      if (match && filterDate) {
        const logDate = new Date(v.requestTime).toISOString().split('T')[0];
        if (logDate !== filterDate) match = false;
      }
      
      if (match && (filterStartTime || filterEndTime)) {
        const logTime = new Date(v.requestTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        if (filterStartTime && logTime < filterStartTime) match = false;
        if (filterEndTime && logTime > filterEndTime) match = false;
      }
      
      return match;
    });
  };

  const downloadCSV = async () => {
    setLoading(true);
    try {
      const reportData = await fetchFilteredLogs();
      const rows: string[] = [];
      rows.push(`"ORCHID HEIGHTS - MASTER ADMIN VISITOR REPORT"`);
      rows.push(`"Report Filter: ${filterTime.toUpperCase()} | Flat: ${filterWing === 'ALL' ? 'ALL' : filterWing + '-' + filterFlatNo}"`);
      rows.push(`"Generated: ${new Date().toLocaleString('en-IN')}"`);
      rows.push(`""`);
      rows.push([
        '"Sr."', '"Visitor Name"', '"Mobile Number"', '"Email"', '"Wing"', '"Flat No"',
        '"Visitor Type"', '"Entry Type"', '"Reason"', '"Status"', '"Request Date"', '"Request Time"',
        '"Response Time"', '"Approved / Rejected By"', '"Exit Time"', '"Duration Stayed"', '"IP Address"', '"Device SN"', '"Rejection Reason"'
      ].join(','));

      reportData.forEach((v, idx) => {
        const reqDate = new Date(v.requestTime);
        const respDate = v.respondedTime ? new Date(v.respondedTime) : null;
        const exitDate = v.exitTime ? new Date(v.exitTime) : null;
        
        const reqDateStr = reqDate.toLocaleDateString('en-IN');
        const reqTimeStr = reqDate.toLocaleTimeString('en-IN', { hour12: false });
        const respTimeStr = respDate ? respDate.toLocaleString('en-IN') : '-';
        const exitTimeStr = exitDate ? exitDate.toLocaleString('en-IN') : '-';
        
        let statusStr = v.exited ? 'EXITED' : (v.status || '').toUpperCase();
        if (v.status === 'expired') statusStr = 'EXPIRED';

        rows.push([
          `"${idx + 1}"`,
          `"${(v.fullName || '').replace(/"/g, '""')}"`,
          `"${v.mobileNumber || ''}"`,
          `"${(v.email || '').replace(/"/g, '""')}"`,
          `"${v.wing}"`,
          `"${v.flatNo}"`,
          `"${v.guestType || ''}"`,
          `"${v.isPreEntry ? 'Pre-Entry' : (v.respondedBy?.includes('Through Call') ? 'Gate Entry (Call)' : 'Gate Entry')}"`,
          `"${(v.reason || '').replace(/"/g, '""')}"`,
          `"${statusStr}"`,
          `"${reqDateStr}"`,
          `"${reqTimeStr}"`,
          `"${respTimeStr}"`,
          `"${(v.respondedBy || '-').toUpperCase().replace(/"/g, '""')}"`,
          `"${exitTimeStr}"`,
          `"${(v.duration || '-').replace(/"/g, '""')}"`,
          `"-"`,
          `"-"`,
          `"${(v.rejectReason || '-').replace(/"/g, '""')}"`
        ].join(','));
      });

      if (reportData.length === 0) {
        rows.push('"No visitor records found for the selected criteria."');
      }

      const csvString = rows.join('\r\n');
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Admin_Visitor_Logs_${new Date().getTime()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Error fetching records.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setLoading(true);
    try {
      const reportData = await fetchFilteredLogs();
      await generateVisitorPDF(reportData, "MASTER ADMIN GATE REPORT", `Filter: ${filterTime.toUpperCase()} | Flat: ${filterWing === 'ALL' ? 'ALL' : filterWing + '-' + filterFlatNo}`, true, owners);
    } catch (e) {
      alert('Error fetching records for PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-sm font-black text-indigo-700 hover:text-indigo-900 cursor-pointer transition select-none bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-5 py-2.5 rounded-full shadow-sm active:scale-95"
        >
          <span className="text-xl leading-none -mt-0.5">◀</span>
          <span className="uppercase tracking-widest text-[10px]">Back to Home</span>
        </button>
        <div className="flex items-center space-x-1 text-indigo-600">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest font-mono">
            Security Logs
          </span>
        </div>
      </div>

      <div>
        <h3 className="font-display font-black text-slate-800 text-lg">Gate Visitor Records (Admin)</h3>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Export gate visitor logs securely. You can pull complete records across all flats, or filter by specific flats and timelines.
        </p>
      </div>

      <div className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Time Range</label>
            <select
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none text-slate-700"
            >
              <option value="today">📅 Today's Entries</option>
              <option value="1m">📊 Last 1 Month Logs</option>
              <option value="2m">📈 Last 2 Months Logs</option>
              <option value="all">🗂️ All-Time Logs</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Specific Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none text-slate-700"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Time Duration</label>
            <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-1.5 focus-within:border-indigo-500 transition">
              <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">From</span>
              <input
                type="time"
                value={filterStartTime}
                onChange={(e) => setFilterStartTime(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none text-slate-700 w-full"
              />
              <span className="text-[10px] font-bold text-slate-400 uppercase">To</span>
              <input
                type="time"
                value={filterEndTime}
                onChange={(e) => setFilterEndTime(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none text-slate-700 w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Target Wing</label>
            <select
              value={filterWing}
              onChange={(e) => setFilterWing(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none text-slate-700"
            >
              <option value="ALL">All Wings (Global)</option>
              <option value="A">Wing A</option>
              <option value="B">Wing B</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Flat No (Optional)</label>
            <input
              type="number"
              placeholder="e.g. 101"
              value={filterFlatNo}
              onChange={(e) => setFilterFlatNo(e.target.value)}
              disabled={filterWing === 'ALL'}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none text-slate-700 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <button
            onClick={downloadCSV}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer select-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Search className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            <span>Download CSV (Spreadsheet)</span>
          </button>
          
          <button
            onClick={downloadPDF}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer select-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Search className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            <span>Download PDF (With Photos)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

