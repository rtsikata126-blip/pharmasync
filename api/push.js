import webpush from 'web-push';
import { readJSON, writeJSON } from './storage.js';

const SUBS_KEY = 'subscriptions';

async function readSubs() {
  const data = await readJSON(SUBS_KEY);
  return data && typeof data === 'object' ? data : {};
}

async function writeSubs(obj) {
  await writeJSON(SUBS_KEY, obj);
}

// Simple store uses file persistence for demo
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || process.env.VITE_VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails('mailto:admin@pharmasync.local', VAPID_PUBLIC, VAPID_PRIVATE);
}

export default async (req, res) => {
  const url = req.url || '';
  if (req.method === 'GET' && url.startsWith('/api/push/publicKey')) {
    return res.json({ publicKey: VAPID_PUBLIC || null });
  }

  if (req.method === 'POST' && url.startsWith('/api/push/subscribe')) {
    try {
      const body = await getBody(req);
      const { patientId, subscription } = JSON.parse(body.toString());
      if (!patientId || !subscription) return res.status(400).json({ error: 'patientId and subscription required' });
      const obj = await readSubs();
      obj[patientId] = obj[patientId] || [];
      obj[patientId].push(subscription);
      await writeSubs(obj);
      return res.json({ ok: true });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST' && url.startsWith('/api/push/send')) {
    try {
      const body = await getBody(req);
      const { patientId, payload } = JSON.parse(body.toString());
      const obj = await readSubs();
      const list = obj[patientId] || [];
      const results = [];
      for (const s of list) {
        try {
          await webpush.sendNotification(s, JSON.stringify(payload));
          results.push({ ok: true });
        } catch (err) {
          results.push({ ok: false, error: err.message });
        }
      }
      return res.json({ results });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  }

  // trigger endpoint: send payload to specified patientId (convenience)
  if (req.method === 'POST' && url.startsWith('/api/push/trigger')) {
    try {
      const body = await getBody(req);
      const { patientId, payload } = JSON.parse(body.toString());
      if (!patientId || !payload) return res.status(400).json({ error: 'patientId and payload required' });
      const obj = await readSubs();
      const list = obj[patientId] || [];
      const results = [];
      for (const s of list) {
        try { await webpush.sendNotification(s, JSON.stringify(payload)); results.push({ ok: true }); } catch (err) { results.push({ ok: false, error: err.message }); }
      }
      return res.json({ results });
    } catch (e) { console.error(e); return res.status(500).json({ error: e.message }); }
  }

  res.status(404).json({ error: 'Not found' });
};

function getBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
