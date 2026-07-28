const fs = require('fs');
let content = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

// Change submit button classes
content = content.replace(
  'className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-sm transition flex items-center justify-center space-x-2"',
  'className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg text-base shadow-sm transition flex items-center justify-center space-x-2"'
);

// Make sure other translations are simple:
content = content.replace(/વિંગ <span/g, 'વિંગ <span'); // unchanged
content = content.replace(/FLAT નંબર <span/g, 'ફ્લેટ નંબર <span');

fs.writeFileSync('src/components/SecurityDashboard.tsx', content);
