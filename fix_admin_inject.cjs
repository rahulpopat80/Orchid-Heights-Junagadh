const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

// Find where the Reaction Menu currently is
const reactionMenuBlockStr = "                        {activeMessageId === msg.id && (";

// Wait, let's just grep `activeMessageId === msg.id` in `AdminChatSection.tsx` to see what it looks like.
