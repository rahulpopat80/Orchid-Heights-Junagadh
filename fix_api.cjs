const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  /  usePreEntry: async \(id: string\): Promise<boolean> => \{\n    return usePreEntry\(id\);\n  \}\n\};/,
  `  usePreEntry: async (id: string): Promise<boolean> => {\n    return usePreEntry(id);\n  },\n  clearAllSocietyNotifications: async (): Promise<boolean> => {\n    return (await import('./firebase')).clearAllSocietyNotifications();\n  }\n};`
);

fs.writeFileSync('src/lib/api.ts', code);
