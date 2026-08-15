const fs = require('fs');
let code = fs.readFileSync('src/components/ChunkedMedia.tsx', 'utf8');

const audioRender = `
  if (type?.startsWith('audio/')) {
    return (
      <div className={"rounded-xl border border-slate-200/60 overflow-hidden bg-slate-50 flex flex-col p-2 " + (className || "w-full")}>
        <div className="flex items-center gap-2 mb-1">
          <audio src={mediaUrl} controls className="h-10 w-full" />
        </div>
      </div>
    );
  }
`;

if (!code.includes("type?.startsWith('audio/')")) {
  code = code.replace(
    /if \(type\?\.startsWith\('video\/'\)\) \{/,
    audioRender + "\n  if (type?.startsWith('video/')) {"
  );
  fs.writeFileSync('src/components/ChunkedMedia.tsx', code);
  console.log("Patched ChunkedMedia");
}
