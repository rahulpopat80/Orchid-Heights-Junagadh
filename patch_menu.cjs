const fs = require('fs');

function patchResident(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix selection and callout
  code = code.replace(
    /className=\{"max-w-\[85%\] sm:max-w-\[75%\] select-none "/g,
    `className={"max-w-[85%] sm:max-w-[75%] select-none "\n                    style={{ WebkitTouchCallout: 'none' }}\n                    onContextMenu={(e) => { e.preventDefault(); return false; }}\n                    `
  );

  // Overhaul the Long Press Handlers
  code = code.replace(
    /onPointerDown=\{\(e\) => \{[\s\S]*?\}\}\n\s*onPointerUp=\{handlePointerUp\}\n\s*onPointerCancel=\{handlePointerUp\}\n\s*onPointerMove=\{\(e\) => \{[\s\S]*?\}\}/g,
    `onTouchStart={(e) => {
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
                  onContextMenu={(e) => e.preventDefault()}`
  );

  // Update Menu Position logic for Resident
  code = code.replace(
    /left: menuPosition \? Math\.max\(10, Math\.min\(menuPosition\.x - 120, window\.innerWidth - 260\)\) : '50%'/g,
    `left: menuPosition ? Math.max(10, Math.min(menuPosition.x - 120, window.innerWidth - 260)) + 'px' : '50%'`
  );
  
  // Clean up duplicate onContextMenu from previous if it existed
  
  fs.writeFileSync(filePath, code);
}

function patchAdmin(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix selection and callout
  code = code.replace(
    /className=\{"max-w-\[85%\] sm:max-w-\[75%\] "/g,
    `className={"max-w-[85%] sm:max-w-[75%] select-none "\n                    style={{ WebkitTouchCallout: 'none' }}\n                    onContextMenu={(e) => { e.preventDefault(); return false; }}\n                    `
  );

  code = code.replace(
    /onPointerMove=\{\(e\) => \{[\s\S]*?\}\}\n\s*onPointerDown=\{\(e\) => \{[\s\S]*?\}\}\n\s*onPointerUp=\{\(e\) => \{[\s\S]*?\}\}\n\s*onPointerCancel=\{\(e\) => \{[\s\S]*?\}\}/g,
    `onTouchStart={(e) => {
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
                  onContextMenu={(e) => e.preventDefault()}`
  );

  // Update Menu Position logic for Admin
  code = code.replace(
    /left: window\.adminMenuPosition \? Math\.max\(10, Math\.min\(window\.adminMenuPosition\.x - 120, window\.innerWidth - 260\)\) : '50%'/g,
    `left: window.adminMenuPosition ? Math.max(10, Math.min(window.adminMenuPosition.x - 120, window.innerWidth - 260)) + 'px' : '50%'`
  );

  fs.writeFileSync(filePath, code);
}

patchResident('src/components/resident/ChatSection.tsx');
patchAdmin('src/components/admin/AdminChatSection.tsx');
console.log("Patched touch events and context menu positioning");
