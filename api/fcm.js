import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let { projectId, accessToken, payload } = req.body;
    projectId = projectId || 'orchidheights-d46f2';

    if (!payload) return res.status(400).json({ error: 'Missing payload' });

    if (!accessToken) {
      try {
        let auth = null;
        if (fs.existsSync('./service-account.json')) {
          auth = new GoogleAuth({ credentials: JSON.parse(fs.readFileSync('./service-account.json', 'utf8')), scopes: ['https://www.googleapis.com/auth/firebase.messaging'] });
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          auth = new GoogleAuth({ credentials: typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string' ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : process.env.FIREBASE_SERVICE_ACCOUNT, scopes: ['https://www.googleapis.com/auth/firebase.messaging'] });
        }
        if (auth) accessToken = (await (await auth.getClient()).getAccessToken()).token;
      } catch (e) { console.warn('OAuth minting error', e); }
    }

    if (!accessToken) return res.status(500).json({ error: 'Missing OAuth token' });

    // CRITICAL: Force Data-Only Payload with High Priority WebPush Headers 
    // to break through Android Doze Mode
    const fcmMessage = {
      token: payload.token,
      topic: payload.topic,
      data: {
        title: String(payload.title || payload.notification?.title || "Orchid Heights"),
        body: String(payload.body || payload.notification?.body || "New alert received."),
        type: String(payload.type || payload.data?.type || "system"),
        visitorId: String(payload.visitorId || payload.data?.visitorId || ""),
        icon: String(payload.icon || payload.notification?.icon || "https://i.ibb.co/zT5tpcdY/1000296229-1.png")
      },
      android: { priority: "high" },
      webpush: { 
        headers: { 
          Urgency: "high", 
          TTL: "86400" 
        } 
      }
    };

    if (!fcmMessage.token) delete fcmMessage.token;
    if (!fcmMessage.topic) delete fcmMessage.topic;

    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ message: fcmMessage })
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
