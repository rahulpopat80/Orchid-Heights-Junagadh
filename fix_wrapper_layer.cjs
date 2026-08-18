const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

code = code.replace(
  /className=\{\`flex flex-col mb-2 \$\{isMe \? 'items-end' : 'items-start'\}\`\}/,
  "className={`flex flex-col mb-2 ${isMe ? 'items-end' : 'items-start'} ${activeMessageId === msg.id ? 'relative z-50' : ''}`}"
);

// Also let's fix the "image" text on replied video/audio messages.
// The code says: repliedMsg.mediaType?.startsWith('video/')
// But sometimes mediaType is empty. We should also check mediaName.
code = code.replace(
  /repliedMsg\.mediaType\?\.startsWith\('video\/'\)/g,
  "(repliedMsg.mediaType?.startsWith('video/') || repliedMsg.mediaName?.match(/\\.(mp4|mov|mkv|webm)$/i))"
);
code = code.replace(
  /repliedMsg\.mediaType\?\.startsWith\('audio\/'\)/g,
  "(repliedMsg.mediaType?.startsWith('audio/') || repliedMsg.mediaName?.match(/\\.(mp3|wav|ogg|m4a)$/i))"
);

code = code.replace(
  /replyingTo\.mediaType\?\.startsWith\('video\/'\)/g,
  "(replyingTo.mediaType?.startsWith('video/') || replyingTo.mediaName?.match(/\\.(mp4|mov|mkv|webm)$/i))"
);
code = code.replace(
  /replyingTo\.mediaType\?\.startsWith\('audio\/'\)/g,
  "(replyingTo.mediaType?.startsWith('audio/') || replyingTo.mediaName?.match(/\\.(mp3|wav|ogg|m4a)$/i))"
);

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
