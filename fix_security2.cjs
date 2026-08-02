const fs = require('fs');
let code = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

const targetHtml = `{scanResult.data?.photoUrl && (
                      <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md">
                        <img src={scanResult.data.photoUrl} alt="Visitor" className="w-full h-full object-cover" />
                      </div>
                    )}`;

const replaceHtml = `<div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md flex items-center justify-center bg-slate-100">
                      {scanResult.data?.photoUrl ? (
                        <img src={scanResult.data.photoUrl} alt="Visitor" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>`;

if (code.includes(targetHtml)) {
  code = code.replace(targetHtml, replaceHtml);
  fs.writeFileSync('src/components/SecurityDashboard.tsx', code);
  console.log("Replaced image logic");
} else {
  console.log("Could not find image logic");
}
