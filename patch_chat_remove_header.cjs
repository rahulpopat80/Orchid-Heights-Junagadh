const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const targetHeader = `<div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10">
        <h3 className="font-display font-black text-slate-800 text-lg uppercase tracking-wider">Community Chat</h3>
        <p className="text-xs text-slate-500 font-medium">Connect with other residents. Messages older than 1 month are deleted.</p>
      </div>`;
      
const wrapperTarget = `className="flex flex-col h-full bg-slate-50 md:rounded-2xl border border-slate-200 overflow-hidden relative shadow-sm md:mt-2"`;
const wrapperReplace = `className="flex flex-col h-full bg-slate-50 overflow-hidden relative"`;

if (code.includes(targetHeader)) {
  code = code.replace(targetHeader, '');
  console.log("Removed ChatSection inner header");
}
if (code.includes(wrapperTarget)) {
  code = code.replace(wrapperTarget, wrapperReplace);
  console.log("Updated ChatSection wrapper");
}

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
