import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { MessPricePlan } from '@messmitra/types';

export const dynamic = 'force-dynamic';

const INITIAL_PRICE_PLANS: MessPricePlan[] = [
  {
    id: 'plan-1meal-veg',
    badge: '1 MEAL / DAY',
    badgeColor: 'emerald',
    name: '1-Meal Pure Veg (Lunch or Dinner)',
    nameMr: '१-वेळ शुद्ध शाकाहारी',
    price: 2400,
    priceUnit: '/ महिना (~२८ जेवणे)',
    description: 'फक्त दुपार किंवा फक्त रात्र. अमर्यादित चपात्या व २ ताज्या भाज्या, वरण-भात व सॅलड. सुट्टी वजावट लागू.',
    descriptionMr: 'फक्त दुपार किंवा फक्त रात्र. अमर्यादित चपात्या व २ ताज्या भाज्या, वरण-भात व सॅलड. सुट्टी वजावट लागू.',
    tags: [{ label: 'Pure Veg', type: 'veg' }],
    planCategory: 'monthly',
    mealsPerDay: 1,
    isActive: true,
    showOnLanding: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'plan-2meal-veg',
    badge: 'सर्वात लोकप्रिय',
    badgeColor: 'amber',
    name: '2-Meal Full Day Pure Veg (Lunch + Dinner)',
    nameMr: '२-वेळ शुद्ध शाकाहारी',
    price: 3000,
    priceUnit: '/ महिना (~५६ जेवणे)',
    description: 'दुपार + रात्र दोन्ही वेळ. २ वेळ पूर्ण जेवण, रविवार स्पेशल गोड जेवण आणि किमान ३ दिवस सुट्टी वजावट.',
    descriptionMr: 'दुपार + रात्र दोन्ही वेळ. २ वेळ पूर्ण जेवण, रविवार स्पेशल गोड जेवण आणि किमान ३ दिवस सुट्टी वजावट.',
    tags: [{ label: 'Pure Veg (Popular)', type: 'veg' }],
    planCategory: 'monthly',
    mealsPerDay: 2,
    isActive: true,
    showOnLanding: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'plan-2meal-special',
    badge: 'चिकन/अंडी स्पेशल',
    badgeColor: 'amber',
    name: '2-Meal Non-Veg Special (Wed/Fri/Sun Special)',
    nameMr: '२-वेळ मांसाहारी स्पेशल',
    price: 3200,
    priceUnit: '/ महिना (~५६ जेवणे)',
    description: 'दुपार + रात्र (बुध/शुक्र/रवि). आठवड्यातून ३ रात्री चिकन/अंडी स्पेशल, इतर वेळी शुद्ध शाकाहारी. पार्सल सुविधा उपलब्ध.',
    descriptionMr: 'दुपार + रात्र (बुध/शुक्र/रवि). आठवड्यातून ३ रात्री चिकन/अंडी स्पेशल, इतर वेळी शुद्ध शाकाहारी. पार्सल सुविधा उपलब्ध.',
    tags: [{ label: 'Non-Veg Special', type: 'nonveg' }],
    planCategory: 'monthly',
    mealsPerDay: 2,
    isActive: true,
    showOnLanding: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'plan-student-coupon',
    badge: 'कूपन पास',
    badgeColor: 'purple',
    name: 'Student 10-Meal Flexi Pass',
    nameMr: 'विद्यार्थी कूपन पास',
    price: 850,
    priceUnit: '/ १० टोकन्स (~₹८५/जेवण)',
    description: '१० जेवण कूपन पास. कधीही वापरा (४५ दिवस वैधता). मित्र किंवा पाहुण्यांसाठी चालू, डिजिटल QR कूपन.',
    descriptionMr: '१० जेवण कूपन पास. कधीही वापरा (४५ दिवस वैधता). मित्र किंवा पाहुण्यांसाठी चालू, डिजिटल QR कूपन.',
    tags: [{ label: 'Flexi Pass', type: 'token' }],
    planCategory: 'token_bundle',
    tokenCount: 10,
    validityDays: 45,
    isActive: true,
    showOnLanding: true,
    createdAt: '2026-06-01T00:00:00Z',
  },
];

let inMemoryPlans: MessPricePlan[] = INITIAL_PRICE_PLANS;

function getPlansFilePath(): string {
  try {
    const localDir = path.join(process.cwd(), '.data');
    if (fs.existsSync(localDir)) {
      return path.join(localDir, 'plans.json');
    }
  } catch {}
  return path.join(os.tmpdir(), 'messmitra_plans.json');
}

function readPlans(): MessPricePlan[] {
  try {
    const filePath = getPlansFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryPlans = parsed;
        return parsed;
      }
    }
  } catch {
    // Fall back to inMemoryPlans
  }
  return inMemoryPlans;
}

function writePlans(data: MessPricePlan[]) {
  inMemoryPlans = data;
  try {
    const filePath = getPlansFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Ignore read-only filesystem errors
  }
}

export async function GET() {
  try {
    const list = readPlans();
    return NextResponse.json(list, {
      headers: {
        'Cache-Control': 'no-store, no-cache, max-age=0',
      },
    });
  } catch (err: any) {
    return NextResponse.json(INITIAL_PRICE_PLANS);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (Array.isArray(body)) {
      // Overwrite full plan list
      writePlans(body);
      return NextResponse.json(body);
    }

    if (body.id) {
      const current = readPlans();
      const existingIndex = current.findIndex((p) => p.id === body.id);
      let updated: MessPricePlan[];

      if (existingIndex >= 0) {
        current[existingIndex] = { ...current[existingIndex], ...body };
        updated = current;
      } else {
        const newPlan: MessPricePlan = {
          id: body.id || `plan-${Date.now()}`,
          badge: body.badge || 'CUSTOM PLAN',
          name: body.name || 'New Plan',
          nameMr: body.nameMr || body.name || 'नवीन योजना',
          price: Number(body.price || 3000),
          priceUnit: body.priceUnit || '/ month',
          description: body.description || '',
          descriptionMr: body.descriptionMr || body.description || '',
          tags: body.tags || [{ label: 'General', type: 'general' }],
          planCategory: body.planCategory || 'monthly',
          isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
          showOnLanding: body.showOnLanding !== undefined ? Boolean(body.showOnLanding) : true,
          createdAt: new Date().toISOString(),
        };
        updated = [...current, newPlan];
      }

      writePlans(updated);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive, showOnLanding, price, name, nameMr, priceUnit, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing plan id' }, { status: 400 });
    }

    const current = readPlans();
    const index = current.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (isActive !== undefined) {
      current[index].isActive = Boolean(isActive);
    }
    if (showOnLanding !== undefined) {
      current[index].showOnLanding = Boolean(showOnLanding);
    }
    if (price !== undefined) {
      current[index].price = Number(price);
    }
    if (name !== undefined) {
      current[index].name = String(name);
    }
    if (nameMr !== undefined) {
      current[index].nameMr = String(nameMr);
    }
    if (priceUnit !== undefined) {
      current[index].priceUnit = String(priceUnit);
    }
    if (description !== undefined) {
      current[index].description = String(description);
    }

    writePlans(current);
    return NextResponse.json(current[index]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id') || (await req.json().catch(() => ({})))?.id;

    if (!id) {
      return NextResponse.json({ error: 'Missing plan id' }, { status: 400 });
    }

    const current = readPlans();
    const updated = current.filter((p) => p.id !== id);
    writePlans(updated);
    return NextResponse.json({ success: true, remaining: updated.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
