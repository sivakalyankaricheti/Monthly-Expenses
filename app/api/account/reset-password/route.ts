import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { hashPassword, randomHex, sha256 } from '../../auth';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json() as { token?: string; password?: string };
    if (!token || !password || password.length < 8 || password.length > 128) return NextResponse.json({ error: 'Enter a password of 8–128 characters.' }, { status: 400 });
    const row = await env.DB.prepare('SELECT user_id FROM password_reset_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?')
      .bind(await sha256(token), new Date().toISOString()).first<{ user_id: string }>();
    if (!row) return NextResponse.json({ error: 'This reset link is invalid or expired.' }, { status: 400 });
    const salt = randomHex(16), passwordHash = await hashPassword(password, salt), now = new Date().toISOString();
    await env.DB.batch([env.DB.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE user_id = ?').bind(passwordHash, salt, row.user_id), env.DB.prepare('UPDATE password_reset_tokens SET used_at = ? WHERE token_hash = ?').bind(now, await sha256(token)), env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(row.user_id)]);
    return NextResponse.json({ ok: true });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to reset password.' }, { status: 500 }); }
}
