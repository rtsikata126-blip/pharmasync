import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "http";

/**
 * Patch a Node.js http.ServerResponse with Express-like methods
 * so Vercel serverless function handlers (which use Express API)
 * work correctly under Vite dev server middlewares.
 */
function patchExpressResponse(res: ServerResponse): ServerResponse {
  const r = res as ServerResponse & {
    status?: (code: number) => any;
    json?: (obj: any) => void;
    send?: (data: any) => void;
  };

  if (!r.status) {
    r.status = function (code: number) {
      this.statusCode = code;
      return this;
    };
  }
  if (!r.json) {
    r.json = function (obj: any) {
      this.setHeader("Content-Type", "application/json");
      this.end(JSON.stringify(obj));
    };
  }
  if (!r.send) {
    r.send = function (data: any) {
      if (typeof data === "object") {
        this.setHeader("Content-Type", "application/json");
        this.end(JSON.stringify(data));
      } else {
        this.end(data);
      }
    };
  }
  return r as ServerResponse;
}

/**
 * Vite plugin that handles /api/* routes in the dev environment.
 * Vercel serverless functions (api/*.js) don't execute under Vite dev,
 * so this middleware intercepts API calls and routes them to the handler.
 * Must run BEFORE Vite's internal middlewares to intercept API requests
 * before they get served as modules or SPA fallbacks.
 */
function apiPlugin(): Plugin {
  let apiHandler: ((req: IncomingMessage, res: ServerResponse) => Promise<void>) | null = null;

  return {
    name: "pharmasync-api-handler",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        if (!req.url?.startsWith("/api/")) return next();

        try {
          // Lazy-load and cache the handler for performance
          if (!apiHandler) {
            // @ts-expect-error - JS module without TypeScript declarations
            const mod = await import("./api/patients.js");
            apiHandler = mod.default;
          }
          // Patch res with Express-like methods (.status(), .json(), .send())
          const patchedRes = patchExpressResponse(res);
          await (apiHandler as (req: IncomingMessage, res: ServerResponse) => Promise<void>)(req, patchedRes);
        } catch (e) {
          console.error("[API] Error handling request:", e);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: String(e) }));
          }
        }
      });
    },
  };
}

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  plugins: [apiPlugin()],
});
