const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');
code = code.replace(/window\.adminLongPress/g, '(window as any).adminLongPress');
code = code.replace(/window\.adminMenuPosition/g, '(window as any).adminMenuPosition');
fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
