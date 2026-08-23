import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { createSession, hashPassword, safeEqual, sessionCookie } from '../../auth';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() || '';
    const row = await env.DB.prepare(`SELECT user_id, password_hash, password_salt, status FROM users WHERE email = ?`)
      .bind(email).first<{ user_id: string; password_hash: string | null; password_salt: string | null; status: string }>();
    if (!row?.password_hash || !row.password_salt || !safeEqual(await hashPassword(body.password || '', row.password_salt), row.password_hash)) {
      return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
    }
    if (row.status === 'disabled') return NextResponse.json({ error: 'Your account has been disabled by an administrator.' }, { status: 403 });
    const token = await createSession(row.user_id);
    return NextResponse.json({ ok: true }, { headers: { 'Set-Cookie': sessionCookie(token) } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to sign in.' }, { status: 500 });
  }
}
