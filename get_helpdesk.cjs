const fs = require('fs');
const code = fs.readFileSync('src/components/resident/HelpDeskSection.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('{complaints.map('));
const end = lines.findIndex((l, i) => i > start && l.includes('{item.description}'));
console.log(lines.slice(start, end + 3).join('\n'));
