import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { requireAdmin } from '../../auth';

function errorResponse(error: unknown) {
  if (error instanceof Response) return error;
  console.error(error);
  return NextResponse.json({ error: 'Admin request failed.' }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const result = await env.DB.prepare(`SELECT user_id, email, display_name, role, status, created_at, last_seen_at
      FROM users ORDER BY created_at DESC`).all();
    return NextResponse.json({ users: result.results });
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin(request);
    const { userId, status, role } = await request.json();
    if (!userId || (status && !['active','disabled'].includes(status)) || (role && !['admin','user'].includes(role))) {
      return NextResponse.json({ error: 'Invalid user update.' }, { status: 400 });
    }
    if (userId === admin.userId && (status === 'disabled' || role === 'user')) {
      return NextResponse.json({ error: 'You cannot remove your own administrator access.' }, { status: 400 });
    }
    if (status) await env.DB.prepare('UPDATE users SET status = ? WHERE user_id = ?').bind(status, userId).run();
    if (role) await env.DB.prepare('UPDATE users SET role = ? WHERE user_id = ?').bind(role, userId).run();
    return NextResponse.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
