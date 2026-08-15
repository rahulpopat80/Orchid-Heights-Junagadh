const fs = require('fs');
let code = fs.readFileSync('src/lib/fileStorage.ts', 'utf8');

code = code.replace('const batchSize = 5;', 'const batchSize = 10;');

fs.writeFileSync('src/lib/fileStorage.ts', code);
