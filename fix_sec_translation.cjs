const fs = require('fs');
let content = fs.readFileSync('src/components/SecurityDashboard.tsx', 'utf8');

// Insert the state and effect right after deviceImei state
const statePattern = /const \[deviceImei, setDeviceImei\] = useState<string>\(''\);/;
const stateReplacement = `const [deviceImei, setDeviceImei] = useState<string>('');
  const [translatedMembersMap, setTranslatedMembersMap] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    import('../lib/transliterate').then(({ transliterateToGujarati }) => {
      const runTranslations = async () => {
        if (!owners || owners.length === 0) return;
        const newMap: Record<string, Record<string, string>> = {};
        for (const owner of owners) {
          const key = \`\${owner.wing}-\${owner.flatNo}\`;
          newMap[key] = {};
          if (owner.members) {
            for (const mStr of owner.members) {
              const match = mStr.match(/^(.*?)(?:\\s*\\((.*?)\\))?$/);
              if (match) {
                const mName = match[1].trim();
                newMap[key][mName] = await transliterateToGujarati(mName);
              }
            }
          }
        }
        setTranslatedMembersMap(newMap);
      };
      runTranslations();
    }).catch(e => console.error("Could not load transliterate", e));
  }, [owners]);`;

content = content.replace(statePattern, stateReplacement);

// Insert the usage inside tempMembers.forEach
const loopPattern = /tempMembers\.forEach\(\(m, idx\) => \{\s*let finalName = m\.name;/;
const loopReplacement = `tempMembers.forEach((m, idx) => {
                          let finalName = m.name;
                          const translations = translatedMembersMap[\`\${owner.wing}-\${owner.flatNo}\`];
                          if (translations && translations[m.name]) {
                             finalName = translations[m.name];
                          }`;

content = content.replace(loopPattern, loopReplacement);

fs.writeFileSync('src/components/SecurityDashboard.tsx', content);
