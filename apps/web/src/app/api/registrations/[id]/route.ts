import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PendingRegistration } from '@messmitra/types';

export const dynamic = 'force-dynamic';

function getRegFilePath(): string {
  try {
    const localDir = path.join(process.cwd(), '.data');
    if (fs.existsSync(localDir)) {
      return path.join(localDir, 'registrations.json');
    }
  } catch {}
  return path.join(os.tmpdir(), 'messmitra_registrations.json');
}

function readRegistrations(): PendingRegistration[] {
  try {
    const filePath = getRegFilePath();
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRegistrations(data: PendingRegistration[]) {
  try {
    const filePath = getRegFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Ignore read-only filesystem errors
  }
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
