import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';

const createTableSql = `CREATE TABLE IF NOT EXISTS tracker_state (
  id INTEGER PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

async function ensureDatabase() {
  await env.DB.prepare(createTableSql).run();
}

export async function GET() {
  await ensureDatabase();
  const row = await env.DB.prepare('SELECT data, updated_at FROM tracker_state WHERE id = ?')
    .bind(1)
    .first<{ data: string; updated_at: string }>();

  return NextResponse.json({ data: row ? JSON.parse(row.data) : null, updatedAt: row?.updated_at ?? null });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body || !Array.isArray(body.shifts) || !Array.isArray(body.expenses) || !Array.isArray(body.payments)) {
    return NextResponse.json({ error: 'Invalid tracker data.' }, { status: 400 });
  }

  const serialized = JSON.stringify(body);
  if (serialized.length > 2_000_000) {
    return NextResponse.json({ error: 'Tracker data is too large.' }, { status: 413 });
  }

  await ensureDatabase();
  const updatedAt = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO tracker_state (id, data, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`)
    .bind(1, serialized, updatedAt)
    .run();

  return NextResponse.json({ ok: true, updatedAt });
}
