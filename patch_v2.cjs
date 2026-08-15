const fs = require('fs');

function patchChatSection() {
  let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');
  
  // 1. Reaction Menu positioning
  code = code.replace(
    /top: menuPosition \? Math.min\(menuPosition.y, window.innerHeight - 200\) : '50%',/g,
    `top: menuPosition ? (menuPosition.y > window.innerHeight - 250 ? menuPosition.y - 140 : menuPosition.y + 20) : '50%',`
  );

  // 2. Highlighting reaction emoji & remove if selected (Resident)
  code = code.replace(
    /\{\['😡', '🙏', '👍', '❤️', '🔥', '🥳'\]\.map\(emoji => \(\s*<button key=\{emoji\} onClick=\{\(\) => handleReact\(msg\.id, emoji\)\} className="text-xl hover:scale-125 transition-transform">\s*\{emoji\}\s*<\/button>\s*\)\)\}/g,
    `{['😡', '🙏', '👍', '❤️', '🔥', '🥳'].map(emoji => {
       const isSelected = msg.reactions?.[flatId] === emoji;
       return (
         <button key={emoji} onClick={() => handleReact(msg.id, isSelected ? null : emoji)} className={\`text-xl hover:scale-125 transition-transform p-1 rounded-full \${isSelected ? 'bg-slate-200/80' : ''}\`}>
           {emoji}
         </button>
       );
     })}`
  );

  // 4. Update Reply Preview inside the Chat bubble (make unselectable)
  code = code.replace(
    /className="text-\[10px\] font-bold text-indigo-700">\{repliedMsg.senderOwnerName \|\| 'Resident'\}/g,
    'className="text-[10px] font-bold text-indigo-700 select-none">{repliedMsg.senderOwnerName || \'Resident\'}'
  );
  code = code.replace(
    /className="text-xs text-slate-600 truncate">\{repliedMsg.text \|\| 'Photo'\}/g,
    'className="text-xs text-slate-600 truncate select-none">{repliedMsg.text || \'Photo\'}'
  );
  
  // 5. Move Reply preview from bottom-fixed to right above the input
  const oldReplyBlockRegex = /\{replyingTo && \([\s\S]*?<X className="w-4 h-4" \/>\s*<\/button>\s*<\/div>\s*<\/div>\s*\)\}/;
  code = code.replace(oldReplyBlockRegex, '');

  const newReplyBlock = `{replyingTo && (
          <div className="bg-[#f0f2f5] px-3 pt-2 pb-1 rounded-t-xl -mx-3 -mt-3 mb-2">
            <div className="bg-white rounded-lg p-2 flex justify-between items-center relative shadow-sm border border-slate-100">
              <div className="flex-1 border-l-4 border-[#027a5b] pl-2 bg-black/5 rounded-r flex flex-col justify-center min-h-[40px]">
                <div className="text-xs font-bold" style={{ color: '#027a5b' }}>
                  {(replyingTo.senderWing === session.wing && replyingTo.senderFlatNo === session.flatNo) ? 'You' : (replyingTo.senderOwnerName || 'Resident')}
                </div>
                <div className="text-sm text-slate-600 truncate pr-4">{replyingTo.text || 'Photo'}</div>
              </div>
              <button onClick={() => setReplyingTo(null)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 rounded-full transition bg-white shadow-sm border border-slate-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}`;

  // Find the exact chat input div to insert before
  code = code.replace(
    /<div className="flex items-center gap-2">\s*<button\s*onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\}/,
    newReplyBlock + '\n        <div className="flex items-center gap-2">\n          <button\n            onClick={() => fileInputRef.current?.click()}'
  );

  // 6. Voice Message Functionality
  if (!code.includes('Mic')) {
    code = code.replace('ChevronDown', 'ChevronDown, Mic');
  }

  if (!code.includes('const [isRecording')) {
    code = code.replace(
      'const [inputText, setInputText] = useState(\'\');',
      `const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], \`Voice_Message_\${Date.now()}.webm\`, { type: 'audio/webm' });
        setStagedFiles(prev => [...prev, file]);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => setRecordingDuration(p => p + 1), 1000);
    } catch (err) {
      console.error(err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };`
    );
  }

  // Safely replace the main chat input
  const mainInputRegex = /<input\s*type="text"\s*value=\{inputText\}\s*onChange=\{\(e\) => setInputText\(e\.target\.value\)\}\s*onKeyDown=\{\(e\) => e\.key === 'Enter' && handleSendAction\(\)\}\s*placeholder="Type a message\.\.\."\s*className="flex-1 bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none"\s*\/>/;
  
  code = code.replace(
    mainInputRegex,
    `{isRecording ? (
            <div className="flex-1 flex items-center justify-between bg-red-50 rounded-xl px-4 py-2 border border-red-100">
              <div className="flex items-center gap-2 text-red-500 animate-pulse">
                <Mic className="w-4 h-4" />
                <span className="text-sm font-bold">{Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}</span>
              </div>
              <button onClick={stopRecording} className="text-red-600 font-bold text-xs bg-red-100 px-3 py-1 rounded-lg hover:bg-red-200 transition">Stop & Attach</button>
            </div>
          ) : (
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendAction()}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none"
            />
          )}`
  );

  // Safely replace the main send button
  const sendButtonRegex = /<button\s*onClick=\{handleSendAction\}\s*disabled=\{\(!inputText\.trim\(\) && stagedFiles\.length === 0\) \|\| uploading\}\s*className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"\s*>\s*<Send className="w-5 h-5 ml-0\.5" \/>\s*<\/button>/;

  code = code.replace(
    sendButtonRegex,
    `{(inputText.trim().length > 0 || stagedFiles.length > 0) ? (
            <button
              onClick={handleSendAction}
              disabled={uploading}
              className="p-3 bg-[#00a884] text-white rounded-full hover:bg-emerald-700 transition shrink-0 shadow-sm"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          ) : (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={uploading}
              className={\`p-3 text-white rounded-full transition shrink-0 shadow-sm \${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-[#00a884] hover:bg-emerald-700'}\`}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}`
  );

  // 7. Viewer reaction list tap to remove
  code = code.replace(
    /\{Object\.entries\(viewReactionsForMsg\.reactions \|\| \{\}\)\.map\(\(\[reactor, emoji\]\) => \([\s\S]*?<div key=\{reactor\} className="flex items-center justify-between border-b border-slate-50 pb-2">\s*<span className="font-medium text-slate-700 text-sm">\s*\{reactor === 'admin' \? 'Admin' : \`Flat \$\{reactor\}\`\}\s*<\/span>\s*<span className="text-2xl">\{emoji\}<\/span>\s*<\/div>\s*\)\)\}/,
    `{Object.entries(viewReactionsForMsg.reactions || {}).sort((a,b)=>a[0]===flatId?-1:(b[0]===flatId?1:0)).map(([reactor, emoji]) => (
                <div 
                  key={reactor} 
                  className={\`flex items-center justify-between border-b border-slate-50 pb-2 \${reactor === flatId ? 'cursor-pointer hover:bg-slate-100 rounded px-2 -mx-2' : 'px-2'}\`}
                  onClick={() => {
                    if (reactor === flatId) {
                      handleReact(viewReactionsForMsg.id, null);
                      setViewReactionsForMsg(prev => prev ? {...prev, reactions: Object.fromEntries(Object.entries(prev.reactions || {}).filter(([k]) => k !== flatId))} : null);
                    }
                  }}
                >
                  <span className={\`text-sm \${reactor === flatId ? 'font-bold text-[#00a884]' : 'font-medium text-slate-700'}\`}>
                    {reactor === flatId ? 'You (Tap to remove)' : (reactor === 'admin' ? 'Admin' : \`Flat \${reactor}\`)}
                  </span>
                  <span className="text-2xl">{emoji}</span>
                </div>
              ))}`
  );

  fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
}

patchChatSection();
console.log("Patched Resident Chat");
