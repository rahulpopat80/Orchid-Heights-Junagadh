const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Ensure tables are wrapped in overflow-x-auto and use w-full min-w-max or similar
// An easier generic patch is to replace "<table" with "<div className='overflow-x-auto'><table"
// and "</table>" with "</table></div>"
// Wait, that might nest divs unnecessarily if it's already wrapped.
code = code.replace(/<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">/g, 
  '<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">');

// Another pattern might be:
code = code.replace(/<table className="w-full text-sm text-left">/g, 
  '<div className="overflow-x-auto"><table className="w-full text-sm text-left min-w-[800px]">');
code = code.replace(/<table className="w-full text-sm text-left text-slate-700">/g, 
  '<div className="overflow-x-auto"><table className="w-full text-sm text-left text-slate-700 min-w-[800px]">');
code = code.replace(/<\/table>/g, 
  '</table></div>');
// Wait, the above replaces might add extra divs if it was already wrapped, but React expects balanced tags. 
// It's safer to just wrap. Wait, `</table>` is replaced with `</table></div>`, so the tags ARE balanced.
// `<table` -> `<div><table`, `</table` -> `</table</div>` => Balanced.

// Let's also check AdminLocalServices.tsx
let localServices = fs.readFileSync('src/components/admin/AdminLocalServices.tsx', 'utf8');
localServices = localServices.replace(/<table /g, '<div className="overflow-x-auto w-full"><table ');
localServices = localServices.replace(/<\/table>/g, '</table></div>');
fs.writeFileSync('src/components/admin/AdminLocalServices.tsx', localServices);

let visitorRecords = fs.readFileSync('src/components/admin/AdminVisitorRecords.tsx', 'utf8');
visitorRecords = visitorRecords.replace(/<table /g, '<div className="overflow-x-auto w-full"><table ');
visitorRecords = visitorRecords.replace(/<\/table>/g, '</table></div>');
fs.writeFileSync('src/components/admin/AdminVisitorRecords.tsx', visitorRecords);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Patched tables for responsiveness");
