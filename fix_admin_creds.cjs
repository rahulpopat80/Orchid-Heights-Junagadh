const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPage.tsx', 'utf8');

const target = `if (username.trim().toLowerCase() === 'orchidheights' && password.trim() === '9898180810') {
      onLoginSuccess({ username: 'orchidheights', role: 'admin' });`;

const replace = `if (username.trim().toLowerCase() === 'admin' && password.trim() === 'Rahul#80810') {
      onLoginSuccess({ username: 'admin', role: 'admin' });`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('src/components/AdminPage.tsx', code);
  console.log("Replaced admin creds");
} else {
  console.log("Could not find admin creds");
}
