import React, { useState, useEffect } from 'react';
import { ChatMessage, FlatOwner } from '../../types';
import { api } from '../../lib/api';
import { Trash2, Edit2, MessageSquare, Download, Check, X } from 'lucide-react';
import { downloadChunkedFile } from '../../lib/fileStorage';
import ChunkedMedia from '../ChunkedMedia';

export default function AdminChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [owners, setOwners] = useState<FlatOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

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
  };

  const saveEdit = async (id: string) => {
    const newVal = editVal;
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text: newVal } : m));
    setEditingId(null);
    await api.updateChatMessage(id, { text: newVal });
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
              const flatOwnerInfo = owners.find(o => o.wing === msg.senderWing && o.flatNo === msg.senderFlatNo);
              let senderTitle = msg.senderOwnerName;
              if (flatOwnerInfo) {
                senderTitle = `${flatOwnerInfo.nameEn} (${msg.senderWing}-${msg.senderFlatNo})`;
              } else {
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
                    ) : (
                      <>
                        {msg.text && <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.text}</p>}
                        
                        {msg.mediaUrl && (
                          <div className="mt-2 max-w-sm">
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded mb-2 inline-block">Media Attached</span>
                            <ChunkedMedia fileId={msg.mediaUrl} type={msg.mediaType || ''} fallbackName={msg.mediaName || 'Attachment'} />
                          </div>
                        )}

                        {msg.isPoll && (
                          <div className="mt-2 text-xs text-slate-600 bg-white border border-slate-200 p-2 rounded-lg inline-block">
                            <span className="font-bold text-indigo-600">Poll:</span> {msg.pollQuestion} 
                            <span className="text-slate-400 ml-2">({msg.pollOptions?.length} options, {Object.keys(msg.pollVotes || {}).length} votes)</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-start gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {!msg.isPoll && !msg.mediaUrl && (
                      <button onClick={() => handleEdit(msg)} className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(msg.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
