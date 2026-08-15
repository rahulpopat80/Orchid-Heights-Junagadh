const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const targetPoll = `              {msg.pollOptions.map((opt) => {
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
              })}`;

const replacePoll = `              {msg.pollOptions.map((opt) => {
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
                    className={\`relative w-full overflow-hidden rounded-lg p-2 text-left transition border-2 \${
                      isSelected 
                        ? (isMe ? 'bg-white/20 border-white text-white shadow-sm' : 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm') 
                        : (isMe ? 'bg-black/10 border-transparent hover:bg-black/20 text-indigo-100' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700')
                    }\`}
                  >
                    <div 
                      className={\`absolute left-0 top-0 bottom-0 transition-all duration-500 \${
                        isMe 
                          ? (isSelected ? 'bg-white/30' : 'bg-white/10') 
                          : (isSelected ? 'bg-indigo-200' : 'bg-slate-100')
                      }\`}
                      style={{ width: \`\${percentage}%\` }}
                    />
                    <div className="relative flex justify-between text-xs z-10 font-medium">
                      <span>{opt.text}</span>
                      <span className="font-bold ml-2">{percentage}%</span>
                    </div>
                  </button>
                );
              })}`;

if (code.includes(targetPoll)) {
  code = code.replace(targetPoll, replacePoll);
  fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
  console.log("Patched Poll Option Rendering logic");
} else {
  console.log("Target not found");
}
