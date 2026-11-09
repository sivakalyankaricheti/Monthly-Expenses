import { readFile } from 'node:fs/promises';
import { initializeRuntime, server } from './server.mjs';

const [trackerHtml, loginBackground, privacyHtml] = await Promise.all([
  readFile(new URL('./public/tracker.html', import.meta.url)),
  readFile(new URL('./public/images/login-pizza-background.png', import.meta.url)),
  readFile(new URL('./public/privacy.html', import.meta.url)),
]);

await initializeRuntime({
  databaseUrl: process.env.DATABASE_URL,
  assets: { trackerHtml, loginBackground, privacyHtml },
});

const port = Number(process.env.PORT || 3000);
server.listen(port, '0.0.0.0', () => console.log(`Part Time Earnings listening on ${port}`));
