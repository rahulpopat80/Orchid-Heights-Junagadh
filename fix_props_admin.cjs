const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

code = code.replace(
  /<div className="flex-1 relative"[\s\S]*?(<div className="flex items-center gap-2 mb-2">)/,
  `<div className="flex-1 relative"
                  onTouchStart={(e) => {
                    const cx = e.touches[0].clientX;
                    const cy = e.touches[0].clientY;
                    (window as any).adminTouchStartX = cx;
                    (window as any).adminTouchStartY = cy;
                    e.currentTarget.style.transition = 'none';
                    if ((window as any).adminLongPress) clearTimeout((window as any).adminLongPress);
                    (window as any).adminLongPress = setTimeout(() => {
                      setActiveMessageId(msg.id);
                      (window as any).adminMenuPosition = { x: cx, y: cy };
                      (window as any).adminLongPress = null;
                    }, 400);
                  }}
                  onTouchMove={(e) => {
                    const cx = e.touches[0].clientX;
                    const cy = e.touches[0].clientY;
                    if ((window as any).adminLongPress && (window as any).adminTouchStartX !== null && (window as any).adminTouchStartY !== null) {
                      if (Math.abs(cx - (window as any).adminTouchStartX) > 10 || Math.abs(cy - (window as any).adminTouchStartY) > 10) {
                        clearTimeout((window as any).adminLongPress);
                        (window as any).adminLongPress = null;
                      }
                    }
                  }}
                  onTouchEnd={(e) => {
                    if ((window as any).adminLongPress) {
                      clearTimeout((window as any).adminLongPress);
                      (window as any).adminLongPress = null;
                    }
                  }}
                  onContextMenu={(e) => { e.preventDefault(); return false; }}
                >
                  $1`
);

// We need to also clean up the duplicate `onTouchStart` in Resident.
let residentCode = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
