const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

if (!code.includes('const [viewReactionsForMsg, setViewReactionsForMsg] = useState')) {
  // Let's inject after the first useState
  code = code.replace(
    'const [messages, setMessages] = useState<ChatMessage[]>([]);',
    `const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewReactionsForMsg, setViewReactionsForMsg] = useState<ChatMessage | null>(null);
  const [showCustomEmojiInput, setShowCustomEmojiInput] = useState<string | null>(null);
  const [customEmoji, setCustomEmoji] = useState<string>('');
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  const handleReact = async (messageId: string, emoji: string | null) => {
    setActiveMessageId(null);
    setShowCustomEmojiInput(null);
    setCustomEmoji('');
    
    const reactorId = "admin";
    
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const newReactions = { ...(m.reactions || {}) };
        if (emoji) {
          newReactions[reactorId] = emoji;
        } else {
          delete newReactions[reactorId];
        }
        return { ...m, reactions: newReactions };
      }
      return m;
    }));
    await api.reactToMessage(messageId, reactorId, emoji);
  };`
  );
  fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
  console.log("Injected state variables to AdminChatSection.tsx");
} else {
  console.log("State variables already exist.");
}
