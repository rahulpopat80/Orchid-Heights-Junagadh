const fs = require('fs');

function patch(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  code = code.replace(
    /<AudioMessagePlayer src=\{mediaUrl\} isMe=\{isMe\} \/>/g,
    "<AudioMessagePlayer src={mediaUrl} isMe={isMe} type={type} fileName={fallbackName} />"
  );

  fs.writeFileSync(filePath, code);
}
patch('src/components/ChunkedMedia.tsx');
