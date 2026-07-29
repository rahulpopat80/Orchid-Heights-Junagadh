const fs = require('fs');
let code = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

code = code.replace(
  /<div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden min-h-\[800px\]">/,
  `<div className="bg-slate-50 p-4 sm:p-8 md:p-12 w-full max-w-4xl mx-auto rounded-3xl border border-slate-200 min-h-screen">`
);

fs.writeFileSync('src/components/SecurityDashboard.tsx', code);
