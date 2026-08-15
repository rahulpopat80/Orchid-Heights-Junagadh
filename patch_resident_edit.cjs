const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

// 1. Add states
if (!code.includes('const [actionMenuId, setActionMenuId] = useState<string | null>(null);')) {
  code = code.replace(
    'const [pollOptions, setPollOptions] = useState([{ id: \'1\', text: \'\' }, { id: \'2\', text: \'\' }]);',
    `const [pollOptions, setPollOptions] = useState([{ id: '1', text: '' }, { id: '2', text: '' }]);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState<string>('');
  const pressTimer = useRef<NodeJS.Timeout | null>(null);`
  );
}

// 2. Add handlers
const handlers = `
  const handleTouchStart = (msg: ChatMessage, isMe: boolean) => {
    if (!isMe) return;
    const msgTime = new Date(msg.createdAt).getTime();
    const isWithin24h = Date.now() - msgTime < 24 * 60 * 60 * 1000;
    if (!isWithin24h) return;
    
    pressTimer.current = setTimeout(() => {
      setActionMenuId(msg.id);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleTouchMove = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const startEdit = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    setEditVal(msg.text || '');
    setActionMenuId(null);
  };

  const saveEdit = async (id: string) => {
    try {
      await api.updateChatMessage(id, { text: editVal });
      setEditingMsgId(null);
    } catch(e) {
      alert("Failed to edit");
    }
  };

  const deleteMsg = async (id: string) => {
    if(confirm("Delete this message?")) {
      try {
        await api.deleteChatMessage(id);
        setActionMenuId(null);
      } catch(e) {
        alert("Failed to delete");
      }
    }
  };

  const renderMessage`;

code = code.replace('const renderMessage', handlers);

// 3. Update renderMessage structure
const targetRenderMessage = `        <div className={\`relative p-2.5 pb-5 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm border \${
          isMe ? 'bg-[#DCF8C6] text-slate-800 border-[#c6e4b1] rounded-tr-none' : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
        }\`}>
          {msg.text && <p className="whitespace-pre-wrap text-sm pr-10">{msg.text}</p>}`;

const replaceRenderMessage = `        <div className="relative flex">
          {actionMenuId === msg.id && isMe && (
            <div className="mr-2 self-center bg-white shadow-lg rounded-xl border border-slate-200 flex flex-col overflow-hidden z-10 shrink-0">
              <button onClick={() => startEdit(msg)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 whitespace-nowrap">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => deleteMsg(msg.id)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 whitespace-nowrap border-t border-slate-100">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <button onClick={() => setActionMenuId(null)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 whitespace-nowrap border-t border-slate-100">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          )}

          <div 
            onTouchStart={() => handleTouchStart(msg, isMe)}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onMouseDown={() => handleTouchStart(msg, isMe)}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            className={\`relative p-2.5 pb-5 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm border select-none \${isMe ? 'cursor-pointer' : ''} \${
            isMe ? 'bg-[#DCF8C6] text-slate-800 border-[#c6e4b1] rounded-tr-none' : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
          } \${actionMenuId === msg.id ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}\`}
          >
          
          {editingMsgId === msg.id ? (
            <div className="flex flex-col gap-2 mt-1 mb-2 bg-white/60 p-2 rounded-xl border border-[#b2dca0]">
              <input
                type="text"
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Edit message..."
              />
              <div className="flex justify-end gap-2 mt-1">
                <button onClick={() => setEditingMsgId(null)} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300">Cancel</button>
                <button onClick={() => saveEdit(msg.id)} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">Save</button>
              </div>
            </div>
          ) : (
            msg.text && <p className="whitespace-pre-wrap text-sm pr-10">{msg.text}</p>
          )}`;

if (code.includes(targetRenderMessage)) {
  code = code.replace(targetRenderMessage, replaceRenderMessage);
} else {
  console.log("Could not find targetRenderMessage");
}

const targetBottom = `            <span className="text-[10px] text-slate-500">{timeStr}</span>
          </div>
        </div>
      </div>
    );
  };`;

const replaceBottom = `            <span className="text-[10px] text-slate-500">{timeStr}</span>
          </div>
        </div>
        </div>
      </div>
    );
  };`;

if (code.includes(targetBottom)) {
  code = code.replace(targetBottom, replaceBottom);
} else {
  console.log("Could not find targetBottom");
}

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
console.log("Patched Resident ChatSection with Edit/Delete");
