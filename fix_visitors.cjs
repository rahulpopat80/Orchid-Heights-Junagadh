const fs = require('fs');
let content = fs.readFileSync('src/components/resident/VisitorsSection.tsx', 'utf8');

const statsLogic = `
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
`;

// Insert after filteredHistory logic
content = content.replace(/const filteredHistory = guestHistory\.filter[^]*?\n  \}\);/, match => match + '\n' + statsLogic);

// Insert stats UI before the search bar
const searchUIHook = /<div className="flex flex-col md:flex-row items-center gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">/;
const statsUI = `
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-indigo-900 font-bold">આજના મુલાકાતીઓ (Today's Visitors)</p>
          <p className="text-[10px] text-indigo-600 font-medium">Number of visitors arrived today</p>
        </div>
        <div className="text-3xl font-black text-indigo-600 bg-white px-4 py-2 rounded-lg shadow-sm">
          {todayVisitorsCount}
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">`;

content = content.replace(searchUIHook, statsUI);

// Fix date input
const dateHackPattern = /type=\{searchDate \? "date" : "text"\}\s*placeholder="Select Date"\s*onFocus=\{\(e\) => \(e\.target\.type = 'date'\)\}\s*onBlur=\{\(e\) => \{ if \(!e\.target\.value\) e\.target\.type = 'text' \}\}/;
const dateFixed = `type="date"`;
content = content.replace(dateHackPattern, dateFixed);

// Wait, the Time inputs are already fixed to type="time" in my previous modification, but let's double check.
// I'll use edit_file to be absolutely sure.
fs.writeFileSync('src/components/resident/VisitorsSection.tsx', content);
