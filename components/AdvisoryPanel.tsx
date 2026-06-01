'use client';

import React from 'react';
import { ZoneData } from '@/lib/constants';

interface AdvisoryPanelProps {
  selectedZone: ZoneData | null;
  displayedAdvisory: string;
  isTyping: boolean;
  isAdvisoryLoading: boolean;
  advisoryConfidence: number | null;
  dispatchMessage: string;
  dispatchStep: 1 | 2 | 3;
  isDispatching: boolean;
  onDispatchStep: () => void;
  onCancelDispatch: () => void;
}

export default function AdvisoryPanel({
  selectedZone,
  displayedAdvisory,
  isTyping,
  isAdvisoryLoading,
  advisoryConfidence,
  dispatchMessage,
  dispatchStep,
  isDispatching,
  onDispatchStep,
  onCancelDispatch,
}: AdvisoryPanelProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-[#161b22]/90 flex flex-col min-h-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          AI Live Advisory
        </h3>

        {/* Confidence Ring */}
        {advisoryConfidence !== null && (
          <div className="relative h-10 w-10 shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#222" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="16" fill="none"
                stroke={advisoryConfidence > 75 ? '#10b981' : advisoryConfidence > 50 ? '#f59e0b' : '#ef4444'}
                strokeWidth="3"
                strokeDasharray={`${advisoryConfidence}, 100`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">
              {advisoryConfidence}%
            </div>
          </div>
        )}
      </div>

      {/* Advisory Text Box */}
      <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex-1 overflow-y-auto max-h-48 mb-4 scrollbar-hide">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
            {selectedZone ? selectedZone.ward_name : 'System Idle'}
          </span>
          {selectedZone && (
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                selectedZone.color === 'red'
                  ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  : selectedZone.color === 'yellow'
                  ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                  : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
              }`}
            />
          )}
        </div>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
          {selectedZone && (
            <span className="text-emerald-400 font-black text-[10px] block mb-2 tracking-widest uppercase">
              Nexus-AI Protocol Output:
            </span>
          )}
          {displayedAdvisory}
          {isTyping && <span className="typewriter-cursor" />}
        </p>
      </div>

      {/* Dispatch Controls */}
      {selectedZone && (
        <div className="mt-auto">
          {dispatchMessage ? (
            <div className="text-xs font-black text-emerald-400 text-center py-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex items-center justify-center gap-2 animate-bounce">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              {dispatchMessage}
            </div>
          ) : dispatchStep === 2 ? (
            <div className="flex gap-2">
              <button
                onClick={onDispatchStep}
                disabled={isAdvisoryLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl transition-all border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                ✓ Confirm Deploy
              </button>
              <button
                onClick={onCancelDispatch}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 py-3.5 rounded-xl transition-all border border-white/5"
              >
                ✕ Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={onDispatchStep}
              disabled={isDispatching || isAdvisoryLoading}
              className="w-full bg-slate-800/50 hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-emerald-400 py-3.5 rounded-xl transition-all border border-emerald-500/20 hover:border-emerald-500/40 hover:text-white"
            >
              {isDispatching ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-3 w-3 border-2 border-emerald-400 border-t-transparent rounded-full" />
                  Processing...
                </span>
              ) : (
                'Approve & Dispatch Unit →'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
