const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminVisitorRecords.tsx', 'utf8');

// Insert stat calculation logic after filter data logic
const statLogic = `
  const getStats = () => {
    const now = new Date();
    const today = now.toDateString();
    
    let todayCount = 0;
    let month1Count = 0;
    let month2Count = 0;
    let allCount = 0;

    const targetWing = filterWing === 'ALL' ? null : filterWing;
    const targetFlat = (filterWing !== 'ALL' && filterFlatNo) ? parseInt(filterFlatNo) : null;

    visitorLogs.forEach(log => {
       if (targetWing && log.wing !== targetWing) return;
       if (targetFlat && log.flatNo !== targetFlat) return;
       
       allCount++;
       const d = new Date(log.requestTime || log.timestamp || 0);
       
       if (d.toDateString() === today) todayCount++;
       
       const daysDiff = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
       if (daysDiff <= 30) month1Count++;
       if (daysDiff <= 60) month2Count++;
    });
    
    return { todayCount, month1Count, month2Count, allCount };
  };
  const stats = getStats();
`;

// Find where reportData is defined and add it before the return
content = content.replace(/const reportData = \[\.\.\.filteredData\]\.sort\(\(a, b\) => \{/, statLogic + '\n  const reportData = [...filteredData].sort((a, b) => {');

// Find the filter UI block and add stats UI right above it
const uiHook = /<div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6">/;
const statsUI = `
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Today's Entries</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.todayCount}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Last 1 Month</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.month1Count}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Last 2 Months</p>
            <p className="text-2xl font-bold text-amber-600">{stats.month2Count}</p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">All-Time</p>
            <p className="text-2xl font-bold text-slate-700">{stats.allCount}</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6">`;

content = content.replace(uiHook, statsUI);

fs.writeFileSync('src/components/admin/AdminVisitorRecords.tsx', content);
