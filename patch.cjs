const fs = require('fs');
const content = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');
const lines = content.split('\n');
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('  );')) {
    lines.splice(i - 2, 0, '        )}');
    break;
  }
}
fs.writeFileSync('src/components/SecurityDashboard.tsx', lines.join('\n'));
