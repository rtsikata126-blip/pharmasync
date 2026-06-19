let handler;

async function getHandler() {
  if (!handler) {
    try {
      const serverModule = await import('../dist/server/server.js');
      handler = serverModule.default;
      console.log('Server handler loaded successfully');
    } catch (err) {
      console.error('Failed to import server:', err);
      throw err;
    }
  }
  return handler;
}

export default async (req, res) => {
  try {
    const handler = await getHandler();
    
    // Build the full URL
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = `${protocol}://${host}${req.url}`;

    console.log(`[API] Incoming request: ${req.method} ${url}`);

    // Create a Fetch API Request
    const init = {
      method: req.method,
      headers: Object.fromEntries(
        Object.entries(req.headers).filter(([key]) => 
          !['content-length', 'host'].includes(key.toLowerCase())
        )
      ),
    };

    // Add body for non-GET/HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      if (chunks.length > 0) {
        init.body = Buffer.concat(chunks);
      }
    }

    const request = new Request(url, init);
    const response = await handler.fetch(request, {}, {});

    console.log(`[API] Server returned status: ${response.status}`);

    // Copy response headers
    response.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });

    // Set status
    res.status(response.status);

    // Send body
    const body = await response.text();
    console.log(`[API] Response body length: ${body.length} bytes`);
    
    res.send(body);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

