const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const target = `          <div className={\`absolute bottom-1 right-2 text-[9px] \${isMe ? 'text-green-800' : 'text-slate-400'}\`}>
            {timeStr}
          </div>
        </div>
      </div>
    );`;

const replace = `          <div className={\`absolute bottom-1 right-2 text-[9px] \${isMe ? 'text-green-800' : 'text-slate-400'}\`}>
            {timeStr}
          </div>
        </div>
        </div>
      </div>
    );`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
  console.log("Patched bottom divs");
} else {
  console.log("Not found bottom target");
}
