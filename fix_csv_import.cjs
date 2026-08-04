const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const search = `      setFinTitle(\`CSV Import: \${count} Ledger Records\`);
      setFinExpense(totalAmount.toString());`;
const replace = `      if (!finTitle.trim()) {
        setFinTitle(\`CSV Import: \${count} Ledger Records\`);
      }
      if (!finExpense.trim() || finExpense === '0') {
        setFinExpense(totalAmount.toString());
      }`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
