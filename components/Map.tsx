'use client';

import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

const INDIA_CENTER: [number, number] = [22.5937, 78.9629];

/** Maps map UI city name → `CITY_WARDS` key in `@/lib/cityWards` for `/api/city-wards`. */
const CITY_API_KEY: Record<string, string> = {
  'New Delhi': 'Delhi',
};

export function zoneLabel(color: string): string {
  if (color === 'red') return 'Critical — Red zone';
  if (color === 'yellow') return 'Elevated — Yellow zone';
  return 'Safe — Green zone';
}

export interface ZoneData {
  ward_name: string;
  lat: number;
  lng: number;
  temperature: number;
  aqi: number;
  traffic_density: number;
  risk_score: number;
  color: string;
  state: string;
  last_updated: string;
  is_procedural?: boolean;
}

// ─── India-level city dots ────────────────────────────────────────────────────
const INDIA_CITIES: ZoneData[] = [
  { ward_name:'Nagpur',            state:'Maharashtra', lat:21.1458, lng:79.0882, temperature:45, aqi:180, traffic_density:600, risk_score:8.5, color:'red',    last_updated:'' },
  { ward_name:'Mumbai',            state:'Maharashtra', lat:19.0760, lng:72.8777, temperature:34, aqi:155, traffic_density:820, risk_score:6.8, color:'yellow', last_updated:'' },
  { ward_name:'Pune',              state:'Maharashtra', lat:18.5204, lng:73.8567, temperature:35, aqi:130, traffic_density:580, risk_score:6.0, color:'yellow', last_updated:'' },
  { ward_name:'Aurangabad',        state:'Maharashtra', lat:19.8762, lng:75.3433, temperature:41, aqi:158, traffic_density:380, risk_score:7.1, color:'red',    last_updated:'' },
  { ward_name:'Nashik',            state:'Maharashtra', lat:19.9975, lng:73.7898, temperature:38, aqi:145, traffic_density:420, risk_score:6.2, color:'yellow', last_updated:'' },
  { ward_name:'Solapur',           state:'Maharashtra', lat:17.6868, lng:75.9064, temperature:42, aqi:168, traffic_density:340, risk_score:7.4, color:'red',    last_updated:'' },
  { ward_name:'New Delhi',         state:'Delhi',       lat:28.6139, lng:77.2090, temperature:44, aqi:320, traffic_density:900, risk_score:9.4, color:'red',    last_updated:'' },
  { ward_name:'Lucknow',           state:'Uttar Pradesh',lat:26.8467, lng:80.9462, temperature:43, aqi:230, traffic_density:620, risk_score:8.8, color:'red',  last_updated:'' },
  { ward_name:'Kanpur',            state:'Uttar Pradesh',lat:26.4499, lng:80.3319, temperature:44, aqi:248, traffic_density:590, risk_score:9.0, color:'red',  last_updated:'' },
  { ward_name:'Varanasi',          state:'Uttar Pradesh',lat:25.3176, lng:82.9739, temperature:44, aqi:220, traffic_density:540, risk_score:8.7, color:'red',  last_updated:'' },
  { ward_name:'Agra',              state:'Uttar Pradesh',lat:27.1767, lng:78.0081, temperature:45, aqi:234, traffic_density:480, risk_score:9.0, color:'red',  last_updated:'' },
  { ward_name:'Jaipur',            state:'Rajasthan',   lat:26.9124, lng:75.7873, temperature:45, aqi:195, traffic_density:560, risk_score:8.8, color:'red',   last_updated:'' },
  { ward_name:'Jodhpur',           state:'Rajasthan',   lat:26.2389, lng:73.0243, temperature:47, aqi:185, traffic_density:350, risk_score:9.1, color:'red',   last_updated:'' },
  { ward_name:'Udaipur',           state:'Rajasthan',   lat:24.5854, lng:73.7125, temperature:38, aqi:110, traffic_density:280, risk_score:6.0, color:'yellow', last_updated:'' },
  { ward_name:'Bhopal',            state:'Madhya Pradesh',lat:23.2599, lng:77.4126, temperature:42, aqi:190, traffic_density:460, risk_score:8.2, color:'red', last_updated:'' },
  { ward_name:'Indore',            state:'Madhya Pradesh',lat:22.7196, lng:75.8577, temperature:41, aqi:185, traffic_density:520, risk_score:7.9, color:'red', last_updated:'' },
  { ward_name:'Ahmedabad',         state:'Gujarat',     lat:23.0225, lng:72.5714, temperature:43, aqi:200, traffic_density:700, risk_score:8.6, color:'red',   last_updated:'' },
  { ward_name:'Surat',             state:'Gujarat',     lat:21.1702, lng:72.8311, temperature:36, aqi:165, traffic_density:650, risk_score:6.8, color:'yellow', last_updated:'' },
  { ward_name:'Bengaluru',         state:'Karnataka',   lat:12.9716, lng:77.5946, temperature:31, aqi:128, traffic_density:850, risk_score:6.2, color:'yellow', last_updated:'' },
  { ward_name:'Mysuru',            state:'Karnataka',   lat:12.2958, lng:76.6394, temperature:30, aqi:95,  traffic_density:320, risk_score:3.8, color:'green',  last_updated:'' },
  { ward_name:'Hyderabad',         state:'Telangana',   lat:17.3850, lng:78.4867, temperature:40, aqi:182, traffic_density:820, risk_score:8.0, color:'red',   last_updated:'' },
  { ward_name:'Chennai',           state:'Tamil Nadu',  lat:13.0827, lng:80.2707, temperature:37, aqi:148, traffic_density:780, risk_score:7.0, color:'yellow', last_updated:'' },
  { ward_name:'Coimbatore',        state:'Tamil Nadu',  lat:11.0168, lng:76.9558, temperature:34, aqi:118, traffic_density:460, risk_score:5.5, color:'yellow', last_updated:'' },
  { ward_name:'Kolkata',           state:'West Bengal', lat:22.5726, lng:88.3639, temperature:36, aqi:170, traffic_density:900, risk_score:7.4, color:'red',   last_updated:'' },
  { ward_name:'Amritsar',          state:'Punjab',      lat:31.6340, lng:74.8723, temperature:40, aqi:195, traffic_density:480, risk_score:7.8, color:'red',   last_updated:'' },
  { ward_name:'Chandigarh',        state:'Punjab',      lat:30.7333, lng:76.7794, temperature:38, aqi:155, traffic_density:420, risk_score:6.8, color:'yellow', last_updated:'' },
  { ward_name:'Patna',             state:'Bihar',       lat:25.5941, lng:85.1376, temperature:43, aqi:225, traffic_density:580, risk_score:8.8, color:'red',   last_updated:'' },
  { ward_name:'Bhubaneswar',       state:'Odisha',      lat:20.2961, lng:85.8245, temperature:38, aqi:145, traffic_density:420, risk_score:6.8, color:'yellow', last_updated:'' },
  { ward_name:'Raipur',            state:'Chhattisgarh',lat:21.2514, lng:81.6296, temperature:42, aqi:175, traffic_density:380, risk_score:7.6, color:'red',   last_updated:'' },
  { ward_name:'Ranchi',            state:'Jharkhand',   lat:23.3441, lng:85.3096, temperature:37, aqi:155, traffic_density:380, risk_score:6.5, color:'yellow', last_updated:'' },
  { ward_name:'Kochi',             state:'Kerala',      lat:9.9312,  lng:76.2673, temperature:31, aqi:90,  traffic_density:480, risk_score:3.5, color:'green',  last_updated:'' },
  { ward_name:'Thiruvananthapuram',state:'Kerala',      lat:8.5241,  lng:76.9366, temperature:30, aqi:82,  traffic_density:380, risk_score:3.0, color:'green',  last_updated:'' },
  { ward_name:'Guwahati',          state:'Assam',       lat:26.1445, lng:91.7362, temperature:34, aqi:142, traffic_density:380, risk_score:5.8, color:'yellow', last_updated:'' },
  { ward_name:'Shimla',            state:'Himachal Pradesh',lat:31.1048, lng:77.1734, temperature:18, aqi:42, traffic_density:180, risk_score:1.2, color:'green', last_updated:'' },
  { ward_name:'Srinagar',          state:'J&K',         lat:34.0837, lng:74.7973, temperature:16, aqi:38,  traffic_density:210, risk_score:1.3, color:'green',  last_updated:'' },
  { ward_name:'Panaji',            state:'Goa',         lat:15.4909, lng:73.8278, temperature:30, aqi:72,  traffic_density:200, risk_score:2.4, color:'green',  last_updated:'' },
  { ward_name:'Visakhapatnam',     state:'Andhra Pradesh',lat:17.6868, lng:83.2185, temperature:35, aqi:138, traffic_density:520, risk_score:6.0, color:'yellow', last_updated:'' },
  { ward_name:'Vijayawada',        state:'Andhra Pradesh',lat:16.5062, lng:80.6480, temperature:40, aqi:165, traffic_density:480, risk_score:7.3, color:'red',  last_updated:'' },
];

interface MapProps {
  onZoneClick: (zone: ZoneData) => void;
  selectedZone?: ZoneData | null;
}

function MapController({ selectedCity, selectedZone }: { selectedCity: string | null; selectedZone?: ZoneData | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedZone) {
      map.flyTo([selectedZone.lat, selectedZone.lng], 14, { duration: 1.5 });
    } else if (selectedCity) {
      const city = INDIA_CITIES.find(c => c.ward_name === selectedCity);
      if (city) map.flyTo([city.lat, city.lng], 12, { duration: 1.5 });
    } else {
      map.flyTo(INDIA_CENTER, 5, { duration: 1.5 });
    }
  }, [selectedCity, selectedZone, map]);
  return null;
}

export default function Map({ onZoneClick, selectedZone }: MapProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [liveWards, setLiveWards] = useState<ZoneData[] | null>(null);
  const [wardsLoading, setWardsLoading] = useState(false);
  const [wardsFetchError, setWardsFetchError] = useState(false);

  // If a city is selected, we show wards. Otherwise we show major India cities.
  const displayZones = selectedCity && liveWards ? liveWards : INDIA_CITIES;

  useEffect(() => {
    if (!selectedCity) {
      setLiveWards(null);
      setWardsFetchError(false);
      return;
    }

    const apiCity = CITY_API_KEY[selectedCity] ?? selectedCity;
    const center = INDIA_CITIES.find(c => c.ward_name === selectedCity);
    if (!center) return;

    const ac = new AbortController();
    setWardsLoading(true);
    setWardsFetchError(false);

    const url = `/api/city-wards?city=${encodeURIComponent(apiCity)}&lat=${center.lat}&lng=${center.lng}`;

    fetch(url, { signal: ac.signal })
      .then(res => res.json())
      .then(json => {
        if (!json.success || !Array.isArray(json.data)) {
          setWardsFetchError(true);
          setLiveWards(null);
          return;
        }
        setLiveWards(json.data);
      })
      .catch(() => {
        if (!ac.signal.aborted) {
          setWardsFetchError(true);
          setLiveWards(null);
        }
      })
      .finally(() => {
        if (!ac.signal.aborted) setWardsLoading(false);
      });

    return () => ac.abort();
  }, [selectedCity]);

  const handleMarkerClick = (zone: ZoneData) => {
    // If clicking a city that has ward-level data, drill in and show wards
    if (!selectedCity) {
      setSelectedCity(zone.ward_name);
      onZoneClick(zone); // report city-level click to parent
    } else {
      onZoneClick(zone); // ward-level click
    }
  };

  return (
    <div className="w-full h-full z-0 relative">
      {/* Back button when drilled into a city */}
      {selectedCity && (
        <div className="absolute top-24 left-4 z-[1000] flex flex-col gap-2">
          <button
            onClick={() => {
              setSelectedCity(null);
              setLiveWards(null);
              setWardsFetchError(false);
            }}
            className="bg-black/80 backdrop-blur-md text-emerald-400 text-xs font-bold px-4 py-2 rounded-full border border-emerald-500/30 hover:bg-black transition-all flex items-center gap-2"
          >
            ← Back to India
          </button>
          
          <div className="bg-black/80 backdrop-blur-md text-white/90 text-[10px] font-bold px-4 py-2 rounded-full border border-white/10">
            📍 <span className="text-emerald-400 uppercase tracking-widest">{selectedCity}</span>
            {wardsLoading ? " · loading live zones..." : liveWards ? ` · ${liveWards.length} zones active` : ""}
            {wardsFetchError && " · API Offline"}
          </div>
        </div>
      )}

      {selectedCity && liveWards && (
        <div className="absolute bottom-4 right-4 left-4 md:left-auto z-[1000] w-full md:w-[22rem] max-h-[min(40vh,320px)] flex flex-col rounded-xl border border-white/10 bg-black/85 backdrop-blur-md shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 shrink-0">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">Areas & current zones</div>
            <div className="text-[10px] text-white/50 mt-0.5">
              {liveWards[0]?.last_updated ? `As of ${new Date(liveWards[0].last_updated).toLocaleString()}` : "Real-time Feed"}
            </div>
          </div>
          <div className="overflow-y-auto flex-1 min-h-0">
            {liveWards.map((z) => {
              const hex = z.color === 'red' ? '#ef4444' : z.color === 'yellow' ? '#eab308' : '#10b981';
              return (
                <div
                  key={z.ward_name}
                  className="px-3 py-2 border-b border-white/5 flex items-start justify-between gap-2 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => onZoneClick(z)}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{z.ward_name}</div>
                    <div className="text-[10px] text-white/45">Risk {z.risk_score}/10</div>
                  </div>
                  <div className="text-[10px] font-bold shrink-0 text-right" style={{ color: hex }}>
                    {z.temperature}°C | AQI {z.aqi}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: '#0d1218' }}
        zoomControl={false}
        minZoom={4}
        maxZoom={18}
      >
        <TileLayer
          attribution="&copy; ESRI World Imagery"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        <MapController selectedCity={selectedCity} selectedZone={selectedZone} />

        {displayZones.map((zone) => {
          const colorHex = zone.color === 'red' ? '#ef4444' : zone.color === 'yellow' ? '#eab308' : '#10b981';
          const isSelected = selectedZone?.ward_name === zone.ward_name;
          
          return (
            <CircleMarker
              key={zone.ward_name + (selectedCity || "India")}
              center={[zone.lat, zone.lng]}
              radius={isSelected ? 18 : selectedCity ? 12 : 9}
              pathOptions={{
                color: colorHex,
                fillColor: colorHex,
                fillOpacity: isSelected ? 0.95 : 0.65,
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={{ click: () => handleMarkerClick(zone) }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.97}>
                <div style={{ fontFamily: 'monospace', padding: '2px 0', minWidth: 160 }}>
                  <div style={{ fontWeight: 'bold', color: colorHex, fontSize: 13 }}>
                    {zone.ward_name} {!selectedCity ? "🔍" : ""}
                  </div>
                  <div style={{ color: '#aaa', fontSize: 10 }}>{zone.state}</div>
                  <div style={{ color: '#ccc', fontSize: 11, marginTop: 4 }}>
                    Risk: <b style={{ color: colorHex }}>{zone.risk_score}/10</b>
                    &nbsp;•&nbsp;{zone.temperature}°C
                  </div>
                  <div style={{ color: '#888', fontSize: 10 }}>
                    AQI {zone.aqi} &nbsp;•&nbsp; Traffic {zone.traffic_density} v/h
                  </div>
                  {!selectedCity && (
                    <div style={{ color: '#666', fontSize: 9, marginTop: 4, fontStyle: 'italic' }}>
                      Click to drill into city areas
                    </div>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
