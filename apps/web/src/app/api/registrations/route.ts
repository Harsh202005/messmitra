import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PendingRegistration } from '@messmitra/types';

import os from 'os';

let inMemoryRegistrations: PendingRegistration[] = [];

function getRegFilePath(): string {
  try {
    const localDir = path.join(process.cwd(), '.data');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return path.join(localDir, 'registrations.json');
  } catch {
    const tmpDir = os.tmpdir();
    return path.join(tmpDir, 'messmitra_registrations.json');
  }
}

function ensureDataFile() {
  try {
    const filePath = getRegFilePath();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(inMemoryRegistrations), 'utf-8');
    }
  } catch {
    // Ignore read-only filesystem errors
  }
}

function readRegistrations(): PendingRegistration[] {
  ensureDataFile();
  try {
    const filePath = getRegFilePath();
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryRegistrations = parsed;
      return parsed;
    }
  } catch {}
  return inMemoryRegistrations;
}

function writeRegistrations(data: PendingRegistration[]) {
  inMemoryRegistrations = data;
  try {
    const filePath = getRegFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Falls back to inMemoryRegistrations
  }
}

const CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0e795dfc92f28';

async function fetchFromCloud(): Promise<PendingRegistration[]> {
  try {
    const res = await fetch(CLOUD_SYNC_URL, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.registrations && Array.isArray(data.data.registrations)) {
        return data.data.registrations;
      }
    }
  } catch (e) {
    // Ignore network error
  }
  return [];
}

async function syncToCloud(list: PendingRegistration[]): Promise<void> {
  try {
    await fetch(CLOUD_SYNC_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'balaji_mess_registrations_v1',
        data: { registrations: list },
      }),
    });
  } catch (e) {
    // Ignore network error
  }
}

export async function GET(req: NextRequest) {
  try {
    const localList = readRegistrations();
    const cloudList = await fetchFromCloud();

    const map = new Map<string, PendingRegistration>();
    for (const r of cloudList) {
      map.set(r.id, r);
    }
    for (const r of localList) {
      if (!map.has(r.id)) {
        map.set(r.id, r);
      }
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    writeRegistrations(merged);

    return NextResponse.json(merged, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'नाव आणि मोबाईल नंबर आवश्यक आहे (Name and phone are required).' },
        { status: 400 }
      );
    }

    const current = readRegistrations();
    const cloudCurrent = await fetchFromCloud();
    const map = new Map<string, PendingRegistration>();
    for (const r of cloudCurrent) map.set(r.id, r);
    for (const r of current) if (!map.has(r.id)) map.set(r.id, r);

    const newRegId = `reg-${Date.now()}`;
    const submittedAt = new Date().toISOString();

    const newReg: PendingRegistration = {
      id: newRegId,
      messId: body.messId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      name: String(body.name).trim(),
      phone: String(body.phone).trim(),
      role: body.role === 'staff' ? 'staff' : 'member',
      dietPreference: body.dietPreference || 'veg',
      planType: body.planType || 'both',
      rate: Number(body.rate || (body.dietPreference === 'veg' ? 3000 : 3200)),
      staffRole: body.staffRole,
      salary: body.salary ? Number(body.salary) : undefined,
      password: body.password,
      submittedAt,
      status: 'pending_approval',
    };

    map.set(newReg.id, newReg);
    const updated = Array.from(map.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    writeRegistrations(updated);
    await syncToCloud(updated);

    return NextResponse.json(newReg, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, reviewedBy = 'शंकर गिरी' } = body;

    if (!id || !['approved', 'rejected', 'pending_approval'].includes(status)) {
      return NextResponse.json({ error: 'अवैध आयडी किंवा स्थिती (Invalid ID or status)' }, { status: 400 });
    }

    const list = readRegistrations();
    const cloudList = await fetchFromCloud();
    const map = new Map<string, PendingRegistration>();
    for (const r of cloudList) map.set(r.id, r);
    for (const r of list) if (!map.has(r.id)) map.set(r.id, r);

    const target = map.get(id);
    if (!target) {
      return NextResponse.json({ error: 'नोंदणी सापडली नाही (Registration not found)' }, { status: 404 });
    }

    target.status = status;
    target.reviewedAt = new Date().toISOString();
    target.reviewedBy = reviewedBy;
    map.set(id, target);

    const updated = Array.from(map.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    writeRegistrations(updated);
    await syncToCloud(updated);

    return NextResponse.json(target);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    writeRegistrations([]);
    await syncToCloud([]);
    return NextResponse.json({ success: true, message: 'All registrations cleared' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
