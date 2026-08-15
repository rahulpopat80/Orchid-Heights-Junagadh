const fs = require('fs');

let code = fs.readFileSync('src/components/ChunkedMedia.tsx', 'utf8');

const audioSupport = `
  if (type?.startsWith('audio/')) {
    return (
      <div className="rounded-xl border border-slate-200/60 overflow-hidden bg-white flex flex-col p-2 w-full min-w-[200px]">
        <audio src={mediaUrl} controls className="w-full h-10" />
      </div>
    );
  }
`;

if (!code.includes("startsWith('audio/')")) {
  code = code.replace(
    /if \(type\?\.startsWith\('video\/'\)\) \{/,
    `${audioSupport}\n  if (type?.startsWith('video/')) {`
  );
  fs.writeFileSync('src/components/ChunkedMedia.tsx', code);
  console.log("Patched ChunkedMedia");
} else {
  console.log("ChunkedMedia already has audio support");
}
