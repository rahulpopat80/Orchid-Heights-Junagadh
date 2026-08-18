const fs = require('fs');
let code = fs.readFileSync('src/components/ChunkedMedia.tsx', 'utf8');

// Ensure Play icon is imported
if (!code.includes('PlayCircle')) {
  code = code.replace(/import \{ FileText, Loader2, Download \} from 'lucide-react';/, "import { FileText, Loader2, Download, PlayCircle } from 'lucide-react';");
}

// Replace the video rendering in the default variant
const target = `<video src={mediaUrl} controls className="max-h-[220px] w-full rounded-lg" />`;
const replacement = `<div className="relative w-full flex items-center justify-center">
          <video src={mediaUrl} className="max-h-[220px] w-full rounded-lg opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <PlayCircle className="w-12 h-12 text-white/80" strokeWidth={1.5} />
          </div>
        </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/ChunkedMedia.tsx', code);
