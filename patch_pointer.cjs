const fs = require('fs');

function patch(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // In Resident ChatSection:
  code = code.replace(
    /const handlePointerDown = \(id: string, e: React\.PointerEvent\) => \{/,
    `const handlePointerDown = (id: string, e: React.PointerEvent) => {
    (window as any).pointerDownX = e.clientX;
    (window as any).pointerDownY = e.clientY;`
  );

  code = code.replace(
    /onPointerCancel=\{handlePointerUp\}/,
    `onPointerCancel={handlePointerUp}
          onPointerMove={(e) => {
            if (longPressTimer.current && (window as any).pointerDownX) {
              if (Math.abs(e.clientX - (window as any).pointerDownX) > 10 || Math.abs(e.clientY - (window as any).pointerDownY) > 10) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
              }
            }
          }}`
  );

  fs.writeFileSync(filePath, code);
}
patch('src/components/resident/ChatSection.tsx');
