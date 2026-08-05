const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'types.ts');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "visitorCount: number;",
  "visitorCount: number;\n  maxUses?: number;\n  uses?: number;"
);

fs.writeFileSync(file, code);
