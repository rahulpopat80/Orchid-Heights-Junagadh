const fs = require('fs');
const code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('const [complaints, setComplaints]'));
console.log(start);
