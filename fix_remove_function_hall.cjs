const fs = require('fs');
let content = fs.readFileSync('src/components/resident/AmenitiesSection.tsx', 'utf8');

// Find the start of the booking screen block
const startScreenStr = `      {/* ==================== SCREEN: FUNCTION HALL BOOKINGS & DECISION ENGINE ==================== */}`;
const startIndex = content.indexOf(startScreenStr);

if (startIndex !== -1) {
  // We can just truncate the file at this point if there are no other screens after it.
  // Let's check what's after this screen.
  
} else {
  console.log("Start block not found.");
}
