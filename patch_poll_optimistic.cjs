const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const targetVote = `  const handleVote = async (messageId: string, optionId: string) => {
    await api.votePoll(messageId, flatId, optionId);
  };`;
  
const replaceVote = `  const handleVote = async (messageId: string, optionId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        return {
          ...m,
          pollVotes: {
            ...(m.pollVotes || {}),
            [flatId]: optionId
          }
        };
      }
      return m;
    }));
    await api.votePoll(messageId, flatId, optionId);
  };`;

if (code.includes(targetVote)) {
  code = code.replace(targetVote, replaceVote);
  fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
  console.log("Patched poll voting optimism");
}
