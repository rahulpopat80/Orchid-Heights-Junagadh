const fs = require('fs');
let code = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

// 1. Remove from gym_entry tab
code = code.replace(
  /\s+<div className="mt-8 border-t border-slate-100 pt-6">[\s\S]*?(?=<\/div>\n\s+<\/div>\n\s+\) : activeSecTab === 'directory' \? \()/g,
  ""
);

// 2. Add below active-tracker
// Let's find where active-tracker ends.
// active-tracker has pendingVisitors and then at the very bottom has "approved/entered" visitors list.
// We can just find the end of the SecurityDashboard div.
// It's better to find the end of the 2-col grid.
// Let's check what's near the end of SecurityDashboard.tsx
