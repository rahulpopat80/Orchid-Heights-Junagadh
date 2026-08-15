const fs = require('fs');

function fixResident() {
  let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

  code = code.replace(
    /\.\.\.\(menuPosition && menuPosition\.x > window\.innerWidth \/ 2[\s\S]*?\)\s*\}\}/,
    `...(isMe ? { right: '16px' } : { left: '16px' })
          }}`
  );

  fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
}
fixResident();

function fixAdmin() {
  let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

  code = code.replace(
    /\.\.\.\(\(window as any\)\.adminMenuPosition && \(window as any\)\.adminMenuPosition\.x > window\.innerWidth \/ 2[\s\S]*?\)\s*\}\}/,
    `...( (window as any).adminMenuPosition && (window as any).adminMenuPosition.x > window.innerWidth / 2 ? { right: '16px' } : { left: '16px' })
                              }}`
  );

  fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
}
fixAdmin();
