const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const csvTableRender = `
                    {report.csvRows && report.csvRows.length > 0 && (
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[300px]">
                          <thead>
                            <tr className="bg-slate-100 text-[10px] text-slate-500 uppercase tracking-wider">
                              <th className="p-2 border-b border-slate-200 rounded-tl-lg">Category</th>
                              <th className="p-2 border-b border-slate-200">Description</th>
                              <th className="p-2 border-b border-slate-200 text-right rounded-tr-lg">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs text-slate-700">
                            {report.csvRows.map((row, idx) => (
                              <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                                <td className="p-2 font-bold">{row.category}</td>
                                <td className="p-2 text-slate-500">{row.description}</td>
                                <td className="p-2 text-right font-mono text-slate-900 font-bold">₹{row.amount.toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
`;

code = code.replace(
  /<p className="text-xs text-slate-600 leading-relaxed font-semibold whitespace-pre-line">\{report.description\}<\/p>/,
  `<p className="text-xs text-slate-600 leading-relaxed font-semibold whitespace-pre-line">{report.description}</p>${csvTableRender}`
);

const attachmentRender = `
                            {att.type?.startsWith('image/') && att.url ? (
                              <div className="rounded border overflow-hidden max-h-[100px] bg-slate-100">
                                <img src={att.url} className="w-full object-cover max-h-[100px]" referrerPolicy="no-referrer" />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                                <p className="font-bold text-slate-700 truncate text-[10px] max-w-[120px]">{att.name}</p>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[10px]">
                              {(!att.type?.startsWith('image/') || !att.url) && (
                                <span className="text-[8px] text-slate-400 font-mono uppercase">{att.type?.split('/')[1] || 'FILE'}</span>
                              )}
                              <button onClick={() => handleDownloadAttachment(att.fileId, att.url, att.name || 'Attachment')} className="text-indigo-600 hover:underline font-extrabold text-[10px] ml-auto cursor-pointer">
                                Download / View
                              </button>
                            </div>
`;

code = code.replace(
  /\{att\.type\?\.startsWith\('image\/'\) \? \([\s\S]*?className="text-indigo-600 hover:underline font-extrabold text-\[10px\] ml-auto">Download<\/a><\/div>/,
  attachmentRender
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log('Applied sixth part of replacement');
