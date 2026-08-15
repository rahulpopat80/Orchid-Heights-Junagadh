const fs = require('fs');

function fixChat(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix 2: Textarea for Enter to newline
  code = code.replace(
    /<input\s+type="text"\s+value=\{inputText\}\s+onChange=\{\(e\) => setInputText\(e\.target\.value\)\}\s+onKeyDown=\{\(e\) => e\.key === 'Enter' && handleSendAction\(\)\}\s+placeholder="Type a message\.\.\."\s+className="flex-1 bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none"\s+\/>/g,
    `<textarea
      value={inputText}
      onChange={(e) => {
        setInputText(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = (e.target.scrollHeight < 120 ? e.target.scrollHeight : 120) + 'px';
      }}
      placeholder="Type a message..."
      className="flex-1 bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none resize-none min-h-[44px] max-h-[120px] overflow-y-auto"
      rows={1}
    />`
  );

  fs.writeFileSync(filePath, code);
}
fixChat('src/components/admin/AdminChatSection.tsx');
