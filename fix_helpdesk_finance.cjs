const fs = require('fs');
let code = fs.readFileSync('src/components/resident/HelpDeskSection.tsx', 'utf8');

// 1. Add downloadChunkedFile, triggerFileDownload imports if not there
if (!code.includes('downloadChunkedFile')) {
  code = code.replace("import { uploadFileInChunks } from '../../lib/fileStorage';",
  "import { uploadFileInChunks, downloadChunkedFile, triggerFileDownload } from '../../lib/fileStorage';");
}

// 2. Add handleDownloadAttachment function
const helperFunc = `  const handleDownloadAttachment = async (fileId: string, fallbackUrl: string, name: string) => {
    if (fileId) {
      try {
        const { base64 } = await downloadChunkedFile(fileId);
        triggerFileDownload(base64, name);
      } catch (e) {
        console.error(e);
        if (fallbackUrl) triggerFileDownload(fallbackUrl, name);
      }
    } else if (fallbackUrl) {
      triggerFileDownload(fallbackUrl, name);
    }
  };`;

// Insert the helper near top of component
code = code.replace(/const \[activeTab, setActiveTab\] = useState/, helperFunc + '\n  const [activeTab, setActiveTab] = useState');

// 3. Update filteredFinancials to also check targetWings and targetFlats
const newFilteredFinancials = `  const filteredFinancials = (financials || []).filter(item => {
    // Flat / Wing targeting
    const targetWings = item.targetWings || [];
    const targetFlats = item.targetFlats || [];
    
    if (targetWings.length > 0 || targetFlats.length > 0) {
      let matched = false;
      if (targetWings.includes(wing)) matched = true;
      if (targetFlats.includes(flatNo.toString())) matched = true;
      if (!matched) return false; // not for this resident
    }

    if (!financeSearchTerm.trim()) return true;
    const search = financeSearchTerm.toLowerCase();
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const date = new Date(item.createdAt || item.timestamp || new Date()).toLocaleDateString('en-IN').toLowerCase();
    if (!title.includes(search) && !desc.includes(search) && !date.includes(search)) {
      return false;
    }
    return true;
  });`;

code = code.replace(/const filteredFinancials = \(financials \|\| \[\]\)\.filter\(item => \{[\s\S]*?return true;\n  \}\);/, newFilteredFinancials);

// 4. Render csvRows and fix attachment download
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
                              {report.csvRows.map((row: any, idx: number) => (
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
  /\{report\.description && \(\s*<p className="text-\[11px\] text-slate-600 bg-white p-2\.5 border border-slate-150 rounded leading-relaxed whitespace-pre-line">\s*\{report\.description\}\s*<\/p>\s*\)\}/,
  `{report.description && (
                        <p className="text-[11px] text-slate-600 bg-white p-2.5 border border-slate-150 rounded leading-relaxed whitespace-pre-line">
                          {report.description}
                        </p>
                      )}
                      ${csvTableRender}`
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

fs.writeFileSync('src/components/resident/HelpDeskSection.tsx', code);
console.log('Applied helpdesk replacement');
