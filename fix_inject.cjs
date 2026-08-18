const fs = require('fs');

let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const reactionMenuBlock = `
          {activeMessageId === msg.id && ( 
             <>
               <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setActiveMessageId(null); }}></div>
               {/* Reaction Menu */}
               <div 
                 className={\`relative z-[100] mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col min-w-[240px] max-w-[90vw] animate-in slide-in-from-top-2 duration-100 \${isMe ? 'self-end' : 'self-start'}\`}
                 onClick={e => e.stopPropagation()}
               >
                 <div className="flex items-center gap-2 p-2 border-b border-slate-100 bg-slate-50 justify-between">
                   {['😡', '🙏', '👍', '❤️', '🔥', '🥳'].map(emoji => {
                     const isSelected = msg.reactions?.[flatId] === emoji;
                     return (
                       <button key={emoji} onClick={() => handleReact(msg.id, isSelected ? null : emoji)} className={\`text-xl hover:scale-125 transition-transform p-1 rounded-full \${isSelected ? 'bg-slate-200/80' : ''}\`}>
                         {emoji}
                       </button>
                     );
                   })}
                   <button onClick={(e) => { e.stopPropagation(); setShowCustomEmojiInput(msg.id); }} className="text-xl hover:scale-125 transition-transform text-slate-400 font-bold">+</button>
                 </div>
                 {showCustomEmojiInput === msg.id && (
                   <div className="p-2 border-b border-slate-100 flex gap-2 items-center bg-white">
                     <input type="text" value={customEmoji} onChange={e => setCustomEmoji(e.target.value)} className="flex-1 border rounded px-2 py-1 text-sm outline-none" placeholder="Paste emoji..." autoFocus />
                     <button onClick={() => handleReact(msg.id, customEmoji)} className="bg-emerald-600 text-white px-3 py-1 rounded text-sm font-bold">Go</button>
                   </div>
                 )}
                 <button onClick={() => { navigator.clipboard.writeText(msg.text || ''); setActiveMessageId(null); }} className="px-4 py-3 text-sm text-left hover:bg-slate-50 text-slate-700 font-bold border-b border-slate-100 flex items-center gap-3">
                   <Copy className="w-4 h-4 text-slate-400" /> Copy Text
                 </button>
                 {isMe && (new Date().getTime() - new Date(msg.createdAt).getTime() < 24 * 60 * 60 * 1000) && !msg.isPoll && !msg.mediaUrl && (
                   <button onClick={() => { setEditInputText(msg.text || ''); setEditingMessageId(msg.id); setActiveMessageId(null); }} className="px-4 py-3 text-sm text-left hover:bg-slate-50 text-indigo-600 font-bold border-b border-slate-100 flex items-center gap-3">
                     <Edit2 className="w-4 h-4" /> Edit
                   </button>
                 )}
                 {isMe && (new Date().getTime() - new Date(msg.createdAt).getTime() < 24 * 60 * 60 * 1000) && (
                   <button onClick={() => { handleDelete(msg.id); setActiveMessageId(null); }} className="px-4 py-3 text-sm text-left hover:bg-red-50 text-red-600 font-bold flex items-center gap-3">
                     <Trash2 className="w-4 h-4" /> Delete
                   </button>
                 )}
               </div>
             </>
          )}
`;

// Find `};` before `return (` in renderMessage.
// Specifically: `</div>\n      </div>\n    );\n  };`
const idx = code.indexOf(`</div>\n      </div>\n    );\n  };`);
if (idx !== -1) {
  code = code.substring(0, idx) + '</div>\n' + reactionMenuBlock + '      </div>\n    );\n  };' + code.substring(idx + 32);
} else {
  console.log("Not found idx!");
}

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
