const fs = require('fs');

function fixChat(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix 1: Reply Click Highlight
  code = code.replace(
    /onClick=\{\(\) => document\.getElementById\(\`msg-\$\{msg\.replyToMessageId\}\`\)\?\.scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\)\}/g,
    `onClick={() => {
      const el = document.getElementById(\`msg-\${msg.replyToMessageId}\`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('bg-indigo-50', 'transition-colors', 'duration-500', '-mx-2', 'px-2', 'rounded-lg');
        setTimeout(() => el.classList.remove('bg-indigo-50', 'transition-colors', 'duration-500', '-mx-2', 'px-2', 'rounded-lg'), 1500);
      }
    }}`
  );

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

  // Fix 3: Media type text in reply snippets
  // First snippet (in the bubble):
  code = code.replace(
    /<div className="text-xs text-slate-600 truncate select-none">\{repliedMsg\.text \|\| 'Photo'\}<\/div>/g,
    `<div className="text-xs text-slate-600 truncate select-none">{repliedMsg.text || (repliedMsg.mediaUrl ? (repliedMsg.mediaType?.startsWith('video/') ? '🎥 Video' : repliedMsg.mediaType?.startsWith('audio/') ? '🎤 Audio' : '📷 Image') : 'Attachment')}</div>`
  );

  // Second snippet (in the typing area):
  code = code.replace(
    /<div className="text-sm text-slate-600 truncate pr-4">\{replyingTo\.text \|\| 'Photo'\}<\/div>/g,
    `<div className="text-sm text-slate-600 truncate pr-4">{replyingTo.text || (replyingTo.mediaUrl ? (replyingTo.mediaType?.startsWith('video/') ? '🎥 Video' : replyingTo.mediaType?.startsWith('audio/') ? '🎤 Audio' : '📷 Image') : 'Attachment')}</div>`
  );

  fs.writeFileSync(filePath, code);
}
fixChat('src/components/resident/ChatSection.tsx');
