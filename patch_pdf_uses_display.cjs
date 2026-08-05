const fs = require('fs');
const file = 'src/lib/pdfGenerator.ts';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `      const typeStr = log.isPreEntry 
        ? \`Type: \${sanitizeText(log.guestType).toUpperCase()} (PRE-ENTRY)\`
        : \`Type: \${sanitizeText(log.guestType).toUpperCase()}\`;
      doc.text(typeStr, textX, currY);`;

const replaceStr = `      const typeStr = log.isPreEntry 
        ? \`Type: \${sanitizeText(log.guestType).toUpperCase()} (PRE-ENTRY)\`
        : \`Type: \${sanitizeText(log.guestType).toUpperCase()}\`;
      doc.text(typeStr, textX, currY);
      
      if (log.isPreEntry && log.preEntryMaxUses) {
        doc.setTextColor(30, 64, 175);
        doc.setFont('helvetica', 'bold');
        doc.text(\`Uses: \${log.preEntryUses || 1}/\${log.preEntryMaxUses}\`, textX + 60, currY);
      }`;

if (code.includes('const typeStr = log.isPreEntry')) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched PDF with Uses display");
}
