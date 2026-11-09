import { httpServerHandler } from 'cloudflare:node';
import trackerHtml from './public/tracker.html?raw';
import privacyHtml from './public/privacy.html?raw';
import loginBackgroundDataUrl from './public/images/login-pizza-background.png?inline';
import { cleanupExpiredData, initializeRuntime, server } from './server.mjs';

const loginBackground = Buffer.from(loginBackgroundDataUrl.slice(loginBackgroundDataUrl.indexOf(',') + 1), 'base64');
const port = 8787;
server.listen(port);
const handleNodeRequest = httpServerHandler({ port });
let initialization;

async function ensureInitialized(env) {
  if (!initialization) {
    initialization = initializeRuntime({
      databaseUrl: env.DATABASE_URL,
      assets: { trackerHtml, loginBackground, privacyHtml },
    }).catch((error) => {
      initialization = undefined;
      throw error;
    });
  }
  await initialization;
}

export default {
  async fetch(request, env) {
    await ensureInitialized(env);
    return handleNodeRequest(request);
  },
  async scheduled(_controller, env, ctx) {
    await ensureInitialized(env);
    ctx.waitUntil(cleanupExpiredData());
  },
};
