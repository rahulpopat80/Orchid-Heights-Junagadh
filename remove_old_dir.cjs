const fs = require('fs');
let code = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

// The grid definition:
// <div className={`grid grid-cols-1 ${activeSecTab === 'directory' ? 'xl:grid-cols-1' : 'xl:grid-cols-2'} gap-6 xl:gap-8 items-start`}>
code = code.replace(
  /<div className=\{\`grid grid-cols-1 \$\{activeSecTab === 'directory' \? 'xl:grid-cols-1' : 'xl:grid-cols-2'\} gap-6 xl:gap-8 items-start\`\}>/,
  `<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8 items-start">`
);

// We had:
//          ) : activeSecTab === 'directory' ? (
//            <div className="bg-slate-50 p-4 sm:p-8 md:p-12 w-full max-w-4xl mx-auto rounded-3xl border border-slate-200 min-h-screen">
//              <Directory owners={owners} session={{ role: 'security' }} />
//            </div>
//          ) : null}
// Let's just find that block and remove it.

code = code.replace(
  /          \) : activeSecTab === 'directory' \? \([\s\S]*?<\/div>\n          \) : null\}/,
  `          ) : null}`
);

// Also remove the `{activeSecTab !== 'directory' && (` logic I added.
code = code.replace(
  /        \{activeSecTab !== 'directory' && \(\n          <div className="flex flex-col gap-6 h-full">\n            \{\(activeSecTab === 'register' \|\| activeSecTab === 'qr_scan'\) && \(\n              <>\n        <div id="active-tracker"/,
  `        <div className="flex flex-col gap-6 h-full">\n            {(activeSecTab === 'register' || activeSecTab === 'qr_scan') && (\n              <>\n        <div id="active-tracker"`
);

// And close it out properly. I had:
//            )}
//          </div>
//        )}
//      </div>
//    </div>
//  );
//}
code = code.replace(
  /            \)\}\n          <\/div>\n        \)\}\n      <\/div>\n    <\/div>\n  \);\n\}/,
  `            )}\n          </div>\n      </div>\n    </div>\n  );\n}`
);


fs.writeFileSync('src/components/SecurityDashboard.tsx', code);
