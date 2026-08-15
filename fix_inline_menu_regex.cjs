const fs = require('fs');

function fixMenu(filePath, isAdmin) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace activeMessageId block
  const patternResident = /<div className="fixed inset-0 z-\[90\]" onClick=\{\(e\) => \{ e\.stopPropagation\(\); setActiveMessageId\(null\); \}\} \/>\s*<div\s*className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-\[100\] overflow-hidden flex flex-col max-w-\[90vw\] animate-in zoom-in-95 duration-100"\s*style=\{\{[\s\S]*?\}\}\s*onClick=\{e => e\.stopPropagation\(\)\}\s*>/g;
  
  const replacementResident = `<div 
          className={\`relative z-[100] mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col min-w-[240px] max-w-[90vw] animate-in slide-in-from-top-2 duration-100 \${isMe ? 'self-end' : 'self-start'}\`}
          onClick={e => e.stopPropagation()}
        >`;

  if (!isAdmin) {
    code = code.replace(patternResident, replacementResident);
  } else {
    // Admin pattern
    const patternAdmin = /<div className="fixed inset-0 z-\[90\]" onClick=\{\(e\) => \{ e\.stopPropagation\(\); setActiveMessageId\(null\); \}\} \/>\s*<div\s*className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-\[100\] overflow-hidden flex flex-col max-w-\[90vw\] animate-in zoom-in-95 duration-100"\s*style=\{\{[\s\S]*?\}\}\s*onClick=\{e => e\.stopPropagation\(\)\}\s*>/g;
    const replacementAdmin = `<div 
          className={\`relative z-[100] mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col min-w-[240px] max-w-[90vw] animate-in slide-in-from-top-2 duration-100 self-center\`}
          onClick={e => e.stopPropagation()}
        >`;
    code = code.replace(patternAdmin, replacementAdmin);
  }
  
  fs.writeFileSync(filePath, code);
}
fixMenu('src/components/resident/ChatSection.tsx', false);
fixMenu('src/components/admin/AdminChatSection.tsx', true);
