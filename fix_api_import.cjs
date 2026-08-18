const fs = require('fs');

let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  /getPreEntryById,\s*usePreEntry, sendChatMessage,/,
  "getPreEntryById,\n  usePreEntry,\n  deletePreEntry,\n  sendChatMessage,"
);

fs.writeFileSync('src/lib/api.ts', code);
