const fs = require('fs');
let code = fs.readFileSync('src/lib/fallback.ts', 'utf8');

if (!code.includes('deletePreEntryLocal')) {
  code += `\nexport function deletePreEntryLocal(id: string): boolean {
  const list = getLocalPreEntries();
  const idx = list.findIndex(p => p.id === id);
  if (idx !== -1) {
    list.splice(idx, 1);
    saveLocalPreEntries(list);
    return true;
  }
  return false;
}\n`;
  fs.writeFileSync('src/lib/fallback.ts', code);
}
