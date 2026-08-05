const fs = require('fs');
const file = 'src/types.ts';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `  entryMethod?: 'Pre-Entry' | 'Call Entry' | 'System-Auto Entry' | 'General Entry';`;
const replaceStr = `  entryMethod?: 'Pre-Entry' | 'Call Entry' | 'System-Auto Entry' | 'General Entry';
  preEntryUses?: number;
  preEntryMaxUses?: number;`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched Visitor interface with uses");
}
