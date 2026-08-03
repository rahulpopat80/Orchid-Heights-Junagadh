const fs = require('fs');
let content = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

const target = `            <Users className="w-5 h-5" />
            <span>ફ્લેટ ધારકો ની વિગત</span>
          </button>
        </div>
      </div>`;

const replace = `            <Users className="w-5 h-5" />
            <span>ફ્લેટ ધારકો ની વિગત</span>
          </button>
          <PWAInstallButton />
        </div>
      </div>`;

if (content.includes(target)) {
    content = content.replace(target, replace);
}

// Remove mt-3 from PWAInstallButton
content = content.replace('shadow-sm mt-3"', 'shadow-sm"');

fs.writeFileSync('src/components/SecurityDashboard.tsx', content);
console.log("Done");
