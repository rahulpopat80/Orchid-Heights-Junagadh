const fs = require('fs');
let code = fs.readFileSync('src/components/resident/HelpDeskSection.tsx', 'utf8');

const searchPayload = `      const payload: any = {
        title: compTitle.trim(),
        description: compDesc.trim(),
        wing,
        flatNo,
  ownerName,
        ownerName,
        attachments: compAttachments
      };`;
const replacePayload = `      const payload: any = {
        title: compTitle.trim(),
        description: compDesc.trim(),
        wing,
        flatNo,
        ownerName,
        attachments: compAttachments
      };`;
code = code.replace(searchPayload, replacePayload);
fs.writeFileSync('src/components/resident/HelpDeskSection.tsx', code);
