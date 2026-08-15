const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const targetCount = `              <div 
                className={\`text-xs mt-2 text-right font-bold transition \${isMe ? 'text-green-800 hover:text-green-900 cursor-pointer underline underline-offset-2' : 'text-slate-700'}\`}
                onClick={() => { if (isMe) setViewVotersForPoll(msg); }}
              >
                {Object.keys(msg.pollVotes || {}).length} Voted
              </div>`;

const replaceCount = `              <div 
                className={\`text-xs mt-2 text-right font-bold transition \${isMe ? 'text-emerald-700 hover:text-emerald-900 cursor-pointer underline underline-offset-2' : 'text-slate-500'}\`}
                onClick={() => { if (isMe) setViewVotersForPoll(msg); }}
              >
                {Object.keys(msg.pollVotes || {}).length} Voted
              </div>`;

if (code.includes(targetCount)) {
  code = code.replace(targetCount, replaceCount);
  fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
  console.log("Patched Resident Poll Voted count colors");
} else {
  console.log("Target count not found");
}
