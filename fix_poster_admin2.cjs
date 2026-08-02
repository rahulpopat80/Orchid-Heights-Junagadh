const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `                              movie.posterUrl.startsWith('file_') ? (
                                <div className="w-16 h-12 rounded border border-slate-200 overflow-hidden shrink-0 bg-slate-900">
                                  <ChunkedMedia fileId={movie.posterUrl} type="image/jpeg" fallbackName={movie.title} variant="raw" className="w-full h-full object-contain" />
                                </div>`;
const replace = `                              movie.posterUrl.startsWith('file_') ? (
                                <div className="w-16 h-12 rounded border border-slate-200 overflow-hidden shrink-0 bg-slate-900 flex items-center justify-center">
                                  <ChunkedMedia fileId={movie.posterUrl} type="image/jpeg" fallbackName={movie.title} variant="raw" className="max-w-full max-h-full object-contain" />
                                </div>`;

if (code.includes(target)) {
    code = code.replace(target, replace);
    fs.writeFileSync('src/components/AdminDashboard.tsx', code);
    console.log("Updated poster flex in AdminDashboard");
} else {
    console.log("Target not found!");
}
