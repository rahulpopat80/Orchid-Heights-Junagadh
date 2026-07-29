const fs = require('fs');
let code = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

// 1. Fix the grid class to be full width for directory
code = code.replace(
  /<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8 items-start">/,
  `<div className={\`grid grid-cols-1 \${activeSecTab === 'directory' ? 'xl:grid-cols-1' : 'xl:grid-cols-2'} gap-6 xl:gap-8 items-start\`}>`
);

// 2. We need to wrap the right panel logic.
// Find the end of the left panel:
//           ) : null}
//         </div>
//
//         <div id="active-tracker" className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 text-left h-full">

code = code.replace(
  /          \) : null\}\n\s+<\/div>\n\n\s+<div id="active-tracker" className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 text-left h-full">/,
  `          ) : null}\n        </div>\n\n        {activeSecTab !== 'directory' && (\n          <div className="flex flex-col gap-6 h-full">\n            {(activeSecTab === 'register' || activeSecTab === 'qr_scan') && (\n              <>\n        <div id="active-tracker" className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 text-left h-full flex-1">`
);

// 3. Find where the "આજના પૂર્ણ થયેલ પ્રવેશ" div ends.
// In the current file, after the pendingVisitors list, there's another block for completed requests.
// We can find it and then close the `</>` and `)}` and then add the gym tracker there?
// Let's first dump the end of the `grid` to see where it is.
