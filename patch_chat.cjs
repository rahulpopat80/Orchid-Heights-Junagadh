const fs = require('fs');

function patch(filePath, isResident) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // 1. Context Menu Long Press Fix
  // Right now: longPressTimer.current = setTimeout(...), but no clear on touchMove?
  // Actually, we can just replace handlePointerDown and touchMove logic or simpler:
  // Add user-select: none to messages so text doesn't select on long press.
  code = code.replace(/className="whitespace-pre-wrap text-sm pr-10 select-none"/g, 'className="whitespace-pre-wrap text-sm pr-10"');
  code = code.replace(/<p className="whitespace-pre-wrap text-sm pr-10">/g, '<p className="whitespace-pre-wrap text-sm pr-10 select-none">');

  code = code.replace(
    /onTouchMove=\{\(e\) => \{/,
    `onTouchMove={(e) => {
             if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }`
  );

  // 2. Menu positioning constraint logic
  code = code.replace(
    /top: menuPosition \? \(menuPosition\.y > window\.innerHeight - 250 \? menuPosition\.y - 140 : menuPosition\.y \+ 20\) : '50%',/g,
    `top: menuPosition ? (menuPosition.y > window.innerHeight - 250 ? menuPosition.y - 140 : menuPosition.y + 20) : '50%',`
  );
  
  if (isResident) {
    code = code.replace(
      /left: menuPosition \? \(isMe \? Math\.max\(10, menuPosition\.x - 240\) : Math\.min\(menuPosition\.x, window\.innerWidth - 250\)\) : '50%'/g,
      `left: menuPosition ? Math.max(10, Math.min(menuPosition.x - 120, window.innerWidth - 260)) : '50%'`
    );
  } else {
    code = code.replace(
      /top: window\.adminMenuPosition \? \(window\.adminMenuPosition\.y > window\.innerHeight - 250 \? window\.adminMenuPosition\.y - 140 : window\.adminMenuPosition\.y \+ 20\) : '50%',/g,
      `top: window.adminMenuPosition ? (window.adminMenuPosition.y > window.innerHeight - 250 ? window.adminMenuPosition.y - 140 : window.adminMenuPosition.y + 20) : '50%',`
    );
    code = code.replace(
      /left: window\.adminMenuPosition \? \(isMe \? Math\.max\(10, window\.adminMenuPosition\.x - 240\) : Math\.min\(window\.adminMenuPosition\.x, window\.innerWidth - 250\)\) : '50%'/g,
      `left: window.adminMenuPosition ? Math.max(10, Math.min(window.adminMenuPosition.x - 120, window.innerWidth - 260)) : '50%'`
    );
  }

  // 3. Pass isMe to ChunkedMedia
  code = code.replace(
    /<ChunkedMedia fileId=\{msg\.mediaUrl\} type=\{msg\.mediaType \|\| ''\} fallbackName=\{msg\.mediaName \|\| 'Attachment'\} \/>/g,
    `<ChunkedMedia fileId={msg.mediaUrl} type={msg.mediaType || ''} fallbackName={msg.mediaName || 'Attachment'} isMe={isMe} />`
  );
  code = code.replace(
    /<ChunkedMedia\s*fileId=\{previewMediaMsg\.mediaUrl!\}\s*type=\{previewMediaMsg\.mediaType!\}\s*fallbackName=\{previewMediaMsg\.mediaName!\}\s*variant="raw"\s*className="max-w-full max-h-\[85vh\] object-contain rounded-lg"\s*\/>/g,
    `<ChunkedMedia 
              fileId={previewMediaMsg.mediaUrl!} 
              type={previewMediaMsg.mediaType!} 
              fallbackName={previewMediaMsg.mediaName!}
              variant="raw"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              isMe={false}
            />`
  );
  
  fs.writeFileSync(filePath, code);
}

patch('src/components/resident/ChatSection.tsx', true);
patch('src/components/admin/AdminChatSection.tsx', false);
console.log("Patched ChatSections");
