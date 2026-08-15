const fs = require('fs');
let code = fs.readFileSync('src/components/ResidentDashboard.tsx', 'utf8');

const targetHeader = `                        <div className="pt-3">
                          <br />
                          <br />
                          <h3 className="font-bold text-sm text-slate-800">Community Chat</h3>
                          <p className="text-[10px] text-emerald-600 font-bold">Online</p>
                        </div>`;

const replaceHeader = `                        <div>
                          <h3 className="font-bold text-sm text-slate-800">Community Chat</h3>
                          <p className="text-[10px] text-emerald-600 font-bold">Online</p>
                        </div>`;

if (code.includes(targetHeader)) {
  code = code.replace(targetHeader, replaceHeader);
  fs.writeFileSync('src/components/ResidentDashboard.tsx', code);
  console.log("Patched Resident Chat Header");
}
