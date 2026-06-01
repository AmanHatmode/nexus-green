'use client';

import React from 'react';
import { DispatchEntry } from '@/lib/types';

interface DispatchBoardProps {
  dispatchLog: DispatchEntry[];
  onNewDeployment: () => void;
}

export default function DispatchBoard({ dispatchLog, onNewDeployment }: DispatchBoardProps) {
  return (
    <div className="pt-24 px-8 w-full h-full flex flex-col overflow-y-auto pb-10 custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Active Dispatch Operations</h2>
          <p className="text-slate-500 text-sm font-medium">
            Real-time status tracking of all field hydration units and medical response teams.
          </p>
        </div>
        <button
          onClick={onNewDeployment}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
        >
          New Deployment +
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#161b22] shadow-xl">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Active Units</div>
          <div className="text-3xl font-black text-white">{dispatchLog.filter(l => l.status === 'active').length}</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#161b22] shadow-xl">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Pending Approval</div>
          <div className="text-3xl font-black text-amber-500">{dispatchLog.filter(l => l.status === 'pending').length}</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#161b22] shadow-xl">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Today Completed</div>
          <div className="text-3xl font-black text-emerald-400">24</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#161b22] shadow-xl">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Mean Response</div>
          <div className="text-3xl font-black text-white">12<span className="text-sm opacity-40 ml-1">min</span></div>
        </div>
      </div>

      {/* Dispatch Table */}
      <div className="glass-panel rounded-2xl border border-white/5 bg-[#161b22] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dispatch ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Zone</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Unit Type</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Time</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {dispatchLog.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5 text-xs font-black text-emerald-400 font-mono tracking-widest">{log.id}</td>
                <td className="px-6 py-5">
                  <div className="text-xs font-bold text-white uppercase">{log.zone}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-xs text-slate-300 font-medium">{log.type}</div>
                </td>
                <td className="px-6 py-5 text-xs text-slate-400 font-mono">{log.time}</td>
                <td className="px-6 py-5">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].slice(0, log.units > 3 ? 3 : log.units).map(i => (
                      <div key={i} className="h-6 w-6 rounded-full border border-[#161b22] bg-slate-800 flex items-center justify-center text-[8px] font-black text-white uppercase">
                        U{i}
                      </div>
                    ))}
                    {log.units > 3 && (
                      <div className="h-6 w-6 rounded-full border border-[#161b22] bg-emerald-500 flex items-center justify-center text-[8px] font-black text-white">
                        +{log.units - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    log.status === 'active'
                      ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                      : log.status === 'pending'
                      ? 'text-amber-400 border-amber-500/20 bg-amber-500/5'
                      : 'text-slate-400 border-white/10 bg-white/5'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                    Abort
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
