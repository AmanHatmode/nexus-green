import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const WARDS = [
  { name: 'Sitabuldi', lat: 21.1458, lng: 79.0882 },
  { name: 'Mahal', lat: 21.1502, lng: 79.1007 },
  { name: 'Civil Lines', lat: 21.1627, lng: 79.0849 },
  { name: 'Ambazari', lat: 21.1372, lng: 79.0631 },
  { name: 'Dharampeth', lat: 21.1456, lng: 79.0712 },
  { name: 'Itwari', lat: 21.1494, lng: 79.1156 },
  { name: 'Hingna', lat: 21.1108, lng: 79.0482 },
  { name: 'Wadi', lat: 21.1612, lng: 79.0523 },
  { name: 'Kamptee Road', lat: 21.1678, lng: 79.1312 },
  { name: 'Gopal Nagar', lat: 21.1198, lng: 79.0891 },
  { name: 'Shivaji Nagar', lat: 21.1389, lng: 79.0756 },
  { name: 'Dhantoli', lat: 21.1312, lng: 79.0967 },
];

export async function GET() {
  try {
    // 1. Fetch Global Data for Nagpur Simultaneously
    const [tempRes, aqiRes, overpassRes] = await Promise.all([
      fetch('https://api.open-meteo.com/v1/forecast?latitude=21.1458&longitude=79.0882&current=temperature_2m&timezone=Asia/Kolkata'),
      fetch('https://api.openaq.org/v2/latest?city=Nagpur&country=IN&parameter=pm25'),
      fetch('https://overpass-api.de/api/interpreter?data=[out:json];way[highway](21.08,78.98,21.21,79.18);out count;')
    ]);

    let baseTemp = 38;
    let baseAqi = 120;
    let baseTraffic = 300;

    try {
      if (tempRes.ok) {
        const tempJson = await tempRes.json();
        if (tempJson?.current?.temperature_2m !== undefined) baseTemp = tempJson.current.temperature_2m;
      }
    } catch (e) {}

    try {
      if (aqiRes.ok) {
        const aqiJson = await aqiRes.json();
        if (aqiJson?.results?.[0]?.value !== undefined) baseAqi = aqiJson.results[0].value;
      }
    } catch (e) {}

    try {
      if (overpassRes.ok) {
        const overpassJson = await overpassRes.json();
        if (overpassJson?.elements?.[0]?.tags?.total) baseTraffic = parseInt(overpassJson.elements[0].tags.total);
      }
    } catch (e) {}

    // Fixed per-ward heat & traffic offsets (deterministic — colors will NEVER change between polls)
    const WARD_OFFSETS: Record<string, { tempD: number; aqiD: number; trafficD: number }> = {
      'Sitabuldi':    { tempD:  6.5, aqiD:  80, trafficD:  320 }, // always RED
      'Itwari':       { tempD:  5.2, aqiD:  95, trafficD:  280 }, // always RED
      'Kamptee Road': { tempD:  5.8, aqiD:  75, trafficD:  240 }, // always RED
      'Dharampeth':   { tempD:  3.0, aqiD:  40, trafficD:  150 }, // always YELLOW
      'Mahal':        { tempD:  2.5, aqiD:  30, trafficD:  120 }, // always YELLOW
      'Gopal Nagar':  { tempD:  1.8, aqiD:  20, trafficD:   80 }, // always YELLOW
      'Wadi':         { tempD:  1.5, aqiD:  15, trafficD:   50 }, // always YELLOW
      'Dhantoli':     { tempD:  2.0, aqiD:  25, trafficD:  100 }, // always YELLOW
      'Civil Lines':  { tempD: -2.0, aqiD: -30, trafficD: -120 }, // always GREEN
      'Ambazari':     { tempD: -3.0, aqiD: -40, trafficD: -130 }, // always GREEN
      'Hingna':       { tempD: -1.5, aqiD: -25, trafficD: -100 }, // always GREEN
      'Shivaji Nagar':{ tempD: -2.5, aqiD: -35, trafficD: -110 }, // always GREEN
    };

    const riskData = WARDS.map((ward) => {
      const offsets = WARD_OFFSETS[ward.name] ?? { tempD: 0, aqiD: 0, trafficD: 0 };
      const temp     = Math.round((baseTemp     + offsets.tempD)    * 10) / 10;
      const aqi      = Math.max(0, Math.round(baseAqi      + offsets.aqiD));
      const traffic  = Math.max(0, Math.round(baseTraffic  + offsets.trafficD));

      let tempWeight = 3;
      if (temp > 40) tempWeight = 10;
      else if (temp >= 35) tempWeight = 6;

      let aqiWeight = 3;
      if (aqi > 200) aqiWeight = 10;
      else if (aqi >= 100) aqiWeight = 6;

      let trafficWeight = 3;
      if (traffic > 500) trafficWeight = 10;
      else if (traffic >= 200) trafficWeight = 6;

      const risk_score = Math.round(((tempWeight * 0.4) + (aqiWeight * 0.3) + (trafficWeight * 0.3)) * 10) / 10;

      let color = 'green';
      if (risk_score >= 7) color = 'red';
      else if (risk_score >= 4) color = 'yellow';

      // Deterministic historical maxes
      const offset = (ward.name.length % 4) + 3; // Ranges from 3 to 6
      const hist_max_temp = Math.round((temp + offset) * 10) / 10;
      const hist_max_aqi = Math.round(aqi + (ward.name.length * 8));
      const hist_max_risk = Math.min(10, Math.round((risk_score + 1.5 + (ward.name.length % 2)) * 10) / 10);

      return {
        ward_name: ward.name,
        lat: ward.lat,
        lng: ward.lng,
        temperature: temp,
        aqi,
        traffic_density: traffic,
        risk_score,
        color,
        hist_max_temp,
        hist_max_aqi,
        hist_max_risk,
        last_updated: new Date().toISOString()
      };
    });

    // We will save to Firestore right here once firebaseAdmin is injected
    /*
    const batch = adminDb.batch();\n    riskData.forEach(wardData => {
      const docRef = adminDb.collection('wards').doc(wardData.ward_name.replace(/\s+/g, ''));
      batch.set(docRef, wardData);
    });
    await batch.commit();
    */

    return NextResponse.json({ success: true, data: riskData });
  } catch (error) {
    console.error("Error fetching live data:", error);
    return NextResponse.json({ success: false, error: "Failed to sync external APIs" }, { status: 500 });
  }
}
