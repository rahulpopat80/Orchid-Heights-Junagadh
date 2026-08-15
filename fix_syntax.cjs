const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

// Fix handleContextMenu duplicate
code = code.replace(
  `const handleContextMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveMessageId(id);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };
    e.preventDefault();
    setActiveMessageId(id);
  };`,
  `const handleContextMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveMessageId(id);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };`
);

// Fix the trailing div
code = code.replace(
  `      )}
  
    </div>
  );
}`,
  `      )}
    </div>
  );
}`
);

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
