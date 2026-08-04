const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regex = /<a href=\{att\.url\} download=\{att\.name \|\| 'Attachment'\} className="text-indigo-600 hover:underline font-extrabold text-\[10px\] ml-auto">Download<\/a>/g;
const replacement = `<button type="button" onClick={() => handleDownloadAttachment(att.fileId, att.url, att.name || 'Attachment')} className="text-indigo-600 hover:underline font-extrabold text-[10px] ml-auto cursor-pointer">Download</button>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
