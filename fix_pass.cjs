const fs = require('fs');

const files = ['src/lib/server-db.ts', 'src/lib/fallback.ts', 'src/lib/firebase.ts', 'src/components/AdminDashboard.tsx'];
for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/Invalid password\. Default is admin@123\./g, 'Invalid password.');
    content = content.replace(/resets passwords to their default state \(<span className="font-semibold text-slate-700 font-mono">admin@123<\/span>\)/g, 'resets passwords to their default state');
    fs.writeFileSync(file, content);
  }
}
