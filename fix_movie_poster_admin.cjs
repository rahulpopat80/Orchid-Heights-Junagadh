const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// 1. Import ChunkedMedia
const importRegex = /import AdminVisitorRecords from '.\/admin\/AdminVisitorRecords';/;
code = code.replace(importRegex, `import AdminVisitorRecords from './admin/AdminVisitorRecords';\nimport ChunkedMedia from './ChunkedMedia';`);

// 2. Fix the poster rendering
const posterTarget = `{movie.posterUrl && (
                              <img
                                src={movie.posterUrl}
                                alt="poster"
                                className="w-12 h-16 object-contain rounded border border-slate-200 bg-slate-900"
                                referrerPolicy="no-referrer"
                              />
                            )}`;

const replacement = `{movie.posterUrl && (
                              movie.posterUrl.startsWith('file_') ? (
                                <div className="w-12 h-16 rounded border border-slate-200 overflow-hidden shrink-0">
                                  <ChunkedMedia fileId={movie.posterUrl} type="image/jpeg" fallbackName={movie.title} />
                                </div>
                              ) : (
                                <img
                                  src={movie.posterUrl}
                                  alt="poster"
                                  className="w-12 h-16 object-cover rounded border border-slate-200 bg-slate-900 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              )
                            )}`;

code = code.replace(posterTarget, replacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Successfully updated movie poster rendering in AdminDashboard.tsx");
