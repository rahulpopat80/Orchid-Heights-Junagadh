const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

if (!code.includes('reactToMessage')) {
  // Find deleteMessage
  if (code.includes('deleteMessage: async (messageId: string) => {')) {
    code = code.replace(
      'deleteMessage: async (messageId: string) => {',
      `reactToMessage: async (messageId: string, flatId: string, emoji: string | null) => {
    if (useLocalFallback) return;
    try {
      const { doc, updateDoc, deleteField } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      const docRef = doc(db, 'chat_messages', messageId);
      if (emoji) {
        await updateDoc(docRef, { [\`reactions.\${flatId}\`]: emoji });
      } else {
        await updateDoc(docRef, { [\`reactions.\${flatId}\`]: deleteField() });
      }
    } catch (e) {
      console.error(e);
    }
  },
  deleteMessage: async (messageId: string) => {`
    );
    fs.writeFileSync('src/lib/api.ts', code);
    console.log("Patched api.ts successfully");
  } else {
    console.log("Could not find deleteMessage");
  }
} else {
  console.log("reactToMessage already exists");
}

