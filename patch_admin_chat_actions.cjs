const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

// 2. Add formatMessageText helper
const formatHelper = `const formatMessageText = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\\\*[^*]+\\\*|_[^_]+_|-[^-]+-)/g);
  return parts.map((part, i) => {
    if (part.length > 2) {
      if (part.startsWith('*') && part.endsWith('*')) return <strong key={i}>{part.slice(1, -1)}</strong>;
      if (part.startsWith('_') && part.endsWith('_')) return <u key={i}>{part.slice(1, -1)}</u>;
      if (part.startsWith('-') && part.endsWith('-')) return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};`;

if (!code.includes('const formatMessageText')) {
  code = code.replace('export default function AdminChatSection', formatHelper + '\n\nexport default function AdminChatSection');
}

// 4. Wrap message content with gesture handlers and format text
const targetRenderMessage = `{msg.text && <p className="whitespace-pre-wrap text-sm pr-10">{msg.text}</p>}`;

const replaceRenderMessage = `{msg.text && <p className="whitespace-pre-wrap text-sm pr-10">{formatMessageText(msg.text)}</p>}`;

if (code.includes(targetRenderMessage)) {
  code = code.replace(targetRenderMessage, replaceRenderMessage);
}

fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
console.log("Patched Admin ChatSection with formatting");
