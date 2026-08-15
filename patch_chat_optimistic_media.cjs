const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const targetUpload = `    setUploading(true);
    setUploadProgress(0);
    try {
      const metadata = await uploadFileInChunks(file, (prog) => {
        setUploadProgress(prog);
      });
      await handleSendMessage('', metadata);
    } catch (err) {
      console.error(err);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }`;

const replaceUpload = `    const tempId = 'temp_' + Date.now();
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
    }`;

if (code.includes(targetUpload)) {
  code = code.replace(targetUpload, replaceUpload);
  console.log("Patched ChatSection optimistic media");
} else {
  console.log("targetUpload not found");
}

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
