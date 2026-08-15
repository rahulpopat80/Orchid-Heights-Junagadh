const fs = require('fs');

function fixResident(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Strip all the touch/pointer props and manually rebuild the div to avoid duplicate props
  code = code.replace(
    /onPointerCancel=\{handlePointerUp\}\s*onPointerMove=\{\(e\) => \{[\s\S]*?\}\s*\}\s*\}/g,
    ''
  );
  
  code = code.replace(
    /onTouchStart=\{\(e\) => \{[\s\S]*?\}\}\n\s*onTouchMove=\{\(e\) => \{[\s\S]*?\}\}\n\s*onTouchEnd=\{\(e\) => \{[\s\S]*?\}\}/g,
    ''
  );

  // Okay, regex is messy. Let's just find the start of the bubble div:
  // <div className={"flex-1 relative" ...
  code = code.replace(
    /<div className="flex-1 relative"[\s\S]*?(className=\{"max-w-\[85%\] sm:max-w-\[75%\] select-none ")/g,
    `<div className="flex-1 relative"
                  onTouchStart={(e) => {
                    const cx = e.touches[0].clientX;
                    const cy = e.touches[0].clientY;
                    touchStartX.current = cx;
                    (window as any).touchStartY = cy;
                    e.currentTarget.style.transition = 'none';
                    if (longPressTimer.current) clearTimeout(longPressTimer.current);
                    longPressTimer.current = setTimeout(() => {
                      setActiveMessageId(msg.id);
                      setMenuPosition({ x: cx, y: cy });
                      longPressTimer.current = null;
                    }, 400);
                  }}
                  onTouchMove={(e) => {
                    const cx = e.touches[0].clientX;
                    const cy = e.touches[0].clientY;
                    if (longPressTimer.current && touchStartX.current !== null && (window as any).touchStartY !== null) {
                      if (Math.abs(cx - touchStartX.current) > 10 || Math.abs(cy - (window as any).touchStartY) > 10) {
                        clearTimeout(longPressTimer.current);
                        longPressTimer.current = null;
                      }
                    }
                    if (touchStartX.current) {
                      const diff = cx - touchStartX.current;
                      if (diff > 0) {
                        e.currentTarget.style.transform = \`translateX(\${Math.min(diff, 100)}px)\`;
                      }
                    }
                  }}
                  onTouchEnd={(e) => {
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                    if (touchStartX.current && e.changedTouches && e.changedTouches.length > 0) {
                      const cx = e.changedTouches[0].clientX;
                      const diff = cx - touchStartX.current;
                      if (diff > 50) {
                        setReplyingTo(msg);
                      }
                    }
                    e.currentTarget.style.transform = 'translateX(0px)';
                    e.currentTarget.style.transition = 'transform 0.2s ease-out';
                    setTimeout(() => {
                      if (e.currentTarget) e.currentTarget.style.transition = '';
                    }, 200);
                    touchStartX.current = null;
                    (window as any).touchStartY = null;
                  }}
                  onContextMenu={(e) => { e.preventDefault(); return false; }}
                >
                  <div $1`
  );

  fs.writeFileSync(filePath, code);
}
fixResident('src/components/resident/ChatSection.tsx');
