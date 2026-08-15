const fs = require('fs');
let code = fs.readFileSync('src/components/ResidentDashboard.tsx', 'utf8');

code = code.replace(
  `        </button>\n      </div>\n\n{/* Notifications Modal Center Overlay */}`,
  `        </button>\n      </div>\n      )}\n\n{/* Notifications Modal Center Overlay */}`
);

fs.writeFileSync('src/components/ResidentDashboard.tsx', code);
console.log("Fixed syntax");
