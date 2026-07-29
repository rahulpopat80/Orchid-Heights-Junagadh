const fs = require('fs');
let content = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

content = content.replace(
  'className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg text-base shadow-sm transition flex items-center justify-center space-x-2"',
  'className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-md text-sm shadow-sm transition flex items-center justify-center"'
);

fs.writeFileSync('src/components/SecurityDashboard.tsx', content);
