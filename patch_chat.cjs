const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

// Add states
if (!code.includes('replyingTo')) {
  code = code.replace(
    'const [inputText, setInputText] = useState(\'\');',
    `const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const touchStartX = useRef<number | null>(null);`
  );
}

// Update menuPosition in handlePointerDown and handleContextMenu
code = code.replace(
  'const handlePointerDown = (id: string) => {',
  `const handlePointerDown = (id: string, e: React.PointerEvent) => {
    const cx = e.clientX; const cy = e.clientY;
    longPressTimer.current = setTimeout(() => {
      setActiveMessageId(id);
      setMenuPosition({ x: cx, y: cy });
    }, 500);
  };`
);

// We need to replace onPointerDown={() => handlePointerDown(msg.id)} with (e) => handlePointerDown(msg.id, e)
code = code.replace(
  'onPointerDown={() => handlePointerDown(msg.id)}',
  'onPointerDown={(e) => handlePointerDown(msg.id, e)}'
);

code = code.replace(
  'const handleContextMenu = (id: string, e: React.MouseEvent) => {',
  `const handleContextMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveMessageId(id);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };`
);

// Add swipe handlers to the message bubble
const bubbleOpeningStr = 'onPointerCancel={handlePointerUp}';
if (!code.includes('onTouchStart={')) {
  code = code.replace(
    bubbleOpeningStr,
    `onPointerCancel={handlePointerUp}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchMove={(e) => {
             if (touchStartX.current) {
                const diff = e.touches[0].clientX - touchStartX.current;
                if (diff > 50) { // Swiped right
                  setReplyingTo(msg);
                  touchStartX.current = null;
                }
             }
          }}
          onTouchEnd={() => { touchStartX.current = null; }}`
  );
}

// Add id to the message wrapper
code = code.replace(
  'className={`flex flex-col mb-2 ${isMe ? \'items-end\' : \'items-start\'}`}',
  'id={`msg-${msg.id}`} className={`flex flex-col mb-2 ${isMe ? \'items-end\' : \'items-start\'}`}'
);

// Update reaction menu to use menuPosition
const oldMenu = '<div className="absolute top-8 right-4 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col min-w-[240px] animate-in fade-in zoom-in duration-200">';
if (code.includes(oldMenu)) {
  code = code.replace(oldMenu, `{/* Reaction Menu */}
        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMessageId(null); }} />
        <div 
          className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col min-w-[240px] animate-in zoom-in-95 duration-100"
          style={{
             top: menuPosition ? Math.min(menuPosition.y, window.innerHeight - 200) : '50%',
             left: menuPosition ? (isMe ? Math.max(10, menuPosition.x - 240) : Math.min(menuPosition.x, window.innerWidth - 250)) : '50%'
          }}
          onClick={e => e.stopPropagation()}
        >`);
}

// Add replied message preview to the bubble
if (!code.includes('if (msg.replyToMessageId) {')) {
  // Let's inject it inside the bubble right before text
  code = code.replace(
    '{editingMessageId === msg.id ? (',
    `{msg.replyToMessageId && (
            (() => {
              const repliedMsg = messages.find(m => m.id === msg.replyToMessageId);
              if (!repliedMsg) return null;
              return (
                <div 
                  onClick={() => document.getElementById(\`msg-\${msg.replyToMessageId}\`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className="bg-black/5 border-l-4 border-indigo-500 rounded p-2 mb-2 cursor-pointer active:opacity-70 transition-opacity"
                >
                  <div className="text-[10px] font-bold text-indigo-700">{repliedMsg.senderOwnerName || 'Resident'}</div>
                  <div className="text-xs text-slate-600 truncate">{repliedMsg.text || 'Photo'}</div>
                </div>
              );
            })()
          )}
          {editingMessageId === msg.id ? (`
  );
}

// handleSendMessage update to include replyToMessageId
code = code.replace(
  'text: text || undefined,',
  `text: text || undefined,
      replyToMessageId: replyingTo?.id || undefined,`
);

// Clear replyingTo in handleSendMessage
if (!code.includes('setReplyingTo(null); // Clear reply')) {
  code = code.replace(
    'await api.sendChatMessage(newMsg);',
    `await api.sendChatMessage(newMsg);
    setReplyingTo(null); // Clear reply`
  );
}

// Add the Reply Preview above the input field
const replyPreview = `
        {replyingTo && (
          <div className="bg-slate-100 rounded-t-xl p-3 flex justify-between items-center border-b border-slate-200/60 shadow-sm relative z-0">
            <div className="flex-1 border-l-4 border-indigo-500 pl-2">
              <div className="text-xs font-bold text-indigo-700 mb-0.5">Replying to {replyingTo.senderOwnerName || 'Resident'}</div>
              <div className="text-sm text-slate-600 truncate pr-4">{replyingTo.text || 'Photo'}</div>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1.5 bg-slate-200 text-slate-500 hover:bg-slate-300 rounded-full transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
`;
if (!code.includes('Replying to')) {
  code = code.replace(
    '<div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-40">',
    '<div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-40">\n' + replyPreview
  );
}

// Add Scroll handlers and Scroll to bottom button
if (!code.includes('const handleScroll = (e')) {
  code = code.replace(
    'const flatId = `${session.wing}-${session.flatNo}`;',
    `const flatId = \`\${session.wing}-\${session.flatNo}\`;
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight > 100) {
      setShowScrollDown(true);
    } else {
      setShowScrollDown(false);
    }
  };
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };`
  );
}

// Attach scrollRef and onScroll to the messages container
code = code.replace(
  '<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#E5DDD5]">',
  '<div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#E5DDD5] relative">'
);

// Add scroll button
const scrollButton = `
        {showScrollDown && (
          <button 
            onClick={scrollToBottom}
            className="fixed bottom-24 right-4 bg-white text-slate-500 p-2.5 rounded-full shadow-lg border border-slate-200 z-30 hover:bg-slate-50 transition-all opacity-90 hover:opacity-100"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        )}
`;
if (!code.includes('onClick={scrollToBottom}')) {
  code = code.replace(
    '{messages.length === 0 && !loading && (',
    scrollButton + '\n        {messages.length === 0 && !loading && ('
  );
}

// Fix lucide-react imports
if (!code.includes('ChevronDown')) {
  code = code.replace(
    'Send, Image as ImageIcon, File, X, Check, BarChart2, MessageSquare',
    'Send, Image as ImageIcon, File, X, Check, BarChart2, MessageSquare, ChevronDown'
  );
}

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
console.log("ChatSection patched successfully");
