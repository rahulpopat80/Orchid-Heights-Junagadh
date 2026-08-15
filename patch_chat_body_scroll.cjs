const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

if (!code.includes("document.body.style.overflow = 'hidden';")) {
  const target = `  useEffect(() => {
    const fetchOwners = async () => {`;
    
  const replacement = `  useEffect(() => {
    // Disable body scroll when chat is open to make it sticky
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const fetchOwners = async () => {`;
    
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
  console.log("Added body scroll lock");
}
