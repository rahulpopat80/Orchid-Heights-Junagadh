const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

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
        }, 'image/jpeg', 0.7);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export default function AdminChatSection() {`;

if (code.includes('export default function AdminChatSection() {')) {
  code = code.replace('export default function AdminChatSection() {', compressImageHelper);
}

const targetHandleFileUpload = `  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 15 * 1024 * 1024) {
      alert("File is too large! Maximum allowed is 15MB.");
      return;
    }
    setUploading(true);
    try {
      const metadata = await uploadFileInChunks(file);`;

const replaceHandleFileUpload = `  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 15 * 1024 * 1024) {
      alert("File is too large! Maximum allowed is 15MB.");
      return;
    }
    setUploading(true);
    try {
      const processedFile = await compressImage(file);
      const metadata = await uploadFileInChunks(processedFile);`;

if (code.includes(targetHandleFileUpload)) {
  code = code.replace(targetHandleFileUpload, replaceHandleFileUpload);
}

fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
console.log("Patched Admin ChatSection");
