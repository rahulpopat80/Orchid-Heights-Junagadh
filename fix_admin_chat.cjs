const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

if (!code.includes('const [viewReactionsForMsg, setViewReactionsForMsg] = useState')) {
  // It probably missed the activeMessageId injection.
  // Let's check if AdminChatSection has activeMessageId
  if (code.includes('const [activeMessageId, setActiveMessageId]')) {
    code = code.replace(
      'const [activeMessageId, setActiveMessageId] = useState<string | null>(null);',
      `const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [viewReactionsForMsg, setViewReactionsForMsg] = useState<ChatMessage | null>(null);
  const [showCustomEmojiInput, setShowCustomEmojiInput] = useState<string | null>(null);
  const [customEmoji, setCustomEmoji] = useState<string>('');
  
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
    console.log("Fixed AdminChatSection states");
  } else {
    console.log("AdminChatSection does not have activeMessageId state");
  }
} else {
  console.log("AdminChatSection already has viewReactionsForMsg state");
}
