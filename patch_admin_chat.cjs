const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

// 1. Reaction Position
code = code.replace(
  /top: \(window as any\)\.adminMenuPosition \? Math\.min\(\(window as any\)\.adminMenuPosition\.y, window\.innerHeight - 200\) : '50%',/g,
  "top: (window as any).adminMenuPosition ? Math.max(10, Math.min((window as any).adminMenuPosition.y - 60, window.innerHeight - 140)) : '50%',"
);

// Reaction highlight
code = code.replace(
  /<button key=\{emoji\} onClick=\{\(\) => handleReact\(msg\.id, emoji\)\} className="text-xl hover:scale-125 transition-transform">/g,
  `<button key={emoji} onClick={() => handleReact(msg.id, msg.reactions && msg.reactions['admin'] === emoji ? null : emoji)} className={\`text-xl hover:scale-125 transition-transform \${msg.reactions && msg.reactions['admin'] === emoji ? 'bg-slate-200 rounded-full scale-110 p-1' : ''}\`}>`
);

// 3. Reaction List View
const reactionListMatch = `              {Object.entries(viewReactionsForMsg.reactions || {}).map(([reactor, emoji]) => (
                <div key={reactor} className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="font-medium text-slate-700 text-sm">
                    {reactor === 'admin' ? 'Admin' : \`Flat \${reactor}\`}
                  </span>
                  <span className="text-2xl">{emoji}</span>
                </div>
              ))}`;

const reactionListNew = `              {Object.entries(viewReactionsForMsg.reactions || {})
                .sort(([rA], [rB]) => {
                   if (rA === 'admin') return -1;
                   if (rB === 'admin') return 1;
                   return 0;
                })
                .map(([reactor, emoji]) => {
                  const isMe = reactor === 'admin';
                  return (
                    <div 
                      key={reactor} 
                      className={\`flex items-center justify-between border-b border-slate-50 pb-2 \${isMe ? 'cursor-pointer hover:bg-slate-50' : ''}\`}
                      onClick={() => {
                        if (isMe) {
                          handleReact(viewReactionsForMsg.id, null);
                          setViewReactionsForMsg(null);
                        }
                      }}
                    >
                      <span className={\`text-sm \${isMe ? 'font-bold text-emerald-600' : 'font-medium text-slate-700'}\`}>
                        {reactor === 'admin' ? 'You (Admin)' : \`Flat \${reactor}\`}
                      </span>
                      <span className="text-2xl">{emoji}</span>
                    </div>
                  );
              })}`;

if (code.includes(reactionListMatch)) {
  code = code.replace(reactionListMatch, reactionListNew);
} else {
  console.log("No reaction match found in admin");
}

fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
console.log("Admin Chat Patched");
