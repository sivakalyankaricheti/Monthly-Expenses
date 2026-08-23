import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { randomHex, sha256 } from '../../auth';

const publicMessage = 'If that email is registered, a password reset link will be sent.';

export async function POST(request: Request) {
  try {
    const { email: input } = await request.json() as { email?: string };
    const email = input?.trim().toLowerCase() || '';
    const user = await env.DB.prepare('SELECT user_id, password_hash FROM users WHERE email = ? AND status = ?')
      .bind(email, 'active').first<{ user_id: string; password_hash: string | null }>();
    if (!user?.password_hash) return NextResponse.json({ message: publicMessage });
    if (!env.RESEND_API_KEY || !env.MAIL_FROM) return NextResponse.json({ error: 'Password reset email is not configured yet.' }, { status: 503 });
    const token = randomHex();
    const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await env.DB.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').bind(user.user_id).run();
    await env.DB.prepare('INSERT INTO password_reset_tokens (token_hash, user_id, expires_at, used_at) VALUES (?, ?, ?, NULL)')
      .bind(await sha256(token), user.user_id, expires).run();
    const resetUrl = `https://pizza-shift-money-tracker.yeruvareddy111202.chatgpt.site/tracker?reset=${token}`;
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: env.MAIL_FROM, to: [email], subject: 'Reset your Pizza Tracker password', html: `<p>Use the link below to reset your password. It expires in 30 minutes.</p><p><a href="${resetUrl}">Reset password</a></p>` }) });
    if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
    return NextResponse.json({ message: publicMessage });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to send the reset email.' }, { status: 500 }); }
}
