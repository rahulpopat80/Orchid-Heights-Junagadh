const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const targetPoll = `                return (
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
                );`;

const replacePoll = `                return (
                  <button
                    key={opt.id}
                    onClick={() => handleVote(msg.id, opt.id)}
                    className={\`relative w-full overflow-hidden rounded-lg p-2 text-left transition border-2 \${
                      isSelected 
                        ? (isMe ? 'bg-emerald-900/10 border-emerald-900/50 text-emerald-950 shadow-sm' : 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm') 
                        : (isMe ? 'bg-black/10 border-transparent hover:bg-black/20 text-emerald-900/80' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700')
                    }\`}
                  >
                    <div 
                      className={\`absolute left-0 top-0 bottom-0 transition-all duration-500 \${
                        isMe 
                          ? (isSelected ? 'bg-emerald-900/20' : 'bg-black/10') 
                          : (isSelected ? 'bg-indigo-200' : 'bg-slate-100')
                      }\`}
                      style={{ width: \`\${percentage}%\` }}
                    />
                    <div className="relative flex justify-between text-xs z-10 font-medium">
                      <span>{opt.text}</span>
                      <span className="font-bold ml-2">{percentage}%</span>
                    </div>
                  </button>
                );`;

if (code.includes(targetPoll)) {
  code = code.replace(targetPoll, replacePoll);
  fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
  console.log("Patched Resident poll colors");
} else {
  console.log("Target not found");
}
