const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminVisitorRecords.tsx', 'utf8');

const searchRegex = /reportData\.forEach\(\(v, idx\) => \{[\s\S]*?\}\);/g;
const replacement = `reportData.forEach((v, idx) => {
        const reqDate = new Date(v.requestTime);
        const respDate = v.respondedTime ? new Date(v.respondedTime) : null;
        const exitDate = v.exitTime ? new Date(v.exitTime) : null;
        
        const reqDateStr = reqDate.toLocaleDateString('en-IN');
        const reqTimeStr = reqDate.toLocaleTimeString('en-IN', { hour12: false });
        const respTimeStr = respDate ? respDate.toLocaleString('en-IN') : '-';
        const exitTimeStr = exitDate ? exitDate.toLocaleString('en-IN') : '-';
        
        let statusStr = v.exited ? 'EXITED' : (v.status || '').toUpperCase();
        if (v.status === 'expired') statusStr = 'EXPIRED';

        rows.push([
          \`"\${idx + 1}"\`,
          \`"\${(v.fullName || '').replace(/"/g, '""')}"\`,
          \`"\${v.mobileNumber || ''}"\`,
          \`"\${(v.email || '').replace(/"/g, '""')}"\`,
          \`"\${v.wing}"\`,
          \`"\${v.flatNo}"\`,
          \`"\${v.guestType || ''}"\`,
          \`"\${v.isPreEntry ? 'Pre-Entry' : (v.respondedBy?.includes('Through Call') ? 'Gate Entry (Call)' : 'Gate Entry')}"\`,
          \`"\${(v.reason || '').replace(/"/g, '""')}"\`,
          \`"\${statusStr}"\`,
          \`"\${reqDateStr}"\`,
          \`"\${reqTimeStr}"\`,
          \`"\${respTimeStr}"\`,
          \`"\${(v.respondedBy || '-').toUpperCase().replace(/"/g, '""')}"\`,
          \`"\${exitTimeStr}"\`,
          \`"\${(v.duration || '-').replace(/"/g, '""')}"\`,
          \`"-"\`,
          \`"-"\`,
          \`"\${(v.rejectReason || '-').replace(/"/g, '""')}"\`
        ].join(','));
      });`;

code = code.replace(searchRegex, replacement);
fs.writeFileSync('src/components/admin/AdminVisitorRecords.tsx', code);
