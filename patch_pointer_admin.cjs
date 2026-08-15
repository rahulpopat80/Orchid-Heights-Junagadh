const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

code = code.replace(
  /onPointerDown=\{\(e\) => \{/,
  `onPointerMove={(e) => {
    if ((window as any).adminLongPress && (window as any).adminPointerDownX) {
      if (Math.abs(e.clientX - (window as any).adminPointerDownX) > 10 || Math.abs(e.clientY - (window as any).adminPointerDownY) > 10) {
        clearTimeout((window as any).adminLongPress);
        (window as any).adminLongPress = null;
      }
    }
  }}
  onPointerDown={(e) => {
    (window as any).adminPointerDownX = e.clientX;
    (window as any).adminPointerDownY = e.clientY;`
);

fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
