const fs = require('fs');
const files = ['src/lib/firebase.ts', 'src/lib/fallback.ts'];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  const targetStr = `      preEntryId: id,
      ipAddress: data.ipAddress,`;
  const replaceStr = `      preEntryId: id,
      entryMethod: 'Pre-Entry',
      ipAddress: data.ipAddress,`;

  if (code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    fs.writeFileSync(file, code);
    console.log("Patched " + file + " with entryMethod");
  } else {
    console.log("Could not find target in " + file);
  }
}
