const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

// 1. Add state variables for poll editing
if (!code.includes('const [editPollQuestion, setEditPollQuestion]')) {
  code = code.replace(
    'const [uploading, setUploading] = useState(false);',
    'const [uploading, setUploading] = useState(false);\n  const [editPollQuestion, setEditPollQuestion] = useState("");\n  const [editPollOptions, setEditPollOptions] = useState<{id: string, text: string}[]>([]);'
  );
}

// 2. Update handleEdit
const targetHandleEdit = `  const handleEdit = (msg: ChatMessage) => {
    setEditingId(msg.id);
    setEditVal(msg.text || '');
    setRemoveMedia(false);
    setNewMediaUrl(null);
    setNewMediaName(null);
    setNewMediaType(null);
  };`;

const replaceHandleEdit = `  const handleEdit = (msg: ChatMessage) => {
    setEditingId(msg.id);
    setEditVal(msg.text || '');
    setRemoveMedia(false);
    setNewMediaUrl(null);
    setNewMediaName(null);
    setNewMediaType(null);
    if (msg.isPoll) {
      setEditPollQuestion(msg.pollQuestion || '');
      setEditPollOptions(msg.pollOptions ? [...msg.pollOptions] : []);
    } else {
      setEditPollQuestion('');
      setEditPollOptions([]);
    }
  };`;

if (code.includes(targetHandleEdit)) {
  code = code.replace(targetHandleEdit, replaceHandleEdit);
}

// 3. Update saveEdit
const targetSaveEdit = `  const saveEdit = async (id: string) => {
    const newVal = editVal;
    const updates: Partial<ChatMessage> = { text: newVal };
    
    if (removeMedia && !newMediaUrl) {
      updates.mediaUrl = null;
      updates.mediaName = null;
      updates.mediaType = null;
    } else if (newMediaUrl) {
      updates.mediaUrl = newMediaUrl;
      updates.mediaName = newMediaName;
      updates.mediaType = newMediaType;
    }

    setMessages(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          text: newVal,
          ...(removeMedia && !newMediaUrl ? { mediaUrl: undefined, mediaName: undefined, mediaType: undefined } : {}),
          ...(newMediaUrl ? { mediaUrl: newMediaUrl, mediaName: newMediaName, mediaType: newMediaType } : {})
        };
      }
      return m;
    }));
    setEditingId(null);

    try {
      await api.updateChatMessage(id, updates);
    } catch (e) {
      console.error(e);
      alert('Failed to update message.');
    }
  };`;

const replaceSaveEdit = `  const saveEdit = async (id: string) => {
    const newVal = editVal;
    const updates: Partial<ChatMessage> = { text: newVal };
    
    if (removeMedia && !newMediaUrl) {
      updates.mediaUrl = null;
      updates.mediaName = null;
      updates.mediaType = null;
    } else if (newMediaUrl) {
      updates.mediaUrl = newMediaUrl;
      updates.mediaName = newMediaName;
      updates.mediaType = newMediaType;
    }

    if (editPollQuestion) {
      updates.pollQuestion = editPollQuestion;
      updates.pollOptions = editPollOptions;
    }

    setMessages(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          text: newVal,
          ...(removeMedia && !newMediaUrl ? { mediaUrl: undefined, mediaName: undefined, mediaType: undefined } : {}),
          ...(newMediaUrl ? { mediaUrl: newMediaUrl, mediaName: newMediaName, mediaType: newMediaType } : {}),
          ...(editPollQuestion ? { pollQuestion: editPollQuestion, pollOptions: editPollOptions } : {})
        };
      }
      return m;
    }));
    setEditingId(null);

    try {
      await api.updateChatMessage(id, updates);
    } catch (e) {
      console.error(e);
      alert('Failed to update message.');
    }
  };`;

if (code.includes(targetSaveEdit)) {
  code = code.replace(targetSaveEdit, replaceSaveEdit);
}

// 4. Update the render logic inside editing condition
const targetEditRender = `                      <div className="flex flex-col gap-2 mt-2 bg-slate-100 p-3 rounded-xl border border-slate-200">
                        <input
                          type="text"
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Edit text..."
                        />
                        
                        {(msg.mediaUrl || newMediaUrl) && (`;

const replaceEditRender = `                      <div className="flex flex-col gap-2 mt-2 bg-slate-100 p-3 rounded-xl border border-slate-200">
                        {(!msg.isPoll || editVal) && (
                          <input
                            type="text"
                            value={editVal}
                            onChange={(e) => setEditVal(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Edit text..."
                          />
                        )}
                        
                        {msg.isPoll && (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={editPollQuestion}
                              onChange={(e) => setEditPollQuestion(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Poll Question"
                            />
                            <div className="pl-4 border-l-2 border-indigo-200 space-y-2">
                              {editPollOptions.map((opt, i) => (
                                <input
                                  key={opt.id}
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) => {
                                    const newOpts = [...editPollOptions];
                                    newOpts[i].text = e.target.value;
                                    setEditPollOptions(newOpts);
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-sm outline-none focus:border-indigo-400"
                                  placeholder={"Option " + (i+1)}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {(msg.mediaUrl || newMediaUrl) && (`;

if (code.includes(targetEditRender)) {
  code = code.replace(targetEditRender, replaceEditRender);
}

// 5. Remove restriction on Edit button for polls
const targetEditButton = `                    {!msg.isPoll && (
                      <button onClick={() => handleEdit(msg)} className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg transition shadow-sm">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}`;

const replaceEditButton = `                    <button onClick={() => handleEdit(msg)} className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg transition shadow-sm">
                      <Edit2 className="w-4 h-4" />
                    </button>`;

if (code.includes(targetEditButton)) {
  code = code.replace(targetEditButton, replaceEditButton);
}

fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
console.log("Patched Admin poll edit logic");
