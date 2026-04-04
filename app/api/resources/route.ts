import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db } = await import('@/lib/firebaseAdmin');
    const snap = await db.collection('agents').orderBy('created_at', 'desc').get();
    const agents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data: agents });
  } catch {
    return NextResponse.json({
      success: true,
      data: [
        { id: 'd1', name: 'Rajesh Kumar', badge_id: 'NMC-001', phone: '9823001234', zone: 'Sitabuldi', status: 'active' },
        { id: 'd2', name: 'Sunita Patil', badge_id: 'NMC-002', phone: '9823001235', zone: 'Dharampeth', status: 'active' },
      ],
      source: 'fallback',
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, badge_id, phone, zone } = body;

    if (!name || !badge_id) {
      return NextResponse.json({ success: false, error: 'name and badge_id required' }, { status: 400 });
    }

    const agentData = {
      name,
      badge_id,
      phone: phone || '',
      zone: zone || 'Unassigned',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    let savedId = `local_${Date.now()}`;
    try {
      const { db } = await import('@/lib/firebaseAdmin');
      const ref = await db.collection('agents').add(agentData);
      savedId = ref.id;
    } catch {
      console.warn('Firebase not configured');
    }

    return NextResponse.json({ success: true, id: savedId, ...agentData });
  } catch (error) {
    console.error('Resource save error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save resource' }, { status: 500 });
  }
}
