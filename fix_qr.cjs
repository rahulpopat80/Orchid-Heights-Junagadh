const fs = require('fs');
let code = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

// The only one we WANT to keep is the one that introduces the qr_scan block
// Let's first restore ALL of them
code = code.replace(/          \) : activeSecTab === 'qr_scan' \? \(/g, "          ) : (");

// Now we specifically target the qr_scan block
// Wait, the qr_scan block starts with:
//           ) : (
//             <div className="space-y-6">
//               <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200/60 text-center space-y-4">
//                 <h3 className="text-xl font-bold text-slate-800">પ્રી-એન્ટ્રી પાસ સ્કેન કરો (Scan Pre-Entry Pass)</h3>

code = code.replace(
  /\) : \(\n\s+<div className="space-y-6">\n\s+<div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200\/60 text-center space-y-4">\n\s+<h3 className="text-xl font-bold text-slate-800">પ્રી-એન્ટ્રી પાસ સ્કેન કરો \(Scan Pre-Entry Pass\)<\/h3>/,
  `) : activeSecTab === 'qr_scan' ? (\n            <div className="space-y-6">\n              <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200/60 text-center space-y-4">\n                <h3 className="text-xl font-bold text-slate-800">પ્રી-એન્ટ્રી પાસ સ્કેન કરો (Scan Pre-Entry Pass)</h3>`
);

fs.writeFileSync('src/components/SecurityDashboard.tsx', code);
