const fs = require('fs');
const file = 'src/lib/fallback.ts';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `    entryMethod: 'Pre-Entry',`;
const replaceStr = `    entryMethod: 'Pre-Entry',
    preEntryUses: currentUses,
    preEntryMaxUses: maxUses,`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched fallback.ts with uses");
}
