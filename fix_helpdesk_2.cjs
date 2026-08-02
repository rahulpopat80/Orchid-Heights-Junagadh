const fs = require('fs');
let content = fs.readFileSync('src/components/resident/HelpDeskSection.tsx', 'utf8');

// Insert filteredFinancials before return
const beforeReturnStr = `  return (
    <div className="space-y-4 text-left">`;

const filteredFinancialsStr = `  const filteredFinancials = (financials || []).filter(item => {
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
    <div className="space-y-4 text-left">`;

content = content.replace(beforeReturnStr, filteredFinancialsStr);

// Notices Search UI
const noticesUI = `          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              onClick={() => navigateToRoute('/help-desk', 'menu')}
              className="flex items-center space-x-2 text-sm font-black text-indigo-700 hover:text-indigo-900 cursor-pointer transition select-none bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-5 py-2.5 rounded-full shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 -ml-1" />
              <span className="uppercase tracking-widest text-[10px]">Back</span>
            </button>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Notices ({filteredNotices.length})
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <input type="text" placeholder="Search Notices..." value={noticesSearchText} onChange={e => setNoticesSearchText(e.target.value)} className="flex-1 bg-white border border-slate-200 p-2 text-xs rounded-lg outline-none focus:border-indigo-500" />
            <input type="date" value={noticesSearchDate} onChange={e => setNoticesSearchDate(e.target.value)} className="w-full md:w-auto bg-white border border-slate-200 p-2 text-xs rounded-lg outline-none focus:border-indigo-500" />
          </div>`;

content = content.replace(/          <div className="flex items-center justify-between border-b border-slate-100 pb-3">\s*<button[^>]*>\s*<ArrowLeft[^>]*\/>\s*<span[^>]*>Back<\/span>\s*<\/button>\s*<span[^>]*>\s*Notices \(\{filteredNotices\.length\}\)\s*<\/span>\s*<\/div>/, noticesUI);

// Ledger Search UI
const ledgerUI = `          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
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
            <input type="text" placeholder="Search Ledger..." value={ledgerSearchText} onChange={e => setLedgerSearchText(e.target.value)} className="flex-1 bg-white border border-slate-200 p-2 text-xs rounded-lg outline-none focus:border-indigo-500" />
            <input type="date" value={ledgerSearchDate} onChange={e => setLedgerSearchDate(e.target.value)} className="w-full md:w-auto bg-white border border-slate-200 p-2 text-xs rounded-lg outline-none focus:border-indigo-500" />
          </div>`;

content = content.replace(/          <div className="flex items-center justify-between border-b border-slate-100 pb-3">\s*<button[^>]*>\s*<ArrowLeft[^>]*\/>\s*<span[^>]*>Back<\/span>\s*<\/button>\s*<span[^>]*>\s*Ledger Statements \(\{filteredFinancials\.length\}\)\s*<\/span>\s*<\/div>/, ledgerUI);

// Complaints Resolved filter
const filter1 = `.filter((c) => c.flatId === \`\${wing}-\${flatNo}\`)`;
const newFilter1 = `.filter((c) => c.flatId === \`\${wing}-\${flatNo}\` && c.status?.toLowerCase() !== 'resolved' && c.status?.toLowerCase() !== 'processed')`;

content = content.replace(filter1, newFilter1); // There might be 2 occurrences

fs.writeFileSync('src/components/resident/HelpDeskSection.tsx', content);
