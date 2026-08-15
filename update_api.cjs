const fs = require('fs');
let content = fs.readFileSync('src/lib/api.ts', 'utf8');

const imports = content.match(/import \{([^}]+)\} from '\.\.\/types';/);
if (imports) {
  if (!imports[1].includes('ChatMessage')) {
    content = content.replace(imports[1], imports[1] + ', ChatMessage');
  }
}

const fbImports = content.match(/import \{([^}]+)\} from '\.\/firebase';/);
if (fbImports) {
  content = content.replace(fbImports[1], fbImports[1] + ', sendChatMessage, deleteChatMessage, updateChatMessage, subscribeToChatMessages, votePoll');
}

const apiMethods = `
  sendChatMessage: async (msg: ChatMessage): Promise<boolean> => {
    return sendChatMessage(msg);
  },
  deleteChatMessage: async (id: string): Promise<boolean> => {
    return deleteChatMessage(id);
  },
  updateChatMessage: async (id: string, updates: Partial<ChatMessage>): Promise<boolean> => {
    return updateChatMessage(id, updates);
  },
  votePoll: async (messageId: string, flatId: string, optionId: string): Promise<boolean> => {
    return votePoll(messageId, flatId, optionId);
  },
  subscribeToChatMessages: (onUpdate: (msgs: ChatMessage[]) => void, onError?: (error: Error) => void) => {
    return subscribeToChatMessages(onUpdate, onError);
  },
`;

content = content.replace('subscribeAnnouncements:', apiMethods + '\n  subscribeAnnouncements:');
fs.writeFileSync('src/lib/api.ts', content);
