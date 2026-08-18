const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  /\};\s*deletePreEntry: async \(id: string\): Promise<boolean> => \{\s*return deletePreEntry\(id\);\s*\}\s*\};\s*/,
  `  deletePreEntry: async (id: string): Promise<boolean> => {
    return deletePreEntry(id);
  }
};\n\n`
);

fs.writeFileSync('src/lib/api.ts', code);
