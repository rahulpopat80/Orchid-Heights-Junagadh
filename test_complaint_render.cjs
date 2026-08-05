const fs = require('fs');
const code = fs.readFileSync('src/components/resident/HelpDeskSection.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('Ticket #'));
const end = lines.findIndex((l, i) => i > start && l.includes('</h5>'));
console.log(lines.slice(start, end + 1).join('\n'));
