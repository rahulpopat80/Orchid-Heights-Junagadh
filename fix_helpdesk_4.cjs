const fs = require('fs');
let content = fs.readFileSync('src/components/resident/HelpDeskSection.tsx', 'utf8');

const filterEmptyState = `complaints.filter(c => c.flatId === \`\${wing}-\${flatNo}\` && c.status?.toLowerCase() !== 'resolved' && c.status?.toLowerCase() !== 'processed').length === 0`;
const newFilterEmptyState = `complaints.filter(c => c.flatId === \`\${wing}-\${flatNo}\` && c.status?.toLowerCase() !== 'resolved').length === 0`;
content = content.replace(filterEmptyState, newFilterEmptyState);

const filterMap = `complaints\n                    .filter((c) => c.flatId === \`\${wing}-\${flatNo}\` && c.status?.toLowerCase() !== 'resolved' && c.status?.toLowerCase() !== 'processed')`;
const newFilterMap = `complaints\n                    .filter((c) => c.flatId === \`\${wing}-\${flatNo}\` && c.status?.toLowerCase() !== 'resolved')`;
content = content.replace(filterMap, newFilterMap);

// In case the map filter was on one line:
const filterMapOneLine = `.filter((c) => c.flatId === \`\${wing}-\${flatNo}\` && c.status?.toLowerCase() !== 'resolved' && c.status?.toLowerCase() !== 'processed')`;
const newFilterMapOneLine = `.filter((c) => c.flatId === \`\${wing}-\${flatNo}\` && c.status?.toLowerCase() !== 'resolved')`;
content = content.replace(filterMapOneLine, newFilterMapOneLine);


fs.writeFileSync('src/components/resident/HelpDeskSection.tsx', content);
