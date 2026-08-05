const fs = require('fs');
const file = 'src/lib/fallback.ts';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `    preEntryId: id,
    ipAddress: data.ipAddress,`;
const replaceStr = `    preEntryId: id,
    entryMethod: 'Pre-Entry',
    ipAddress: data.ipAddress,`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched fallback with entryMethod");
}
