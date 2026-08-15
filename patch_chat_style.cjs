const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const target = `<div className="flex flex-col h-[70vh] max-h-[800px] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden relative shadow-sm">`;
const replacement = `<div className="flex flex-col h-[calc(100dvh-160px)] max-h-[900px] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden relative shadow-sm mt-2">`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
  console.log("Success ChatSection");
} else {
  console.log("Target ChatSection not found");
}
