const fs = require('fs');
const file = 'src/components/SecurityDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `          deviceImei: deviceImei
        };`;
const replaceStr = `          deviceImei: deviceImei,
          entryMethod: isBypassed ? 'System-Auto Entry' : 'Call Entry'
        };`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched SecurityDashboard with entryMethod");
}
