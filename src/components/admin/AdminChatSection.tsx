import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, FlatOwner } from '../../types';
import { api } from '../../lib/api';
import { Trash2, Edit2, MessageSquare, Download, Check, X } from 'lucide-react';
import { downloadChunkedFile, uploadFileInChunks } from '../../lib/fileStorage';
import ChunkedMedia from '../ChunkedMedia';

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
      return resolve(file);
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max = 1200;
        if (width > max || height > max) {
          if (width > height) {
            height = Math.round((height *= max / width));
            width = max;
          } else {
            width = Math.round((width *= max / height));
            height = max;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return resolve(file);
          const newFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(newFile);
        }, 'image/jpeg', 0.7);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

const formatMessageText = (text: string): React.ReactNode => {
  if (!text) return null;
  const match = text.match(/(\*|_|-)([\s\S]*?)\1/);
  if (!match) return <>{text}</>;
  
  const fullMatch = match[0];
  const char = match[1];
  const innerText = match[2];
  const index = match.index!;
  
  const before = text.substring(0, index);
  const after = text.substring(index + fullMatch.length);
  
  let wrappedInner: React.ReactNode = formatMessageText(innerText);
  if (char === '*') wrappedInner = <strong>{wrappedInner}</strong>;
  if (char === '_') wrappedInner = <u>{wrappedInner}</u>;
  if (char === '-') wrappedInner = <em>{wrappedInner}</em>;
  
  return (
    <React.Fragment>
      {formatMessageText(before)}
      {wrappedInner}
      {formatMessageText(after)}
    </React.Fragment>
  );
};

export default function AdminChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewReactionsForMsg, setViewReactionsForMsg] = useState<ChatMessage | null>(null);
  const [showCustomEmojiInput, setShowCustomEmojiInput] = useState<string | null>(null);
  const [customEmoji, setCustomEmoji] = useState<string>('');
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  const handleReact = async (messageId: string, emoji: string | null) => {
    setActiveMessageId(null);
    setShowCustomEmojiInput(null);
    setCustomEmoji('');
    
    const reactorId = "admin";
    
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
  };
  const [owners, setOwners] = useState<FlatOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewMediaMsg, setPreviewMediaMsg] = useState<ChatMessage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [removeMedia, setRemoveMedia] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState<string | null>(null);
  const [newMediaType, setNewMediaType] = useState<string | null>(null);
  const [newMediaName, setNewMediaName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editPollQuestion, setEditPollQuestion] = useState("");
  const [editPollOptions, setEditPollOptions] = useState<{id: string, text: string}[]>([]);
  const [viewVotersForPoll, setViewVotersForPoll] = useState<ChatMessage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const ownerList = await api.getOwners();
        setOwners(ownerList);
      } catch (e) {
        console.error(e);
      }
    };
    fetchOwners();
    // Fire and forget cleanup task
    api.cleanupOldChatMessages().catch(console.error);

    const unsub = api.subscribeToChatMessages((msgs) => {
      setMessages(msgs);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      setMessages(prev => prev.filter(m => m.id !== id));
      await api.deleteChatMessage(id);
    }
  };

  const handleEdit = (msg: ChatMessage) => {
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
      const processedFile = await compressImage(file);
      const metadata = await uploadFileInChunks(processedFile);
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
  };

  const saveEdit = async (id: string) => {
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
  };

  const downloadMedia = async (fileId: string, filename: string) => {
    try {
      const data = await downloadChunkedFile(fileId);
      const link = document.createElement('a');
      link.href = data.base64;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to download file.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-slate-800">Community Chat Logs</h2>
            <p className="text-sm text-slate-500">Monitor and moderate all resident messages (Retained for 1 month)</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center text-slate-500 py-10">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-500 py-10">No messages in the last month.</div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => {
              const flatOwnerInfo = owners.find(o => String(o.wing) === String(msg.senderWing) && String(o.flatNo) === String(msg.senderFlatNo));
              
              // Forcefully ensure we don't display family member names. Always use the registered owner if found.
              let senderTitle = `Resident (${msg.senderWing}-${msg.senderFlatNo})`;
              
              if (flatOwnerInfo && flatOwnerInfo.nameEn) {
                senderTitle = `${flatOwnerInfo.nameEn} (${msg.senderWing}-${msg.senderFlatNo})`;
              } else if (msg.senderOwnerName) {
                senderTitle = `${msg.senderOwnerName} (${msg.senderWing}-${msg.senderFlatNo})`;
              }

              return (
                <div key={msg.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-slate-800 text-sm">{senderTitle}</span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(msg.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {editingId === msg.id ? (
                      <div className="flex flex-col gap-2 mt-2 bg-slate-100 p-3 rounded-xl border border-slate-200">
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
                    ) : (
                      <>
                        {msg.text && <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.text}</p>}
                        
                        {msg.mediaUrl && (
                          <div className="mt-2 max-w-sm">
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded mb-2 inline-block">Media Attached</span>
                            <div onClick={() => msg.mediaType?.startsWith('image/') && setPreviewMediaMsg(msg)} className={msg.mediaType?.startsWith('image/') ? 'cursor-pointer' : ''}>
                <ChunkedMedia fileId={msg.mediaUrl} type={msg.mediaType || ''} fallbackName={msg.mediaName || 'Attachment'} />
              </div>
                          </div>
                        )}

                        {msg.isPoll && (
                          <div className="mt-2 text-xs text-slate-600 bg-white border border-slate-200 p-3 rounded-lg inline-block">
                            <div><span className="font-bold text-indigo-600">Poll:</span> <span className="font-medium text-slate-800">{msg.pollQuestion}</span></div>
                            <div className="mt-2 flex items-center gap-3">
                              <span className="text-slate-500">{msg.pollOptions?.length} options</span>
                              <button 
                                onClick={() => setViewVotersForPoll(msg)}
                                className="font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 transition"
                              >
                                {Object.keys(msg.pollVotes || {}).length} Voted
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-start gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(msg)} className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg transition shadow-sm">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(msg.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg transition shadow-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewVotersForPoll && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Poll Voters</h3>
              <button onClick={() => setViewVotersForPoll(null)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg transition"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 overflow-y-auto space-y-5">
              <p className="font-bold text-sm text-slate-700 leading-snug">{viewVotersForPoll.pollQuestion}</p>
              
              {viewVotersForPoll.pollOptions?.map(opt => {
                const votesForOpt = Object.entries(viewVotersForPoll.pollVotes || {}).filter(([fid, oid]) => oid === opt.id);
                if (votesForOpt.length === 0) return null;
                return (
                  <div key={opt.id} className="space-y-2">
                    <h4 className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md inline-block">
                      {opt.text} ({votesForOpt.length})
                    </h4>
                    <ul className="space-y-1.5">
                      {votesForOpt.map(([fid, _]) => {
                        const [wing, flatNo] = fid.split('-');
                        const flatOwnerInfo = owners.find(o => String(o.wing) === String(wing) && String(o.flatNo) === String(flatNo));
                        // Look up the real owner if there's a stored name, or fallback to generic
                        let voterName = 'Resident';
                        if (flatOwnerInfo && flatOwnerInfo.nameEn) {
                          voterName = flatOwnerInfo.nameEn;
                        } else {
                          voterName = 'Family Member';
                        }

                        return (
                          <li key={fid} className="text-xs flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm">
                            <span className="font-medium text-slate-700 truncate mr-2">{voterName}</span>
                            <span className="font-bold font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">{fid}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
              
              {Object.keys(viewVotersForPoll.pollVotes || {}).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-6 font-medium">No one has voted yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {previewMediaMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
          <button 
            onClick={() => setPreviewMediaMsg(null)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 z-50 p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-4xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center relative">
            <ChunkedMedia 
              fileId={previewMediaMsg.mediaUrl!} 
              type={previewMediaMsg.mediaType!} 
              fallbackName={previewMediaMsg.mediaName!}
              variant="raw"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            {previewMediaMsg.text && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="inline-block bg-black/60 text-white px-4 py-2 rounded-xl text-sm max-w-2xl whitespace-pre-wrap">
                  {formatMessageText(previewMediaMsg.text)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
  

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
                    {reactor === 'admin' ? 'Admin' : `Flat ${reactor}`}
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
  
    </div>
  );
}