const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

code = code.replace(
  /if \(\(window as any\)\.adminLongPress\) \{ clearTimeout\(\(window as any\)\.adminLongPress\); \}/g,
  `if ((window as any).adminLongPress) { clearTimeout((window as any).adminLongPress); }`
);

fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
