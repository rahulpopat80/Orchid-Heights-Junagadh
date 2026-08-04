const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = '</select>\n                </div>\n              {/* Inline Owner Editor Dialog';
if (code.includes(target)) {
  code = code.replace(target, '</select>\n                </div>\n              </div>\n              {/* Inline Owner Editor Dialog');
  fs.writeFileSync('src/components/AdminDashboard.tsx', code);
  console.log('Fixed with exact string');
} else {
  // Let's use regex
  code = code.replace(
    /<\/select>\s*<\/div>\s*\{\/\* Inline Owner Editor Dialog/,
    '</select>\n                </div>\n              </div>\n              {/* Inline Owner Editor Dialog'
  );
  fs.writeFileSync('src/components/AdminDashboard.tsx', code);
  console.log('Fixed with regex');
}
