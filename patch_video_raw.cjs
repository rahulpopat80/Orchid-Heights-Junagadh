const fs = require('fs');
let code = fs.readFileSync('src/components/ChunkedMedia.tsx', 'utf8');

code = code.replace(
  /if \(type\?\.startsWith\('video\/'\)\) \{\s*return \(\s*<div className="rounded-xl border border-slate-200\/60 overflow-hidden bg-black flex flex-col items-center justify-center p-1 w-full">/g,
  `if (type?.startsWith('video/')) {
    if (variant === 'raw') {
      return (
        <video 
          src={mediaUrl} 
          controls 
          className={className || "w-full h-full object-contain"} 
          playsInline
          autoPlay
        />
      );
    }
    return (
      <div className="rounded-xl border border-slate-200/60 overflow-hidden bg-black flex flex-col items-center justify-center p-1 w-full">`
);

fs.writeFileSync('src/components/ChunkedMedia.tsx', code);
