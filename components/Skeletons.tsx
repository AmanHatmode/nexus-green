'use client';

import React from 'react';

// ── Shared shimmer keyframe (injected once via a style tag) ───────────────────
// We use a CSS-in-JS style tag so Tailwind doesn't need to know about
// the custom keyframe, keeping everything self-contained.
const shimmerStyle = `
  @keyframes nx-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  .nx-shimmer {
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.03) 25%,
      rgba(255,255,255,0.08) 50%,
      rgba(255,255,255,0.03) 75%
    );
    background-size: 800px 100%;
    animation: nx-shimmer 1.6s infinite linear;
  }
`;

function ShimmerStyle() {
  return <style>{shimmerStyle}</style>;
}

/** A single shimmer block */
function Shimmer({ className = '' }: { className?: string }) {
  return <div className={`nx-shimmer rounded-lg ${className}`} />;
}

// ── Map Skeleton ──────────────────────────────────────────────────────────────

export function MapSkeleton() {
  return (
    <div className="absolute inset-0 z-0 pt-20 bg-[#0d1117]">
      <ShimmerStyle />

      {/* Map canvas placeholder */}
      <div className="w-full h-full relative overflow-hidden">
        <Shimmer className="absolute inset-0 rounded-none" />

        {/* Fake map grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#10b981" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Fake zone pins */}
        {[
          { top: '30%', left: '40%' },
          { top: '45%', left: '55%' },
          { top: '60%', left: '35%' },
          { top: '38%', left: '65%' },
          { top: '55%', left: '70%' },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 rounded-full border-2 border-emerald-500/30 bg-emerald-500/10 nx-shimmer"
            style={{ top: pos.top, left: pos.left }}
          />
        ))}

        {/* Centre loading indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <div className="h-10 w-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 animate-pulse">
            Initialising Map Feed...
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Advisory Panel Skeleton ───────────────────────────────────────────────────

export function AdvisoryPanelSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-[#161b22]/90 flex flex-col min-h-[360px]">
      <ShimmerStyle />
      <div className="flex items-center justify-between mb-4">
        <Shimmer className="h-5 w-36" />
        <Shimmer className="h-10 w-10 rounded-full" />
      </div>
      <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex-1 mb-4 space-y-2">
        <Shimmer className="h-3 w-24 mb-3" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-[90%]" />
        <Shimmer className="h-3 w-[75%]" />
        <Shimmer className="h-3 w-[85%]" />
        <Shimmer className="h-3 w-[60%]" />
      </div>
      <Shimmer className="h-12 w-full rounded-xl" />
    </div>
  );
}

// ── Metrics Panel Skeleton ────────────────────────────────────────────────────

export function MetricsPanelSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 col-span-2 bg-[#161b22]/95 shadow-2xl">
      <ShimmerStyle />
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Shimmer className="h-5 w-56" />
          <Shimmer className="h-3 w-80" />
        </div>
        <div className="flex gap-4">
          <Shimmer className="h-10 w-28 rounded-xl" />
          <Shimmer className="h-10 w-28 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-3">
            <Shimmer className="h-3 w-20" />
            <Shimmer className="h-10 w-28" />
            <Shimmer className="h-2 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
