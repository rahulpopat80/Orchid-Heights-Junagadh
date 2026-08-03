const fs = require('fs');
let content = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

const target = `            <Users className="w-5 h-5" />
            <span>ફ્લેટ ધારકો ની વિગત</span>
          </button>
          <PWAInstallButton />
        </div>
      </div>`;

const replace = `            <Users className="w-5 h-5" />
            <span>ફ્લેટ ધારકો ની વિગત</span>
          </button>
        </div>
      </div>
      <div className="w-full flex justify-end">
        <PWAInstallButton />
      </div>`;

if (content.includes(target)) {
    content = content.replace(target, replace);
    fs.writeFileSync('src/components/SecurityDashboard.tsx', content);
    console.log("Re-positioned PWA button");
} else {
    console.log("Target not found");
}
