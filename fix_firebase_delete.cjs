const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(
  /export async function deletePreEntry\(id: string\): Promise<boolean> \{\s*if \(isQuotaExceeded\) return false;\s*try \{/,
  `export async function deletePreEntry(id: string): Promise<boolean> {
  if (isQuotaExceeded) return fallback.deletePreEntryLocal(id);
  try {`
);

code = code.replace(
  /if \(isQuotaError\(error\)\) \{\s*markQuotaExceeded\(\);\s*return false;\s*\}/,
  `if (isQuotaError(error)) {
      markQuotaExceeded();
      return fallback.deletePreEntryLocal(id);
    }`
);

fs.writeFileSync('src/lib/firebase.ts', code);
