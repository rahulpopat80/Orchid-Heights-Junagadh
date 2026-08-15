const fs = require('fs');

function patchAdminChatSection() {
  let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

  // 1. Reaction Menu positioning
  code = code.replace(
    /top: window.adminMenuPosition \? Math.min\(window.adminMenuPosition.y, window.innerHeight - 200\) : '50%',/g,
    `top: window.adminMenuPosition ? (window.adminMenuPosition.y > window.innerHeight - 250 ? window.adminMenuPosition.y - 140 : window.adminMenuPosition.y + 20) : '50%',`
  );

  // 2. Highlighting reaction emoji & remove if selected (Admin)
  code = code.replace(
    /\{(.*?)\]\.map\(emoji => \(\s*<button key=\{emoji\} onClick=\{\(\) => handleReact\(msg\.id, emoji\)\} className="text-xl hover:scale-125 transition-transform">\s*\{emoji\}\s*<\/button>\s*\)\)\}/,
    `{['😡', '🙏', '👍', '❤️', '🔥', '🥳'].map(emoji => {
       const isSelected = msg.reactions?.['admin'] === emoji;
       return (
         <button key={emoji} onClick={() => handleReact(msg.id, isSelected ? null : emoji)} className={\`text-xl hover:scale-125 transition-transform p-1 rounded-full \${isSelected ? 'bg-slate-200/80' : ''}\`}>
           {emoji}
         </button>
       );
     })}`
  );

  // 3. Viewer reaction list tap to remove (Admin)
  code = code.replace(
    /\{Object\.entries\(viewReactionsForMsg\.reactions \|\| \{\}\)\.map\(\(\[reactor, emoji\]\) => \([\s\S]*?<div key=\{reactor\} className="flex items-center justify-between border-b border-slate-50 pb-2">\s*<span className="font-medium text-slate-700 text-sm">\s*\{reactor === 'admin' \? 'Admin' : \`Flat \$\{reactor\}\`\}\s*<\/span>\s*<span className="text-2xl">\{emoji\}<\/span>\s*<\/div>\s*\)\)\}/,
    `{Object.entries(viewReactionsForMsg.reactions || {}).sort((a,b)=>a[0]==='admin'?-1:(b[0]==='admin'?1:0)).map(([reactor, emoji]) => (
                <div 
                  key={reactor} 
                  className={\`flex items-center justify-between border-b border-slate-50 pb-2 \${reactor === 'admin' ? 'cursor-pointer hover:bg-slate-100 rounded px-2 -mx-2' : 'px-2'}\`}
                  onClick={() => {
                    if (reactor === 'admin') {
                      handleReact(viewReactionsForMsg.id, null);
                      setViewReactionsForMsg(prev => prev ? {...prev, reactions: Object.fromEntries(Object.entries(prev.reactions || {}).filter(([k]) => k !== 'admin'))} : null);
                    }
                  }}
                >
                  <span className={\`text-sm \${reactor === 'admin' ? 'font-bold text-[#00a884]' : 'font-medium text-slate-700'}\`}>
                    {reactor === 'admin' ? 'You (Tap to remove)' : \`Flat \${reactor}\`}
                  </span>
                  <span className="text-2xl">{emoji}</span>
                </div>
              ))}`
  );

  fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
}
patchAdminChatSection();
console.log("Patched Admin Chat");
