const fs = require('fs');
function fixChunkedMedia(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(/fileId=\{att\.url\}/g, 'fileId={att.fileId || att.url}');
  fs.writeFileSync(filePath, code);
}
fixChunkedMedia('src/components/resident/HelpDeskSection.tsx');
fixChunkedMedia('src/components/AdminDashboard.tsx');
