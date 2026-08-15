const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

// 1. formatting text
code = code.replace(
  '{msg.text && <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.text}</p>}',
  '{msg.text && <p className="text-sm text-slate-700 whitespace-pre-wrap select-none">{formatMessageText(msg.text)}</p>}'
);

// 2. Add long press to react
if (!code.includes('onContextMenu={(e)')) {
  code = code.replace(
    '<div className="flex-1">',
    `<div className="flex-1 relative" 
      onPointerDown={(e) => {
        const cx = e.clientX; const cy = e.clientY;
        window.adminLongPress = setTimeout(() => {
          setActiveMessageId(msg.id);
          window.adminMenuPosition = { x: cx, y: cy };
        }, 500);
      }}
      onPointerUp={() => clearTimeout(window.adminLongPress)}
      onPointerLeave={() => clearTimeout(window.adminLongPress)}
      onContextMenu={(e) => {
        e.preventDefault();
        setActiveMessageId(msg.id);
        window.adminMenuPosition = { x: e.clientX, y: e.clientY };
      }}
    >`
  );
}

// 3. Add reaction bubble + menu rendering
const reactionRender = `
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div 
                            onClick={(e) => { e.stopPropagation(); setViewReactionsForMsg(msg); }}
                            className="bg-white border border-slate-200 shadow-sm rounded-full px-2 py-0.5 mt-2 text-xs flex items-center gap-1 cursor-pointer w-fit hover:bg-slate-50 transition-colors"
                          >
                            {Array.from(new Set(Object.values(msg.reactions))).slice(0, 3).join('')}
                            <span className="font-bold text-slate-500 ml-1">{Object.keys(msg.reactions).length > 1 ? Object.keys(msg.reactions).length : ''}</span>
                          </div>
                        )}
                        
                        {activeMessageId === msg.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMessageId(null); }} />
                            <div 
                              className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col min-w-[240px] animate-in zoom-in-95 duration-100"
                              style={{
                                top: window.adminMenuPosition ? Math.min(window.adminMenuPosition.y, window.innerHeight - 200) : '50%',
                                left: window.adminMenuPosition ? Math.min(window.adminMenuPosition.x, window.innerWidth - 250) : '50%'
                              }}
                              onClick={e => e.stopPropagation()}
                            >
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
                            </div>
                          </>
                        )}
`;

if (!code.includes('activeMessageId === msg.id &&')) {
  // Inject after {msg.isPoll && (
  code = code.replace(
    '{msg.isPoll && (',
    reactionRender + '\n                        {msg.isPoll && ('
  );
}

fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
console.log("AdminChatSection patched");
