const fs = require('fs');
const file = 'src/components/resident/PreEntrySection.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace in both functions (they share the same logic structure)
const targetStr = `    drawRow('Invited By:', entry.householdMemberName);`;
const replaceStr = `    drawRow('Invited By:', entry.householdMemberName);\n    drawRow('Pass Uses:', \`\${entry.uses || 0} / \${entry.maxUses || 1}\`);`;

if (code.includes(targetStr)) {
  code = code.replaceAll(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched PDF generators with Pass Uses");
}
