const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

if (!code.includes("import { uploadFileInChunks")) {
  code = code.replace(
    "import { downloadChunkedFile } from '../../lib/fileStorage';",
    "import { downloadChunkedFile, uploadFileInChunks } from '../../lib/fileStorage';"
  );
}

if (!code.includes("import React, { useState, useEffect, useRef }")) {
  code = code.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';"
  );
}

const targetState = `  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');`;

const replaceState = `  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [removeMedia, setRemoveMedia] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState<string | null>(null);
  const [newMediaType, setNewMediaType] = useState<string | null>(null);
  const [newMediaName, setNewMediaName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);`;

code = code.replace(targetState, replaceState);

const targetHandleEdit = `  const handleEdit = (msg: ChatMessage) => {
    setEditingId(msg.id);
    setEditVal(msg.text || '');
  };`;

const replaceHandleEdit = `  const handleEdit = (msg: ChatMessage) => {
    setEditingId(msg.id);
    setEditVal(msg.text || '');
    setRemoveMedia(false);
    setNewMediaUrl(null);
    setNewMediaName(null);
    setNewMediaType(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 15 * 1024 * 1024) {
      alert("File is too large! Maximum allowed is 15MB.");
      return;
    }
    setUploading(true);
    try {
      const metadata = await uploadFileInChunks(file);
      setNewMediaUrl(metadata.fileId);
      setNewMediaName(metadata.name);
      setNewMediaType(metadata.type);
      setRemoveMedia(true); // this means we replace old media
    } catch (err) {
      console.error(err);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };`;

code = code.replace(targetHandleEdit, replaceHandleEdit);

const targetSaveEdit = `  const saveEdit = async (id: string) => {
    const newVal = editVal;
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text: newVal } : m));
    setEditingId(null);
    await api.updateChatMessage(id, { text: newVal });
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
    await api.updateChatMessage(id, updates);
  };`;

code = code.replace(targetSaveEdit, replaceSaveEdit);

const targetEditor = `{editingId === msg.id ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-sm outline-none"
                        />
                        <button onClick={() => saveEdit(msg.id)} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (`;

const replaceEditor = `{editingId === msg.id ? (
                      <div className="flex flex-col gap-2 mt-2 bg-slate-100 p-3 rounded-xl border border-slate-200">
                        <input
                          type="text"
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Edit text..."
                        />
                        
                        {(msg.mediaUrl || newMediaUrl) && (
                           <div className="flex items-center gap-3 text-xs bg-white p-2 rounded-lg border border-slate-200">
                             <span className="font-bold text-slate-600">Attached:</span>
                             <span className="truncate flex-1">{newMediaName || msg.mediaName}</span>
                             {(!removeMedia || newMediaUrl) && (
                               <button 
                                 onClick={() => { setRemoveMedia(true); setNewMediaUrl(null); }} 
                                 className="text-red-600 font-bold hover:underline"
                               >
                                 Remove
                               </button>
                             )}
                             {(removeMedia && !newMediaUrl) && (
                               <span className="text-red-500 italic">Will be removed</span>
                             )}
                           </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                           <div className="flex items-center gap-2">
                             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                             <button 
                               onClick={() => fileInputRef.current?.click()} 
                               disabled={uploading}
                               className="text-xs bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-200 transition"
                             >
                               {uploading ? 'Uploading...' : (msg.mediaUrl || newMediaUrl ? 'Change Media' : 'Add Media')}
                             </button>
                           </div>
                           <div className="flex items-center gap-2">
                              <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 px-3 text-xs font-bold transition">
                                Cancel
                              </button>
                              <button onClick={() => saveEdit(msg.id)} disabled={uploading} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 px-4 text-xs font-bold transition">
                                Save
                              </button>
                           </div>
                        </div>
                      </div>
                    ) : (`;

code = code.replace(targetEditor, replaceEditor);

const targetButtons = `                  <div className="flex items-start gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {!msg.isPoll && !msg.mediaUrl && (
                      <button onClick={() => handleEdit(msg)} className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(msg.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>`;

const replaceButtons = `                  <div className="flex items-start gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {!msg.isPoll && (
                      <button onClick={() => handleEdit(msg)} className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg transition shadow-sm">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(msg.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg transition shadow-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>`;

code = code.replace(targetButtons, replaceButtons);

fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
console.log("Patched AdminChatSection to support full text/media editing!");
