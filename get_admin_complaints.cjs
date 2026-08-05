const fs = require('fs');
const code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('{complaints.map((comp)'));
const end = lines.findIndex((l, i) => i > start && l.includes('</div>') && lines[i+1] && lines[i+1].includes('))}'));
console.log(lines.slice(start, end + 3).join('\n'));
