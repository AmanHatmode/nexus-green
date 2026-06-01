'use client';

import React from 'react';
import { ZoneData } from '@/lib/constants';

// Module-level constant — stable, no useEffect deps issues
export const ALERT_POOL = [
  { zone: 'Sitabuldi',    msg: 'Surface temp crossed 47°C — vendor clearance protocol initiated.',        level: 'critical' },
  { zone: 'Itwari',       msg: 'AQI index at 224 — air quality RED alert issued.',                        level: 'critical' },
  { zone: 'Kamptee Road', msg: 'Freight density 508 v/h — emergency rerouting active.',                   level: 'warning'  },
  { zone: 'Dharampeth',   msg: 'Heat index at 43°C near Lata Mangeshkar Hospital — cool zone activated.', level: 'warning'  },
  { zone: 'Hingna MIDC',  msg: 'Particulate matter PM2.5 at 89 µg/m³ — factory shutdown order sent.',     level: 'critical' },
  { zone: 'Mahal',        msg: 'Crowd density exceeding 1,200/hectare — ORS distribution dispatched.',    level: 'warning'  },
  { zone: 'Ambazari',     msg: 'Lake evaporation causing 78% relative humidity spike — advisory issued.', level: 'info'     },
  { zone: 'Wadi',         msg: 'Rail crossing gridlock — 14-minute delay. Signal override requested.',    level: 'warning'  },
  { zone: 'Civil Lines',  msg: 'NMC Emergency Operations Centre notified of regional heat event.',        level: 'info'     },
  { zone: 'Gopal Nagar',  msg: 'Open drainage AQI spike detected — NMC sanitation team dispatched.',     level: 'warning'  },
] as const;

interface AlertTickerProps {
  tickerIndex: number;
  tickerVisible: boolean;
}

export default function AlertTicker({ tickerIndex, tickerVisible }: AlertTickerProps) {
  const alert = ALERT_POOL[tickerIndex];
  return (
    <div
      className={`flex-1 bg-black/40 border rounded-xl px-5 py-2.5 flex items-center gap-4 overflow-hidden transition-all duration-500 shadow-inner ${
        tickerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
      } ${
        alert.level === 'critical'
          ? 'border-red-500/40 glow-red'
          : alert.level === 'warning'
          ? 'border-amber-500/30 glow-amber'
          : 'border-emerald-500/20'
      }`}
    >
      <span
        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1.5 ${
          alert.level === 'critical'
            ? 'bg-red-600 text-white'
            : alert.level === 'warning'
            ? 'bg-amber-500 text-black'
            : 'bg-emerald-600 text-white'
        }`}
      >
        {alert.level === 'critical' ? '🔴 CRITICAL' : alert.level === 'warning' ? '⚠️ WARNING' : 'ℹ️ INFO'}
      </span>
      <span className="text-xs font-bold text-white shrink-0 tracking-wide uppercase opacity-90">
        {alert.zone}:
      </span>
      <span className="text-xs text-slate-300 truncate font-medium">{alert.msg}</span>
    </div>
  );
}
