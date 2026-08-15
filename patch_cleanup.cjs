const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const cleanupFunc = `
export async function cleanupOldChatMessages() {
  if (isQuotaExceeded) return;
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const q = query(collection(db, 'chat_messages'), where('createdAt', '<', thirtyDaysAgo));
    const snap = await getDocs(q);
    const msgs = snap.docs;
    
    // Process in small batches so we don't block
    for (let i = 0; i < msgs.length; i++) {
      const d = msgs[i];
      const data = d.data();
      if (data.mediaUrl) {
        // delete metadata
        deleteDoc(doc(db, 'file_metadata', data.mediaUrl)).catch(()=>{});
        // delete chunks
        const chunksQ = query(collection(db, 'file_chunks'), where('fileId', '==', data.mediaUrl));
        getDocs(chunksQ).then(csnap => {
          csnap.forEach(c => deleteDoc(c.ref).catch(()=>{}));
        }).catch(()=>{});
      }
      await deleteDoc(d.ref).catch(()=>{});
    }
    console.log("Cleanup complete");
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}
`;

if (!code.includes('cleanupOldChatMessages')) {
  code += cleanupFunc;
  fs.writeFileSync('src/lib/firebase.ts', code);
}

let apiCode = fs.readFileSync('src/lib/api.ts', 'utf8');
if (!apiCode.includes('cleanupOldChatMessages')) {
  apiCode = apiCode.replace(
    ", sendChatMessage, deleteChatMessage, updateChatMessage, subscribeToChatMessages, votePoll} from './firebase';",
    ", sendChatMessage, deleteChatMessage, updateChatMessage, subscribeToChatMessages, votePoll, cleanupOldChatMessages} from './firebase';"
  );
  
  apiCode = apiCode.replace(
    "deleteChatMessage: async (id: string): Promise<boolean> => {",
    "cleanupOldChatMessages: async () => {\n    await cleanupOldChatMessages();\n  },\n  deleteChatMessage: async (id: string): Promise<boolean> => {"
  );
  fs.writeFileSync('src/lib/api.ts', apiCode);
}

let adminChatCode = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');
if (!adminChatCode.includes('cleanupOldChatMessages')) {
  const adminTarget = `    fetchOwners();`;
  const adminReplace = `    fetchOwners();
    // Fire and forget cleanup task
    api.cleanupOldChatMessages().catch(console.error);`;
  adminChatCode = adminChatCode.replace(adminTarget, adminReplace);
  fs.writeFileSync('src/components/admin/AdminChatSection.tsx', adminChatCode);
}

console.log("Patched cleanup old messages logic");
