const fs = require('fs');
let code = fs.readFileSync('src/lib/fileStorage.ts', 'utf8');

// Increase chunk size to 900KB to reduce number of chunks
code = code.replace('const chunkSize = 700 * 1024;', 'const chunkSize = 900 * 1024;');

// Add a check to limit concurrent uploads
const targetConcurrent = `        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, base64String.length);
          const chunkData = base64String.substring(start, end);

          const chunkRef = doc(db, 'file_chunks', \`\${fileId}_chunk_\${i}\`);
          const promise = setDoc(chunkRef, {
            fileId,
            chunkIndex: i,
            data: chunkData
          }).then(() => {
            completedChunks++;
            if (onProgress) {
              onProgress(Math.round((completedChunks / totalChunks) * 100));
            }
          });
          chunkPromises.push(promise);
        }

        await Promise.all(chunkPromises);`;

const replaceConcurrent = `        // Upload chunks in batches of 5 to prevent browser connection stalling and throttling
        const uploadChunk = async (i: number) => {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, base64String.length);
          const chunkData = base64String.substring(start, end);
          const chunkRef = doc(db, 'file_chunks', \`\${fileId}_chunk_\${i}\`);
          await setDoc(chunkRef, { fileId, chunkIndex: i, data: chunkData });
          completedChunks++;
          if (onProgress) onProgress(Math.round((completedChunks / totalChunks) * 100));
        };

        const batchSize = 5;
        for (let i = 0; i < totalChunks; i += batchSize) {
          const batch = [];
          for (let j = 0; j < batchSize && (i + j) < totalChunks; j++) {
            batch.push(uploadChunk(i + j));
          }
          await Promise.all(batch);
        }`;

if (code.includes('chunkPromises.push(promise);')) {
  code = code.replace(targetConcurrent, replaceConcurrent);
  console.log("Patched fileStorage for chunking speed.");
}

fs.writeFileSync('src/lib/fileStorage.ts', code);
