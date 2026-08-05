const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'resident', 'AmenitiesSection.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('Phone,')) {
  code = code.replace("Camera", "Camera, Phone");
  fs.writeFileSync(file, code);
  console.log("Patched imports");
}
