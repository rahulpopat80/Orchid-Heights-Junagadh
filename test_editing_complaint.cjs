const fs = require('fs');
const code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('Update Complaint Status'));
const end = lines.findIndex((l, i) => i > start && l.includes('</select>'));
console.log(lines.slice(start - 2, end + 3).join('\n'));
