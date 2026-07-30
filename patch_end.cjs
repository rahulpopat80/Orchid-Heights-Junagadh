const fs = require('fs');
const content = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');
const fixedContent = content.replace(/                      <\/div>\n        \)}\n                    <\/div>/, '                      </div>\n                    </div>');
fs.writeFileSync('src/components/SecurityDashboard.tsx', fixedContent);
