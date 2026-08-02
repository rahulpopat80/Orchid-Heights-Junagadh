const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Remove handleDownloadAmenitiesPDF
const downloadRegex = /const handleDownloadAmenitiesPDF = async \(\) => \{[\s\S]*?\};\n/;
code = code.replace(downloadRegex, '');

// Remove the button Export Amenities Logs (PDF)
const btnRegex = /<button\s*onClick=\{handleDownloadAmenitiesPDF\}[\s\S]*?<\/button>\s*/;
code = code.replace(btnRegex, '');

// Remove the Function Hall Requests section
const sectionRegex = /\{\/\* Left Column: Function Bookings \(7 cols\) \*\/\}([\s\S]*?)\{\/\* Right Column: Gym \& Theatre Logging \(5 cols\) \*\/\}/;
code = code.replace(sectionRegex, '{/* Left Column: Function Bookings Removed */}\n              {/* Right Column: Gym & Theatre Logging (5 cols) */}');

// Change the right column to 12 cols if we remove the left column?
// Let's replace lg:col-span-5 with lg:col-span-12
code = code.replace(
  /<div className="lg:col-span-5 space-y-6">/,
  '<div className="lg:col-span-12 space-y-6">'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Successfully removed amenities logic from AdminDashboard.tsx");
