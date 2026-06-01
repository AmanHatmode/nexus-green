'use client';

import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import { INDIA_CITIES, ZoneData } from '@/lib/constants';

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

interface MapProps {
  onZoneClick: (zone: ZoneData) => void;
  selectedZone?: ZoneData | null;
  /** Called once after the Leaflet map finishes initialising — used to swap skeleton → real map */
  onMapReady?: () => void;
}

/** Fires onMapReady once after Leaflet emits its first 'load' event */
function WhenReady({ onReady }: { onReady?: () => void }) {
  useMapEvents({
    load: () => {
      onReady?.();
    },
  });
  // Fallback: also fire on first render inside the map (handles cached tiles case)
  const map = useMap();
  useEffect(() => {
    if (!onReady) return;
    // If tiles already loaded synchronously, fire immediately
    const timeout = setTimeout(() => onReady(), 300);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
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

export default function Map({ onZoneClick, selectedZone, onMapReady }: MapProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [liveWards, setLiveWards] = useState<ZoneData[] | null>(null);
  const [wardsLoading, setWardsLoading] = useState(false);
  const [hoveredWard, setHoveredWard] = useState<string | null>(null);
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
              const isHovered = hoveredWard === z.ward_name;
              return (
                <div
                  key={z.ward_name}
                  className="px-3 py-2 border-b border-white/5 flex flex-col transition-colors cursor-pointer hover:bg-white/5"
                  onMouseEnter={() => setHoveredWard(z.ward_name)}
                  onMouseLeave={() => setHoveredWard(null)}
                  onClick={() => onZoneClick(z)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{z.ward_name}</div>
                      <div className="text-[10px] text-white/45">Risk {z.risk_score}/10</div>
                    </div>
                    <div className="text-[10px] font-bold shrink-0 text-right" style={{ color: hex }}>
                      {z.temperature}°C | AQI {z.aqi}
                    </div>
                  </div>
                  {isHovered && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <div className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Risk Score</div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(z.risk_score / 10) * 100}%`, backgroundColor: hex }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] mt-1">
                        <span className="text-white/30">0</span>
                        <span className="font-bold" style={{ color: hex }}>{z.risk_score} / 10</span>
                        <span className="text-white/30">10</span>
                      </div>
                    </div>
                  )}
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
        <WhenReady onReady={onMapReady} />

        {displayZones.map((zone) => {
          const colorHex = zone.color === 'red' ? '#ef4444' : zone.color === 'yellow' ? '#eab308' : '#10b981';
          const isSelected = selectedZone?.ward_name === zone.ward_name;
          
          return (
            <React.Fragment key={zone.ward_name + (selectedCity || 'India')}>
              {zone.color === 'red' && (
                <>
                  <CircleMarker
                    center={[zone.lat, zone.lng]}
                    radius={(isSelected ? 18 : (selectedCity ? 12 : 9)) + 8}
                    pathOptions={{
                      color: '#ef4444',
                      fillOpacity: 0,
                      weight: 2,
                      className: 'leaflet-pulse-ring',
                    }}
                    interactive={false}
                  />
                </>
              )}
            <CircleMarker
              key={zone.ward_name + '_main'}
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
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
