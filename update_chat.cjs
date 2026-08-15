const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

// 1. Move senderTitle inside the bubble and use "You" for isMe
code = code.replace(
  /{!isMe && \(\s*<div className="text-\[10px\] text-slate-500 font-bold ml-1 mb-0\.5" style={{ color: '#075E54' }}>\s*{senderTitle}\s*<\/div>\s*\)}/g,
  ''
);

const bubbleStart = `className={\`relative p-2.5 pb-5 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm border \${
          isMe ? 'bg-[#DCF8C6] text-slate-800 border-[#c6e4b1] rounded-tr-none' : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
        }\`}>`;

if (code.includes(bubbleStart)) {
  code = code.replace(bubbleStart, 
    bubbleStart + '\n          <div className="text-[11px] font-bold mb-1 select-none" style={{ color: isMe ? \'#027a5b\' : \'#075E54\' }}>\n            {isMe ? \'You\' : senderTitle}\n          </div>'
  );
} else {
    console.log("Could not find bubbleStart");
}

// 2. Make time unselectable
code = code.replace(
  /<div className={\`absolute bottom-1 right-2 text-\[9px\] \${isMe \? 'text-green-800' : 'text-slate-400'}\`}>/g,
  '<div className={`absolute bottom-1 right-2 text-[9px] select-none ${isMe ? \'text-green-800\' : \'text-slate-400\'}`}>'
);

// 3. Update touch handlers for swipe to reply
code = code.replace(
  /onTouchStart=\{\(e\) => \{ touchStartX\.current = e\.touches\[0\]\.clientX; \}\}[\s\S]*?onTouchEnd=\{\(\) => \{ touchStartX\.current = null; \}\}/g,
  `onTouchStart={(e) => { 
            touchStartX.current = e.touches[0].clientX; 
            e.currentTarget.style.transition = 'none';
          }}
          onTouchMove={(e) => {
             if (touchStartX.current) {
                const diff = e.touches[0].clientX - touchStartX.current;
                if (diff > 0) { // Swipe right
                  e.currentTarget.style.transform = \`translateX(\${Math.min(diff, 100)}px)\`;
                }
             }
          }}
          onTouchEnd={(e) => {
             if (touchStartX.current) {
                const diff = e.changedTouches[0].clientX - touchStartX.current;
                if (diff > 50) {
                  setReplyingTo(msg);
                }
                e.currentTarget.style.transform = 'translateX(0px)';
                e.currentTarget.style.transition = 'transform 0.2s ease-out';
                setTimeout(() => {
                   if (e.currentTarget) e.currentTarget.style.transition = '';
                }, 200);
                touchStartX.current = null;
             }
          }}`
);

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
console.log("Chat section updated");
