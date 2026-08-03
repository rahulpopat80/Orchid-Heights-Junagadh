const fs = require('fs');
let content = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

const targetPWA = `  return (
    <button
      onClick={handleInstallClick}
      className="w-full sm:w-auto bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-lg font-bold flex items-center justify-center space-x-2 transition shadow-sm"
    >
      <Download className="w-5 h-5" />
      <span>Download WebApp</span>
    </button>
  );`;

const replacePWA = `  return (
    <button
      onClick={handleInstallClick}
      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors shadow-sm flex items-center justify-center space-x-2 mt-4"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
      </svg>
      <span>Download WebApp (PWA)</span>
    </button>
  );`;

if (content.includes(targetPWA)) {
    content = content.replace(targetPWA, replacePWA);
    fs.writeFileSync('src/components/SecurityDashboard.tsx', content);
    console.log("Updated PWAInstallButton style in SecurityDashboard");
} else {
    console.log("Target PWAInstallButton not found");
}

