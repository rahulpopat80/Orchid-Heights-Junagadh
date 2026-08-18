const fs = require('fs');

// Add preEntryPassId to Visitor in types.ts
let typesCode = fs.readFileSync('src/types.ts', 'utf8');
typesCode = typesCode.replace(
  /isPreEntry\?: boolean; \/\/ flag to distinguish Pre-Entry records/,
  "isPreEntry?: boolean; // flag to distinguish Pre-Entry records\n  preEntryPassId?: string; // Original Pre-Entry Pass ID if applicable"
);
fs.writeFileSync('src/types.ts', typesCode);

// Add it in usePreEntry in firebase.ts
let fbCode = fs.readFileSync('src/lib/firebase.ts', 'utf8');
fbCode = fbCode.replace(
  /isPreEntry: true,/g,
  "isPreEntry: true,\n      preEntryPassId: id,"
);
fs.writeFileSync('src/lib/firebase.ts', fbCode);

// Display it in pdfGenerator.ts
let pdfCode = fs.readFileSync('src/lib/pdfGenerator.ts', 'utf8');
pdfCode = pdfCode.replace(
  /doc\.roundedRect\(rightX - 53, currY - 6, 26, 8, 2, 2, 'F'\);\s*doc\.setTextColor\(30, 64, 175\); \/\/ Blue-800\s*doc\.setFontSize\(7\.5\);\s*doc\.setFont\('helvetica', 'bold'\);\s*doc\.text\('PRE-ENTRY', rightX - 40, currY - 0\.5, \{ align: 'center' \}\);/g,
  `doc.roundedRect(rightX - 63, currY - 6, 36, 8, 2, 2, 'F');
        doc.setTextColor(30, 64, 175); // Blue-800
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text('PRE-ENTRY', rightX - 45, currY - 0.5, { align: 'center' });
        if (log.preEntryPassId) {
          doc.setFontSize(6);
          doc.setTextColor(100, 116, 139); // Slate-500
          doc.setFont('helvetica', 'normal');
          doc.text(\`PASS ID: \${log.preEntryPassId}\`, rightX - 45, currY + 4.5, { align: 'center' });
        }`
);

fs.writeFileSync('src/lib/pdfGenerator.ts', pdfCode);

