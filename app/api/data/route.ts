import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { requireAppUser } from '../auth';

const seedData = {shifts:[
  {id:'csv-20260807-ajay',date:'2026-08-07',type:'Store',store:'Ajay',start:'',end:'',hours:3,rate:10,deliveryCount:0,notes:''},
  {id:'csv-20260808-ajay',date:'2026-08-08',type:'Store',store:'Ajay',start:'',end:'',hours:3.833333333333332,rate:10,deliveryCount:0,notes:''},
  {id:'csv-20260815-ajay',date:'2026-08-15',type:'Store',store:'Ajay',start:'',end:'',hours:4,rate:10,deliveryCount:0,notes:''},
  {id:'csv-20260818-lesaint',date:'2026-08-18',type:'Store',store:'Le Saint',start:'',end:'',hours:2.5,rate:10,deliveryCount:1,notes:'one delivery'},
  {id:'csv-20260819-lesaint',date:'2026-08-19',type:'Store',store:'Le Saint',start:'',end:'',hours:2.5,rate:10,deliveryCount:4,notes:'4 delivery'},
  {id:'csv-20260821-lesaint',date:'2026-08-21',type:'Store',store:'Le Saint',start:'',end:'',hours:2.5,rate:10,deliveryCount:0,notes:''},
  {id:'csv-20260822-lesaint',date:'2026-08-22',type:'Store',store:'Le Saint',start:'',end:'',hours:3.416666666666666,rate:10,deliveryCount:2,notes:'2 delivery'}
],expenses:[],payments:[
  {id:'csv-payment-20260815',date:'2026-08-15',type:'Salary',amount:125,reference:'july last week & aug 1st week'},
  {id:'csv-payment-20260819',date:'2026-08-19',type:'Salary',amount:194.1,reference:'aug 2nd week'}
],settings:{currency:'€',defaultRate:10,deliveryRate:2}};

function handleError(error: unknown) {
  if (error instanceof Response) return error;
  console.error(error);
  return NextResponse.json({ error: 'Database request failed.' }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const user = await requireAppUser(request);
    if (user.role === 'admin') return NextResponse.json({ data: null, updatedAt: null, user });
    let row = await env.DB.prepare('SELECT data, updated_at FROM tracker_state WHERE user_id = ?')
      .bind(user.userId).first<{ data: string; updated_at: string }>();
    return NextResponse.json({ data: row ? JSON.parse(row.data) : null, updatedAt: row?.updated_at ?? null, user });
  } catch (error) { return handleError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireAppUser(request);
    if (user.role === 'admin') return NextResponse.json({ error: 'Administrator accounts manage users only.' }, { status: 403 });
    const body = await request.json();
    if (!body || !Array.isArray(body.shifts) || !Array.isArray(body.expenses) || !Array.isArray(body.payments)) {
      return NextResponse.json({ error: 'Invalid tracker data.' }, { status: 400 });
    }
    const serialized = JSON.stringify(body);
    if (serialized.length > 2_000_000) return NextResponse.json({ error: 'Tracker data is too large.' }, { status: 413 });
    const updatedAt = new Date().toISOString();
    await env.DB.prepare(`INSERT INTO tracker_state (user_id, data, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`)
      .bind(user.userId, serialized, updatedAt).run();
    return NextResponse.json({ ok: true, updatedAt });
  } catch (error) { return handleError(error); }
}
