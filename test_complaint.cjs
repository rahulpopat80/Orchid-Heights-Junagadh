const fs = require('fs');
const code = fs.readFileSync('src/components/resident/HelpDeskSection.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('const payload: any = {'));
const end = lines.findIndex((l, i) => i > start && l.includes('};'));
console.log(lines.slice(start, end + 1).join('\n'));
