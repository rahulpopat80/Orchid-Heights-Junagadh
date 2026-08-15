const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

const targetPoll = `                        {msg.isPoll && (
                          <div className="mt-2 text-xs text-slate-600 bg-white border border-slate-200 p-2 rounded-lg inline-block">
                            <span className="font-bold text-indigo-600">Poll:</span> {msg.pollQuestion} 
                            <span className="text-slate-400 ml-2">({msg.pollOptions?.length} options, {Object.keys(msg.pollVotes || {}).length} votes)</span>
                          </div>
                        )}`;

const replacePoll = `                        {msg.isPoll && (
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
                        )}`;

if (code.includes(targetPoll)) {
  code = code.replace(targetPoll, replacePoll);
  
  if (!code.includes("const [viewVotersForPoll")) {
    code = code.replace(
      "const [uploading, setUploading] = useState(false);",
      "const [uploading, setUploading] = useState(false);\n  const [viewVotersForPoll, setViewVotersForPoll] = useState<ChatMessage | null>(null);"
    );
  }
  
  const modalHTML = `
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
                        const name = flatOwnerInfo ? flatOwnerInfo.nameEn : 'Resident';
                        return (
                          <li key={fid} className="text-xs flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm">
                            <span className="font-medium text-slate-700">{name}</span>
                            <span className="font-bold font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{fid}</span>
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
}`;
  code = code.replace(/    <\/div>\n  \);\n}\s*$/, modalHTML);

  fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
  console.log("Patched AdminChatSection voter modal");
} else {
  console.log("Target not found");
}
