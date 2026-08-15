const fs = require('fs');

function fixResident() {
  let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

  code = code.replace(
    /className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col max-w-\[90vw\] animate-in zoom-in-95 duration-100"/g,
    'className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] overflow-hidden flex flex-col max-w-[90vw] animate-in zoom-in-95 duration-100"'
  );
  
  code = code.replace(
    /<div className="fixed inset-0 z-40" onClick=\{\(e\) => \{ e\.stopPropagation\(\); setActiveMessageId\(null\); \}\}>/g,
    '<div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setActiveMessageId(null); }}>'
  );
  
  code = code.replace(
    /<div className="fixed inset-0 z-40" onClick=\{\(e\) => \{ e\.stopPropagation\(\); setActiveMessageId\(null\); \}\} \/>/g,
    '<div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setActiveMessageId(null); }} />'
  );

  fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
}
fixResident();

function fixAdmin() {
  let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

  code = code.replace(
    /className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col max-w-\[90vw\] animate-in zoom-in-95 duration-100"/g,
    'className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] overflow-hidden flex flex-col max-w-[90vw] animate-in zoom-in-95 duration-100"'
  );
  
  code = code.replace(
    /<div className="fixed inset-0 z-40" onClick=\{\(e\) => \{ e\.stopPropagation\(\); setActiveMessageId\(null\); \}\} \/>/g,
    '<div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setActiveMessageId(null); }} />'
  );

  fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
}
fixAdmin();
