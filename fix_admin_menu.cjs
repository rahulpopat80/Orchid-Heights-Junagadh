const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

code = code.replace(
  /style=\{\{\s*top: \(window as any\)\.adminMenuPosition \? Math\.min\(\(window as any\)\.adminMenuPosition\.y, window\.innerHeight - 200\) : '50%',\s*left: \(window as any\)\.adminMenuPosition \? Math\.min\(\(window as any\)\.adminMenuPosition\.x, window\.innerWidth - 250\) : '50%'\s*\}\}/g,
  `style={{
                                top: (window as any).adminMenuPosition ? ((window as any).adminMenuPosition.y > window.innerHeight - 250 ? (window as any).adminMenuPosition.y - 140 : (window as any).adminMenuPosition.y + 20) : '50%',
                                ...((window as any).adminMenuPosition && (window as any).adminMenuPosition.x > window.innerWidth / 2
                                  ? { right: Math.max(10, window.innerWidth - (window as any).adminMenuPosition.x - 20) + 'px' }
                                  : { left: (window as any).adminMenuPosition ? Math.max(10, (window as any).adminMenuPosition.x - 20) + 'px' : '50%' }
                                )
                              }}`
);

code = code.replace(
  /className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col min-w-\[240px\] animate-in zoom-in-95 duration-100"/g,
  `className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col max-w-[90vw] animate-in zoom-in-95 duration-100"`
);

fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
