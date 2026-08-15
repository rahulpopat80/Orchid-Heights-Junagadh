const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const targetRender = `  const renderMessage = (msg: ChatMessage) => {
    const isMe = msg.senderWing === session.wing && msg.senderFlatNo === session.flatNo && msg.senderOwnerName === (session.ownerName || 'Resident');
    
    let senderTitle = 'Resident';
    const flatOwnerInfo = owners.find(o => o.wing === msg.senderWing && o.flatNo === msg.senderFlatNo);
    
    if (flatOwnerInfo) {
      if (flatOwnerInfo.nameEn === msg.senderOwnerName) {
        // It's the owner
        senderTitle = \`\${msg.senderOwnerName}, (\${msg.senderWing}-\${msg.senderFlatNo})\`;
      } else {
        // It's a member
        senderTitle = \`\${msg.senderOwnerName}, (\${flatOwnerInfo.nameEn}), \${msg.senderWing}-\${msg.senderFlatNo}\`;
      }
    } else {
      senderTitle = \`\${msg.senderOwnerName}, (\${msg.senderWing}-\${msg.senderFlatNo})\`;
    }

    if (isMe) senderTitle = 'You';


    return (
      <div key={msg.id} className={\`flex flex-col mb-4 \${isMe ? 'items-end' : 'items-start'}\`}>
        <div className="text-[10px] text-slate-400 mb-1 font-semibold ml-1 mr-1">
          {senderTitle} • {new Date(msg.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
        </div>
        <div className={\`p-3 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm border \${
          isMe ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none' : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
        }\`}>`;

const replacementRender = `  const renderMessage = (msg: ChatMessage) => {
    const isMe = msg.senderWing === session.wing && msg.senderFlatNo === session.flatNo;
    
    let senderTitle = 'Resident';
    const flatOwnerInfo = owners.find(o => o.wing === msg.senderWing && o.flatNo === msg.senderFlatNo);
    
    if (flatOwnerInfo) {
      senderTitle = \`\${flatOwnerInfo.nameEn} (\${msg.senderWing}-\${msg.senderFlatNo})\`;
    } else {
      senderTitle = \`\${msg.senderOwnerName} (\${msg.senderWing}-\${msg.senderFlatNo})\`;
    }

    const timeStr = new Date(msg.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
      <div key={msg.id} className={\`flex flex-col mb-2 \${isMe ? 'items-end' : 'items-start'}\`}>
        {!isMe && (
          <div className="text-[10px] text-slate-500 font-bold ml-1 mb-0.5" style={{ color: '#075E54' }}>
            {senderTitle}
          </div>
        )}
        <div className={\`relative p-2.5 pb-5 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm border \${
          isMe ? 'bg-[#DCF8C6] text-slate-800 border-[#c6e4b1] rounded-tr-none' : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
        }\`}>`;

code = code.replace(targetRender, replacementRender);

const targetTime = `            </div>
          )}
        </div>
      </div>
    );
  };`;
const replaceTime = `            </div>
          )}
          
          <div className={\`absolute bottom-1 right-2 text-[9px] \${isMe ? 'text-green-800' : 'text-slate-400'}\`}>
            {timeStr}
          </div>
        </div>
      </div>
    );
  };`;
code = code.replace(targetTime, replaceTime);

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
console.log("Patched Chat Bubbles");
