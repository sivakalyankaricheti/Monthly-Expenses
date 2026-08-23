import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookie, sha256 } from '../../auth';

export async function POST(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const token = cookie.split(';').map(x => x.trim()).find(x => x.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  return NextResponse.json({ ok: true }, { headers: { 'Set-Cookie': sessionCookie('', 0) } });
}
