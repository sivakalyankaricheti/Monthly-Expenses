import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { requireAppUser } from '../auth';

export async function GET(request: Request) {
  try {
    const user = await requireAppUser(request);
    if (user.role === 'admin') return NextResponse.json({ error: 'User account required.' }, { status: 403 });
    const result = await env.DB.prepare(`SELECT id, data, created_at FROM tracker_state_history
      WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`).bind(user.userId).all<{ id: number; data: string; created_at: string }>();
    return NextResponse.json({ backups: result.results.map(row => {
      const data = JSON.parse(row.data);
      return { id: String(row.id), createdAt: row.created_at, shiftCount: data.shifts?.length || 0, paymentCount: data.payments?.length || 0, expenseCount: data.expenses?.length || 0 };
    }) });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ error: 'Unable to load saved versions.' }, { status: 500 });
  }
}
