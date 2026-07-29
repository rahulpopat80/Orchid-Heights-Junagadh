const fs = require('fs');
let code = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

code = code.replace(
  /<div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden h-\[800px\] relative">/,
  `<div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden min-h-[800px]">`
);

fs.writeFileSync('src/components/SecurityDashboard.tsx', code);
