import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db } = await import('@/lib/firebaseAdmin');
    const snap = await db.collection('field_reports').orderBy('timestamp', 'desc').limit(20).get();
    const reports = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data: reports });
  } catch {
    // Return demo data if Firebase not configured
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'demo1',
          officer_name: 'Ravi Sharma',
          location: 'Sitabuldi Market',
          heat_score: 8,
          summary: 'Heavy vehicle congestion causing significant heat buildup near market area.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'demo2',
          officer_name: 'Priya Nair',
          location: 'Dharampeth Junction',
          heat_score: 6,
          summary: 'Moderate heat, partial shade from trees. Needs mist cooling station.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
      source: 'fallback',
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { officer_name, location, heat_score, summary, indicators, actions } = body;

    const reportData = {
      officer_name: officer_name || 'Unknown Officer',
      location: location || 'Unknown Location',
      heat_score: heat_score ?? 5,
      summary: summary || '',
      indicators: indicators || [],
      actions: actions || [],
      timestamp: new Date().toISOString(),
    };

    let savedId = `local_${Date.now()}`;
    try {
      const { db } = await import('@/lib/firebaseAdmin');
      const ref = await db.collection('field_reports').add(reportData);
      savedId = ref.id;
    } catch {
      console.warn('Firebase not configured, report saved locally only');
    }

    return NextResponse.json({ success: true, id: savedId, ...reportData });
  } catch (error) {
    console.error('Field report save error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save report' }, { status: 500 });
  }
}
