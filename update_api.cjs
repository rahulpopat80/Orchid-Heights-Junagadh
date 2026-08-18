const fs = require('fs');

let code = fs.readFileSync('src/lib/api.ts', 'utf8');

code = code.replace(
  /getPreEntries,\n  getPreEntryById,\n  usePreEntry,/g,
  "getPreEntries,\n  getPreEntryById,\n  usePreEntry,\n  deletePreEntry,"
);

code = code.replace(
  /export const clearAllSocietyNotifications/g,
  `  deletePreEntry: async (id: string): Promise<boolean> => {
    return deletePreEntry(id);
  }
};

export const clearAllSocietyNotifications`
);

fs.writeFileSync('src/lib/api.ts', code);
