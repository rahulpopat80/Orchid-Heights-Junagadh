const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

if (!code.includes('reactToMessage: async')) {
  // We'll append it before the last `}` of export const api = { ... }
  // Find `export const api = {` and then add it inside.
  code = code.replace(
    'deleteMessage: async (messageId: string) => {',
    `reactToMessage: async (messageId: string, flatId: string, emoji: string | null) => {
    if (useLocalFallback) return; // Note: we're modifying state locally too, so we don't strictly need local fallback logic here if we update state in component
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
  console.log('Added reactToMessage to api');
} else {
  console.log('Already added');
}
