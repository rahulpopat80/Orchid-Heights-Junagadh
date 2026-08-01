const fs = require('fs');
let content = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

const regex = /const memberOptions:[^]*?if\s*\(activeCallReq\?\.visitorId === v\.id\)/g;

const replacement = `const memberOptions: { name: string; phone: string; nameEn: string }[] = [];
                        
                        let ownerNameGu = owner.nameGu || owner.nameEn || 'Owner';
                        if (owner.nameGu || owner.nameEn) {
                          memberOptions.push({ name: ownerNameGu, phone: owner.phone, nameEn: owner.nameEn || ownerNameGu });
                        }
                        
                        const secPhone = owner.secondaryContact ? owner.secondaryContact.replace(/\\D/g, '') : '';
                        let secMatchedIndex = -1;
                        
                        const tempMembers: { name: string; phone: string; nameEn: string }[] = [];
                        if (owner.members) {
                          owner.members.forEach((mStr) => {
                            const match = mStr.match(/^(.*?)(?:\\s*\\((.*?)\\))?$/);
                            if (match) {
                              const mName = match[1].trim();
                              const mPhone = match[2]?.trim() || '';
                              tempMembers.push({ name: mName, phone: mPhone, nameEn: mName });
                            }
                          });
                        }
                        
                        if (secPhone) {
                          secMatchedIndex = tempMembers.findIndex(m => m.phone.replace(/\\D/g, '') === secPhone);
                        }
                        
                        tempMembers.forEach((m, idx) => {
                          let finalName = m.name;
                          if (idx === secMatchedIndex) {
                            finalName = \`\${finalName} (S)\`;
                          }
                          memberOptions.push({ name: finalName, phone: m.phone, nameEn: m.nameEn });
                        });
                        
                        if (secPhone && secMatchedIndex === -1) {
                          memberOptions.push({ name: \`\${ownerNameGu} (Secondary)\`, phone: owner.secondaryContact, nameEn: \`\${owner.nameEn || 'Owner'} (Secondary)\` });
                        }

                        if (activeCallReq?.visitorId === v.id)`;

// We have to use a more precise regex. Let's just do it directly.
