const fs = require('fs');

let fileStorageCode = fs.readFileSync('src/lib/fileStorage.ts', 'utf8');

const triggerSearch = `export function triggerFileDownload(base64: string, filename: string) {
  const link = document.createElement('a');
  link.href = base64;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}`;

const triggerReplace = `export function triggerFileDownload(base64: string, filename: string) {
  try {
    // If it's a data URL, convert to Blob to avoid browser limits
    if (base64.startsWith('data:')) {
      const arr = base64.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : '';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type:mime});
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
      return;
    }
  } catch (e) {
    console.error('Failed to convert base64 to blob', e);
  }

  const link = document.createElement('a');
  link.href = base64;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}`;

fileStorageCode = fileStorageCode.replace(triggerSearch, triggerReplace);
fs.writeFileSync('src/lib/fileStorage.ts', fileStorageCode);


let chunkedMediaCode = fs.readFileSync('src/components/ChunkedMedia.tsx', 'utf8');
const chunkedSearch = `              const link = document.createElement('a');
              link.href = mediaUrl;
              link.download = fallbackName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);`;

const chunkedReplace = `              triggerFileDownload(mediaUrl, fallbackName);`;

chunkedMediaCode = chunkedMediaCode.replace(chunkedSearch, chunkedReplace);
chunkedMediaCode = chunkedMediaCode.replace(chunkedSearch, chunkedReplace);
chunkedMediaCode = chunkedMediaCode.replace(chunkedSearch, chunkedReplace);
chunkedMediaCode = chunkedMediaCode.replace(chunkedSearch, chunkedReplace);

fs.writeFileSync('src/components/ChunkedMedia.tsx', chunkedMediaCode);

