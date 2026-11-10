import { httpServerHandler } from 'cloudflare:node';
import { Client } from 'pg';
import trackerHtml from './public/tracker.html?raw';
import privacyHtml from './public/privacy.html?raw';
import loginBackgroundDataUrl from './public/images/login-pizza-background.png?inline';
import { cleanupExpiredData, initializeRuntime, server, withDatabaseClient } from './server.mjs';

const loginBackground = Buffer.from(loginBackgroundDataUrl.slice(loginBackgroundDataUrl.indexOf(',') + 1), 'base64');
const port = 8787;
server.listen(port);
const nodeHandler = httpServerHandler({ port });
let initialization;

async function ensureInitialized() {
  if (!initialization) {
    initialization = initializeRuntime({
      assets: { trackerHtml, loginBackground, privacyHtml },
    }).catch((error) => {
      initialization = undefined;
      throw error;
    });
  }
  await initialization;
}

async function withRequestClient(env, callback) {
  const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });
  await client.connect();
  try {
    return await withDatabaseClient(client, async (contextId) => {
      await ensureInitialized();
      return callback(contextId);
    });
  } finally {
    await client.end();
  }
}

export default {
  async fetch(request, env, ctx) {
    return withRequestClient(env, (contextId) => {
      const headers = new Headers(request.headers);
      headers.set('x-worker-db-context', contextId);
      return nodeHandler.fetch(new Request(request, { headers }), env, ctx);
    });
  },
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(withRequestClient(env, () => cleanupExpiredData()));
  },
};
