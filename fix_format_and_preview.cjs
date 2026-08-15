const fs = require('fs');

// 1. New formatMessageText function
const newFormatText = `const formatMessageText = (text: string): React.ReactNode => {
  if (!text) return null;
  const match = text.match(/(\\S|\\s)*?(\\*|_|-)([\\s\\S]*?)\\2/);
  if (!match) return <>{text}</>;
  
  const char = match[2];
  const innerText = match[3];
  
  const index = text.indexOf(char + innerText + char);
  const before = text.substring(0, index);
  const after = text.substring(index + innerText.length + 2);
  
  let wrappedInner: React.ReactNode = formatMessageText(innerText);
  if (char === '*') wrappedInner = <strong>{wrappedInner}</strong>;
  if (char === '_') wrappedInner = <u>{wrappedInner}</u>;
  if (char === '-') wrappedInner = <em>{wrappedInner}</em>;
  
  return (
    <>
      {formatMessageText(before)}
      {wrappedInner}
      {formatMessageText(after)}
    </>
  );
};`;

// Wait, the match might be greedy. The regex `(\S|\s)*?` is slow.
// Let's use string operations or a simpler regex.
const simpleFormatText = `const formatMessageText = (text: string): React.ReactNode => {
  if (!text) return null;
  const match = text.match(/(\\*|_|-)([\\s\\S]*?)\\1/);
  if (!match) return <>{text}</>;
  
  const fullMatch = match[0];
  const char = match[1];
  const innerText = match[2];
  const index = match.index!;
  
  const before = text.substring(0, index);
  const after = text.substring(index + fullMatch.length);
  
  let wrappedInner: React.ReactNode = formatMessageText(innerText);
  if (char === '*') wrappedInner = <strong>{wrappedInner}</strong>;
  if (char === '_') wrappedInner = <u>{wrappedInner}</u>;
  if (char === '-') wrappedInner = <em>{wrappedInner}</em>;
  
  return (
    <React.Fragment>
      {formatMessageText(before)}
      {wrappedInner}
      {formatMessageText(after)}
    </React.Fragment>
  );
};`;

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace formatMessageText
  const oldFormatMatch = code.match(/const formatMessageText = \(text: string\)(?:(?:.|\n|\r)*?)};\n/);
  if (oldFormatMatch) {
    code = code.replace(oldFormatMatch[0], simpleFormatText + '\n');
  } else {
    // If it's AdminChatSection, the formatMessageText might be slightly different
    const oldFormatMatch2 = code.match(/const formatMessageText = \(text: string\) => \{(?:(?:.|\n|\r)*?)};\n/);
    if (oldFormatMatch2) {
      code = code.replace(oldFormatMatch2[0], simpleFormatText + '\n');
    }
  }

  // Add state for preview
  if (code.includes('const [previewImage, setPreviewImage] = useState')) {
     // already added
  } else {
     code = code.replace(
       'const [loading, setLoading] = useState(true);',
       'const [loading, setLoading] = useState(true);\n  const [previewMediaMsg, setPreviewMediaMsg] = useState<ChatMessage | null>(null);'
     );
  }

  // Find where ChunkedMedia is used and add onClick
  // In ChatSection.tsx:
  // <ChunkedMedia fileId={msg.mediaUrl} type={msg.mediaType || ''} fallbackName={msg.mediaName || 'Attachment'} />
  // We want to wrap it or add onClick if possible. ChunkedMedia doesn't accept onClick, so wrap in a div.
  const chunkedMediaOriginal = '<ChunkedMedia fileId={msg.mediaUrl} type={msg.mediaType || \'\'} fallbackName={msg.mediaName || \'Attachment\'} />';
  const chunkedMediaNew = `<div onClick={() => msg.mediaType?.startsWith('image/') && setPreviewMediaMsg(msg)} className={msg.mediaType?.startsWith('image/') ? 'cursor-pointer' : ''}>\n                <ChunkedMedia fileId={msg.mediaUrl} type={msg.mediaType || ''} fallbackName={msg.mediaName || 'Attachment'} />\n              </div>`;
  
  code = code.split(chunkedMediaOriginal).join(chunkedMediaNew);

  // Add the modal at the end, right before the last closing tags
  const modalCode = `
      {previewMediaMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
          <button 
            onClick={() => setPreviewMediaMsg(null)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 z-50 p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-4xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center relative">
            <ChunkedMedia 
              fileId={previewMediaMsg.mediaUrl!} 
              type={previewMediaMsg.mediaType!} 
              fallbackName={previewMediaMsg.mediaName!}
              variant="raw"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            {previewMediaMsg.text && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="inline-block bg-black/60 text-white px-4 py-2 rounded-xl text-sm max-w-2xl whitespace-pre-wrap">
                  {formatMessageText(previewMediaMsg.text)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
  `;

  // Insert before the last `</div>` of the whole component
  // Usually right before `</div>\n  );\n}` or `    </div>\n  );\n}`
  if (!code.includes('previewMediaMsg && (')) {
     const endPattern = '    </div>\n  );\n}';
     if (code.includes(endPattern)) {
       code = code.replace(endPattern, modalCode + '\n' + endPattern);
     } else {
       const endPattern2 = '</div>\n  );\n}';
       code = code.replace(endPattern2, modalCode + '\n' + endPattern2);
     }
  }

  // Ensure X icon is imported
  if (!code.includes('X }')) {
    code = code.replace('import { Send, FileUp, Loader2, PlaySquare, FileText, CheckCircle2, ChevronRight, Share2, CornerUpLeft, MessageCircle, Mic, AlertCircle, Phone, XCircle, Search, Edit2, Trash2, Copy } from \'lucide-react\';', 
    'import { Send, FileUp, Loader2, PlaySquare, FileText, CheckCircle2, ChevronRight, Share2, CornerUpLeft, MessageCircle, Mic, AlertCircle, Phone, XCircle, Search, Edit2, Trash2, Copy, X } from \'lucide-react\';');
  }
  // Wait, the imports might be different. Let's just do a generic replace:
  if (!code.includes(' X ') && !code.includes(' X,')) {
    code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1, X } from 'lucide-react';");
  }

  fs.writeFileSync(file, code);
}

patchFile('src/components/resident/ChatSection.tsx');
patchFile('src/components/admin/AdminChatSection.tsx');
console.log("Patched both chat sections");
