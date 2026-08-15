const fs = require('fs');
let code = fs.readFileSync('src/components/ResidentDashboard.tsx', 'utf8');

const targetChat = `{activeSubSection === 'chat' && (
                  <ChatSection session={session} />
                )}`;

const replacementChat = `{activeSubSection === 'chat' && (
                  <div className="fixed top-[100px] bottom-[75px] left-4 right-4 z-30 sm:left-6 sm:right-6 lg:left-8 lg:right-8 max-w-7xl mx-auto flex flex-col">
                    <ChatSection session={session} />
                  </div>
                )}`;

if (code.includes(targetChat)) {
  code = code.replace(targetChat, replacementChat);
  fs.writeFileSync('src/components/ResidentDashboard.tsx', code);
  console.log("Success patching ChatSection wrapper in ResidentDashboard");
} else {
  console.log("Could not find ChatSection in ResidentDashboard");
}
