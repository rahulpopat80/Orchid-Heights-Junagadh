const fs = require('fs');
let lines = fs.readFileSync('src/components/resident/AmenitiesSection.tsx', 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('SCREEN: FUNCTION HALL BOOKINGS'));
const endIdx = lines.findIndex(l => l.includes('{showExitPhotoModal && ('));

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx);
  fs.writeFileSync('src/components/resident/AmenitiesSection.tsx', lines.join('\n'));
} else {
  console.log("Could not find boundaries.");
}
