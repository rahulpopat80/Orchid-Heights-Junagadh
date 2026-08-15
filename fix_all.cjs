const fs = require('fs');

function cleanResident() {
  let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

  // Strip all the messy touch/pointer handlers between `<div` and `className={\`relative p-2.5 pb-5`
  // We'll replace it entirely.
  const regex = /<div\s+onPointerDown=\{\(e\) => handlePointerDown\(msg\.id, e\)\}\s+onPointerUp=\{handlePointerUp\}\s+onPointerLeave=\{handlePointerUp\}\s+\}\s+onContextMenu=\{\(e\) => handleContextMenu\(msg\.id, e\)\}\s+className=\{\`relative p-2\.5 pb-5 rounded-2xl max-w-\[85%\] sm:max-w-\[70%\] shadow-sm border \$\{/g;
  
  // Wait, let's just find the exact block and replace it:
  code = code.replace(
    /<div\s+onPointerDown=[\s\S]*? className=\{\`relative p-2\.5/g,
    `<div 
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
          style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none', userSelect: 'none' }}
          className={\`relative p-2.5`
  );

  fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
}

cleanResident();
