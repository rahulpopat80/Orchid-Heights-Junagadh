const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const target = `export async function sendChatMessage(msg: ChatMessage): Promise<boolean> {
  if (isQuotaExceeded) return fallback.sendChatMessageLocal(msg);
  try {
    await setDoc(doc(db, 'chat_messages', msg.id), msg);
    return true;`;

const replacement = `export async function sendChatMessage(msg: ChatMessage): Promise<boolean> {
  if (isQuotaExceeded) return fallback.sendChatMessageLocal(msg);
  try {
    await setDoc(doc(db, 'chat_messages', msg.id), msg);
    
    // Broadcast notification
    try {
      sendFCMBroadcast({
        title: \`\${msg.senderOwnerName} (Flat \${msg.senderWing}-\${msg.senderFlatNo})\`,
        body: msg.isPoll ? 'Created a new poll in Community Chat' : msg.mediaUrl ? 'Sent an attachment' : (msg.text || 'New message'),
        data: { type: 'chat', id: msg.id }
      }).catch(e => console.error("FCM Broadcast failed:", e));
    } catch (e) { }

    return true;`;

code = code.replace(target, replacement);

fs.writeFileSync('src/lib/firebase.ts', code);
