const fs = require('fs');
let amContent = fs.readFileSync('src/components/resident/AmenitiesSection.tsx', 'utf8');

amContent = amContent.replace(/  \}\);\n  \}\);\n/g, '  });\n');

fs.writeFileSync('src/components/resident/AmenitiesSection.tsx', amContent);
