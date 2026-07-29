const fs = require('fs');
let amContent = fs.readFileSync('src/components/resident/AmenitiesSection.tsx', 'utf8');

amContent = amContent.replace(/const filteredLogs = gymTheatreLogs.*?;/s, '');
// If it's still there:
amContent = amContent.replace(/const filteredLogs = gymTheatreLogs[\s\S]*?\}\);/m, '');

fs.writeFileSync('src/components/resident/AmenitiesSection.tsx', amContent);
