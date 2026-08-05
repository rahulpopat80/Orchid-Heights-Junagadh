const fs = require('fs');
const file = 'src/lib/pdfGenerator.ts';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `      // If Pre-Entry, place PRE-ENTRY badge directly beside Status badge (at rightX - 53)
      if (log.isPreEntry) {`;
const replaceStr = `      // If Pre-Entry, place PRE-ENTRY badge directly beside Status badge (at rightX - 53)
      let entryMethodBadge = log.entryMethod ? log.entryMethod.toUpperCase() : (log.isPreEntry ? 'PRE-ENTRY' : (log.respondedBy?.includes('Through Call') ? 'CALL ENTRY' : ''));
      if (entryMethodBadge) {
        doc.setFillColor(219, 234, 254); // Blue-100
        doc.roundedRect(rightX - 55, currY - 6, 28, 8, 2, 2, 'F');
        doc.setTextColor(30, 64, 175); // Blue-800
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(entryMethodBadge, rightX - 41, currY - 0.5, { align: 'center' });
      } else if (false) {`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched PDF entryMethod");
}
