import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let { projectId, accessToken, payload } = req.body;
    projectId = projectId || 'orchidheights-d46f2';

    if (!payload) {
      return res.status(400).json({ error: 'Missing required payload field' });
    }

    if (!accessToken) {
      try {
        let auth = null;
        if (fs.existsSync('./service-account.json')) {
          const sa = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));
          auth = new GoogleAuth({
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
          auth = new GoogleAuth({
            credentials: {
              client_email: sa.client_email,
              private_key: sa.private_key,
            },
            scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
          });
        }

        if (auth) {
          const client = await auth.getClient();
          const tokenRes = await client.getAccessToken();
          accessToken = tokenRes.token;
        }
      } catch (authErr) {
        console.warn('GoogleAuth token minting error:', authErr);
      }
    }

    if (!accessToken) {
      return res.status(500).json({
        error: 'Failed to obtain Google OAuth access token for FCM. Ensure service-account.json is present in the project root or FIREBASE_SERVICE_ACCOUNT environment variable is set.'
      });
    }

    let fcmPayload = payload;
    if (!fcmPayload.message) {
      fcmPayload = { message: payload };
    }

    // --- 1. CONVERT TO DATA-ONLY MESSAGE TO BYPASS DOZE MODE ---
    if (fcmPayload.message.notification) {
      fcmPayload.message.data = fcmPayload.message.data || {};
      fcmPayload.message.data.title = fcmPayload.message.data.title || fcmPayload.message.notification.title;
      fcmPayload.message.data.body = fcmPayload.message.data.body || fcmPayload.message.notification.body;
      fcmPayload.message.data.icon = fcmPayload.message.data.icon || fcmPayload.message.notification.icon || 'https://i.ibb.co/zT5tpcdY/1000296229-1.png';
      
      // Deleting this forces the Service Worker to wake up and handle it manually
      delete fcmPayload.message.notification;
    }

    // --- 2. SET STRICT WEBPUSH HEADERS FOR BACKGROUND DELIVERY ---
    fcmPayload.message.android = fcmPayload.message.android || { priority: "high" };
    fcmPayload.message.webpush = fcmPayload.message.webpush || { 
      headers: { 
        "urgency": "high",
        "TTL": "86400"
      } 
    };
    fcmPayload.message.apns = fcmPayload.message.apns || { payload: { aps: { 'content-available': 1 } } };

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(fcmPayload)
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('FCM Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
