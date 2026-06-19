#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run the Vite build
execSync('vite build', { stdio: 'inherit' });

// Create a minimal index.html in dist/client
const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PharmaSync — Smart Medication Adherence</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"><\/script>
  </body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'dist/client/index.html'), indexHtml);
console.log('✓ Generated dist/client/index.html');
