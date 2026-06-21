import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "http";

/**
 * Vite plugin that handles /api/* routes in the dev environment.
 * Vercel serverless functions (api/*.js) don't execute under Vite dev,
 * so this middleware intercepts API calls and routes them to the handler.
 */
function apiPlugin(): Plugin {
  return {
    name: "pharmasync-api-handler",
    configureServer(server: ViteDevServer) {
      return () => {
        server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
          if (!req.url?.startsWith("/api/")) return next();

          try {
            // Dynamically import the patients API handler
            const mod = await import("./api/patients.js");
            await mod.default(req, res);
          } catch (e) {
            console.error("[API] Error handling request:", e);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: String(e) }));
            }
          }
        });
      };
    },
  };
}

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  plugins: [apiPlugin()],
});
