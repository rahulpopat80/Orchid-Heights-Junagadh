const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const targetSearch = "target: 'all' | 'wing' | 'flat';";
const targetReplace = "target: 'all' | 'wing' | 'flat' | 'multi';";
code = code.replace(targetSearch, targetReplace);

const flatNoSearch = "flatNo?: number;";
const flatNoReplace = "flatNo?: number;\n  targetFlats?: string[];";
code = code.replace(flatNoSearch, flatNoReplace);

fs.writeFileSync('src/types.ts', code);
