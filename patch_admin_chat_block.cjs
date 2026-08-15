const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Patch hashchange listener
code = code.replace(
  "['home', 'flats', 'notices', 'complaints', 'finance', 'address-book', 'system', 'amenities', 'visitors', 'local-services']",
  "['home', 'flats', 'notices', 'complaints', 'finance', 'address-book', 'system', 'amenities', 'visitors', 'local-services', 'chat']"
);

// Add to the grid
const gridTarget = `{ id: 'local-services', label: 'Local Services', icon: Grid, color: 'text-amber-600', bg: 'bg-amber-50' }
          ].map`;

const gridReplacement = `{ id: 'local-services', label: 'Local Services', icon: Grid, color: 'text-amber-600', bg: 'bg-amber-50' },
            { id: 'chat', label: 'Community Chat', icon: MessageCircle, color: 'text-sky-600', bg: 'bg-sky-50' }
          ].map`;

if (code.includes(gridTarget)) {
  code = code.replace(gridTarget, gridReplacement);
  console.log("Admin Dashboard grid patched");
} else {
  console.log("Admin Dashboard grid not found");
}

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
