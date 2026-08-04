const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const newAddAttachment = `  const addFinAttachment = (file: File) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('File too large (max 15MB).');
      return;
    }
    setFinAttachments(prev => [
      ...prev,
      {
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        file: file
      }
    ]);
  };`;

code = code.replace(/const addFinAttachment = \(file: File\) => \{[\s\S]*?reader\.readAsDataURL\(file\);\n  \};/, newAddAttachment);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log('Applied third part of replacement');
