const fs = require('fs');
let code = fs.readFileSync('src/lib/pdfGenerator.ts', 'utf8');

const targetRegex = /const textX = margin \+ 5;[\s\S]*?if \(log\.memberPhone\) \{[\s\S]*?currY \+= 5;[\s\S]*?doc\.text\(`Phone: \$\{log\.memberPhone\}`\, textX\, currY\);[\s\S]*?\}/;

const replace = `let headerName = ownerName;
      if (log.memberPhone) {
        if (ownerMatch && ownerMatch.phone === log.memberPhone) {
          headerName = \`\${ownerName} (\${log.memberPhone})\`;
        } else if (ownerMatch && ownerMatch.members) {
          const matchedMember = ownerMatch.members.find((m: string) => m.includes(log.memberPhone));
          if (matchedMember) {
            headerName = matchedMember;
          } else {
            headerName = \`\${sanitizeText(log.memberName, ownerName)} (\${log.memberPhone})\`;
          }
        } else {
          headerName = \`\${sanitizeText(log.memberName, ownerName)} (\${log.memberPhone})\`;
        }
      } else {
        headerName = sanitizeText(log.memberName, ownerName);
      }
      
      headerName = sanitizeText(headerName, ownerName);

      const textX = margin + 5;
      let currY = startY + 10;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(headerName.toUpperCase(), textX, currY);
      
      currY += 6;
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(\`Flat: \${log.flatId} (\${sanitizeText(ownerName)})\`, textX, currY);
      
      if (ownerMatch && ownerMatch.phone) {
          currY += 5;
          doc.text(\`Phone: \${ownerMatch.phone}\`, textX, currY);
      }`;

if (targetRegex.test(code)) {
  code = code.replace(targetRegex, replace);
  fs.writeFileSync('src/lib/pdfGenerator.ts', code);
  console.log("Successfully replaced gym pdf layout via regex");
} else {
  console.log("Target not found via regex!");
}
