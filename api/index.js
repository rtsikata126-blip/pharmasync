import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serverHandler;

async function getServerHandler() {
  if (!serverHandler) {
    const handlerPath = join(__dirname, '../dist/server/server.js');
    const module = await import(handlerPath);
    serverHandler = module.default;
  }
  return serverHandler;
}

export default async (req, res) => {
  try {
    const handler = await getServerHandler();
    
    // Convert Vercel request to Fetch API Request
    const url = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}${req.url}`;
    const fetchRequest = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
    });

    // Call the TanStack Start server handler
    const response = await handler.fetch(fetchRequest, {}, {});

    // Set response status
    res.status(response.status);

    // Set response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Send response body
    const body = await response.text();
    res.end(body);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

