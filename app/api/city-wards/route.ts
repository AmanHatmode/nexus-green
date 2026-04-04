import { NextResponse } from 'next/server';
import { CITY_WARDS, WardEntry } from '@/lib/cityWards';

export const dynamic = 'force-dynamic';

/** State/UT label for each city key in CITY_WARDS (for client display). */
const CITY_STATE: Record<string, string> = {
  Nagpur: 'Maharashtra',
  Mumbai: 'Maharashtra',
  Delhi: 'Delhi',
  Pune: 'Maharashtra',
  Hyderabad: 'Telangana',
  Chennai: 'Tamil Nadu',
  Kolkata: 'West Bengal',
  Bengaluru: 'Karnataka',
  Ahmedabad: 'Gujarat',
  Jaipur: 'Rajasthan',
  Lucknow: 'Uttar Pradesh',
};

function calcRiskScore(temp: number, aqi: number, traffic: number) {
  const tW = temp > 42 ? 10 : temp >= 35 ? 6 : 3;
  const aW = aqi  > 200 ? 10 : aqi  >= 100 ? 6 : 3;
  const trW = traffic > 500 ? 10 : traffic >= 200 ? 6 : 3;
  return Math.round((tW * 0.4 + aW * 0.3 + trW * 0.3) * 10) / 10;
}

/** 
 * Deterministically generates realistic wards if a city isn't in our database.
 * Uses city name as seed for stability.
 */
function generateProceduralWards(cityName: string, baseLat: number, baseLng: number): WardEntry[] {
  // Simple deterministic hash from string
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = cityName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const wards: WardEntry[] = [];
  const wardCount = 6 + (Math.abs(hash) % 5); // 6-10 wards
  
  const wardNames = ["Central", "North Zone", "South Extension", "East Market", "Western Suburb", "Industrial Area", "Tech Park", "Heritage Loop", "Riverfront", "Green Belt"];

  for (let i = 0; i < wardCount; i++) {
    // Deterministic pseudo-random offsets
    const angle = (i * (360 / wardCount) + (Math.abs(hash + i * 137) % 45)) * (Math.PI / 180);
    const dist = 0.015 + (Math.abs(hash * (i + 1)) % 30) / 1000; // ~1.5km - 4.5km
    
    wards.push({
      name: wardNames[i % wardNames.length] + (i >= wardNames.length ? ` ${Math.floor(i / wardNames.length) + 1}` : ""),
      lat: baseLat + Math.sin(angle) * dist,
      lng: baseLng + Math.cos(angle) * dist,
      tempOffset: ((Math.abs(hash + i * 7) % 70) / 10) - 2.0, // -2.0C to +5.0C
      aqiOffset: (Math.abs(hash + i * 11) % 120) - 20,       // -20 to +100
      trafficOffset: (Math.abs(hash + i * 19) % 400) - 100, // -100 to +300
    });
  }
  return wards;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');

  if (!city || !latStr || !lngStr) {
    return NextResponse.json({ success: false, error: 'Missing city/lat/lng' }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  // Get manual data or generate procedurally
  let wards = CITY_WARDS[city];
  let isProcedural = false;
  
  if (!wards || wards.length === 0) {
    wards = generateProceduralWards(city, lat, lng);
    isProcedural = true;
  }

  // Fetch live current temperature for this city from Open-Meteo
  let liveTemp = 38;
  let liveAqi  = 130;
  let liveTraffic = 350;

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m&timezone=Asia/Kolkata`,
      { next: { revalidate: 600 } }
    );
    const json = await res.json();
    if (json?.current?.temperature_2m !== undefined) {
      liveTemp = json.current.temperature_2m;
    }
  } catch (e) {
    console.error('Open-Meteo fetch failed, using fallback temp', e);
  }

  const wardRisks = wards.map(ward => {
    const temp    = Math.round((liveTemp    + ward.tempOffset)    * 10) / 10;
    const aqi     = Math.max(0, Math.round(liveAqi   + ward.aqiOffset));
    const traffic = Math.max(0, Math.round(liveTraffic + ward.trafficOffset));
    const risk_score = calcRiskScore(temp, aqi, traffic);
    const color = risk_score >= 7 ? 'red' : risk_score >= 4 ? 'yellow' : 'green';

    const hist_max_temp = Math.round((temp + 2 + (ward.name.length % 4)) * 10) / 10;
    const hist_max_aqi = Math.round(aqi + 30 + (ward.name.length * 5));
    const hist_max_risk = Math.min(10, Math.round((risk_score + 1) * 10) / 10);

    return {
      ward_name: ward.name,
      city,
      state: CITY_STATE[city] || 'India',
      lat: ward.lat,
      lng: ward.lng,
      temperature: temp,
      aqi,
      traffic_density: traffic,
      risk_score,
      color,
      is_procedural: isProcedural,
      hist_max_temp,
      hist_max_aqi,
      hist_max_risk,
      last_updated: new Date().toISOString(),
    };
  });

  return NextResponse.json({ success: true, city, data: wardRisks });
}
