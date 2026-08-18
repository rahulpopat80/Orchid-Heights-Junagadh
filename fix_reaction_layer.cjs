const fs = require('fs');

const path = 'src/components/resident/ChatSection.tsx';
let code = fs.readFileSync(path, 'utf8');

// The goal is to move the activeMessageId block OUTSIDE the bubble container.
// It is currently inside this div:
// <div 
//    onTouchStart={(e) => { ... }}
//    ...
//    className={`relative p-2.5 pb-5 rounded-2xl max-w-[85%] sm:max-w-[70%] shadow-sm border ${...}`}>
//    <div className="text-[11px] font-bold mb-1 select-none"...>
//    ...
//    {activeMessageId === msg.id && ( ... )}
// </div>
//
// We want to move `{activeMessageId === msg.id && ( ... )}` to right after that `</div>`,
// so it is a direct child of the `<div key={msg.id} ... className="flex flex-col mb-2 ...">`

const blockStartString = "          {activeMessageId === msg.id && (";
const blockStartIndex = code.indexOf(blockStartString);
if (blockStartIndex !== -1) {
  // Find where the block ends. We look for the closing tag `</>` of the fragment, followed by `)}`
  // Actually, the fragment is:
  //             <>
  //               <div className="fixed ...></div>
  //               <div className="Reaction Menu...">...</div>
  //             </>
  //           )}
  const endMarker = "             </>\n          )}";
  const blockEndIndex = code.indexOf(endMarker, blockStartIndex);
  if (blockEndIndex !== -1) {
    const fullBlockLength = (blockEndIndex + endMarker.length) - blockStartIndex;
    const fullBlock = code.substr(blockStartIndex, fullBlockLength);
    
    // Remove it from its current position
    let newCode = code.slice(0, blockStartIndex) + code.slice(blockStartIndex + fullBlockLength);
    
    // Now we need to insert it right AFTER the closing `</div>` of the message bubble.
    // The message bubble ends with:
    //             </div>
    //           )}
    //         </>
    //       )}
    //     </div>
    //   </div>
    // )
    // Let's do a simple regex replace to insert it right before the closing `</div>` of the outer flex container.
    // Actually, looking at the renderMessage return:
    
    // return (
    //   <div key={msg.id} ...>
    //     <div onTouchStart=... className="relative ...">
    //       ... (lots of stuff) ...
    //     </div>
    //     {/* WE WANT IT HERE */}
    //   </div>
    // )
    
    // Let's find: `className={\`flex flex-col mb-2 \${isMe ? 'items-end' : 'items-start'}\`}>`
    // It's easier to find the end of the `renderMessage` function return statement.
    const renderReturnEnd = "        )}"; // This is where the mapping of renderMessage ends in the render function.
    // Wait, let's just insert it before the last </div> in the return of renderMessage.
    
    // Actually, the structure is:
    //       <div className={`absolute bottom-1 right-2 text-[9px] select-none ${isMe ? 'text-green-800' : 'text-slate-400'}`}>
    //         {timeStr}
    //       </div>
    //       {msg.reactions && Object.keys(msg.reactions).length > 0 && ( ... )}
    //     </div>
    //     <-- WE WANT TO INSERT IT HERE -->
    //   </div>
    // );
    
    const insertPointMarker = "            </div>\n          )}\n        </div>";
    
    const replacement = `            </div>\n          )}\n        </div>\n${fullBlock}`;
    
    newCode = newCode.replace(insertPointMarker, replacement);
    
    fs.writeFileSync(path, newCode);
    console.log("Moved reaction menu outside the bubble.");
  } else {
    console.log("Could not find end of activeMessageId block.");
  }
} else {
  console.log("Could not find activeMessageId block.");
}

