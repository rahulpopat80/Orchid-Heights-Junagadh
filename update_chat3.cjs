const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

// 1. Mic import
if (!code.includes('Mic')) {
  code = code.replace(/Copy \} from 'lucide-react';/, "Copy, Mic } from 'lucide-react';");
}

// 2. Reaction Position & Highlight
code = code.replace(
  /top: menuPosition \? Math\.min\(menuPosition\.y, window\.innerHeight - 200\) : '50%',/g,
  "top: menuPosition ? Math.max(10, Math.min(menuPosition.y - 60, window.innerHeight - 140)) : '50%',"
);

// Reaction highlight
code = code.replace(
  /<button key=\{emoji\} onClick=\{\(\) => handleReact\(msg\.id, emoji\)\} className="text-xl hover:scale-125 transition-transform">/g,
  `<button key={emoji} onClick={() => handleReact(msg.id, msg.reactions && msg.reactions[\`\${session.wing}-\${session.flatNo}\`] === emoji ? null : emoji)} className={\`text-xl hover:scale-125 transition-transform \${msg.reactions && msg.reactions[\`\\\${session.wing}-\\\${session.flatNo}\`] === emoji ? 'bg-slate-200 rounded-full scale-110 p-1' : ''}\`}>`
);

// 3. Reaction List View (Top & toggle)
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
                   const myId = \`\${session.wing}-\${session.flatNo}\`;
                   if (rA === myId) return -1;
                   if (rB === myId) return 1;
                   return 0;
                })
                .map(([reactor, emoji]) => {
                  const isMe = reactor === \`\${session.wing}-\${session.flatNo}\`;
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
                        {reactor === 'admin' ? 'Admin' : (isMe ? 'You' : \`Flat \${reactor}\`)}
                      </span>
                      <span className="text-2xl">{emoji}</span>
                    </div>
                  );
              })}`;
if (code.includes(reactionListMatch)) {
  code = code.replace(reactionListMatch, reactionListNew);
}

// 4. Select None for Reply Preview
code = code.replace(
  /className="bg-black\/5 border-l-4 border-emerald-500 rounded p-2 mb-2 cursor-pointer active:opacity-70 transition-opacity"/g,
  'className="bg-black/5 border-l-4 border-emerald-500 rounded p-2 mb-2 cursor-pointer active:opacity-70 transition-opacity select-none"'
);

// 5. Reply Input Preview Position
// Find the {replyingTo && ( ... )} at the bottom
const replyingToMatchRegex = /\{replyingTo && \(\s*<div className="mb-2 p-2 bg-slate-50 rounded-xl flex justify-between items-center border-l-4 border-emerald-500 shadow-sm mx-1">\s*<div className="flex-1 truncate">\s*<div className="text-xs font-bold text-emerald-700 mb-0\.5">\s*\{replyingTo\.senderWing === session\.wing && replyingTo\.senderFlatNo === session\.flatNo \? 'You' : \(replyingTo\.senderOwnerName \|\| 'Resident'\)\}\s*<\/div>\s*<div className="text-sm text-slate-600 truncate pr-4">\{replyingTo\.text \|\| 'Photo'\}<\/div>\s*<\/div>\s*<button onClick=\{\(\) => setReplyingTo\(null\)\} className="p-1\.5 bg-slate-200 text-slate-500 hover:bg-slate-300 rounded-full transition shrink-0">\s*<X className="w-4 h-4" \/>\s*<\/button>\s*<\/div>\s*\)\}/;

const newReplyingTo = `{replyingTo && (
        <div className="absolute bottom-full left-0 right-0 px-2 pb-1 z-0 animate-in slide-in-from-bottom-2 duration-200">
          <div className="bg-slate-100/95 backdrop-blur-sm rounded-t-xl rounded-b-md p-2 flex justify-between items-center shadow-lg border-l-4 border-emerald-500">
            <div className="flex-1 truncate pl-1">
              <div className="text-xs font-bold text-emerald-700 mb-0.5">
                {replyingTo.senderWing === session.wing && replyingTo.senderFlatNo === session.flatNo ? 'You' : (replyingTo.senderOwnerName || 'Resident')}
              </div>
              <div className="text-sm text-slate-600 truncate pr-4">{replyingTo.text || 'Photo'}</div>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1.5 bg-slate-200 text-slate-500 hover:bg-slate-300 rounded-full transition shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}`;

if (replyingToMatchRegex.test(code)) {
  code = code.replace(replyingToMatchRegex, newReplyingTo);
  // Also we need to make the container relative
  code = code.replace(
    /<div className="p-3 bg-white border-t border-slate-200">/,
    '<div className="relative p-3 bg-white border-t border-slate-200">'
  );
}

// Write it back
fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
console.log("ChatSection patches 1-5 applied");
