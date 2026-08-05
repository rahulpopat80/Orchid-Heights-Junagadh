const fs = require('fs');
const file = 'src/components/resident/PreEntrySection.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `                const currentStatus = expired ? 'Expired' : entry.status;`;
const replaceStr = `                const currentStatus = entry.status === 'Used' ? 'Used' : (expired ? 'Expired' : entry.status);`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched PreEntry status logic");
}
