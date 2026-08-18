const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  /return usePreEntry\(id\);\s*\}\s*deletePreEntry: async \(id: string\): Promise<boolean> => \{/,
  `return usePreEntry(id);
  },
  deletePreEntry: async (id: string): Promise<boolean> => {`
);

fs.writeFileSync('src/lib/api.ts', code);
