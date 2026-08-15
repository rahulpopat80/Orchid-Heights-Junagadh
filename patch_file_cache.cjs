const fs = require('fs');
let code = fs.readFileSync('src/lib/fileStorage.ts', 'utf8');

const targetFunction = `export async function downloadChunkedFile(fileId: string): Promise<{ name: string; type: string; base64: string }> {
  const metaDoc = await getDoc(doc(db, 'file_metadata', fileId));`;

const replaceFunction = `
const memoryCache = new Map<string, { name: string; type: string; base64: string }>();

export async function downloadChunkedFile(fileId: string): Promise<{ name: string; type: string; base64: string }> {
  if (memoryCache.has(fileId)) {
    return memoryCache.get(fileId)!;
  }

  const metaDoc = await getDoc(doc(db, 'file_metadata', fileId));`;

if (code.includes(targetFunction)) {
  code = code.replace(targetFunction, replaceFunction);
  
  const targetEnd = `  const base64 = chunks.map((c) => c.data).join('');

  return {
    name: meta.name,
    type: meta.type,
    base64
  };
}`;
  
  const replaceEnd = `  const base64 = chunks.map((c) => c.data).join('');

  const result = {
    name: meta.name,
    type: meta.type,
    base64
  };
  
  // Cache up to 100 files to prevent memory leak
  if (memoryCache.size > 100) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }
  memoryCache.set(fileId, result);

  return result;
}`;

  code = code.replace(targetEnd, replaceEnd);
  fs.writeFileSync('src/lib/fileStorage.ts', code);
  console.log("Patched file cache");
} else {
  console.log("Target not found");
}
