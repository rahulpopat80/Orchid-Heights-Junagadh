const fs = require('fs');
let amContent = fs.readFileSync('src/components/resident/AmenitiesSection.tsx', 'utf8');

amContent = amContent.replace(/      return l\.flatId === myFlatId && dateLimit\.getTime\(\) >= oneMonthAgo\.getTime\(\);\n  \}\);\n/g, '');

fs.writeFileSync('src/components/resident/AmenitiesSection.tsx', amContent);
