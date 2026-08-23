import { env } from 'cloudflare:workers';

export type AppUser = {
  userId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  status: 'active' | 'disabled';
};

function decodeDisplayName(request: Request) {
  const encoded = request.headers.get('oai-authenticated-user-full-name');
  if (!encoded || request.headers.get('oai-authenticated-user-full-name-encoding') !== 'percent-encoded-utf-8') return '';
  try { return decodeURIComponent(encoded); } catch { return ''; }
}

export async function requireAppUser(request: Request): Promise<AppUser> {
  const userId = request.headers.get('oai-authenticated-user-id');
  const email = request.headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
  if (!userId || !email) throw new Response(JSON.stringify({ error: 'Sign in required.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const displayName = decodeDisplayName(request);
  const configuredAdmin = env.ADMIN_EMAIL?.trim().toLowerCase();
  const role: 'admin' | 'user' = configuredAdmin === email || (!configuredAdmin && email.endsWith('@sites.test')) ? 'admin' : 'user';
  const now = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO users (user_id, email, display_name, role, status, created_at, last_seen_at)
    VALUES (?, ?, ?, ?, 'active', ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name,
      role = CASE WHEN excluded.role = 'admin' THEN 'admin' ELSE users.role END, last_seen_at = excluded.last_seen_at`)
    .bind(userId, email, displayName || null, role, now, now).run();

  const stored = await env.DB.prepare('SELECT role, status FROM users WHERE user_id = ?')
    .bind(userId).first<{ role: 'admin' | 'user'; status: 'active' | 'disabled' }>();
  if (!stored || stored.status === 'disabled') throw new Response(JSON.stringify({ error: 'Your account has been disabled by an administrator.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  return { userId, email, displayName, role: stored.role, status: stored.status };
}

export async function requireAdmin(request: Request) {
  const user = await requireAppUser(request);
  if (user.role !== 'admin') throw new Response(JSON.stringify({ error: 'Administrator access required.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  return user;
}
