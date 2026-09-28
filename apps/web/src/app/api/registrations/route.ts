import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PendingRegistration } from '@messmitra/types';

const DATA_DIR = path.join(process.cwd(), '.data');
const REG_FILE = path.join(DATA_DIR, 'registrations.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(REG_FILE)) {
    fs.writeFileSync(REG_FILE, JSON.stringify([]), 'utf-8');
  }
}

function readRegistrations(): PendingRegistration[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(REG_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeRegistrations(data: PendingRegistration[]) {
  ensureDataFile();
  fs.writeFileSync(REG_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  try {
    const list = readRegistrations();
    return NextResponse.json(list, {
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

    // Prepend to top of queue
    const updated = [newReg, ...current.filter((r) => r.id !== newReg.id)];
    writeRegistrations(updated);

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

export async function DELETE() {
  try {
    writeRegistrations([]);
    return NextResponse.json({ success: true, message: 'All registrations cleared' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
