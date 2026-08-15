const fs = require('fs');
let content = fs.readFileSync('src/lib/fallback.ts', 'utf8');

const imports = content.match(/import \{([^}]+)\} from '\.\.\/types';/);
if (imports) {
  if (!imports[1].includes('ChatMessage')) {
    content = content.replace(imports[1], imports[1] + ', ChatMessage');
  }
}

const chatFunctions = `
export function getLocalChatMessages(): ChatMessage[] {
  const data = localStorage.getItem('orchid_local_chat_messages');
  return data ? JSON.parse(data) : [];
}

export function saveLocalChatMessages(msgs: ChatMessage[]) {
  localStorage.setItem('orchid_local_chat_messages', JSON.stringify(msgs));
  localEvents.emit('chat_messages_update_trigger', null);
}

export function sendChatMessageLocal(msg: ChatMessage): boolean {
  const msgs = getLocalChatMessages();
  msgs.push(msg);
  saveLocalChatMessages(msgs);
  return true;
}

export function deleteChatMessageLocal(id: string): boolean {
  const msgs = getLocalChatMessages();
  const filtered = msgs.filter(m => m.id !== id);
  if (filtered.length !== msgs.length) {
    saveLocalChatMessages(filtered);
    return true;
  }
  return false;
}

export function updateChatMessageLocal(id: string, updates: Partial<ChatMessage>): boolean {
  const msgs = getLocalChatMessages();
  const index = msgs.findIndex(m => m.id === id);
  if (index !== -1) {
    msgs[index] = { ...msgs[index], ...updates };
    saveLocalChatMessages(msgs);
    return true;
  }
  return false;
}

export function votePollLocal(messageId: string, flatId: string, optionId: string): boolean {
  const msgs = getLocalChatMessages();
  const index = msgs.findIndex(m => m.id === messageId);
  if (index !== -1 && msgs[index].isPoll) {
    if (!msgs[index].pollVotes) msgs[index].pollVotes = {};
    msgs[index].pollVotes![flatId] = optionId;
    saveLocalChatMessages(msgs);
    return true;
  }
  return false;
}
`;

content += chatFunctions;

// add clear function
content = content.replace("localStorage.removeItem('orchid_local_announcements');", "localStorage.removeItem('orchid_local_announcements');\n  localStorage.removeItem('orchid_local_chat_messages');");

fs.writeFileSync('src/lib/fallback.ts', content);
