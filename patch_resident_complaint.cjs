const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'resident', 'HelpDeskSection.tsx');
let code = fs.readFileSync(file, 'utf8');

const targetStr = `                              <span className="font-mono bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                                Flat {item.flatId}
                              </span>
                            </div>
                            <h5 className="font-bold text-slate-800 uppercase leading-snug">{item.title}</h5>
                            {item.ownerName && (
                               <p className="text-[10px] text-slate-500 font-medium mt-0.5">Raised by: <span className="font-bold text-slate-700">{item.ownerName}</span></p>
                            )}
                          </div>`;

const newStr = `                              <span className="font-mono bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                                Flat {item.flatId} {item.ownerName && <span className="ml-1 pl-1 border-l border-slate-300 text-slate-600">{item.ownerName}</span>}
                              </span>
                            </div>
                            <h5 className="font-bold text-slate-800 uppercase leading-snug">{item.title}</h5>
                          </div>`;

if (code.includes('Flat {item.flatId}')) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync(file, code);
  console.log("Patched HelpDeskSection");
}

const file2 = path.join(__dirname, 'src', 'components', 'AdminDashboard.tsx');
let code2 = fs.readFileSync(file2, 'utf8');

const targetStr2 = `<div className="flex flex-col gap-0.5">
                        <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-black font-mono w-max">Flat {comp.flatId}</span>
                        {comp.ownerName && <span className="text-[10px] text-slate-500 font-bold mt-1">Raised by: <span className="text-slate-700">{comp.ownerName}</span></span>}
                      </div>`;

const newStr2 = `<span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-black font-mono flex items-center">
                        Flat {comp.flatId} 
                        {comp.ownerName && <span className="ml-2 text-indigo-700 border-l border-slate-300 pl-2">{comp.ownerName}</span>}
                      </span>`;

if (code2.includes('<div className="flex flex-col gap-0.5">')) {
  code2 = code2.replace(targetStr2, newStr2);
  fs.writeFileSync(file2, code2);
  console.log("Patched AdminDashboard");
}
