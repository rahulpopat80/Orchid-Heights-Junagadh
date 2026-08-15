const fs = require('fs');

function fixMenu(filePath, isAdmin) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace activeMessageId block
  const oldActiveBlock = `          {activeMessageId === msg.id && (
             <>
               <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setActiveMessageId(null); }}></div>
               {/* Reaction Menu */}
        <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setActiveMessageId(null); }} />
        <div 
          className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] overflow-hidden flex flex-col max-w-[90vw] animate-in zoom-in-95 duration-100"
          style={{ 
             top: menuPosition ? (menuPosition.y > window.innerHeight - 250 ? menuPosition.y - 140 : menuPosition.y + 20) : '50%',
             ...(isMe ? { right: '16px' } : { left: '16px' })
          }}
          onClick={e => e.stopPropagation()}
        >`;

  const newActiveBlock = `          {activeMessageId === msg.id && (
             <>
               <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setActiveMessageId(null); }}></div>
               {/* Reaction Menu */}
        <div 
          className={\`relative z-[100] mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col min-w-[240px] max-w-[90vw] animate-in slide-in-from-top-2 duration-100 \${isMe ? 'self-end' : 'self-start'}\`}
          onClick={e => e.stopPropagation()}
        >`;

  code = code.replace(oldActiveBlock, newActiveBlock);

  // Note: We'll have to adapt admin version specifically due to its different structure.
  
  fs.writeFileSync(filePath, code);
}
fixMenu('src/components/resident/ChatSection.tsx', false);
