import React, { useState, useEffect, useRef } from 'react';
import { UserSession, ChatMessage , FlatOwner} from '../../types';
import { api } from '../../lib/api';
import { Send, Image as ImageIcon, File as FileIcon, BarChart2, Trash2, Edit2, X, Plus } from 'lucide-react';
import { uploadFileInChunks, downloadChunkedFile } from '../../lib/fileStorage';
import ChunkedMedia from '../ChunkedMedia';

interface ChatSectionProps {
  session: UserSession;
}

export default function ChatSection({ session }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  const [owners, setOwners] = useState<FlatOwner[]>([]);

  
  // Media upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll state
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState([{ id: '1', text: '' }, { id: '2', text: '' }]);

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
    const file = e.target.files[0];
    
    // Max 15MB
    if (file.size > 15 * 1024 * 1024) {
      alert("File is too large! Maximum allowed is 15MB.");
      return;
    }

    const tempId = 'temp_' + Date.now();
    const localUrl = URL.createObjectURL(file);
    
    // Optimistic UI for media
    const tempMsg: ChatMessage = {
      id: tempId,
      senderWing: session.wing,
      senderFlatNo: session.flatNo,
      senderOwnerName: session.ownerName || 'Resident',
      text: '',
      mediaUrl: localUrl,
      mediaType: file.type,
      mediaName: file.name,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    setUploading(true);
    setUploadProgress(0);
    try {
      const metadata = await uploadFileInChunks(file, (prog) => {
        setUploadProgress(prog);
      });
      // Replace the temp message natively when firebase updates
      setMessages(prev => prev.filter(m => m.id !== tempId));
      await handleSendMessage('', metadata);
    } catch (err) {
      console.error(err);
      alert("Failed to upload file.");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
        <div className={`relative p-2.5 pb-5 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm border ${
          isMe ? 'bg-[#DCF8C6] text-slate-800 border-[#c6e4b1] rounded-tr-none' : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
        }`}>
          {msg.text && <p className="whitespace-pre-wrap text-sm pr-10">{msg.text}</p>}
          
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
                const myVote = msg.pollVotes ? msg.pollVotes[flatId] : null;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleVote(msg.id, opt.id)}
                    className={`relative w-full overflow-hidden rounded-lg p-2 text-left transition ${
                      myVote === opt.id 
                        ? (isMe ? 'bg-white/20 border-white/30' : 'bg-indigo-50 border-indigo-200 text-indigo-900') 
                        : (isMe ? 'bg-black/10 hover:bg-black/20' : 'bg-slate-50 hover:bg-slate-100')
                    } border`}
                  >
                    <div 
                      className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${
                        isMe ? 'bg-white/20' : 'bg-indigo-100'
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
              <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                {Object.keys(msg.pollVotes || {}).length} votes
              </div>
            </div>
          )}
          
          <div className={`absolute bottom-1 right-2 text-[9px] ${isMe ? 'text-green-800' : 'text-slate-400'}`}>
            {timeStr}
          </div>
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
            type="file" 
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
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none"
          />

          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() && !uploading}
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
    </div>
  );
}
