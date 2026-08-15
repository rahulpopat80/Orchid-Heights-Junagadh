const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

// Add import
if (!code.includes("import ChunkedMedia from '../../components/ChunkedMedia'")) {
  code = code.replace(
    "import { uploadFileInChunks, downloadChunkedFile } from '../../lib/fileStorage';",
    "import { uploadFileInChunks, downloadChunkedFile } from '../../lib/fileStorage';\nimport ChunkedMedia from '../ChunkedMedia';"
  );
}

// Replace the media block
const targetMedia = `{msg.mediaUrl && (
            <div className="mt-2">
              {msg.mediaType?.startsWith('image/') ? (
                <div 
                  className="relative rounded-lg overflow-hidden border border-white/20 cursor-pointer"
                  onClick={() => downloadMedia(msg.mediaUrl!, msg.mediaName!)}
                >
                  <div className="flex items-center justify-center bg-black/10 p-4">
                    <ImageIcon className="w-8 h-8 opacity-50 mb-2" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
                    <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded">Download Image</span>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => downloadMedia(msg.mediaUrl!, msg.mediaName!)}
                  className={\`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold transition \${
                    isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }\`}
                >
                  <FileIcon className="w-4 h-4" />
                  <span className="truncate max-w-[150px]">{msg.mediaName}</span>
                </button>
              )}
            </div>
          )}`;

const replacementMedia = `{msg.mediaUrl && (
            <div className={\`mt-2 w-full min-w-[200px] \${isMe ? 'text-slate-800' : ''}\`}>
              <ChunkedMedia fileId={msg.mediaUrl} type={msg.mediaType || ''} fallbackName={msg.mediaName || 'Attachment'} />
            </div>
          )}`;

if (code.includes(targetMedia)) {
  code = code.replace(targetMedia, replacementMedia);
  console.log("Replaced media render logic!");
} else {
  console.log("Could not find target media logic.");
}

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
