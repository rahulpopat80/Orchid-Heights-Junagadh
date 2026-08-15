const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const stateDecls = `  const touchStartX = useRef<number | null>(null);

  // --- Voice Message State ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const startRecording = async (e: React.PointerEvent) => {
    e.preventDefault();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], \`Voice_Message_\${Date.now()}.webm\`, { type: 'audio/webm' });
        setUploading(true);
        try {
          const meta = await uploadFileInChunks(file, (prog) => setUploadProgress(prog));
          await handleSendMessage('', meta);
        } catch (err) {
          console.error(err);
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Microphone permission denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null; // Prevent sending
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };
`;

if (!code.includes("const [isRecording")) {
  code = code.replace(
    /  const touchStartX = useRef<number \| null>\(null\);/,
    stateDecls
  );
}

const inputBoxRegex = /<input\s*type="text"\s*value=\{inputText\}\s*onChange=\{\(e\) => setInputText\(e\.target\.value\)\}\s*onKeyDown=\{\(e\) => \{ if \(e\.key === 'Enter'\) handleSendMessage\(\); \}\}\s*placeholder="Type a message\.\.\."\s*className="flex-1 border-none bg-slate-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"\s*\/>/;

const newInputBox = `{isRecording ? (
            <div className="flex-1 flex items-center justify-between bg-red-50 rounded-full px-4 py-2 border border-red-100 mr-2">
              <div className="flex items-center gap-2 text-red-500 animate-pulse">
                <Mic className="w-5 h-5" />
                <span className="font-bold text-sm">
                  {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <button onClick={cancelRecording} className="text-slate-500 hover:text-red-600 font-bold text-xs uppercase tracking-wider">Cancel</button>
            </div>
          ) : (
            <input 
              type="text" 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              placeholder="Type a message..."
              className="flex-1 border-none bg-slate-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 mr-2"
            />
          )}`;

if (inputBoxRegex.test(code)) {
  code = code.replace(inputBoxRegex, newInputBox);
}

const oldSendButton = `<button
            onClick={() => handleSendMessage()}
            className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition shrink-0"
            disabled={uploading}
          >
            <Send className="w-5 h-5 ml-1" />
          </button>`;

const newSendButton = `{inputText.trim() || stagedFiles.length > 0 ? (
            <button
              onClick={() => handleSendMessage()}
              className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition shrink-0 shadow-sm"
              disabled={uploading}
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              onPointerDown={startRecording}
              onPointerUp={stopRecording}
              onPointerLeave={cancelRecording}
              className={\`p-3 text-white rounded-full transition shrink-0 shadow-sm \${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-emerald-600 hover:bg-emerald-700'}\`}
              disabled={uploading}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}`;

if (code.includes(oldSendButton)) {
  code = code.replace(oldSendButton, newSendButton);
}

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
console.log("Voice feature added to ChatSection");
