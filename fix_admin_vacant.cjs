const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /!o\.nameEn\.toLowerCase\(\)\.includes\('vacant'\)/g,
  "!(o.nameEn || '').toLowerCase().includes('vacant')"
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
