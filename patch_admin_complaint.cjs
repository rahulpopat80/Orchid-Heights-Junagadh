const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'AdminDashboard.tsx');
let code = fs.readFileSync(file, 'utf8');

const targetStr = `                      <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-black font-mono flex items-center">
                        Flat {comp.flatId} 
                        {comp.ownerName && <span className="ml-2 text-indigo-700 border-l border-slate-300 pl-2">{comp.ownerName}</span>}
                      </span>`;

const replaceStr = `                      <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-black font-mono flex items-center">
                        Flat {comp.flatId} 
                        {comp.ownerName && <span className="ml-2 text-indigo-700 border-l border-slate-300 pl-2">By: {comp.ownerName}</span>}
                      </span>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched AdminDashboard complaint person name");
}
