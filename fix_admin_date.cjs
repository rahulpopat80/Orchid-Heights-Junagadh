const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminVisitorRecords.tsx', 'utf8');

const dateHackPattern = /type=\{filterDate \? "date" : "text"\}\s*placeholder="Select Date"\s*onFocus=\{\(e\) => \(e\.target\.type = 'date'\)\}\s*onBlur=\{\(e\) => \{ if \(!e\.target\.value\) e\.target\.type = 'text' \}\}/;
const dateFixed = `type="date"`;
content = content.replace(dateHackPattern, dateFixed);

fs.writeFileSync('src/components/admin/AdminVisitorRecords.tsx', content);
