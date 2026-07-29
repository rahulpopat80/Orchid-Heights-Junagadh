const fs = require('fs');
let code = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');
code = code.replace(
  /onClick=\{\(\) => window.open\('\/directory', '_blank'\)\}\n\s+className="w-full sm:w-auto bg-slate-100 border border-slate-200 hover:bg-slate-200 active:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center space-x-2 transition shadow-sm"/,
  `onClick={() => setActiveSecTab('directory')}\n            className={\`w-full sm:w-auto px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center space-x-2 transition shadow-sm \${activeSecTab === 'directory' ? 'bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent' : 'bg-slate-100 border border-slate-200 hover:bg-slate-200 active:bg-slate-300 text-slate-700'}\`}`
);
fs.writeFileSync('src/components/SecurityDashboard.tsx', code);
