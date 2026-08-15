const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes('reactions?: Record<string, string>;')) {
  code = code.replace(
    'export interface ChatMessage {',
    'export interface ChatMessage {\n  reactions?: Record<string, string>; // flatId -> emoji'
  );
  fs.writeFileSync('src/types.ts', code);
  console.log('Added reactions to ChatMessage interface');
} else {
  console.log('Already added');
}
