const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

// 1. Remove the broken closing tags. Let's find exactly:
const brokenTags = `          {activeMessageId === msg.id && (
             <>
               <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMessageId(null); }}></div>
               <div className="absolute top-8 right-4 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col min-w-[140px] animate-in fade-in zoom-in duration-200">
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
            </>
          )}
        </div>
      </div>
    );`;

const correctClosing = `          {activeMessageId === msg.id && (
             <>
               <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMessageId(null); }}></div>
               <div className="absolute top-8 right-4 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col min-w-[140px] animate-in fade-in zoom-in duration-200">
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
        </div>
      </div>
    );`;

code = code.replace(brokenTags, correctClosing);

// Now apply the opening tags and formatText properly
const originalBubbleStart = `<div className={\`relative p-2.5 pb-5 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm border \${
          isMe ? 'bg-[#DCF8C6] text-slate-800 border-[#c6e4b1] rounded-tr-none' : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
        }\`}>
          {msg.text && <p className="whitespace-pre-wrap text-sm pr-10">{msg.text}</p>}
          
          {msg.mediaUrl && (`;

const newBubbleStart = `<div 
          onPointerDown={() => handlePointerDown(msg.id)}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onContextMenu={(e) => handleContextMenu(msg.id, e)}
          className={\`relative p-2.5 pb-5 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm border \${
          isMe ? 'bg-[#DCF8C6] text-slate-800 border-[#c6e4b1] rounded-tr-none' : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
        }\`}>
          {editingMessageId === msg.id ? (
            <div className="flex flex-col gap-2 mt-1 bg-white/60 p-2 rounded-xl">
              <input
                type="text"
                value={editInputText}
                onChange={(e) => setEditInputText(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Edit text..."
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 mt-1">
                <button onClick={() => setEditingMessageId(null)} className="p-1 text-slate-600 rounded hover:bg-slate-200 px-2 text-xs font-bold transition">
                  Cancel
                </button>
                <button onClick={() => handleSaveEdit(msg.id)} className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 px-3 text-xs font-bold transition shadow-sm">
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
          {msg.text && <p className="whitespace-pre-wrap text-sm pr-10">{formatMessageText(msg.text)}</p>}
          
          {msg.mediaUrl && (`;

if (code.includes(originalBubbleStart)) {
  code = code.replace(originalBubbleStart, newBubbleStart);
  
  // also need to close it before the end div
  // wait, I just replaced `brokenTags` with `correctClosing`. I need to insert `</>)}` before `</div></div>);`
  // So `correctClosing` should actually have the `</>)}` right before `</div></div>);`!
  // Let me replace `correctClosing` again to add it.
  code = code.replace(correctClosing, correctClosing.replace('        </div>\n      </div>\n    );', '            </>\n          )}\n        </div>\n      </div>\n    );'));
} else {
  console.log("Could not find originalBubbleStart");
}

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
console.log("Fixed JSX syntax");
