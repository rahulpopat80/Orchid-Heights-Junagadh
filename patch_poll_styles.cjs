const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const targetPoll = `          {msg.isPoll && msg.pollOptions && (
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
                    className={\`relative w-full overflow-hidden rounded-lg p-2 text-left transition \${
                      myVote === opt.id 
                        ? (isMe ? 'bg-white/20 border-white/30' : 'bg-indigo-50 border-indigo-200 text-indigo-900') 
                        : (isMe ? 'bg-black/10 hover:bg-black/20' : 'bg-slate-50 hover:bg-slate-100')
                    } border\`}
                  >
                    <div 
                      className={\`absolute left-0 top-0 bottom-0 transition-all duration-500 \${
                        isMe ? 'bg-white/20' : 'bg-indigo-100'
                      }\`}
                      style={{ width: \`\${percentage}%\` }}
                    />
                    <div className="relative flex justify-between text-xs z-10 font-medium">
                      <span>{opt.text}</span>
                      <span className="font-bold ml-2">{percentage}%</span>
                    </div>
                  </button>
                );
              })}
              <div className={\`text-[9px] mt-1 text-right \${isMe ? 'text-indigo-200' : 'text-slate-400'}\`}>
                {Object.keys(msg.pollVotes || {}).length} votes
              </div>
            </div>
          )}`;

const replacePoll = `          {msg.isPoll && msg.pollOptions && (
            <div className="mt-2 space-y-2 w-full min-w-[200px]">
              <h5 className="font-bold text-sm mb-2">{msg.pollQuestion}</h5>
              {msg.pollOptions.map((opt) => {
                const votes = msg.pollVotes ? Object.values(msg.pollVotes) : [];
                const optionVotes = votes.filter(v => v === opt.id).length;
                const totalVotes = votes.length;
                const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                const isSelected = msg.pollVotes ? msg.pollVotes[flatId] === opt.id : false;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleVote(msg.id, opt.id)}
                    className={\`relative w-full overflow-hidden rounded-lg p-2 text-left transition border-2 \${
                      isSelected 
                        ? (isMe ? 'bg-green-100/30 border-white text-green-900 shadow-sm' : 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm') 
                        : (isMe ? 'bg-black/5 border-transparent hover:bg-black/10' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800')
                    }\`}
                  >
                    <div 
                      className={\`absolute left-0 top-0 bottom-0 transition-all duration-500 \${
                        isMe ? (isSelected ? 'bg-white/40' : 'bg-black/10') : (isSelected ? 'bg-indigo-200/50' : 'bg-slate-100')
                      }\`}
                      style={{ width: \`\${percentage}%\` }}
                    />
                    <div className="relative flex justify-between text-xs z-10 font-medium">
                      <span>{opt.text}</span>
                      <span className="font-bold ml-2">{percentage}%</span>
                    </div>
                  </button>
                );
              })}
              <div 
                className={\`text-xs mt-2 text-right font-bold transition \${isMe ? 'text-green-800 hover:text-green-900 cursor-pointer underline underline-offset-2' : 'text-slate-700'}\`}
                onClick={() => { if (isMe) setViewVotersForPoll(msg); }}
              >
                {Object.keys(msg.pollVotes || {}).length} Voted
              </div>
            </div>
          )}`;

if (code.includes("myVote === opt.id")) {
  code = code.replace(targetPoll, replacePoll);
  
  if (!code.includes("const [viewVotersForPoll")) {
    code = code.replace(
      "const [showPollModal, setShowPollModal] = useState(false);",
      "const [showPollModal, setShowPollModal] = useState(false);\n  const [viewVotersForPoll, setViewVotersForPoll] = useState<ChatMessage | null>(null);"
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

  fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
  console.log("Patched ChatSection poll styling and added Voter modal");
} else {
  console.log("Target poll rendering not found");
}
