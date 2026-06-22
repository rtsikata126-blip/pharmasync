/**
 * API entry point for Vercel serverless. All requests arriving at /api
 * (via the vercel.json catch-all route) land here.
 *
 * Routing:
 *   /api/patients*  → handled by the patients handler (file-based JSON)
 *   /api/push*      → handled by the push notifications handler
 *   everything else  → forwarded to the TanStack Start SSR server
 */

let patientsHandler;
let pushHandler;
let ssrHandler;

async function getPatientsHandler() {
  if (!patientsHandler) {
    const mod = await import("./patients.js");
    patientsHandler = mod.default;
  }
  return patientsHandler;
}

async function getPushHandler() {
  if (!pushHandler) {
    const mod = await import("./push.js");
    pushHandler = mod.default;
  }
  return pushHandler;
}

async function getSsrHandler() {
  if (!ssrHandler) {
    try {
      const serverModule = await import("../dist/server/server.js");
      ssrHandler = serverModule.default;
    } catch (err) {
      console.error("[API] Failed to import SSR server:", err);
      throw err;
    }
  }
  return ssrHandler;
}

/** Read the raw body from an IncomingMessage */
function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.method === "GET" || req.method === "HEAD") return resolve(null);
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(chunks.length > 0 ? Buffer.concat(chunks) : null));
    req.on("error", reject);
  });
}

export default async (req, res) => {
  const urlPath = req.url || "/";

  // ── Patients API ──────────────────────────────────────────────
  if (urlPath.startsWith("/api/patients")) {
    try {
      const handler = await getPatientsHandler();
      await handler(req, res);
    } catch (error) {
      console.error("[API] Patients handler error:", error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: error.message }));
      }
    }
    return;
  }

  // ── Push Notifications API ────────────────────────────────────
  if (urlPath.startsWith("/api/push")) {
    try {
      const handler = await getPushHandler();
      await handler(req, res);
    } catch (error) {
      console.error("[API] Push handler error:", error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: error.message }));
      }
    }
    return;
  }

  // ── SSR — forward to the TanStack Start server ────────────────
  try {
    const handler = await getSsrHandler();

    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = `${protocol}://${host}${urlPath}`;

    const init = {
      method: req.method,
      headers: Object.fromEntries(
        Object.entries(req.headers).filter(
          ([key]) => !["content-length", "host"].includes(key.toLowerCase()),
        ),
      ),
    };

    const body = await readBody(req);
    if (body) init.body = body;

    const request = new Request(url, init);
    const response = await handler.fetch(request, {}, {});

    response.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });

    res.status(response.status);
    res.send(await response.text());
  } catch (error) {
    console.error("[API] SSR handler error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

