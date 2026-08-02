const fs = require('fs');
let code = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

const targetHtml = `<div className="flex justify-between">
                          <span className="text-slate-400">મુલાકાતીનો પ્રકાર:</span>
                          <span className="font-bold text-slate-800">{scanResult.data.guestType}</span>
                        </div>`;

const replaceHtml = `<div className="flex justify-between">
                          <span className="text-slate-400">મુલાકાતીનો પ્રકાર:</span>
                          <span className="font-bold text-slate-800">{scanResult.data.guestType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">મુલાકાતીઓ (Count):</span>
                          <span className="font-bold text-slate-800">{scanResult.data.visitorCount || 1}</span>
                        </div>`;

if (code.includes(targetHtml)) {
  code = code.replace(targetHtml, replaceHtml);
  fs.writeFileSync('src/components/SecurityDashboard.tsx', code);
  console.log("visitorCount added to pass details");
} else {
  console.log("Could not find target html");
}
