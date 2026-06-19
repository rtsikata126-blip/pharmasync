import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
}));

// Register service worker on client and expose a helper to subscribe
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
  // expose helper to app
  (window as any).registerForPush = async (patientId: string) => {
    try {
      const m = await import('./lib/push');
      return m.subscribeToPush(patientId);
    } catch (e) { throw e; }
  };
  // Listen for SW messages (notification actions)
  navigator.serviceWorker.addEventListener('message', (ev) => {
    try {
      const data = ev.data;
      if (data?.type === 'notification-action') {
        // forward to app-level handler
        window.dispatchEvent(new CustomEvent('pharmasync:notification', { detail: data }));
      }
    } catch (e) {}
  });
}
