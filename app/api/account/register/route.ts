import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { createSession, hashPassword, randomHex, sessionCookie } from '../../auth';

const IMPORTED_OWNER_ID = '79d6da7a-764e-4fec-b3ff-0ad303574668';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string; displayName?: string };
    const email = body.email?.trim().toLowerCase() || '';
    const displayName = body.displayName?.trim() || '';
    const password = body.password || '';
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    if (displayName.length < 2 || displayName.length > 80) return NextResponse.json({ error: 'Enter your name (2–80 characters).' }, { status: 400 });
    if (password.length < 8 || password.length > 128) return NextResponse.json({ error: 'Password must be 8–128 characters.' }, { status: 400 });
    const exists = await env.DB.prepare('SELECT 1 FROM users WHERE email = ?').bind(email).first();
    if (exists) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });

    const userId = crypto.randomUUID();
    const salt = randomHex(16);
    const passwordHash = await hashPassword(password, salt);
    const now = new Date().toISOString();
    const role = env.ADMIN_EMAIL?.trim().toLowerCase() === email ? 'admin' : 'user';
    await env.DB.prepare(`INSERT INTO users
      (user_id, email, display_name, role, status, created_at, last_seen_at, password_hash, password_salt)
      VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)`)
      .bind(userId, email, displayName, role, now, now, passwordHash, salt).run();
    if (role === 'admin') {
      await env.DB.prepare(`INSERT OR IGNORE INTO tracker_state (user_id, data, updated_at)
        SELECT ?, data, updated_at FROM tracker_state WHERE user_id = ?`).bind(userId, IMPORTED_OWNER_ID).run();
    }
    const token = await createSession(userId);
    return NextResponse.json({ ok: true }, { status: 201, headers: { 'Set-Cookie': sessionCookie(token) } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to create your account.' }, { status: 500 });
  }
}
