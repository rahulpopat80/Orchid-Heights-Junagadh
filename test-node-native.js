import fs from 'fs';
import crypto from 'crypto';

const fileContent = fs.readFileSync('./src/lib/server-notifications.ts', 'utf-8');
const match = fileContent.match(/const keyBase64 = "([^"]+)";/);
if (!match) {
  console.error('keyBase64 not found in file!');
  process.exit(1);
}

const keyBase64 = match[1];
const decoded = Buffer.from(keyBase64, 'base64').toString('utf-8');
const replaced = decoded.replace(/\\n/g, '\n');

try {
  const pkey = crypto.createPrivateKey(replaced);
  console.log('Successfully imported with Node native crypto!', pkey);
} catch (err) {
  console.error('Node native crypto failed:', err);
}
