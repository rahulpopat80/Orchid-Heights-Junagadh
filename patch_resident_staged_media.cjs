const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

if (!code.includes('const [stagedFiles, setStagedFiles] = useState<File[]>([])')) {
  code = code.replace(
    'const [uploading, setUploading] = useState(false);',
    'const [uploading, setUploading] = useState(false);\n  const [stagedFiles, setStagedFiles] = useState<File[]>([]);'
  );
}

const targetHandleFileUpload = `  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Max 15MB
    if (file.size > 15 * 1024 * 1024) {
      alert("File is too large! Maximum allowed is 15MB.");
      return;
    }

    const tempId = 'temp_' + Date.now();
    const localUrl = URL.createObjectURL(file);
    
    // Optimistic UI for media
    const tempMsg: ChatMessage = {
      id: tempId,
      senderWing: session.wing,
      senderFlatNo: session.flatNo,
      senderOwnerName: session.ownerName || 'Resident',
      text: '',
      mediaUrl: localUrl,
      mediaType: file.type,
      mediaName: file.name,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    setUploading(true);
    setUploadProgress(0);
    try {
      const metadata = await uploadFileInChunks(file, (prog) => {
        setUploadProgress(prog);
      });
      // Replace the temp message natively when firebase updates
      setMessages(prev => prev.filter(m => m.id !== tempId));
      await handleSendMessage('', metadata);
    } catch (err) {
      console.error(err);
      alert("Failed to upload file.");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };`;

const replaceHandleFileUpload = `  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles = Array.from(e.target.files);
    
    let validFiles = [];
    for (const file of newFiles) {
      if (file.size > 15 * 1024 * 1024) {
        alert(\`File \${file.name} is too large! Maximum allowed is 15MB.\`);
        continue;
      }
      validFiles.push(file);
    }

    if (stagedFiles.length + validFiles.length > 5) {
      alert("You can only attach up to 5 files at a time.");
      validFiles = validFiles.slice(0, 5 - stagedFiles.length);
    }

    setStagedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendAction = async () => {
    if (!inputText.trim() && stagedFiles.length === 0) return;
    
    const textToSend = inputText.trim();
    const filesToSend = [...stagedFiles];
    setInputText('');
    setStagedFiles([]);

    if (filesToSend.length === 0) {
      await handleSendMessage(textToSend);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      for(let i=0; i<filesToSend.length; i++) {
        const file = filesToSend[i];
        
        // Optimistic UI for each file
        const tempId = 'temp_' + Date.now() + '_' + i;
        const localUrl = URL.createObjectURL(file);
        const tempMsg: ChatMessage = {
          id: tempId,
          senderWing: session.wing!,
          senderFlatNo: session.flatNo!,
          senderOwnerName: session.ownerName || 'Resident',
          text: i === 0 ? textToSend : '',
          mediaUrl: localUrl,
          mediaType: file.type,
          mediaName: file.name,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        const meta = await uploadFileInChunks(file, (prog) => {
          setUploadProgress(Math.round(((i * 100) + prog) / filesToSend.length));
        });
        
        setMessages(prev => prev.filter(m => m.id !== tempId));
        await handleSendMessage(i === 0 ? textToSend : '', meta);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload some files.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };`;

if (code.includes(targetHandleFileUpload)) {
  code = code.replace(targetHandleFileUpload, replaceHandleFileUpload);
}

// Update file input to multiple
code = code.replace(
  '<input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />',
  '<input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileUpload} />'
);

// Update input bindings
code = code.replace(
  'onKeyDown={(e) => e.key === \'Enter\' && handleSendMessage(inputText)}',
  'onKeyDown={(e) => e.key === \'Enter\' && handleSendAction()}'
);

code = code.replace(
  'onClick={() => handleSendMessage(inputText)}',
  'onClick={handleSendAction}'
);

// Add staged files UI preview right above the input row
const targetInputArea = `<div className="p-3 bg-white border-t border-slate-200">`;
const replaceInputArea = `<div className="p-3 bg-white border-t border-slate-200">
        {stagedFiles.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto py-2">
            {stagedFiles.map((file, idx) => (
              <div key={idx} className="relative w-16 h-16 shrink-0 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                <button 
                  onClick={() => removeStagedFile(idx)} 
                  className="absolute -top-1 -right-1 bg-slate-800 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition z-10"
                >
                  <X className="w-3 h-3" />
                </button>
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] font-bold text-slate-500 text-center px-1 truncate w-full">{file.name}</span>
                )}
              </div>
            ))}
          </div>
        )}`;

if (code.includes(targetInputArea) && !code.includes('stagedFiles.map(')) {
  code = code.replace(targetInputArea, replaceInputArea);
}

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
console.log("Patched ChatSection staged media");
