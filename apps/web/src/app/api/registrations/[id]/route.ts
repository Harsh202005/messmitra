import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PendingRegistration } from '@messmitra/types';

const DATA_DIR = path.join(process.cwd(), '.data');
const REG_FILE = path.join(DATA_DIR, 'registrations.json');

function readRegistrations(): PendingRegistration[] {
  try {
    if (!fs.existsSync(REG_FILE)) return [];
    const raw = fs.readFileSync(REG_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeRegistrations(data: PendingRegistration[]) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(REG_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const id = params?.id || new URL(req.url).pathname.split('/').pop() || '';
    const body = await req.json();
    const { status, reviewedBy = 'शंकर गिरी' } = body;

    if (!['approved', 'rejected', 'pending_approval'].includes(status)) {
      return NextResponse.json({ error: 'अवैध स्थिती (Invalid status)' }, { status: 400 });
    }

    const list = readRegistrations();
    const index = list.findIndex((r) => r.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'नोंदणी सापडली नाही (Registration not found)' }, { status: 404 });
    }

    list[index].status = status;
    list[index].reviewedAt = new Date().toISOString();
    list[index].reviewedBy = reviewedBy;

    writeRegistrations(list);

    return NextResponse.json(list[index]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
