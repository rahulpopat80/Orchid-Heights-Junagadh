const fs = require('fs');
let content = fs.readFileSync('src/lib/fallback.ts', 'utf8');

const targetFallback = `  const defaultOwners = require('./initialOwners').initialOwners;`;
const replaceFallback = `  const defaultOwners = getInitialOwners();`;

if (content.includes(targetFallback)) {
    content = content.replace(targetFallback, replaceFallback);
    fs.writeFileSync('src/lib/fallback.ts', content);
    console.log("Fixed require in fallback.ts");
} else {
    console.log("Target not found!");
}
