const fs = require('fs');

function patch(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix video preview
  code = code.replace(
    /onClick=\{\(\) => msg\.mediaType\?\.startsWith\('image\/'\) && setPreviewMediaMsg\(msg\)\} className=\{msg\.mediaType\?\.startsWith\('image\/'\) \? 'cursor-pointer' : ''\}/g,
    "onClick={() => (msg.mediaType?.startsWith('image/') || msg.mediaType?.startsWith('video/')) && setPreviewMediaMsg(msg)} className={(msg.mediaType?.startsWith('image/') || msg.mediaType?.startsWith('video/')) ? 'cursor-pointer' : ''}"
  );

  fs.writeFileSync(filePath, code);
}
patch('src/components/resident/ChatSection.tsx');
patch('src/components/admin/AdminChatSection.tsx');
