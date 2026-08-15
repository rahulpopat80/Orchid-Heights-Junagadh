const fs = require('fs');

function fixResident() {
  let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

  code = code.replace(
    /top: menuPosition \? \(menuPosition\.y > window\.innerHeight - 250 \? menuPosition\.y - 140 : menuPosition\.y \+ 20\) : '50%',/g,
    "top: menuPosition ? Math.max(20, Math.min(menuPosition.y - 85, window.innerHeight - 220)) + 'px' : '50%',"
  );

  fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
}
fixResident();

function fixAdmin() {
  let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

  code = code.replace(
    /top: \(window as any\)\.adminMenuPosition \? \(\(window as any\)\.adminMenuPosition\.y > window\.innerHeight - 250 \? \(window as any\)\.adminMenuPosition\.y - 140 : \(window as any\)\.adminMenuPosition\.y \+ 20\) : '50%',/g,
    "top: (window as any).adminMenuPosition ? Math.max(20, Math.min((window as any).adminMenuPosition.y - 85, window.innerHeight - 220)) + 'px' : '50%',"
  );

  fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
}
fixAdmin();
