const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `                              movie.posterUrl.startsWith('file_') ? (
                                <div className="w-12 h-16 rounded border border-slate-200 overflow-hidden shrink-0">
                                  <ChunkedMedia fileId={movie.posterUrl} type="image/jpeg" fallbackName={movie.title} variant="raw" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <img
                                  src={movie.posterUrl}
                                  alt="poster"
                                  className="w-12 h-16 object-cover rounded border border-slate-200 bg-slate-900 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              )`;
const replace = `                              movie.posterUrl.startsWith('file_') ? (
                                <div className="w-16 h-12 rounded border border-slate-200 overflow-hidden shrink-0 bg-slate-900">
                                  <ChunkedMedia fileId={movie.posterUrl} type="image/jpeg" fallbackName={movie.title} variant="raw" className="w-full h-full object-contain" />
                                </div>
                              ) : (
                                <img
                                  src={movie.posterUrl}
                                  alt="poster"
                                  className="w-16 h-12 object-contain rounded border border-slate-200 bg-slate-900 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              )`;

if (code.includes(target)) {
    code = code.replace(target, replace);
    fs.writeFileSync('src/components/AdminDashboard.tsx', code);
    console.log("Updated poster in AdminDashboard");
} else {
    console.log("Target not found!");
}
