import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('./data');
const SUB_FILE = path.join(DATA_DIR, 'subscriptions.json');

function ensureDataDir() {
  try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR); } catch (e) {}
  try { if (!fs.existsSync(SUB_FILE)) fs.writeFileSync(SUB_FILE, JSON.stringify({})); } catch (e) {}
}

function readSubs() {
  ensureDataDir();
  try { return JSON.parse(fs.readFileSync(SUB_FILE)); } catch (e) { return {}; }
}

function writeSubs(obj) { ensureDataDir(); fs.writeFileSync(SUB_FILE, JSON.stringify(obj, null, 2)); }

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
      const obj = readSubs();
      obj[patientId] = obj[patientId] || [];
      obj[patientId].push(subscription);
      writeSubs(obj);
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
      const obj = readSubs();
      const list = obj[patientId] || [];
      const results = [];
+      // prepare to log attempts
+      const logsPath = path.join(DATA_DIR, 'logs.json');
+      let logs = [];
+      try { if (fs.existsSync(logsPath)) logs = JSON.parse(fs.readFileSync(logsPath)); } catch (e) { logs = []; }
      for (const s of list) {
        try {
          await webpush.sendNotification(s, JSON.stringify(payload));
          results.push({ ok: true });
+          logs.push({ patientId, timestamp: new Date().toISOString(), status: 'sent', payload });
        } catch (err) {
          results.push({ ok: false, error: err.message });
+          logs.push({ patientId, timestamp: new Date().toISOString(), status: 'error', error: err.message, payload });
        }
      }
+      try { fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2)); } catch (e) { console.error('Failed writing logs', e); }
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
      const obj = readSubs();
      const list = obj[patientId] || [];
      const results = [];
+      const logsPath = path.join(DATA_DIR, 'logs.json');
+      let logs = [];
+      try { if (fs.existsSync(logsPath)) logs = JSON.parse(fs.readFileSync(logsPath)); } catch (e) { logs = []; }
+      for (const s of list) {
+        try { await webpush.sendNotification(s, JSON.stringify(payload)); results.push({ ok: true }); logs.push({ patientId, timestamp: new Date().toISOString(), status: 'sent', payload }); } catch (err) { results.push({ ok: false, error: err.message }); logs.push({ patientId, timestamp: new Date().toISOString(), status: 'error', error: err.message, payload }); }
+      }
+      try { fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2)); } catch (e) { console.error('Failed writing logs', e); }
+      return res.json({ results });
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
