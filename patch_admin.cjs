const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `{activeTab === 'visitors' && (
          <AdminVisitorRecords
            owners={owners}
            onBack={() => setActiveTab('home')}
          />
        )}`;

const replacement = `{activeTab === 'visitors' && (
          <AdminVisitorRecords
            owners={owners}
            onBack={() => setActiveTab('home')}
          />
        )}
        {activeTab === 'chat' && (
          <AdminChatSection />
        )}`;

code = code.replace(target, replacement);

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
                <MessageSquare className="w-5 h-5" />
                <span>Community Chat</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('local-services');
                  setSidebarOpen(false);
                }}`;

code = code.replace(targetNav, replacementNav);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
