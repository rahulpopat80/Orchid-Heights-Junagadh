const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminChatSection.tsx', 'utf8');

if (!code.includes('Mic')) {
  code = code.replace('ChevronDown, ', 'ChevronDown, Mic, ');

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

  const mainInputRegex = /<input\s*type="text"\s*value=\{inputText\}\s*onChange=\{\(e\) => setInputText\(e\.target\.value\)\}\s*onKeyDown=\{\(e\) => e\.key === 'Enter' && handleSendAction\(\)\}\s*placeholder="Type a message to resident\.\.\."\s*className="flex-1 bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none"\s*\/>/;
  
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
              placeholder="Type a message to resident..."
              className="flex-1 bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none"
            />
          )}`
  );

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
  
  fs.writeFileSync('src/components/admin/AdminChatSection.tsx', code);
  console.log("Patched Admin Mic");
} else {
  console.log("Already has Mic");
}
