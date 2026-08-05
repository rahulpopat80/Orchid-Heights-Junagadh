const fs = require('fs');
const file = 'src/components/resident/VisitorsSection.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `                      <span className="text-xs font-bold text-slate-800 truncate uppercase block">{log.fullName}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{log.mobileNumber} • {log.guestType}</p>`;
const replaceStr = `                      <span className="text-xs font-bold text-slate-800 truncate uppercase block">{log.fullName}</span>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <p className="text-[10px] text-slate-500 font-mono">{log.mobileNumber} • {log.guestType}</p>
                        {log.entryMethod && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700">
                            {log.entryMethod}
                          </span>
                        )}
                      </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched visitor history UI");
}
