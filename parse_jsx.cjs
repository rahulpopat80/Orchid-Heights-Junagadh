const fs = require('fs');
const code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

let stack = [];
let i = 0;
while(i < code.length) {
  // Very crude tag matching just for div/span/etc
  if (code.substr(i, 4) === '<div') { stack.push('div'); i += 4; continue; }
  if (code.substr(i, 5) === '</div') { 
    if(stack[stack.length-1] === 'div') stack.pop(); 
    else console.log('Mismatch div at', i, 'expected', stack[stack.length-1]);
    i += 5; continue; 
  }
  i++;
}
console.log('Unclosed tags left in stack:', stack.length);
