/**
 * Server-Side Notification Service
 * Orchid Heights Apartment Management System
 * 
 * Runs background Firestore snapshot listeners to detect and send FCM push notifications
 * independently of whether any client browser is open.
 */

import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { webcrypto } from 'crypto';
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';

// Use global crypto or fallback to Node's built-in webcrypto
const crypto = (globalThis.crypto || (webcrypto as any)) as Crypto;

// Base64 helper for JWT signing
function base64url(source: ArrayBuffer | string): string {
  let base64 = "";
  if (typeof source === "string") {
    base64 = Buffer.from(source).toString('base64');
  } else {
    base64 = Buffer.from(source).toString('base64');
  }
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const buf = Buffer.from(b64, 'base64');
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  view.set(buf);
  return ab;
}

// Hardcoded service account credentials (decoded on server-side using Buffer)
function getHardcodedServiceAccount(): { client_email: string; private_key: string; project_id: string } {
  try {
    const emailBase64 = "ZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAb3JjaGlkaGVpZ2h0cy1kNDZmMi5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbQ==";
    const keyBase64 = "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXG5NSUlFdkFJQkFEQU5CZ2txaGtpRzl3MEJBUUVGQUFTQ0JLWXdnZ1NpQWdFQUFvSUJBUURBSjJJR0pDRGN5MnVQXG5tRWFNSGt3R2xIRkpKRG5QV1ZMRytPRUhuMDNSSk5JNHFWdnJxdzN6Y2U2RXo0QWZDdFVVc2t5eVJ5bWdVams4XG5pVzNXb3ZaWkFvbnk1ekJvNEJMaUl1VTB5amJUTHB6U2d2ZDFrVmlseEdJODM0U0JZdHppTkVUVU8raDU1ZjJvXG5QKy9BcWVQU0dDdlZIb2ZmMmpIQzJQTjRjNE4zZ3IyRHVEZ2Frd1BURWZiaC84R1JjOUgwOFg4emlhNnR1WkhVXG5VLzNiQ1FBd0pmTW44MXlOQ0dDenZPQ3FWVys2SklrVm4zQVdKRGdWbDBubzhpYXBNZFpGd3NmNUIraVoxSUNnXG5Xc3hiYWROVzNuSHpSbkpTY0haakw1aHZFV3BSU0pLWTRia053Z0lmYWVJSnVkN0NYTFhQWG9ucXQzTXY4Y0lwXG4rdCtFd2ZxaEFnTUJBQUVDZ2Y5ZC9vaTZqNVNhK0ltd3FLbDhzcHNneTJUOEtDVUg5MEVHdHFCMGdzb2xTaTh1XG5LMDBkSGVFR25ha2JDSlE2K0RSeDM2N1RWK1RoOEczMzNYQ0wzMEs1ZGtwS2ZDbkpVZ0ZmRVd6Mks1ZDNjSGlqXG5ETXFpdzdDOFRvNTVyTnpTK1gyMkVmS3dtUHFmWUpCTGhPLzh6c0QwRUR2c2JTWEVONzE4ek9rMDl1OWo3bndVXG5cbmMwZ1J5bVFLRDRUNVpmZGZkaHVhdkJMaWRUa2ZDV3hvNUFidENPb3ZEZ3FaV3hXOUFybUtnZWF0Z0pNdy9GMGpcbjcrQkRnMSt3YTRHSWtLd29pMS90NTRNNVlCdHF6SlpvVWszRjhpNEJLMmw0RTRJL1FPZ2N4c0hIdExHTDBFa3ZcbkEwaTBCSVJoUEY2KzFQN3dsNEVhRGJqbVMveWNpOVhteXZyazA2dGtDZ1lFQTlPLzFWUnU0UlplTWJzVExwYmlNXG50aUxVMytMWkNHMlRjSTBLb3FTcG1WM0EvNXZFMDdHZUxPZkFGNnpESnV2RmFFaFhvNU85WVpiMkxIeXF0cXdlXG5teVVFd2NZdTc3Tm1mMjRuSE5VcmtPNVZVR2ROWVluV0VOcmlVY1Q0ZmtPZGYyWTVEMXIrSnBSWkgwMEFWeHJ4XG5rWFQvZWNSaS9RSUtLSzh4VkpXTHRIVUNnWUVFQXlOVWdGNHlCaHJ2eU9TYlhVNXFEb08rMFIwS1lXaklML243XG56WUp4TWxhdk4wR1crWGpRcllNSW5KRWtyV3Fpa2REWTBRWWMzcUUvRGhmYWU4d2dXN1JLRlZ4dFA4Sko4UG9UXG53TXpSVzdEemd1eWl5VkR3M3hIUzR0Zjc1REtMTEtoYnVjSlBVVTR0NnEvV0Rhb3FRTlBGV1Aya1NEQjJ5OUJoXG42TExOdC8wQ2dZQm95QTVucmtnU1hWYVNQRlh5T3hUWEJlZVRMM1F4Q3M4OEl0b2Q0ZHM3NU1PZDMzRkFMb2ZBXG5KaFFqREtFZmtWVU4yNFRDVVgxK3Robnh4aE14dWtnTmpyU09RTDNyaFErZ0MvdG5kam9BOGpSRkJTd3hRY24xXG53KzExbFpISVVoeWFWNXlwV1AvSVVEU2Z3U29ZR1VxbU15cm5hSUFBUkZNWEdrczhLQTF2MFFLQmdRREF4M3hIXG52cEx5LzJTVEllT1RTZ1hDTFhaUzFRVGh3RFF4Z1hnSkhJYUdPSmwycEJwRkhJakxsYlZsZlJuRThWQmVRaWh0XG45TDB2bzM3QWkzc3BUSmRmRDkveFEwaUhaSHZQdW0zTnE0M253eUxzOFRPTnBZbWh4eDAwclBqWll2OGZmZmlXXG5ob1BXMndIT2ZyMHRYc095ZU5XK0I3TnpyRG5NaVJvQzRlZ0JEUUtCZ1FDRktRQ2Fyanh1NndKbGpuR1FlTjNxXG5jcWE5SStqWlRDWWdKOUlYTWEzbE1SaXJ5RDFGdHEwTmtFZERNRHdTcFZvb2VZUUU1cUxiWHo5Q2FzUVk5T0kvXG5zaFloNVhielo3c2Y5NVNpMHpVbTdaZE5ySlRvcjFTNWZoM1VnWGZMWjE5bHZUbC9PMml2eHh5eVlMYTZROE51XG43bHhFQ3lsTzMrUjZrNXhwRkRZT2R3PT1cbi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0=";
    return {
      client_email: Buffer.from(emailBase64, 'base64').toString('utf-8'),
      private_key: Buffer.from(keyBase64, 'base64').toString('utf-8').replace(/\\n/g, '\n'),
      project_id: 'orchidheights-d46f2'
    };
  } catch (err) {
    console.error('[Hardcoded SA Error] Failed to decode Service Account:', err);
    return { client_email: '', private_key: '', project_id: '' };
  }
}

// Generate Google Access Token using GoogleAuth or Web Crypto fallback
async function getGoogleAccessTokenServer(clientEmail: string, privateKeyPem: string, scope = "https://www.googleapis.com/auth/firebase.messaging"): Promise<string> {
  try {
    let auth: GoogleAuth | null = null;
    if (fs.existsSync('./service-account.json')) {
      const sa = JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));
      auth = new GoogleAuth({
        credentials: { client_email: sa.client_email, private_key: sa.private_key },
        scopes: [scope],
      });
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const sa = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;
      auth = new GoogleAuth({
        credentials: { client_email: sa.client_email, private_key: sa.private_key },
        scopes: [scope],
      });
    } else if (clientEmail && privateKeyPem) {
      auth = new GoogleAuth({
        credentials: { client_email: clientEmail, private_key: privateKeyPem },
        scopes: [scope],
      });
    }

    if (auth) {
      const client = await auth.getClient();
      const tokenRes = await client.getAccessToken();
      if (tokenRes.token) return tokenRes.token;
    }
  } catch (err: any) {
    console.warn('[FCM Auth] GoogleAuth error:', err?.message || err);
  }

  try {
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    let pemContents = privateKeyPem.trim();
    if (pemContents.startsWith(pemHeader)) {
      pemContents = pemContents.substring(pemHeader.length);
    }
    if (pemContents.endsWith(pemFooter)) {
      pemContents = pemContents.substring(0, pemContents.length - pemFooter.length);
    }
    pemContents = pemContents.replace(/\\n/g, "").replace(/\s/g, "").replace(/[^A-Za-z0-9+/=]/g, "");

    if (!pemContents) {
      console.warn('[FCM Auth] Empty private key contents');
      return "";
    }

    const derBuffer = base64ToArrayBuffer(pemContents);

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

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT" };
    const claim = {
      iss: clientEmail,
      scope: scope,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now
    };

    const encodedHeader = base64url(JSON.stringify(header));
    const encodedClaim = base64url(JSON.stringify(claim));
    const tokenInput = `${encodedHeader}.${encodedClaim}`;

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(tokenInput)
    );

    const encodedSignature = base64url(signature);
    const assertion = `${tokenInput}.${encodedSignature}`;

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${assertion}`
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[FCM Auth] Failed to get OAuth token on server: ${errorText}`);
      return "";
    }

    const data = await response.json();
    return data.access_token || "";
  } catch (err: any) {
    console.warn('[FCM Auth] Invalid service account key or OAuth token generation error:', err?.message || err);
    return "";
  }
}

// Retrieve FCM tokens for a specific flat
async function getFCMTokensForFlatServer(wing: string, flatNo: number): Promise<string[]> {
  try {
    const id = `${wing.toUpperCase()}-${flatNo}`;
    const snap = await getDoc(doc(db, 'owners', id));
    if (snap.exists()) {
      const data = snap.data();
      return data.fcmTokens || [];
    }
  } catch (err) {
    console.error(`[Server Notifications] Failed to read tokens for ${wing}-${flatNo}:`, err);
  }
  return [];
}

// Retrieve all FCM tokens across the society
async function getAllFCMTokensServer(): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, 'owners'));
    const allTokens: string[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const tokens: string[] = data.fcmTokens || [];
      tokens.forEach(t => {
        if (t && !allTokens.includes(t)) {
          allTokens.push(t);
        }
      });
    });
    return allTokens;
  } catch (err) {
    console.error('[Server Notifications] Failed to read all tokens:', err);
  }
  return [];
}

// Dispatch FCM Push Notification to target tokens
async function sendFCMPushServer(
  tokens: string[],
  notification: { title: string; body: string; icon?: string; data?: Record<string, string> }
): Promise<void> {
  if (tokens.length === 0) return;

  try {
    const serviceAccount = getHardcodedServiceAccount();
    if (!serviceAccount.client_email || !serviceAccount.private_key) {
      console.warn('[Server Notifications] Credentials missing, skipping push.');
      return;
    }

    const accessToken = await getGoogleAccessTokenServer(
      serviceAccount.client_email,
      serviceAccount.private_key
    );

    if (!accessToken) {
      console.warn('[Server Notifications] Valid OAuth access token unavailable. Skipping push.');
      return;
    }

    for (const token of tokens) {
      try {
        const payload = {
          message: {
            token: token,
            notification: {
              title: String(notification.title),
              body: String(notification.body)
            },
            data: Object.assign(
              {
                title: String(notification.title),
                body: String(notification.body)
              },
              Object.fromEntries(
                Object.entries(notification.data || {}).map(([k, v]) => [k, String(v)])
              )
            ),
            webpush: {
              notification: {
                icon: String(notification.icon || "https://i.ibb.co/zT5tpcdY/1000296229-1.png"),
                badge: "https://i.ibb.co/zT5tpcdY/1000296229-1.png",
                requireInteraction: notification.data?.type === 'visitor' || notification.data?.type === 'visitor_request' || notification.data?.type === 'sos',
                vibrate: [200, 100, 200],
                tag: String(notification.data?.visitorId || notification.data?.type || "orchid_notif"),
                ...( (notification.data?.type === 'visitor' || notification.data?.type === 'visitor_request') ? {
                  actions: [
                    { action: 'approve', title: '✅ Approve Entry' },
                    { action: 'reject', title: '❌ Reject' }
                  ]
                } : {})
              },
              fcm_options: {
                link: "/?activeTab=resident"
              },
              headers: {
                Urgency: "high",
                TTL: "86400"
              }
            }
          }
        };

        const response = await fetch(`https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[Server FCM] Failed to send to token ${token.substring(0, 8)}: ${errText}`);
        } else {
          console.log(`[Server FCM] Successfully delivered push to token ${token.substring(0, 8)}...`);
        }
      } catch (tokenErr) {
        console.error('[Server FCM] Token delivery exception:', tokenErr);
      }
    }
  } catch (err) {
    console.error('[Server FCM] Global sending exception:', err);
  }
}

// Main background notification loop
export function startServerNotificationService() {
  console.log('[Server Notifications] Initializing real-time Firestore background snapshot listeners...');

  // ─── 1. LISTEN TO VISITORS ───────────────────────────────────────────────
  let visitorsInitial = true;
  const visitorCache = new Map<string, string>();

  onSnapshot(collection(db, 'visitors'), (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      const docData = change.doc.data();
      const visitorId = change.doc.id;
      const status = docData.status;

      if (change.type === 'added') {
        visitorCache.set(visitorId, status);

        // Only notify if it's a new pending visitor after service startup
        if (!visitorsInitial && status === 'pending') {
          console.log(`[Server Notifications] NEW VISITOR REQUEST: ${docData.fullName} for ${docData.wing}-${docData.flatNo}`);
          const tokens = await getFCMTokensForFlatServer(docData.wing, Number(docData.flatNo));
          
          sendFCMPushServer(tokens, {
            title: `🚨 Visitor Entry Request: ${docData.fullName}`,
            body: `${docData.guestType} - ${docData.reason}\nMobile: ${docData.mobileNumber}\nFlat ${docData.wing}-${docData.flatNo}`,
            icon: docData.photoUrl || 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
            data: {
              visitorId: String(visitorId),
              type: 'visitor_request',
              wing: String(docData.wing),
              flatNo: String(docData.flatNo),
              fullName: String(docData.fullName),
              guestType: String(docData.guestType),
              mobileNumber: String(docData.mobileNumber),
              reason: String(docData.reason)
            }
          });
        }
      } else if (change.type === 'modified') {
        const cachedStatus = visitorCache.get(visitorId);
        if (cachedStatus !== status) {
          visitorCache.set(visitorId, status);

          if (!visitorsInitial) {
            console.log(`[Server Notifications] VISITOR STATUS CHANGED: ${docData.fullName} -> ${status}`);
            
            // Send push notification about approval/rejection status
            if (status === 'approved' || status === 'rejected' || status === 'Entered') {
              const tokens = await getFCMTokensForFlatServer(docData.wing, Number(docData.flatNo));
              let statusLabel = status.toUpperCase();
              if (status === 'approved') statusLabel = 'APPROVED ✅';
              if (status === 'rejected') statusLabel = 'REJECTED ❌';
              if (status === 'Entered') statusLabel = 'ENTERED THE GATE 🚪';

              sendFCMPushServer(tokens, {
                title: `🚪 Visitor Status: ${docData.fullName}`,
                body: `The visitor request for ${docData.fullName} has been ${statusLabel} by ${docData.respondedBy || 'Resident'}.`,
                icon: docData.photoUrl || 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
                data: {
                  visitorId: String(visitorId),
                  type: 'visitor_status_update',
                  status: String(status),
                  fullName: String(docData.fullName)
                }
              });
            }
          }
        }
      }
    });

    if (visitorsInitial) {
      console.log(`[Server Notifications] Seeded ${snapshot.size} visitors into status cache. Ignored historical alerts.`);
      visitorsInitial = false;
    }
  }, (err) => {
    console.error('[Server Notifications] Visitors listener error:', err);
  });


  // ─── 2. LISTEN TO SOCIETY NOTIFICATIONS ──────────────────────────────────
  let societyInitial = true;
  const societyCache = new Set<string>();

  onSnapshot(collection(db, 'society_notifications'), (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      const docData = change.doc.data();
      const id = change.doc.id;

      if (change.type === 'added') {
        const isAlreadyProcessed = societyCache.has(id);
        societyCache.add(id);

        if (!societyInitial && !isAlreadyProcessed) {
          console.log(`[Server Notifications] NEW SOCIETY NOTIFICATION: "${docData.title}"`);
          
          const wing = docData.wing || '';
          const flatNo = Number(docData.flatNo) || 0;

          // Target specific flat if provided, otherwise broadcast to all owners
          if (wing && flatNo > 0) {
            const tokens = await getFCMTokensForFlatServer(wing, flatNo);
            sendFCMPushServer(tokens, {
              title: docData.title,
              body: docData.message,
              icon: 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
              data: {
                id: String(id),
                type: String(docData.type || 'society')
              }
            });
          } else {
            const tokens = await getAllFCMTokensServer();
            sendFCMPushServer(tokens, {
              title: docData.title,
              body: docData.message,
              icon: 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
              data: {
                id: String(id),
                type: String(docData.type || 'society')
              }
            });
          }
        }
      }
    });

    if (societyInitial) {
      console.log(`[Server Notifications] Seeded ${snapshot.size} society notifications into cache.`);
      societyInitial = false;
    }
  }, (err) => {
    console.error('[Server Notifications] Society notifications listener error:', err);
  });


  // ─── 3. LISTEN TO COMPLAINTS (FOR DIRECT COMPLAINT UPDATES) ──────────────────
  let complaintsInitial = true;
  const complaintCache = new Map<string, string>();

  onSnapshot(collection(db, 'complaints'), (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      const docData = change.doc.data();
      const complaintId = change.doc.id;
      const status = docData.status;

      if (change.type === 'added') {
        complaintCache.set(complaintId, status);
      } else if (change.type === 'modified') {
        const cachedStatus = complaintCache.get(complaintId);
        if (cachedStatus !== status) {
          complaintCache.set(complaintId, status);

          if (!complaintsInitial) {
            console.log(`[Server Notifications] COMPLAINT STATUS UPDATED: "${docData.title}" -> ${status}`);
            
            // Extract wing and flatNo from flatId (e.g., 'B-1104' or 'A-402')
            const flatId = docData.flatId || '';
            const parts = flatId.split('-');
            if (parts.length === 2) {
              const wing = parts[0];
              const flatNo = Number(parts[1]);
              const tokens = await getFCMTokensForFlatServer(wing, flatNo);

              sendFCMPushServer(tokens, {
                title: `📝 Complaint Update: ${status.toUpperCase()}`,
                body: `Your complaint "${docData.title}" is now marked as "${status.toUpperCase()}".\nNotes: ${docData.processNotes || 'No notes added yet.'}`,
                icon: 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
                data: {
                  complaintId: String(complaintId),
                  type: 'complaint_update',
                  status: String(status)
                }
              });
            }
          }
        }
      }
    });

    if (complaintsInitial) {
      console.log(`[Server Notifications] Seeded ${snapshot.size} complaints into cache.`);
      complaintsInitial = false;
    }
  }, (err) => {
    console.error('[Server Notifications] Complaints listener error:', err);
  });


  // ─── 4. LISTEN TO EMERGENCY SOS ALERTS ───────────────────────────────────
  let sosInitial = true;
  const sosCache = new Map<string, string>();

  onSnapshot(collection(db, 'sos_alerts'), (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      const docData = change.doc.data();
      const alertId = change.doc.id;
      const status = docData.status;

      if (change.type === 'added') {
        sosCache.set(alertId, status);

        if (!sosInitial && status === 'active') {
          console.log(`[Server Notifications] 🚨 EMERGENCY SOS BROADCAST: Triggered by ${docData.triggeredBy} of Flat ${docData.flatId}`);
          
          const tokens = await getAllFCMTokensServer();
          sendFCMPushServer(tokens, {
            title: `🚨 EMERGENCY SOS ALERT!`,
            body: `Resident ${docData.triggeredBy} of Flat ${docData.flatId} has triggered a society-wide EMERGENCY SOS! Please check immediately!`,
            icon: 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
            data: {
              alertId: String(alertId),
              type: 'sos',
              flatId: String(docData.flatId),
              triggeredBy: String(docData.triggeredBy)
            }
          });
        }
      } else if (change.type === 'modified') {
        const cachedStatus = sosCache.get(alertId);
        if (cachedStatus !== status) {
          sosCache.set(alertId, status);

          if (!sosInitial && status === 'resolved') {
            console.log(`[Server Notifications] EMERGENCY SOS RESOLVED: Alert ${alertId}`);
            
            const tokens = await getAllFCMTokensServer();
            sendFCMPushServer(tokens, {
              title: `✅ SOS Emergency Resolved`,
              body: `The emergency SOS alert for Flat ${docData.flatId} has been resolved.`,
              icon: 'https://i.ibb.co/zT5tpcdY/1000296229-1.png',
              data: {
                alertId: String(alertId),
                type: 'sos_resolved',
                flatId: String(docData.flatId)
              }
            });
          }
        }
      }
    });

    if (sosInitial) {
      console.log(`[Server Notifications] Seeded ${snapshot.size} active SOS alerts into cache.`);
      sosInitial = false;
    }
  }, (err) => {
    console.error('[Server Notifications] SOS alerts listener error:', err);
  });
}
