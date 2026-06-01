'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { ForecastEntry } from '@/lib/types';

interface ForecastTabProps {
  forecastData: ForecastEntry[];
  isForecastLoading: boolean;
}

export default function ForecastTab({ forecastData, isForecastLoading }: ForecastTabProps) {
  return (
    <div className="pt-24 px-8 w-full h-full flex flex-col overflow-y-auto pb-10 custom-scrollbar">
      <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2 uppercase tracking-tight">
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Predictive Heat Forecast
      </h2>
      <p className="text-slate-500 text-sm max-w-2xl mb-8 font-medium">
        AI-driven meteorological predictions highlighting upcoming heat spikes and critical resource deployment risk windows over the next 7 days.
      </p>

      {isForecastLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-emerald-400 gap-4">
          <div className="h-12 w-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">Running Neural Models...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-8 max-w-6xl pb-20">

          {/* Temperature Area Chart */}
          <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-[#161b22] h-[450px] flex flex-col shadow-2xl">
            <h3 className="text-xs font-black text-white mb-6 uppercase tracking-[0.2em]">Temperature Trend Projection (°C)</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUrb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="label" stroke="#444" tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis stroke="#444" tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} domain={['auto', 'auto']} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Area type="monotone" name="Industrial Zones" dataKey="industrial_zone" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorInd)" />
                  <Area type="monotone" name="Urban Core" dataKey="urban_core" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorUrb)" />
                  <Area type="monotone" name="Green Corridors" dataKey="green_belt" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorGreen)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Bar Chart */}
          <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-[#161b22] h-[300px] flex flex-col shadow-2xl">
            <h3 className="text-xs font-black text-white mb-6 uppercase tracking-[0.2em]">Heat Danger Risk Index</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="label" stroke="#444" tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis stroke="#444" tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} domain={[0, 10]} />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '12px' }} />
                  <Bar dataKey="risk_score" name="Risk Level" radius={[6, 6, 0, 0]} barSize={40}>
                    {forecastData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.risk_score >= 7 ? '#ef4444' : entry.risk_score >= 4 ? '#f59e0b' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
