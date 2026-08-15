import React, { useState, useEffect, useRef } from 'react';
import { UserSession, ChatMessage , FlatOwner} from '../../types';
import { api } from '../../lib/api';
import { Send, Image as ImageIcon, File as FileIcon, BarChart2, Trash2, Edit2, X, Plus, Copy } from 'lucide-react';
import { uploadFileInChunks, downloadChunkedFile } from '../../lib/fileStorage';
import ChunkedMedia from '../ChunkedMedia';

interface ChatSectionProps {
  session: UserSession;
}

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

const formatMessageText = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*[^*]+\*|_.*?_|-.*?-[^-]*?)/g); // simplistic split doesn't work well
  // Better regex for the specific pattern matching:
  const parts2 = text.split(/(\*[^*]+\*|_[^_]+_|-[^-]+-)/g);
  return parts2.map((part, i) => {
    if (part.length > 2) {
      if (part.startsWith('*') && part.endsWith('*')) return <strong key={i}>{part.slice(1, -1)}</strong>;
      if (part.startsWith('_') && part.endsWith('_')) return <u key={i}>{part.slice(1, -1)}</u>;
      if (part.startsWith('-') && part.endsWith('-')) return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

export default function ChatSection({ session }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  const [owners, setOwners] = useState<FlatOwner[]>([]);

  
  // Media upload state
  const [uploading, setUploading] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll state
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
  };

  const flatId = `${session.wing}-${session.flatNo}`;

  useEffect(() => {
    // Disable body scroll when chat is open to make it sticky
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const ownerList = await api.getOwners();
        setOwners(ownerList);
      } catch (e) {
        console.error("Failed to fetch owners", e);
      }
    };
    fetchOwners();
  }, []);


  useEffect(() => {
    const unsub = api.subscribeToChatMessages((msgs) => {
      setMessages(msgs);
      setLoading(false);
      // Auto scroll to bottom could be implemented here
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const handleSendMessage = async (text: string, media?: any, poll?: any) => {
    if (!text && !media && !poll) return;

    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      senderWing: session.wing!,
      senderFlatNo: session.flatNo!,
      senderOwnerName: session.ownerName || 'Resident',
      text: text || undefined,
      createdAt: new Date().toISOString()
    };

    if (media) {
      newMsg.mediaUrl = media.fileId;
      newMsg.mediaType = media.type;
      newMsg.mediaName = media.name;
      newMsg.mediaSize = media.size;
    }

    if (poll) {
      newMsg.isPoll = true;
      newMsg.pollQuestion = poll.question;
      newMsg.pollOptions = poll.options;
      newMsg.pollVotes = {};
    }

    await api.sendChatMessage(newMsg);
    setInputText('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles: File[] = Array.from(e.target.files);
    
    let validFiles: File[] = [];
    for (const file of newFiles) {
      if (file.size > 15 * 1024 * 1024) {
        alert(`File ${file.name} is too large! Maximum allowed is 15MB.`);
        continue;
      }
      // Compress if image to save time/bandwidth
      const processedFile = await compressImage(file);
      validFiles.push(processedFile);
    }

    if (stagedFiles.length + validFiles.length > 5) {
      alert("You can only attach up to 5 files at a time.");
      validFiles = validFiles.slice(0, 5 - stagedFiles.length);
    }

    setStagedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendAction = async () => {
    if (!inputText.trim() && stagedFiles.length === 0) return;
    
    const textToSend = inputText.trim();
    const filesToSend = [...stagedFiles];
    setInputText('');
    setStagedFiles([]);

    if (filesToSend.length === 0) {
      await handleSendMessage(textToSend);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      for(let i=0; i<filesToSend.length; i++) {
        const file = filesToSend[i];
        
        // Optimistic UI for each file
        const tempId = 'temp_' + Date.now() + '_' + i;
        const localUrl = URL.createObjectURL(file);
        const tempMsg: ChatMessage = {
          id: tempId,
          senderWing: session.wing!,
          senderFlatNo: session.flatNo!,
          senderOwnerName: session.ownerName || 'Resident',
          text: i === 0 ? textToSend : '',
          mediaUrl: localUrl,
          mediaType: file.type,
          mediaName: file.name,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        const meta = await uploadFileInChunks(file, (prog) => {
          setUploadProgress(Math.round(((i * 100) + prog) / filesToSend.length));
        });
        
        setMessages(prev => prev.filter(m => m.id !== tempId));
        await handleSendMessage(i === 0 ? textToSend : '', meta);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload some files.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
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

  const handleVote = async (messageId: string, optionId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        return {
          ...m,
          pollVotes: {
            ...(m.pollVotes || {}),
            [flatId]: optionId
          }
        };
      }
      return m;
    }));
    await api.votePoll(messageId, flatId, optionId);
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, { id: Date.now().toString(), text: '' }]);
  };

  const submitPoll = async () => {
    const validOptions = pollOptions.filter(o => o.text.trim() !== '');
    if (!pollQuestion.trim() || validOptions.length < 2) {
      alert("Enter a question and at least two options.");
      return;
    }
    await handleSendMessage('', undefined, {
      question: pollQuestion,
      options: validOptions
    });
    setShowPollModal(false);
    setPollQuestion('');
    setPollOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
  };

  const renderMessage = (msg: ChatMessage) => {
    const isMe = msg.senderWing === session.wing && msg.senderFlatNo === session.flatNo;
    
    let senderTitle = 'Resident';
    const flatOwnerInfo = owners.find(o => o.wing === msg.senderWing && o.flatNo === msg.senderFlatNo);
    
    if (flatOwnerInfo) {
      senderTitle = `${flatOwnerInfo.nameEn} (${msg.senderWing}-${msg.senderFlatNo})`;
    } else {
      senderTitle = `${msg.senderOwnerName} (${msg.senderWing}-${msg.senderFlatNo})`;
    }

    const timeStr = new Date(msg.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
      <div key={msg.id} className={`flex flex-col mb-2 ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && (
          <div className="text-[10px] text-slate-500 font-bold ml-1 mb-0.5" style={{ color: '#075E54' }}>
            {senderTitle}
          </div>
        )}
        <div 
          onPointerDown={() => handlePointerDown(msg.id)}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onContextMenu={(e) => handleContextMenu(msg.id, e)}
          className={`relative p-2.5 pb-5 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm border ${
          isMe ? 'bg-[#DCF8C6] text-slate-800 border-[#c6e4b1] rounded-tr-none' : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
        }`}>
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
          
          {msg.mediaUrl && (
            <div className={`mt-2 w-full min-w-[200px] ${isMe ? 'text-slate-800' : ''}`}>
              <ChunkedMedia fileId={msg.mediaUrl} type={msg.mediaType || ''} fallbackName={msg.mediaName || 'Attachment'} />
            </div>
          )}

          {msg.isPoll && msg.pollOptions && (
            <div className="mt-2 space-y-2 w-full min-w-[200px]">
              <h5 className="font-bold text-sm mb-2">{msg.pollQuestion}</h5>
              {msg.pollOptions.map((opt) => {
                const votes = msg.pollVotes ? Object.values(msg.pollVotes) : [];
                const optionVotes = votes.filter(v => v === opt.id).length;
                const totalVotes = votes.length;
                const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                const isSelected = msg.pollVotes ? msg.pollVotes[flatId] === opt.id : false;
                
                // If the user hasn't voted yet, just show empty grey backgrounds for all options.
                // If they have voted, only the selected one gets the solid background color, the unselected ones just get the grey bar.
                const hasVoted = msg.pollVotes && msg.pollVotes[flatId] !== undefined;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleVote(msg.id, opt.id)}
                    className={`relative w-full overflow-hidden rounded-lg p-2 text-left transition border-2 ${
                      isSelected 
                        ? (isMe ? 'bg-emerald-900/10 border-emerald-900/50 text-emerald-950 shadow-sm' : 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm') 
                        : (isMe ? 'bg-black/10 border-transparent hover:bg-black/20 text-emerald-900/80' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700')
                    }`}
                  >
                    <div 
                      className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${
                        isMe 
                          ? (isSelected ? 'bg-emerald-900/20' : 'bg-black/10') 
                          : (isSelected ? 'bg-indigo-200' : 'bg-slate-100')
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative flex justify-between text-xs z-10 font-medium">
                      <span>{opt.text}</span>
                      <span className="font-bold ml-2">{percentage}%</span>
                    </div>
                  </button>
                );
              })}
              <div 
                className={`text-xs mt-2 text-right font-bold transition ${isMe ? 'text-emerald-700 hover:text-emerald-900 cursor-pointer underline underline-offset-2' : 'text-slate-500'}`}
                onClick={() => { if (isMe) setViewVotersForPoll(msg); }}
              >
                {Object.keys(msg.pollVotes || {}).length} Voted
              </div>
            </div>
          )}
          
          <div className={`absolute bottom-1 right-2 text-[9px] ${isMe ? 'text-green-800' : 'text-slate-400'}`}>
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
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
      
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-slate-400 text-sm">No messages yet. Start the conversation!</div>
        ) : (
          messages.map(renderMessage)
        )}
      </div>

      <div className="p-3 bg-white border-t border-slate-200">
        {stagedFiles.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto py-2">
            {stagedFiles.map((file, idx) => (
              <div key={idx} className="relative w-16 h-16 shrink-0 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                <button 
                  onClick={() => removeStagedFile(idx)} 
                  className="absolute -top-1 -right-1 bg-slate-800 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition z-10"
                >
                  <X className="w-3 h-3" />
                </button>
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] font-bold text-slate-500 text-center px-1 truncate w-full">{file.name}</span>
                )}
              </div>
            ))}
          </div>
        )}
        {uploading && (
          <div className="mb-2 w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition shrink-0"
            disabled={uploading}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input 
            type="file" multiple 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          
          <button
            onClick={() => setShowPollModal(true)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition shrink-0"
          >
            <BarChart2 className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendAction()}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none"
          />

          <button
            onClick={handleSendAction}
            disabled={(!inputText.trim() && stagedFiles.length === 0) || uploading}
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>

      {showPollModal && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-800">Create Poll</h4>
              <button onClick={() => setShowPollModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Question</label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="e.g., When should we host the Diwali party?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Options</label>
                <div className="space-y-2">
                  {pollOptions.map((opt, i) => (
                    <div key={opt.id} className="flex gap-2">
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...pollOptions];
                          newOpts[i].text = e.target.value;
                          setPollOptions(newOpts);
                        }}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          onClick={() => setPollOptions(pollOptions.filter(o => o.id !== opt.id))}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addPollOption}
                  className="mt-2 flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="w-3 h-3" /> Add Option
                </button>
              </div>

              <button
                onClick={submitPoll}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-indigo-200"
              >
                Send Poll
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}