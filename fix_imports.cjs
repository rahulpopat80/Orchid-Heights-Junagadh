const fs = require('fs');
let code = fs.readFileSync('src/components/ChunkedMedia.tsx', 'utf8');

if (!code.includes('triggerFileDownload')) {
    console.log("No triggerFileDownload used?");
} else if (!code.includes('triggerFileDownload }')) {
    code = code.replace(/import { downloadChunkedFile } from '\.\.\/lib\/fileStorage';/, "import { downloadChunkedFile, triggerFileDownload } from '../lib/fileStorage';");
    fs.writeFileSync('src/components/ChunkedMedia.tsx', code);
}
