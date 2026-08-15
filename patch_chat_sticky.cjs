const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const targetClass = `className="flex flex-col h-[calc(100dvh-160px)] max-h-[900px] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden relative shadow-sm mt-2"`;
const replacementClass = `className="flex flex-col h-full bg-slate-50 md:rounded-2xl border border-slate-200 overflow-hidden relative shadow-sm md:mt-2"`;

if (code.includes(targetClass)) {
  code = code.replace(targetClass, replacementClass);
  console.log("Patched ChatSection wrapper");
} else {
  console.log("Could not find ChatSection wrapper class");
}
fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
