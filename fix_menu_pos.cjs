const fs = require('fs');

function fix(filePath, isAdmin) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace style in Resident
  if (!isAdmin) {
    code = code.replace(
      /style=\{\{\s*top: menuPosition \? \(menuPosition\.y > window\.innerHeight - 250 \? menuPosition\.y - 140 : menuPosition\.y \+ 20\) : '50%',\s*left: menuPosition \? Math\.max\(10, Math\.min\(menuPosition\.x - 120, window\.innerWidth - 260\)\) \+ 'px' : '50%'\s*\}\}/g,
      `style={{
             top: menuPosition ? (menuPosition.y > window.innerHeight - 250 ? menuPosition.y - 140 : menuPosition.y + 20) : '50%',
             ...(menuPosition && menuPosition.x > window.innerWidth / 2
               ? { right: Math.max(10, window.innerWidth - menuPosition.x - 20) + 'px' }
               : { left: menuPosition ? Math.max(10, menuPosition.x - 20) + 'px' : '50%' }
             )
          }}`
    );
  } else {
    // Admin
    code = code.replace(
      /style=\{\{\s*top: \(window as any\)\.adminMenuPosition \? \(\(window as any\)\.adminMenuPosition\.y > window\.innerHeight - 250 \? \(window as any\)\.adminMenuPosition\.y - 140 : \(window as any\)\.adminMenuPosition\.y \+ 20\) : '50%',\s*left: window\.adminMenuPosition \? Math\.max\(10, Math\.min\(window\.adminMenuPosition\.x - 120, window\.innerWidth - 260\)\) \+ 'px' : '50%'\s*\}\}/g,
      `style={{
             top: (window as any).adminMenuPosition ? ((window as any).adminMenuPosition.y > window.innerHeight - 250 ? (window as any).adminMenuPosition.y - 140 : (window as any).adminMenuPosition.y + 20) : '50%',
             ...((window as any).adminMenuPosition && (window as any).adminMenuPosition.x > window.innerWidth / 2
               ? { right: Math.max(10, window.innerWidth - (window as any).adminMenuPosition.x - 20) + 'px' }
               : { left: (window as any).adminMenuPosition ? Math.max(10, (window as any).adminMenuPosition.x - 20) + 'px' : '50%' }
             )
          }}`
    );
  }

  // Ensure menu doesn't overflow horizontally
  code = code.replace(
    /className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col min-w-\[240px\] animate-in zoom-in-95 duration-100"/g,
    `className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col max-w-[90vw] animate-in zoom-in-95 duration-100"`
  );

  fs.writeFileSync(filePath, code);
}
fix('src/components/resident/ChatSection.tsx', false);
// Let's verify admin replacement string first
