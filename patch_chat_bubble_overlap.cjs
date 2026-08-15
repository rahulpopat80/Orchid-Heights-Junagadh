const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const targetText = `{msg.text && <p className="whitespace-pre-wrap text-sm">{msg.text}</p>}`;
const replaceText = `{msg.text && <p className="whitespace-pre-wrap text-sm pr-10">{msg.text}</p>}`;
code = code.replace(targetText, replaceText);

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
console.log("Patched text bubble padding");
