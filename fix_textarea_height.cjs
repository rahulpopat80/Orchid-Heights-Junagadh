const fs = require('fs');

let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

// Inside handleSendAction, after we send the message, reset the height
code = code.replace(
  /setInputText\(''\);\s*setStagedFiles\(\[\]\);/g,
  `setInputText('');
    setStagedFiles([]);
    const ta = document.getElementById('chat-input-textarea');
    if (ta) ta.style.height = 'auto';`
);

// We need to add id="chat-input-textarea" to the textarea
code = code.replace(
  /className="flex-1 bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none resize-none min-h-\[44px\] max-h-\[120px\] overflow-y-auto"/g,
  `id="chat-input-textarea"
      className="flex-1 bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none resize-none min-h-[44px] max-h-[120px] overflow-y-auto"`
);

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
