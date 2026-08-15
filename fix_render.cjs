const fs = require('fs');
let code = fs.readFileSync('src/components/ResidentDashboard.tsx', 'utf8');

const target = `{activeSubSection === 'preentry' && (
                  <PreEntrySection
                    wing={wing}
                    flatNo={flatNo}
                    session={session}
                  />
                )}`;

const replacement = `{activeSubSection === 'preentry' && (
                  <PreEntrySection
                    wing={wing}
                    flatNo={flatNo}
                    session={session}
                  />
                )}
                {activeSubSection === 'chat' && (
                  <ChatSection session={session} />
                )}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/ResidentDashboard.tsx', code);
  console.log("Success");
} else {
  console.log("Target not found!");
}
