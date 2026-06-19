const webpush = require('web-push');
const fs = require('fs');

const keys = webpush.generateVAPIDKeys();
console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);

try {
  fs.writeFileSync('.env', `VAPID_PUBLIC_KEY=${keys.publicKey}\nVAPID_PRIVATE_KEY=${keys.privateKey}\n`);
  console.log('Wrote .env with VAPID keys');
} catch (e) {
  console.error('Failed to write .env:', e);
}
