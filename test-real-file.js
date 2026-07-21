import fs from 'fs';
import { webcrypto } from 'crypto';
const crypto = (globalThis.crypto || webcrypto);

const fileContent = fs.readFileSync('./src/lib/server-notifications.ts', 'utf-8');
const match = fileContent.match(/const keyBase64 = "([^"]+)";/);
if (!match) {
  console.error('keyBase64 not found in file!');
  process.exit(1);
}

const keyBase64 = match[1];
const decoded = Buffer.from(keyBase64, 'base64').toString('utf-8');
const replaced = decoded.replace(/\\n/g, '\n');

const pemHeader = "-----BEGIN PRIVATE KEY-----";
const pemFooter = "-----END PRIVATE KEY-----";
let pemContents = replaced.trim();
if (pemContents.startsWith(pemHeader)) {
  pemContents = pemContents.substring(pemHeader.length);
}
if (pemContents.endsWith(pemFooter)) {
  pemContents = pemContents.substring(0, pemContents.length - pemFooter.length);
}
pemContents = pemContents.replace(/\s/g, "");

// Robust base64ToArrayBuffer
function base64ToArrayBuffer(b64) {
  const buf = Buffer.from(b64, 'base64');
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  view.set(buf);
  return ab;
}

async function test() {
  try {
    const derBuffer = base64ToArrayBuffer(pemContents);
    console.log('derBuffer length:', derBuffer.byteLength);

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      derBuffer,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: { name: "SHA-256" }
      },
      false,
      ["sign"]
    );
    console.log('Successfully imported cryptoKey with robust converter!', cryptoKey);
  } catch (err) {
    console.error('Error importing key:', err);
  }
}

test();
