const fs = require('fs');
let code = fs.readFileSync('src/components/ResidentDashboard.tsx', 'utf8');

code = code.replace(
  'className="h-[calc(100dvh-160px)] flex flex-col"',
  'className="h-[calc(100dvh-240px)] flex flex-col"'
);

fs.writeFileSync('src/components/ResidentDashboard.tsx', code);
