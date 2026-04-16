// API route placeholder for webhooks
// Only used if external webhooks are needed
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ status: 'ok' });
}
