const fs = require('fs');
const file = 'src/components/SecurityDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `      // If valid, apply usage & save visitor log
      const ok = await api.usePreEntry(pass.id);`;

const replaceStr = `      // Check if this pass is currently active (visitor inside)
      const isCurrentlyInside = visitors.some(v => v.preEntryId === pass.id && !v.exited && (v.status === 'Entered' || v.status === 'approved'));
      if (isCurrentlyInside) {
        setScanResult({
          status: 'invalid',
          message: 'આ પાસ વાળો વ્યક્તિ પહેલેથી જ અંદર છે! (Visitor is already inside and has not exited yet)',
          data: pass
        });
        playDecisionSound('rejected');
        return;
      }

      // If valid, apply usage & save visitor log
      const ok = await api.usePreEntry(pass.id);`;

if (code.includes('const ok = await api.usePreEntry(pass.id);')) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Patched SecurityDashboard duplicate entry check");
}
