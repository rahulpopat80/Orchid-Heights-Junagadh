const fs = require('fs');

function patchFile(file, isResident) {
  let code = fs.readFileSync(file, 'utf8');

  // Add state variables
  const stateInjection = `  const [viewReactionsForMsg, setViewReactionsForMsg] = useState<ChatMessage | null>(null);
  const [showCustomEmojiInput, setShowCustomEmojiInput] = useState<string | null>(null);
  const [customEmoji, setCustomEmoji] = useState<string>('');
  
  const handleReact = async (messageId: string, emoji: string | null) => {
    setActiveMessageId(null);
    setShowCustomEmojiInput(null);
    setCustomEmoji('');
    
    const reactorId = ${isResident ? 'flatId' : '"admin"'};
    
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const newReactions = { ...(m.reactions || {}) };
        if (emoji) {
          newReactions[reactorId] = emoji;
        } else {
          delete newReactions[reactorId];
        }
        return { ...m, reactions: newReactions };
      }
      return m;
    }));
    await api.reactToMessage(messageId, reactorId, emoji);
  };`;

  if (!code.includes('handleReact =')) {
    code = code.replace(
      'const [activeMessageId, setActiveMessageId] = useState<string | null>(null);',
      'const [activeMessageId, setActiveMessageId] = useState<string | null>(null);\n' + stateInjection
    );
  }

  // Make text non-selectable
  code = code.replace(
    'className="whitespace-pre-wrap text-sm pr-10"',
    'className="whitespace-pre-wrap text-sm pr-10 select-none"'
  );

  // Reaction Bar
  const reactionBar = `
               <div className="flex items-center gap-2 p-2 border-b border-slate-100 bg-slate-50 justify-between">
                 {['😡', '🙏', '👍', '❤️', '🔥', '🥳'].map(emoji => (
                   <button key={emoji} onClick={() => handleReact(msg.id, emoji)} className="text-xl hover:scale-125 transition-transform">
                     {emoji}
                   </button>
                 ))}
                 <button onClick={(e) => { e.stopPropagation(); setShowCustomEmojiInput(msg.id); }} className="text-xl hover:scale-125 transition-transform text-slate-400 font-bold">+</button>
               </div>
               {showCustomEmojiInput === msg.id && (
                 <div className="p-2 border-b border-slate-100 flex gap-2 items-center bg-white">
                   <input type="text" value={customEmoji} onChange={e => setCustomEmoji(e.target.value)} className="flex-1 border rounded px-2 py-1 text-sm outline-none" placeholder="Paste emoji..." autoFocus />
                   <button onClick={() => handleReact(msg.id, customEmoji)} className="bg-emerald-600 text-white px-3 py-1 rounded text-sm font-bold">Go</button>
                 </div>
               )}
  `;

  if (code.includes('animate-in fade-in zoom-in duration-200">')) {
    code = code.replace(
      'animate-in fade-in zoom-in duration-200">',
      'animate-in fade-in zoom-in duration-200">\n' + reactionBar
    );
  } else {
    // try without classes exactly
    code = code.replace(
      '<div className="absolute top-8 right-4 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col min-w-[140px]',
      '<div className="absolute top-8 right-4 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col min-w-[280px]'
    );
    // wait I need to replace it carefully
  }
  
  // also update width of menu
  code = code.replace('min-w-[140px]', 'min-w-[240px]');
  
  // Add Reaction bubbles to the message bubble
  const reactionBubble = `
          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
            <div 
              onClick={(e) => { e.stopPropagation(); setViewReactionsForMsg(msg); }}
              className={\`absolute -bottom-3 \${isMe ? 'right-2' : 'left-2'} bg-white border border-slate-200 shadow-sm rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-1 cursor-pointer z-10 hover:bg-slate-50 transition-colors\`}
            >
              {Array.from(new Set(Object.values(msg.reactions))).slice(0, 3).join('')}
              <span className="font-bold text-slate-500 ml-0.5">{Object.keys(msg.reactions).length > 1 ? Object.keys(msg.reactions).length : ''}</span>
            </div>
          )}
  `;

  // Before the activeMessageId modal, or after the timeStr.
  // The timeStr is:
  // <div className={`absolute bottom-1 right-2 text-[9px] ${isMe ? 'text-green-800' : 'text-slate-400'}`}>
  //   {timeStr}
  // </div>
  // We can inject `reactionBubble` right after `timeStr` closing tag `</div>`
  const timeStrHTML = `{timeStr}\n          </div>`;
  if (code.includes(timeStrHTML) && !code.includes('setViewReactionsForMsg(msg)')) {
    code = code.replace(timeStrHTML, timeStrHTML + '\n' + reactionBubble);
  }

  // Add the Reaction Viewer Modal at the end of the file
  const reactionsViewerModal = `
      {viewReactionsForMsg && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200" onClick={() => setViewReactionsForMsg(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Reactions</h3>
              <button onClick={() => setViewReactionsForMsg(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {Object.entries(viewReactionsForMsg.reactions || {}).map(([reactor, emoji]) => (
                <div key={reactor} className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="font-medium text-slate-700 text-sm">
                    {reactor === 'admin' ? 'Admin' : \`Flat \${reactor}\`}
                  </span>
                  <span className="text-2xl">{emoji}</span>
                </div>
              ))}
              {(!viewReactionsForMsg.reactions || Object.keys(viewReactionsForMsg.reactions).length === 0) && (
                <div className="text-center text-slate-400 text-sm">No reactions yet</div>
              )}
            </div>
          </div>
        </div>
      )}
  `;

  if (!code.includes('viewReactionsForMsg && (')) {
     const endPattern = '    </div>\n  );\n}';
     if (code.includes(endPattern)) {
       code = code.replace(endPattern, reactionsViewerModal + '\n' + endPattern);
     } else {
       const endPattern2 = '</div>\n  );\n}';
       code = code.replace(endPattern2, reactionsViewerModal + '\n' + endPattern2);
     }
  }

  fs.writeFileSync(file, code);
}

patchFile('src/components/resident/ChatSection.tsx', true);
patchFile('src/components/admin/AdminChatSection.tsx', false);
console.log("Patched both components");
