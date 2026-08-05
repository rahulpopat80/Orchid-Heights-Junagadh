const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'lib', 'fallback.ts');
let code = fs.readFileSync(file, 'utf8');

const targetStr = `  list[idx].status = 'Used';
  saveLocalPreEntries(list);`;

const replaceStr = `  const maxUses = list[idx].maxUses || 1;
  const currentUses = (list[idx].uses || 0) + 1;
  list[idx].uses = currentUses;
  if (currentUses >= maxUses) {
    list[idx].status = 'Used';
  }
  saveLocalPreEntries(list);`;

if (code.includes("list[idx].status = 'Used';")) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched fallback usePreEntry");
} else {
  console.log("Could not find target in fallback.ts");
}
