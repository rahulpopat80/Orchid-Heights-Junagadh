const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(/<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">/g, 
  '<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">');

code = code.replace(/<div className="overflow-x-auto"><table className="w-full text-sm text-left min-w-\\[800px\\]">/g, 
  '<table className="w-full text-sm text-left">');

code = code.replace(/<div className="overflow-x-auto"><table className="w-full text-sm text-left text-slate-700 min-w-\\[800px\\]">/g, 
  '<table className="w-full text-sm text-left text-slate-700">');

code = code.replace(/<\/table><\/div>/g, 
  '</table>');

fs.writeFileSync('src/components/AdminDashboard.tsx', code);

let localServices = fs.readFileSync('src/components/admin/AdminLocalServices.tsx', 'utf8');
localServices = localServices.replace(/<div className="overflow-x-auto w-full"><table /g, '<table ');
localServices = localServices.replace(/<\/table><\/div>/g, '</table>');
fs.writeFileSync('src/components/admin/AdminLocalServices.tsx', localServices);

let visitorRecords = fs.readFileSync('src/components/admin/AdminVisitorRecords.tsx', 'utf8');
visitorRecords = visitorRecords.replace(/<div className="overflow-x-auto w-full"><table /g, '<table ');
visitorRecords = visitorRecords.replace(/<\/table><\/div>/g, '</table>');
fs.writeFileSync('src/components/admin/AdminVisitorRecords.tsx', visitorRecords);

console.log("Undid table patches");
