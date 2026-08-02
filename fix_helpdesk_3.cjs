const fs = require('fs');
let content = fs.readFileSync('src/components/resident/HelpDeskSection.tsx', 'utf8');

const filterEmptyState = `complaints.filter(c => c.flatId === \`\${wing}-\${flatNo}\`).length === 0`;
const newFilterEmptyState = `complaints.filter(c => c.flatId === \`\${wing}-\${flatNo}\` && c.status?.toLowerCase() !== 'resolved' && c.status?.toLowerCase() !== 'processed').length === 0`;
content = content.replace(filterEmptyState, newFilterEmptyState);

fs.writeFileSync('src/components/resident/HelpDeskSection.tsx', content);
