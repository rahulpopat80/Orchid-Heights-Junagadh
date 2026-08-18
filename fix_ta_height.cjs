const fs = require('fs');

let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

code = code.replace(
  /const ta = document.getElementById\('chat-input-textarea'\);\s*if \(ta\) ta\.style\.height = 'auto';/,
  `const ta = document.getElementById('chat-input-textarea');
    if (ta) ta.style.height = '44px';`
);

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
