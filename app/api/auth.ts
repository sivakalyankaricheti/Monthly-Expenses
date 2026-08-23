import { env } from 'cloudflare:workers';

export type AppUser = {
  userId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  status: 'active' | 'disabled';
};

export const SESSION_COOKIE = 'pizza_session';
export const SESSION_SECONDS = 60 * 60 * 24 * 30;

const bytesToHex = (bytes: Uint8Array) => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
const hexToBytes = (hex: string) => new Uint8Array(hex.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) ?? []);

export function randomHex(length = 32) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function sha256(value: string) {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))));
}

export async function hashPassword(password: string, saltHex: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: hexToBytes(saltHex), iterations: 210_000 }, key, 256);
  return bytesToHex(new Uint8Array(bits));
}

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export function sessionCookie(token: string, maxAge = SESSION_SECONDS) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export async function createSession(userId: string) {
  const token = randomHex();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_SECONDS * 1000);
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .bind(await sha256(token), userId, now.toISOString(), expires.toISOString()).run();
  return token;
}

function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get('cookie') || '';
  for (const part of cookie.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return '';
}

export async function requireAppUser(request: Request): Promise<AppUser> {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token) throw new Response(JSON.stringify({ error: 'Sign in required.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  const now = new Date().toISOString();
  const stored = await env.DB.prepare(`SELECT u.user_id, u.email, u.display_name, u.role, u.status
    FROM sessions s JOIN users u ON u.user_id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?`).bind(await sha256(token), now)
    .first<{ user_id: string; email: string; display_name: string | null; role: 'admin' | 'user'; status: 'active' | 'disabled' }>();
  if (!stored) throw new Response(JSON.stringify({ error: 'Your session has expired. Please sign in again.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  if (stored.status === 'disabled') throw new Response(JSON.stringify({ error: 'Your account has been disabled by an administrator.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  await env.DB.prepare('UPDATE users SET last_seen_at = ? WHERE user_id = ?').bind(now, stored.user_id).run();
  return { userId: stored.user_id, email: stored.email, displayName: stored.display_name || '', role: stored.role, status: stored.status };
}

export async function requireAdmin(request: Request) {
  const user = await requireAppUser(request);
  if (user.role !== 'admin') throw new Response(JSON.stringify({ error: 'Administrator access required.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  return user;
}
