const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'AdminDashboard.tsx');
let code = fs.readFileSync(file, 'utf8');

const oldStr = `<span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-black font-mono">Flat {comp.flatId} {comp.ownerName && <span className="ml-2 text-indigo-700 border-l border-slate-300 pl-2">{comp.ownerName}</span>}</span>`;
const newStr = `<div className="flex flex-col gap-0.5">
                        <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-black font-mono w-max">Flat {comp.flatId}</span>
                        {comp.ownerName && <span className="text-[10px] text-slate-500 font-bold mt-1">Raised by: <span className="text-slate-700">{comp.ownerName}</span></span>}
                      </div>`;

code = code.replace(oldStr, newStr);

fs.writeFileSync(file, code);
console.log("Patched AdminDashboard complaints header");
