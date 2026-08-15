const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const targetVisitor = `{activeTab === 'visitors' && (
          <AdminVisitorRecords onBack={() => window.location.hash = 'home'} owners={owners} />
        )}`;

const replacementVisitor = `{activeTab === 'visitors' && (
          <AdminVisitorRecords onBack={() => window.location.hash = 'home'} owners={owners} />
        )}
        {activeTab === 'chat' && (
          <AdminChatSection />
        )}`;

if (code.includes(targetVisitor)) {
  code = code.replace(targetVisitor, replacementVisitor);
  console.log("Visitor replacement success");
} else {
  console.log("Target Visitor not found");
}

const targetNav = `<button
                onClick={() => {
                  setActiveTab('local-services');
                  setSidebarOpen(false);
                }}`;
                
const replacementNav = `<button
                onClick={() => {
                  setActiveTab('chat');
                  setSidebarOpen(false);
                }}
                className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition \${
                  activeTab === 'chat'
                    ? 'bg-indigo-600 text-white font-bold shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }\`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Community Chat</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('local-services');
                  setSidebarOpen(false);
                }}`;

if (code.includes(targetNav)) {
  code = code.replace(targetNav, replacementNav);
  console.log("Nav replacement success");
} else {
  console.log("Target Nav not found");
}

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
