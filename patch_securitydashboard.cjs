const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'SecurityDashboard.tsx');
let code = fs.readFileSync(file, 'utf8');

const targetStr = `      const ok = await api.usePreEntry(pass.id);
      if (ok) {
        setScanResult({
          status: 'success',
          message: \`✅ એન્ટ્રી મંજૂર: \${pass.fullName} માટે પ્રવેશ સફળતાપૂર્વક સ્વીકારવામાં આવ્યો છે! (Access Granted)\`,
          data: { ...pass, status: 'Approved' }
        });`;

const replaceStr = `      const ok = await api.usePreEntry(pass.id);
      if (ok) {
        const currentUses = (pass.uses || 0) + 1;
        const maxUses = pass.maxUses || 1;
        setScanResult({
          status: 'success',
          message: \`✅ એન્ટ્રી મંજૂર: \${pass.fullName} માટે પ્રવેશ સફળતાપૂર્વક સ્વીકારવામાં આવ્યો છે! (Access Granted) - [\${currentUses}/\${maxUses} Uses]\`,
          data: { ...pass, status: 'Approved' }
        });`;

if (code.includes('const ok = await api.usePreEntry(pass.id);')) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched SecurityDashboard");
}
