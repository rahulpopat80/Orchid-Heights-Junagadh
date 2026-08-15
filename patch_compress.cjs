const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

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

export default function ChatSection({ session }: ChatSectionProps) {`;

code = code.replace('export default function ChatSection({ session }: ChatSectionProps) {', compressImageHelper);

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
