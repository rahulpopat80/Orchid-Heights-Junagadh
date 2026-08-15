const fs = require('fs');
let code = fs.readFileSync('src/components/ResidentDashboard.tsx', 'utf8');

// 1. Hide bottom nav when activeSubSection === 'chat'
const targetNav = `{/* Floating Bottom Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 py-3.5 px-6 flex items-center justify-around z-40 shadow-xl max-w-md mx-auto rounded-t-3xl">`;
const replaceNav = `{/* Floating Bottom Navigation Bar */}
      {activeSubSection !== 'chat' && (
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 py-3.5 px-6 flex items-center justify-around z-40 shadow-xl max-w-md mx-auto rounded-t-3xl">`;

code = code.replace(targetNav, replaceNav);

const targetNavEnd = `      </div>
    </div>
  );
}`;
const replaceNavEnd = `      </div>
      )}
    </div>
  );
}`;
code = code.replace(targetNavEnd, replaceNavEnd);

// 2. Adjust pb-24 conditionally
code = code.replace(
  `className="space-y-6 text-slate-800 pb-24 text-left"`,
  `className={\`space-y-6 text-slate-800 text-left \${activeSubSection === 'chat' ? 'pb-2' : 'pb-24'}\`}`
);

// 3. Change ChatSection wrapper height and styling to fit mobile perfectly
const targetChat = `{activeSubSection === 'chat' && (
                  <div className="h-[calc(100dvh-240px)] flex flex-col">
                    <ChatSection session={session} />
                  </div>
                )}`;
const replaceChat = `{activeSubSection === 'chat' && (
                  <div className="h-[calc(100dvh-120px)] flex flex-col -mx-4 sm:mx-0">
                    <ChatSection session={session} />
                  </div>
                )}`;
code = code.replace(targetChat, replaceChat);

fs.writeFileSync('src/components/ResidentDashboard.tsx', code);
