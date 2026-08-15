const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const imports = content.match(/import \{([^}]+)\} from '\.\.\/types';/);
if (imports) {
  if (!imports[1].includes('ChatMessage')) {
    content = content.replace(imports[1], imports[1] + ', ChatMessage');
  }
}

const chatFunctions = `
export async function sendChatMessage(msg: ChatMessage): Promise<boolean> {
  if (isQuotaExceeded) return fallback.sendChatMessageLocal(msg);
  try {
    await setDoc(doc(db, 'chat_messages', msg.id), msg);
    return true;
  } catch (error) {
    if (isQuotaError(error)) {
      markQuotaExceeded();
      return fallback.sendChatMessageLocal(msg);
    }
    console.error('Failed to send chat message:', error);
    return false;
  }
}

export async function deleteChatMessage(id: string): Promise<boolean> {
  if (isQuotaExceeded) return fallback.deleteChatMessageLocal(id);
  try {
    await deleteDoc(doc(db, 'chat_messages', id));
    return true;
  } catch (error) {
    if (isQuotaError(error)) {
      markQuotaExceeded();
      return fallback.deleteChatMessageLocal(id);
    }
    console.error('Failed to delete chat message:', error);
    return false;
  }
}

export async function updateChatMessage(id: string, updates: Partial<ChatMessage>): Promise<boolean> {
  if (isQuotaExceeded) return fallback.updateChatMessageLocal(id, updates);
  try {
    await setDoc(doc(db, 'chat_messages', id), updates, { merge: true });
    return true;
  } catch (error) {
    if (isQuotaError(error)) {
      markQuotaExceeded();
      return fallback.updateChatMessageLocal(id, updates);
    }
    console.error('Failed to update chat message:', error);
    return false;
  }
}

export async function votePoll(messageId: string, flatId: string, optionId: string): Promise<boolean> {
  if (isQuotaExceeded) return fallback.votePollLocal(messageId, flatId, optionId);
  try {
    const msgRef = doc(db, 'chat_messages', messageId);
    const snap = await getDoc(msgRef);
    if (snap.exists()) {
      const data = snap.data() as ChatMessage;
      if (data.isPoll) {
        const currentVotes = data.pollVotes || {};
        currentVotes[flatId] = optionId;
        await setDoc(msgRef, { pollVotes: currentVotes }, { merge: true });
        return true;
      }
    }
    return false;
  } catch (error) {
    if (isQuotaError(error)) {
      markQuotaExceeded();
      return fallback.votePollLocal(messageId, flatId, optionId);
    }
    console.error('Failed to vote on poll:', error);
    return false;
  }
}

export function subscribeToChatMessages(onUpdate: (msgs: ChatMessage[]) => void, onError?: (error: Error) => void) {
  let unsubFirestore: () => void;
  if (isQuotaExceeded) {
    const list = fallback.getLocalChatMessages();
    
    // Auto-delete older than 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const filtered = list.filter(m => new Date(m.createdAt).getTime() >= thirtyDaysAgo);
    
    onUpdate(filtered);
    return fallback.localEvents.subscribe('chat_messages_update_trigger', () => {
      const list = fallback.getLocalChatMessages();
      const filtered = list.filter(m => new Date(m.createdAt).getTime() >= thirtyDaysAgo);
      onUpdate(filtered);
    });
  }

  try {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    // We fetch all, and filter locally to ensure correct sync without complex composite index
    unsubFirestore = onSnapshot(collection(db, 'chat_messages'), (snapshot) => {
      const list: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as ChatMessage;
        if (new Date(item.createdAt).getTime() >= thirtyDaysAgo) {
          list.push(item);
        }
      });
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      onUpdate(list);
    }, (error) => {
      if (isQuotaError(error)) {
        markQuotaExceeded();
        const list = fallback.getLocalChatMessages();
        const filtered = list.filter(m => new Date(m.createdAt).getTime() >= thirtyDaysAgo);
        onUpdate(filtered);
        unsubFirestore = fallback.localEvents.subscribe('chat_messages_update_trigger', () => {
          const list = fallback.getLocalChatMessages();
          const filtered = list.filter(m => new Date(m.createdAt).getTime() >= thirtyDaysAgo);
          onUpdate(filtered);
        });
      } else {
        if (onError) onError(error);
        console.error('Firestore chat messages subscription error:', error);
      }
    });
  } catch (error) {
    if (isQuotaError(error)) {
      markQuotaExceeded();
      const list = fallback.getLocalChatMessages();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const filtered = list.filter(m => new Date(m.createdAt).getTime() >= thirtyDaysAgo);
      onUpdate(filtered);
      unsubFirestore = fallback.localEvents.subscribe('chat_messages_update_trigger', () => {
        const list = fallback.getLocalChatMessages();
        const filtered = list.filter(m => new Date(m.createdAt).getTime() >= thirtyDaysAgo);
        onUpdate(filtered);
      });
    } else {
      if (onError) onError(error as Error);
    }
  }

  return () => {
    if (unsubFirestore) {
      if (typeof unsubFirestore === 'function') {
        unsubFirestore();
      } else {
        fallback.localEvents.unsubscribe('chat_messages_update_trigger', unsubFirestore);
      }
    }
  };
}
`;

content += chatFunctions;
fs.writeFileSync('src/lib/firebase.ts', content);
