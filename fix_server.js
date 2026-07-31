const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /async function getFcmAccessToken.*?return null;\n\s*\}/s;
const newCode = `
let cachedGoogleAuth: GoogleAuth | null = null;
async function getFcmAccessToken(clientEmail?: string, privateKey?: string): Promise<string | null> {
  try {
    if (!cachedGoogleAuth) {
      if (fs.existsSync('./service-account.json')) {
        const sa = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));
        cachedGoogleAuth = new GoogleAuth({
          credentials: {
            client_email: sa.client_email,
            private_key: sa.private_key,
          },
          scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });
      } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const sa = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
          ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
          : process.env.FIREBASE_SERVICE_ACCOUNT;
        cachedGoogleAuth = new GoogleAuth({
          credentials: {
            client_email: sa.client_email,
            private_key: sa.private_key,
          },
          scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });
      } else if (clientEmail && privateKey) {
        cachedGoogleAuth = new GoogleAuth({
          credentials: {
            client_email: clientEmail,
            private_key: privateKey,
          },
          scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });
      }
    }
    
    if (cachedGoogleAuth) {
      const client = await cachedGoogleAuth.getClient();
      const tokenRes = await client.getAccessToken();
      return tokenRes.token || null;
    }
  } catch (err: any) {
    console.error('[FCM OAuth] Failed to generate access token:', err?.message || err);
  }
  return null;
}
`;
code = code.replace(regex, newCode.trim());
fs.writeFileSync('server.ts', code);
