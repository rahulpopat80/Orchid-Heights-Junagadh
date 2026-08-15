const fs = require('fs');
const code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');
let depth = 0;
for(let i=0; i<code.length; i++) {
  if(code[i]==='{') depth++;
  if(code[i]==='}') depth--;
  if (depth < 0) {
    console.log("Went below 0 at line", code.substring(0, i).split('\n').length);
    console.log("Context:\n" + code.substring(i-100, i+100));
    break;
  }
}
