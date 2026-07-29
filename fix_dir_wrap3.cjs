const fs = require('fs');
let code = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

code = code.replace(
  /  return \(\n    <div className="space-y-8">/,
  `  if (activeSecTab === 'directory') {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          <button onClick={() => setActiveSecTab('register')} className="mb-4 flex items-center space-x-2 text-indigo-600 font-bold hover:text-indigo-800 transition">
            <ArrowLeft className="w-4 h-4" /> <span>પાછા જાઓ (Back to Dashboard)</span>
          </button>
          <Directory owners={owners} session={{ role: 'security' }} onBack={() => setActiveSecTab('register')} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">`
);

fs.writeFileSync('src/components/SecurityDashboard.tsx', code);
