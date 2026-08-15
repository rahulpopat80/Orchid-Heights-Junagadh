const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

const targetSender = `              const flatOwnerInfo = owners.find(o => o.wing === msg.senderWing && o.flatNo === msg.senderFlatNo);
              let senderTitle = msg.senderOwnerName;
              if (flatOwnerInfo) {
                senderTitle = \`\${flatOwnerInfo.nameEn} (\${msg.senderWing}-\${msg.senderFlatNo})\`;
              } else {
                senderTitle = \`\${msg.senderOwnerName} (\${msg.senderWing}-\${msg.senderFlatNo})\`;
              }`;
              
const replaceSender = `              const flatOwnerInfo = owners.find(o => String(o.wing) === String(msg.senderWing) && String(o.flatNo) === String(msg.senderFlatNo));
              
              // Forcefully ensure we don't display family member names. Always use the registered owner if found.
              let senderTitle = \`Resident (\${msg.senderWing}-\${msg.senderFlatNo})\`;
              
              if (flatOwnerInfo && flatOwnerInfo.nameEn) {
                senderTitle = \`\${flatOwnerInfo.nameEn} (\${msg.senderWing}-\${msg.senderFlatNo})\`;
              } else if (msg.senderOwnerName) {
                senderTitle = \`\${msg.senderOwnerName} (\${msg.senderWing}-\${msg.senderFlatNo})\`;
              }`;

code = code.replace(targetSender, replaceSender);
fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
