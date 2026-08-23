import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { requireAppUser } from '../../auth';

export async function POST(request: Request) {
  try {
    const user = await requireAppUser(request);
    if (user.role === 'admin') return NextResponse.json({ error: 'User account required.' }, { status: 403 });
    const { id } = await request.json() as { id?: string };
    const backup = await env.DB.prepare('SELECT data FROM tracker_state_history WHERE id = ? AND user_id = ?').bind(id, user.userId).first<{ data: string }>();
    if (!backup) return NextResponse.json({ error: 'Saved version not found.' }, { status: 404 });
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO tracker_state_history (user_id, data, created_at)
        SELECT user_id, data, ? FROM tracker_state WHERE user_id = ?`).bind(now, user.userId),
      env.DB.prepare('UPDATE tracker_state SET data = ?, updated_at = ? WHERE user_id = ?').bind(backup.data, now, user.userId),
    ]);
    return NextResponse.json({ ok: true, data: JSON.parse(backup.data) });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: 'Unable to restore saved version.' }, { status: 500 });
  }
}
