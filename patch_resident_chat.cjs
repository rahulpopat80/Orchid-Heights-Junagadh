const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

// 1. Fix disabled button logic
const targetButtonDisabled = `            onClick={handleSendAction}
            disabled={!inputText.trim() && !uploading}`;
const replaceButtonDisabled = `            onClick={handleSendAction}
            disabled={(!inputText.trim() && stagedFiles.length === 0) || uploading}`;

if (code.includes(targetButtonDisabled)) {
  code = code.replace(targetButtonDisabled, replaceButtonDisabled);
}

// 2. Add compressImage helper
const compressImageHelper = `const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
      return resolve(file);
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max = 1200;
        if (width > max || height > max) {
          if (width > height) {
            height = Math.round((height *= max / width));
            width = max;
          } else {
            width = Math.round((width *= max / height));
            height = max;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return resolve(file);
          const newFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(newFile);
        }, 'image/jpeg', 0.7); // 70% quality for smaller size
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export default function ChatSection({ session }: { session: any }) {`;

if (code.includes('export default function ChatSection')) {
  code = code.replace('export default function ChatSection({ session }: { session: any }) {', compressImageHelper);
}

// 3. Update handleFileUpload to async and compress
const targetHandleFileUpload = `  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles: File[] = Array.from(e.target.files);
    
    let validFiles: File[] = [];
    for (const file of newFiles) {
      if (file.size > 15 * 1024 * 1024) {
        alert(\`File \${file.name} is too large! Maximum allowed is 15MB.\`);
        continue;
      }
      validFiles.push(file);
    }

    if (stagedFiles.length + validFiles.length > 5) {
      alert("You can only attach up to 5 files at a time.");
      validFiles = validFiles.slice(0, 5 - stagedFiles.length);
    }

    setStagedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };`;

const replaceHandleFileUpload = `  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles: File[] = Array.from(e.target.files);
    
    let validFiles: File[] = [];
    for (const file of newFiles) {
      if (file.size > 15 * 1024 * 1024) {
        alert(\`File \${file.name} is too large! Maximum allowed is 15MB.\`);
        continue;
      }
      // Compress if image to save time/bandwidth
      const processedFile = await compressImage(file);
      validFiles.push(processedFile);
    }

    if (stagedFiles.length + validFiles.length > 5) {
      alert("You can only attach up to 5 files at a time.");
      validFiles = validFiles.slice(0, 5 - stagedFiles.length);
    }

    setStagedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };`;

if (code.includes(targetHandleFileUpload)) {
  code = code.replace(targetHandleFileUpload, replaceHandleFileUpload);
}

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
console.log("Patched Resident ChatSection");
