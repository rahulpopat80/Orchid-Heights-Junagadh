const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

if (!code.includes('reactToMessage:')) {
  code = code.replace(
    'deleteChatMessage: async (id: string)',
    `reactToMessage: async (messageId: string, flatId: string, emoji: string | null) => {
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
  deleteChatMessage: async (id: string)`
  );
  fs.writeFileSync('src/lib/api.ts', code);
  console.log("Patched api.ts successfully");
} else {
  console.log("reactToMessage already exists in api.ts");
}
