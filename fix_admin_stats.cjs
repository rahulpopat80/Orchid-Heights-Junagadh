const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const replacement = `                  <h3 className="font-display font-bold text-base text-slate-800">Flat Registers & Credentials</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Total: 96</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active: {owners.filter(isOwnerActive).length}</span>
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">Non-Active: {owners.filter(o => !isOwnerActive(o) && !o.nameEn.toLowerCase().includes('vacant')).length}</span>
                  </div>`;

code = code.replace(
  /<h3 className="font-display font-bold text-base text-slate-800">Flat Registers & Credentials<\/h3>\s*<p className="text-xs text-slate-400">Total 96 Apartments\. Audit device logouts and retrieve flatowner passwords\.<\/p>/,
  replacement
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
