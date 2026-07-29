const fs = require('fs');
let code = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');
code = code.replace(
  /\) : null\}\n\s+<\/div>\n\n\s+<div id="active-tracker"/,
  `) : activeSecTab === 'directory' ? (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden h-[800px] relative">
              <Directory owners={owners} session={{ role: 'security' }} />
            </div>
          ) : null}
        </div>

        <div id="active-tracker"`
);
fs.writeFileSync('src/components/SecurityDashboard.tsx', code);
