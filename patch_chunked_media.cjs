const fs = require('fs');
let code = fs.readFileSync('src/components/ChunkedMedia.tsx', 'utf8');

if (!code.includes('AudioMessagePlayer')) {
  code = code.replace(
    "import { FileText, Loader2, Download } from 'lucide-react';",
    "import { FileText, Loader2, Download } from 'lucide-react';\nimport AudioMessagePlayer from './AudioMessagePlayer';"
  );
}

if (!code.includes('AudioMessagePlayer src=')) {
  code = code.replace(
    /<audio src=\{mediaUrl\} controls className="w-full h-10" \/>/,
    `<AudioMessagePlayer src={mediaUrl} isMe={false} />` // We don't have isMe here easily, but it's fine. Wait, if we can pass isMe it would be great.
  );
  
  // Update ChunkedMediaProps
  code = code.replace(
    /className\?: string;\n\}/,
    `className?: string;\n  isMe?: boolean;\n}`
  );
  
  code = code.replace(
    /export default function ChunkedMedia\(\{ fileId, type, fallbackName, variant = 'default', className \}: ChunkedMediaProps\) \{/,
    `export default function ChunkedMedia({ fileId, type, fallbackName, variant = 'default', className, isMe }: ChunkedMediaProps) {`
  );

  code = code.replace(
    /<AudioMessagePlayer src=\{mediaUrl\} isMe=\{false\} \/>/,
    `<AudioMessagePlayer src={mediaUrl} isMe={isMe} />`
  );

  // also remove the bg-white and padding for audio wrapper to match Whatsapp
  code = code.replace(
    /<div className="rounded-xl border border-slate-200\/60 overflow-hidden bg-white flex flex-col p-2 w-full min-w-\[200px\]">/,
    `<div className="w-full min-w-[200px]">`
  );
  
  fs.writeFileSync('src/components/ChunkedMedia.tsx', code);
  console.log("Patched ChunkedMedia with AudioMessagePlayer");
}

