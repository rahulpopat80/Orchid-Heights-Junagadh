const fs = require('fs');
let code = fs.readFileSync('src/components/resident/HelpDeskSection.tsx', 'utf8');

const search = `<h5 className="font-bold text-xs text-slate-800 uppercase leading-snug">{report.title}</h5>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Date: {new Date(report.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>`;

const replace = `<h5 className="font-bold text-xs text-slate-800 uppercase leading-snug">{report.title}</h5>
                      <div className="flex gap-2">
                        <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-black font-mono w-max">
                          {report.month} {report.year}
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono py-0.5">
                          Date: {new Date(report.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/resident/HelpDeskSection.tsx', code);
