const fs = require('fs');

let code = fs.readFileSync('src/lib/api.ts', 'utf8');

if (!code.includes('deletePreEntry,')) {
  code = code.replace(
    /usePreEntry,\s*sendChatMessage/,
    "usePreEntry, deletePreEntry, sendChatMessage"
  );
  fs.writeFileSync('src/lib/api.ts', code);
  console.log("Fixed import.");
} else {
  console.log("Already imported.");
}
