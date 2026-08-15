const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

code = code.replace(
  `const handlePointerDown = (id: string, e: React.PointerEvent) => {
    const cx = e.clientX; const cy = e.clientY;
    longPressTimer.current = setTimeout(() => {
      setActiveMessageId(id);
      setMenuPosition({ x: cx, y: cy });
    }, 500);
  };
    longPressTimer.current = setTimeout(() => {
      setActiveMessageId(id);
    }, 500);
  };`,
  `const handlePointerDown = (id: string, e: React.PointerEvent) => {
    const cx = e.clientX; const cy = e.clientY;
    longPressTimer.current = setTimeout(() => {
      setActiveMessageId(id);
      setMenuPosition({ x: cx, y: cy });
    }, 500);
  };`
);

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
