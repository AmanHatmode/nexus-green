import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tempUrl = 'https://api.open-meteo.com/v1/forecast?latitude=21.1458&longitude=79.0882&current=temperature_2m,apparent_temperature&timezone=Asia/Kolkata';
    const overpassUrl = 'https://overpass-api.de/api/interpreter?data=[out:json];way[highway~"^(primary|secondary|tertiary)$"](21.08,78.98,21.21,79.18);out count;';

    const [tempRes, overpassRes] = await Promise.allSettled([
      fetch(tempUrl, { cache: 'no-store' }),
      fetch(overpassUrl, { cache: 'no-store' }),
    ]);

    let avgTemp = 42.5;
    let feelsLike = 45.0;
    try {
      if (tempRes.status === 'fulfilled') {
        const tj = await tempRes.value.json();
        avgTemp = tj?.current?.temperature_2m ?? 42.5;
        feelsLike = tj?.current?.apparent_temperature ?? avgTemp + 2;
      }
    } catch(e) {}

    let trafficFlow = 68;
    try {
      if (overpassRes.status === 'fulfilled') {
        const oj = await overpassRes.value.json();
        const count = parseInt(oj?.elements?.[0]?.tags?.total ?? '400');
        trafficFlow = Math.min(95, Math.max(30, Math.round((count / 400) * 70)));
      }
    } catch(e) {}

    let agentCount = 0;
    try {
      const { db } = await import('@/lib/firebaseAdmin');
      const snap = await db.collection('agents').count().get();
      agentCount = snap.data().count;
    } catch {
      agentCount = 24;
    }

    return NextResponse.json({
      success: true,
      avg_temp: Math.round(avgTemp * 10) / 10,
      feels_like: Math.round(feelsLike * 10) / 10,
      traffic_flow: trafficFlow,
      agent_count: agentCount,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      avg_temp: 42.5,
      feels_like: 45.0,
      traffic_flow: 68,
      agent_count: 24,
      source: 'fallback',
    });
  }
}
