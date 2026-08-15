const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

// 1. Add lucide import for Copy
if (!code.includes('Copy,')) {
  code = code.replace('import { Send, Image as ImageIcon, File as FileIcon, BarChart2, Trash2, Edit2, X, Plus }', 'import { Send, Image as ImageIcon, File as FileIcon, BarChart2, Trash2, Edit2, X, Plus, Copy }');
}

// 2. Add formatMessageText helper
const formatHelper = `const formatMessageText = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\\\*[^*]+\\\*|_.*?_|-.*?-[^-]*?)/g); // simplistic split doesn't work well
  // Better regex for the specific pattern matching:
  const parts2 = text.split(/(\\\*[^*]+\\\*|_[^_]+_|-[^-]+-)/g);
  return parts2.map((part, i) => {
    if (part.length > 2) {
      if (part.startsWith('*') && part.endsWith('*')) return <strong key={i}>{part.slice(1, -1)}</strong>;
      if (part.startsWith('_') && part.endsWith('_')) return <u key={i}>{part.slice(1, -1)}</u>;
      if (part.startsWith('-') && part.endsWith('-')) return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};`;

if (!code.includes('const formatMessageText')) {
  code = code.replace('export default function ChatSection', formatHelper + '\n\nexport default function ChatSection');
}

// 3. Add states for edit/delete/long-press
const stateHooks = `  // Poll state
  const [showPollModal, setShowPollModal] = useState(false);
  const [viewVotersForPoll, setViewVotersForPoll] = useState<ChatMessage | null>(null);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState([{ id: '1', text: '' }, { id: '2', text: '' }]);
  
  // Message Action State
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInputText, setEditInputText] = useState<string>('');
  const longPressTimer = useRef<any>(null);

  const handlePointerDown = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      setActiveMessageId(id);
    }, 500);
  };
  const handlePointerUp = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };
  const handleContextMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveMessageId(id);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editInputText.trim()) return;
    try {
      await api.updateChatMessage(id, { text: editInputText.trim() });
      setEditingMessageId(null);
      setEditInputText('');
    } catch (e) {
      console.error(e);
      alert("Failed to edit message");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this message for everyone?")) {
      try {
        await api.deleteChatMessage(id);
      } catch(e) {
        console.error(e);
        alert("Failed to delete");
      }
    }
  };`;

if (code.includes('// Poll state')) {
  const oldPollState = `  // Poll state
  const [showPollModal, setShowPollModal] = useState(false);
  const [viewVotersForPoll, setViewVotersForPoll] = useState<ChatMessage | null>(null);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState([{ id: '1', text: '' }, { id: '2', text: '' }]);`;
  code = code.replace(oldPollState, stateHooks);
}

// 4. Wrap message content with gesture handlers and format text
const targetRenderMessage = `        <div className={\`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-sm \${
          isMe 
            ? 'bg-[#DCF8C6] text-slate-800 border-[#c6e4b1] rounded-tr-none' 
            : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
        }\`}>
          {msg.text && <p className="whitespace-pre-wrap text-sm pr-10">{msg.text}</p>}
          
          {msg.mediaUrl && (`;

const replaceRenderMessage = `        <div 
          onPointerDown={() => handlePointerDown(msg.id)}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onContextMenu={(e) => handleContextMenu(msg.id, e)}
          className={\`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-sm \${
          isMe 
            ? 'bg-[#DCF8C6] text-slate-800 border-[#c6e4b1] rounded-tr-none' 
            : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
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

if (code.includes(targetRenderMessage)) {
  code = code.replace(targetRenderMessage, replaceRenderMessage);
}

// 5. Add overlay for active message action menu
const targetBottomTime = `          <div className={\`absolute bottom-1 right-2 text-[9px] \${isMe ? 'text-green-800' : 'text-slate-400'}\`}>
            {timeStr}
          </div>
        </div>
      </div>
    );`;

const replaceBottomTime = `          <div className={\`absolute bottom-1 right-2 text-[9px] \${isMe ? 'text-green-800' : 'text-slate-400'}\`}>
            {timeStr}
          </div>
          
          {activeMessageId === msg.id && (
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

if (code.includes(targetBottomTime)) {
  code = code.replace(targetBottomTime, replaceBottomTime);
}

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
console.log("Patched Resident ChatSection with formatting and actions");
