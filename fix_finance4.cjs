const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

if (!code.includes('downloadChunkedFile')) {
  code = code.replace("import { uploadFileInChunks } from '../lib/fileStorage';",
  "import { uploadFileInChunks, downloadChunkedFile, triggerFileDownload } from '../lib/fileStorage';");
}

code = code.replace(
  "const [isFinUploading, setIsFinUploading] = useState(false);",
  `const [isFinUploading, setIsFinUploading] = useState(false);
  
  const handleDownloadAttachment = async (fileId: string, fallbackUrl: string, name: string) => {
    if (fileId) {
      try {
        const { base64 } = await downloadChunkedFile(fileId);
        triggerFileDownload(base64, name);
      } catch (e) {
        console.error(e);
        if (fallbackUrl) triggerFileDownload(fallbackUrl, name);
      }
    } else if (fallbackUrl) {
      triggerFileDownload(fallbackUrl, name);
    }
  };`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log('Applied fourth part of replacement');
