const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

const targetButtons = `opacity-0 group-hover:opacity-100 transition-opacity`;
const replaceButtons = `opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity`;

if (code.includes(targetButtons)) {
  code = code.replace(targetButtons, replaceButtons);
  fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
  console.log("Fixed Admin chat buttons visibility for mobile");
} else {
  console.log("Could not find target buttons in AdminChatSection");
}
