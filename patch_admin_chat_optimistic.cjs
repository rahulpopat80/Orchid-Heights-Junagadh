const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

// 1. Patch handleDelete
const targetDelete = `  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      await api.deleteChatMessage(id);
    }
  };`;
const replaceDelete = `  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      setMessages(prev => prev.filter(m => m.id !== id));
      await api.deleteChatMessage(id);
    }
  };`;
code = code.replace(targetDelete, replaceDelete);

// 2. Patch saveEdit
const targetEdit = `  const saveEdit = async (id: string) => {
    await api.updateChatMessage(id, { text: editVal });
    setEditingId(null);
  };`;
const replaceEdit = `  const saveEdit = async (id: string) => {
    const newVal = editVal;
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text: newVal } : m));
    setEditingId(null);
    await api.updateChatMessage(id, { text: newVal });
  };`;
code = code.replace(targetEdit, replaceEdit);

// 3. Patch Sender Name format
const targetSender = `              const flatOwnerInfo = owners.find(o => o.wing === msg.senderWing && o.flatNo === msg.senderFlatNo);
              let senderTitle = msg.senderOwnerName;
              if (flatOwnerInfo) {
                if (flatOwnerInfo.nameEn === msg.senderOwnerName) {
                  senderTitle = \`\${msg.senderOwnerName}, (\${msg.senderWing}-\${msg.senderFlatNo})\`;
                } else {
                  senderTitle = \`\${msg.senderOwnerName}, (\${flatOwnerInfo.nameEn}), \${msg.senderWing}-\${msg.senderFlatNo}\`;
                }
              }`;

const replaceSender = `              const flatOwnerInfo = owners.find(o => o.wing === msg.senderWing && o.flatNo === msg.senderFlatNo);
              let senderTitle = msg.senderOwnerName;
              if (flatOwnerInfo) {
                senderTitle = \`\${flatOwnerInfo.nameEn} (\${msg.senderWing}-\${msg.senderFlatNo})\`;
              } else {
                senderTitle = \`\${msg.senderOwnerName} (\${msg.senderWing}-\${msg.senderFlatNo})\`;
              }`;
code = code.replace(targetSender, replaceSender);

fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
console.log("Patched AdminChatSection optimistic updates and sender name");
