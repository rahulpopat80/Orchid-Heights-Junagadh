const fs = require('fs');
const file = 'src/lib/firebase.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace("isPreEntry: true,", "isPreEntry: true,\n      preEntryId: id,");
fs.writeFileSync(file, code);
console.log("Patched usePreEntry visitor firebase");

const file2 = 'src/lib/fallback.ts';
let code2 = fs.readFileSync(file2, 'utf8');
code2 = code2.replace("isPreEntry: true,", "isPreEntry: true,\n    preEntryId: id,");
fs.writeFileSync(file2, code2);
console.log("Patched usePreEntry visitor fallback");
