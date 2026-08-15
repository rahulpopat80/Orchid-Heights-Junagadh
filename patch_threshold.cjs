const fs = require('fs');

function patch(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /if \(longPressTimer\.current\) \{ clearTimeout\(longPressTimer\.current\); longPressTimer\.current = null; \}/g,
    `if (longPressTimer.current && touchStartX.current && Math.abs(e.touches[0].clientX - touchStartX.current) > 5) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }`
  );
  
  // also, in ChatSection, onPointerDown might be fired on touch devices, but touch events might prevent it?
  // Let's add -webkit-touch-callout: none to the chat bubbles
  code = code.replace(
    /className=\{"max-w-\[85%\] sm:max-w-\[75%\]/g,
    `className={"max-w-[85%] sm:max-w-[75%] select-none "\\`
  );
  // Actually, wait, let's just make sure the user-select none is there.
  
  fs.writeFileSync(file, code);
}
patch('src/components/resident/ChatSection.tsx');
