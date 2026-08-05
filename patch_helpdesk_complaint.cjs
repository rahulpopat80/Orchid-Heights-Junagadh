const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'resident', 'HelpDeskSection.tsx');
let code = fs.readFileSync(file, 'utf8');

const targetStr = `                              <span className="font-mono bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                                Flat {item.flatId} {item.ownerName && <span className="ml-1 pl-1 border-l border-slate-300 text-slate-600">{item.ownerName}</span>}
                              </span>`;

const replaceStr = `                              <span className="font-mono bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                                Flat {item.flatId} {item.ownerName && <span className="ml-1 pl-1 border-l border-slate-400 text-indigo-700">By: {item.ownerName}</span>}
                              </span>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched HelpDeskSection complaint person name");
}
