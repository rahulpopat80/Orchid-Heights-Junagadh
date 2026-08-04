const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// We need to fix the noticeAttachments map block.
// Let's find it.
const noticeStart = code.indexOf('{noticeAttachments.map((att, idx) => (');
const noticeEnd = code.indexOf('))}</div></div>', noticeStart) + 3;

const fixedNotice = `{noticeAttachments.map((att, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2.5 text-xs shadow-sm">
                            <div className="flex items-center space-x-2 truncate">
                              {att.type?.startsWith('image/') ? (
                                <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span className="font-bold text-slate-700 truncate max-w-[150px]">{att.name}</span>
                            </div>
                            <button onClick={() => handleDownloadAttachment(att.fileId, att.url, att.name || 'Attachment')} className="text-indigo-600 hover:underline font-extrabold text-[10px] ml-auto cursor-pointer">
                              Download
                            </button>
                          </div>
                        ))}`;

code = code.substring(0, noticeStart) + fixedNotice + code.substring(noticeEnd);

// Now let's fix financialReports attachments
// search for: {/* Multi attachments list */}
const finListStart = code.indexOf('{/* Multi attachments list */}');
if (finListStart !== -1) {
  const finMapStart = code.indexOf('{report.attachments && report.attachments.map((att: any, idx: number) => (', finListStart);
  if (finMapStart !== -1) {
    const finMapEnd = code.indexOf('))}</div></div>', finMapStart) + 3;
    
    const fixedFin = `{report.attachments && report.attachments.map((att: any, idx: number) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 p-2 rounded-xl flex flex-col gap-1.5 shadow-sm text-left">
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
                          </div>
                        ))}`;
    code = code.substring(0, finMapStart) + fixedFin + code.substring(finMapEnd);
  }
}

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log('Fixed JSX');
