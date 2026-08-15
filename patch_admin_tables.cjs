const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  '<table className="w-full text-left text-xs text-slate-600 border-collapse">',
  '<div className="overflow-x-auto w-full"><table className="w-full text-left text-xs text-slate-600 border-collapse min-w-[600px]">'
);

code = code.replace(
  '<table className="w-full text-left border-collapse min-w-[300px]">',
  '<div className="overflow-x-auto w-full"><table className="w-full text-left border-collapse min-w-[500px]">'
);

// We know there are exactly two <table> and two </table> in the file.
// We can just replace all </table> with </table></div>
let splitByTableEnd = code.split('</table>');
if (splitByTableEnd.length === 3) {
  code = splitByTableEnd.join('</table></div>');
} else {
  console.log("Could not find exactly 2 </table> tags in AdminDashboard.tsx");
}

fs.writeFileSync('src/components/AdminDashboard.tsx', code);

// Now for AdminLocalServices.tsx
let lsCode = fs.readFileSync('src/components/admin/AdminLocalServices.tsx', 'utf8');
if (lsCode.includes('<table className="w-full text-sm text-left">')) {
  lsCode = lsCode.replace('<table className="w-full text-sm text-left">', '<div className="overflow-x-auto w-full"><table className="w-full text-sm text-left min-w-[600px]">');
  lsCode = lsCode.replace('</table>', '</table></div>');
  fs.writeFileSync('src/components/admin/AdminLocalServices.tsx', lsCode);
}

// Now for AdminVisitorRecords.tsx
let vrCode = fs.readFileSync('src/components/admin/AdminVisitorRecords.tsx', 'utf8');
if (vrCode.includes('<table className="w-full text-sm text-left text-slate-700">')) {
  vrCode = vrCode.replace('<table className="w-full text-sm text-left text-slate-700">', '<div className="overflow-x-auto w-full"><table className="w-full text-sm text-left text-slate-700 min-w-[700px]">');
  vrCode = vrCode.replace('</table>', '</table></div>');
  fs.writeFileSync('src/components/admin/AdminVisitorRecords.tsx', vrCode);
}

console.log("Patched tables manually.");
