#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run the Vite build
execSync('vite build', { stdio: 'inherit' });

// Read the assets directory to find the built files
const assetsDir = path.join(__dirname, 'dist/client/assets');
const files = fs.readdirSync(assetsDir);

// Find the main index JS file and the CSS file
const indexJs = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
const stylesCss = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));

if (!indexJs) {
  console.error('Error: Could not find index-*.js in dist/client/assets');
  process.exit(1);
}

// Create index.html with correct asset references
const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PharmaSync — Smart Medication Adherence</title>
    ${stylesCss ? `<link rel="stylesheet" href="/assets/${stylesCss}">` : ''}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/${indexJs}"><\/script>
  </body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'dist/client/index.html'), indexHtml);
console.log('✓ Generated dist/client/index.html with correct asset references');
