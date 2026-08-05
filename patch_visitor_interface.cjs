const fs = require('fs');
const file = 'src/types.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace("isPreEntry?: boolean;", "isPreEntry?: boolean;\n  preEntryId?: string;");
fs.writeFileSync(file, code);
console.log("Patched Visitor interface");
