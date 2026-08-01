const fs = require('fs');
let content = fs.readFileSync('src/lib/pdfGenerator.ts', 'utf8');

const namePattern = /doc\.text\(sanitizeText\(truncatedVisitorName\)\.toUpperCase\(\), textX, currY\);/;
const nameFixed = `doc.text(\`\${currentLogIndex + 1}. \` + sanitizeText(truncatedVisitorName).toUpperCase(), textX, currY);`;
content = content.replace(namePattern, nameFixed);

fs.writeFileSync('src/lib/pdfGenerator.ts', content);
