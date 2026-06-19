#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run the Vite build
execSync('vite build', { stdio: 'inherit' });

// Read the assets directory to find CSS and JS files
const assetsDir = path.join(__dirname, 'dist/client/assets');
const files = fs.readdirSync(assetsDir);

const stylesFile = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));
const indexFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));

// Create a minimal fallback index.html with CSS
const fallbackHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PharmaSync — Smart Medication Adherence</title>
    ${stylesFile ? `<link rel="stylesheet" href="/assets/${stylesFile}">` : ''}
  </head>
  <body>
    <div id="root"></div>
    ${indexFile ? `<script type="module" src="/assets/${indexFile}"><\/script>` : ''}
  </body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'dist/client/index.html'), fallbackHtml);
console.log('✓ Generated fallback index.html');
