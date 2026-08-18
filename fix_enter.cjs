const fs = require('fs');

let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

code = code.replace(
  /id="chat-input-textarea"/,
  `id="chat-input-textarea"\n      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendAction();
        }
      }}`
);

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
