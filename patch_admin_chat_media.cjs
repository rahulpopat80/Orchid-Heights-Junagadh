const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

// Add import
if (!code.includes("import ChunkedMedia from '../ChunkedMedia'")) {
  code = code.replace(
    "import { downloadChunkedFile } from '../../lib/fileStorage';",
    "import { downloadChunkedFile } from '../../lib/fileStorage';\nimport ChunkedMedia from '../ChunkedMedia';"
  );
}

// Replace the media block
const targetMedia = `{msg.mediaUrl && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Media Attached</span>
                            <button 
                              onClick={() => downloadMedia(msg.mediaUrl!, msg.mediaName!)}
                              className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600"
                            >
                              <Download className="w-3 h-3" /> {msg.mediaName}
                            </button>
                          </div>
                        )}`;

const replacementMedia = `{msg.mediaUrl && (
                          <div className="mt-2 max-w-sm">
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded mb-2 inline-block">Media Attached</span>
                            <ChunkedMedia fileId={msg.mediaUrl} type={msg.mediaType || ''} fallbackName={msg.mediaName || 'Attachment'} />
                          </div>
                        )}`;

if (code.includes(targetMedia)) {
  code = code.replace(targetMedia, replacementMedia);
  console.log("Replaced media render logic in AdminChatSection!");
} else {
  console.log("Could not find target media logic in AdminChatSection.");
}

fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
