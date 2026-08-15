const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetMain = `<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">`;
const replaceMain = `<main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 overflow-hidden sm:overflow-visible">`;

if (code.includes(targetMain)) {
  code = code.replace(targetMain, replaceMain);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Made App layout more responsive for mobile");
}
