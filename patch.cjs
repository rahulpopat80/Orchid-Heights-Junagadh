const fs = require('fs');
let content = fs.readFileSync('src/components/WebcamCapture.tsx', 'utf8');

// Change Visitor Photo to Gujarati
content = content.replace('Visitor Photo <span', 'મુલાકાતી નો ફોટો (Visitor Photo) <span');

// Change mode default
content = content.replace("const [mode, setMode] = useState<'preset' | 'camera' | 'upload'>('preset');", "const [mode, setMode] = useState<'camera' | 'upload'>('upload');");

// Remove preset button
content = content.replace(/<button\s+type="button"\s+onClick=\{\(\) => \{ setMode\('preset'\); stopCamera\(\); \}\}[\s\S]*?Presets\s+<\/button>/, '');

// Remove preset section
content = content.replace(/\{mode === 'preset' && \([\s\S]*?\}\)          \}/, '');

fs.writeFileSync('src/components/WebcamCapture.tsx', content);
