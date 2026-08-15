const fs = require('fs');
let code = fs.readFileSync('src/components/resident/ChatSection.tsx', 'utf8');

const importsMatch = code.match(/import \{([^}]+)\} from '\.\.\/\.\.\/types';/);
if (importsMatch && !importsMatch[1].includes('FlatOwner')) {
  code = code.replace(importsMatch[1], importsMatch[1] + ', FlatOwner');
}

const stateToAdd = `
  const [owners, setOwners] = useState<FlatOwner[]>([]);
`;

const newEffect = `
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const ownerList = await api.getOwners();
        setOwners(ownerList);
      } catch (e) {
        console.error("Failed to fetch owners", e);
      }
    };
    fetchOwners();
  }, []);
`;

code = code.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n' + stateToAdd);
code = code.replace('const flatId = `${session.wing}-${session.flatNo}`;', 'const flatId = `${session.wing}-${session.flatNo}`;\n' + newEffect);

const renderMessageOrig = `  const renderMessage = (msg: ChatMessage) => {
    const isMe = msg.senderWing === session.wing && msg.senderFlatNo === session.flatNo;
    const senderTitle = isMe ? 'You' : \`\${msg.senderOwnerName} (\${msg.senderWing}-\${msg.senderFlatNo})\`;`;

const renderMessageNew = `  const renderMessage = (msg: ChatMessage) => {
    const isMe = msg.senderWing === session.wing && msg.senderFlatNo === session.flatNo && msg.senderOwnerName === (session.ownerName || 'Resident');
    
    let senderTitle = 'Resident';
    const flatOwnerInfo = owners.find(o => o.wing === msg.senderWing && o.flatNo === msg.senderFlatNo);
    
    if (flatOwnerInfo) {
      if (flatOwnerInfo.nameEn === msg.senderOwnerName) {
        // It's the owner
        senderTitle = \`\${msg.senderOwnerName}, (\${msg.senderWing}-\${msg.senderFlatNo})\`;
      } else {
        // It's a member
        senderTitle = \`\${msg.senderOwnerName}, (\${flatOwnerInfo.nameEn}), \${msg.senderWing}-\${msg.senderFlatNo}\`;
      }
    } else {
      senderTitle = \`\${msg.senderOwnerName}, (\${msg.senderWing}-\${msg.senderFlatNo})\`;
    }

    if (isMe) senderTitle = 'You';
`;

code = code.replace(renderMessageOrig, renderMessageNew);

fs.writeFileSync('src/components/resident/ChatSection.tsx', code);
