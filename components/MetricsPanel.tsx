'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  ResponsiveContainer,
} from 'recharts';
import { ZoneData } from '@/lib/constants';

interface SparklinePoint {
  name: string;
  val: number;
}

interface MetricsPanelProps {
  selectedZone: ZoneData | null;
  isThermal: boolean;
  sparklineData: SparklinePoint[];
  displayedMetrics: { avg_temp: number; traffic_flow: number; agent_count: number };
  metricsUpdated: string[];
  onToggleThermal: () => void;
  onCloseZone: () => void;
  onOpenResourceModal: () => void;
}

export default function MetricsPanel({
  selectedZone,
  isThermal,
  sparklineData,
  displayedMetrics,
  metricsUpdated,
  onToggleThermal,
  onCloseZone,
  onOpenResourceModal,
}: MetricsPanelProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 col-span-2 flex flex-col justify-between bg-[#161b22]/95 transition-all duration-500 shadow-2xl">
      {selectedZone ? (
        /* ── Zone Detail View ── */
        <div className="flex h-full gap-6 min-h-[300px]">

          {/* Street View / Camera Column */}
          <div className="w-[62%] rounded-xl overflow-hidden relative border border-white/10 group bg-slate-900 shadow-2xl">
            <iframe
              src={`https://maps.google.com/maps?layer=c&cbll=${selectedZone.lat},${selectedZone.lng}&cbp=0,0,0,0,0&output=svembed`}
              className="w-full h-full absolute inset-0 opacity-100"
              frameBorder={0}
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
            />

            {/* Thermal Overlay */}
            {isThermal && (
              <>
                <div
                  className="absolute inset-0 z-20 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,0,0,0.55) 0%, rgba(255,100,0,0.45) 30%, rgba(255,200,0,0.3) 60%, rgba(0,100,255,0.25) 100%)',
                    mixBlendMode: 'multiply',
                  }}
                />
                <div
                  className="absolute inset-0 z-20 pointer-events-none"
                  style={{ backdropFilter: 'saturate(3) hue-rotate(300deg) contrast(1.4)' }}
                />
              </>
            )}

            {/* Camera HUD */}
            <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
              <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">
                  NMC Cam {selectedZone.ward_name.substring(0, 3).toUpperCase()}-{selectedZone.ward_name.length + 10}
                </span>
              </div>
              <button
                onClick={onToggleThermal}
                className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg backdrop-blur-md transition-all border ${
                  isThermal
                    ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_20px_rgba(255,100,0,0.6)]'
                    : 'bg-black/80 border-white/10 text-slate-300 hover:bg-black'
                }`}
              >
                {isThermal ? '🔥 Thermal Active' : '🌡️ Thermal View'}
              </button>
            </div>

            {/* Zone Name Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pt-12 pb-5 px-6 pointer-events-none z-10">
              <span className="text-white font-black text-3xl drop-shadow-2xl uppercase tracking-tighter">
                {selectedZone.ward_name}
              </span>
              <div className={`font-black text-[9px] uppercase tracking-[0.2em] drop-shadow-lg flex items-center gap-2 mt-1.5 ${isThermal ? 'text-orange-400' : 'text-emerald-400'}`}>
                <span className={`w-2 h-2 rounded-full ${isThermal ? 'bg-orange-500' : 'bg-emerald-500'} animate-pulse`} />
                {isThermal ? 'Calibrating Thermal Signature...' : 'Field Surveillance Uplink Stable'}
              </div>
            </div>
          </div>

          {/* Stats Column */}
          <div className="w-[38%] flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Zone Intelligence</h3>
              <button
                onClick={onCloseZone}
                className="text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md text-slate-400 transition-all"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* AQI */}
              <div className="bg-black/60 p-4 rounded-xl border border-white/5 relative overflow-hidden group">
                <div className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">AQI Index</div>
                <div className={`text-2xl font-black ${selectedZone.aqi > 150 ? 'text-red-500' : selectedZone.aqi > 100 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {selectedZone.aqi}
                </div>
                <div className="text-[8px] text-slate-500 mt-1 font-bold">5Y MAX: <span className="text-white">{selectedZone.hist_max_aqi ?? '—'}</span></div>
              </div>

              {/* Risk */}
              <div className="bg-black/60 p-4 rounded-xl border border-white/5 relative overflow-hidden">
                <div className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Risk Factor</div>
                <div className={`text-2xl font-black ${selectedZone.color === 'red' ? 'text-red-500' : selectedZone.color === 'yellow' ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {selectedZone.risk_score}<span className="text-sm opacity-50 ml-1">/10</span>
                </div>
                <div className={`absolute bottom-0 left-0 h-1 w-full ${selectedZone.color === 'red' ? 'bg-red-500' : selectedZone.color === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              </div>

              {/* Temp */}
              <div className="bg-black/60 p-4 rounded-xl border border-white/5 relative overflow-hidden">
                <div className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Heat Profile</div>
                <div className="text-2xl font-black text-white">{selectedZone.temperature}°C</div>
                <div className="text-[8px] text-slate-500 mt-1 font-bold">5Y MAX: <span className="text-white">{selectedZone.hist_max_temp ?? '—'}°C</span></div>
              </div>

              {/* Traffic */}
              <div className="bg-black/60 p-4 rounded-xl border border-white/5 relative overflow-hidden">
                <div className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Traffic</div>
                <div className="text-2xl font-black text-white">{selectedZone.traffic_density}</div>
                <div className="text-[8px] text-slate-500 mt-1 font-bold">VEH/HR</div>
              </div>
            </div>

            {/* 7-Day Sparkline */}
            <div className="flex-1 bg-black/60 p-4 rounded-xl border border-white/5 flex flex-col min-h-[120px]">
              <div className="text-[9px] text-slate-500 font-black mb-2 uppercase tracking-widest">7-Day Temp Sparkline</div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#sparklineGrad)" isAnimationActive={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between mt-2 px-1">
                {sparklineData.map((p, i) => (
                  <span key={i} className="text-[7px] font-black text-slate-600 uppercase">{p.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Network Metrics View (no zone selected) ── */
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Consolidated Network Metrics</h3>
              <p className="text-xs text-slate-500 font-medium">Real-time aggregate data across all monitored Indian city wards.</p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Load</div>
                <div className="text-sm font-bold text-emerald-400">NOMINAL (14ms)</div>
              </div>
              <div className="h-10 w-px bg-white/5" />
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Nodes</div>
                <div className="text-sm font-bold text-white">1,208 / 1,400</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 flex-1">
            {/* Avg Temp */}
            <div className={`bg-black/40 p-6 rounded-2xl border transition-all duration-700 relative overflow-hidden group ${metricsUpdated.includes('avg_temp') ? 'border-emerald-500/50 glow-green' : 'border-white/5'}`}>
              <div className="text-[10px] text-slate-500 font-black mb-1 uppercase tracking-widest">Average Temp</div>
              <div className="text-4xl font-black text-white mb-2">{displayedMetrics.avg_temp}°C</div>
              <div className="text-[9px] text-emerald-500/60 font-bold uppercase">Avg across 42 cities</div>
              {metricsUpdated.includes('avg_temp') && <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-2xl animate-pulse" />}
            </div>

            {/* Traffic */}
            <div className={`bg-black/40 p-6 rounded-2xl border transition-all duration-700 relative overflow-hidden group ${metricsUpdated.includes('traffic_flow') ? 'border-emerald-500/50 glow-green' : 'border-white/5'}`}>
              <div className="text-[10px] text-slate-500 font-black mb-1 uppercase tracking-widest">Traffic Index</div>
              <div className="text-4xl font-black text-white mb-2">{displayedMetrics.traffic_flow}%</div>
              <div className="text-[9px] text-emerald-500/60 font-bold uppercase">Network optimization: active</div>
              {metricsUpdated.includes('traffic_flow') && <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-2xl animate-pulse" />}
            </div>

            {/* Agent Count */}
            <div className={`bg-black/40 p-6 rounded-2xl border transition-all duration-700 relative overflow-hidden group ${metricsUpdated.includes('agent_count') ? 'border-emerald-500/50 glow-green' : 'border-white/5'}`}>
              <div className="text-[10px] text-slate-500 font-black mb-1 uppercase tracking-widest">Field Personnel</div>
              <div className="text-4xl font-black text-white mb-2">{displayedMetrics.agent_count}</div>
              <div className="text-[9px] text-emerald-500/60 font-bold uppercase">Ready for deployment</div>
              {metricsUpdated.includes('agent_count') && <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-2xl animate-pulse" />}
            </div>

            {/* Register Personnel CTA */}
            <button
              onClick={onOpenResourceModal}
              className="bg-emerald-500/5 hover:bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20 flex flex-col justify-center items-center transition-all group cursor-pointer border-dashed"
            >
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-all">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Register Personnel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
