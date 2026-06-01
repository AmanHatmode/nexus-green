'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { VisionResult } from '@/lib/types';

interface FieldReportsTabProps {
  visionFile: File | null;
  visionPreview: string | null;
  visionResult: VisionResult | null;
  isVisionLoading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVisionUpload: (e: React.FormEvent) => void;
}

export default function FieldReportsTab({
  visionFile,
  visionPreview,
  visionResult,
  isVisionLoading,
  onFileChange,
  onVisionUpload,
}: FieldReportsTabProps) {
  return (
    <div className="pt-24 px-8 w-full h-full flex flex-col overflow-y-auto pb-10 custom-scrollbar">
      <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight flex items-center gap-3">
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Computer Vision Field Analysis
      </h2>
      <p className="text-slate-500 text-sm max-w-2xl mb-10 font-medium">
        Upload field intelligence photographs for neural-network driven environmental risk assessment.
      </p>

      <div className="grid grid-cols-2 gap-8 max-w-6xl">
        {/* Upload Column */}
        <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-[#161b22] shadow-2xl flex flex-col">
          <form onSubmit={onVisionUpload} className="flex flex-col h-full">
            <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-widest">
              Photograph Uplink
            </label>

            {/* Drop Zone */}
            <div className="flex-1 min-h-[300px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center relative bg-black/40 hover:bg-black/60 transition-all cursor-pointer group mb-6 overflow-hidden">
              <input
                type="file"
                onChange={onFileChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {visionPreview ? (
                <Image
                  src={visionPreview}
                  alt="Field preview"
                  fill
                  className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="text-center p-6">
                  <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500/10 transition-all">
                    <svg className="w-8 h-8 text-slate-500 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <span className="text-slate-400 text-sm font-bold block">Select Field Image</span>
                  <span className="text-slate-600 text-[10px] uppercase font-black tracking-widest mt-2 block">JPEG / PNG / WEBP</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!visionFile || isVisionLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              {isVisionLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  Processing Neural Nodes...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Execute Vision Model
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Column */}
        <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-[#161b22] flex flex-col shadow-2xl min-h-[500px]">
          <h3 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-widest">Model Analysis Output</h3>

          {/* Idle State */}
          {!visionResult && !isVisionLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center px-10">
              <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="text-xs font-bold uppercase tracking-widest">Waiting for Intelligence Feed...</div>
            </div>
          )}

          {/* Loading State */}
          {isVisionLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-emerald-400 gap-4">
              <div className="h-10 w-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Scanning Pixels...</span>
            </div>
          )}

          {/* Success State */}
          {visionResult && visionResult.success && (
            <div className="flex-1 flex flex-col gap-8">
              {/* Labels */}
              <div>
                <div className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest">Neural Label Detection</div>
                <div className="flex flex-wrap gap-2">
                  {visionResult.labels?.map((label, i) => (
                    <span key={i} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black font-mono uppercase">
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/60 p-5 rounded-2xl border border-white/5">
                  <div className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Heat Score</div>
                  <div className={`text-3xl font-black ${(visionResult.heatRiskEstimate ?? 0) >= 7 ? 'text-red-500' : (visionResult.heatRiskEstimate ?? 0) >= 4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {visionResult.heatRiskEstimate ?? 'N/A'}<span className="text-sm opacity-40 ml-1">/10</span>
                  </div>
                </div>
                <div className="bg-black/60 p-5 rounded-2xl border border-white/5">
                  <div className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Safety Scan</div>
                  <div className={`text-3xl font-black flex items-center gap-2 ${visionResult.isSafe ? 'text-emerald-500' : 'text-red-500'}`}>
                    {visionResult.isSafe ? 'PASS' : 'FLAGGED'}
                  </div>
                </div>
              </div>

              {/* Warning */}
              {visionResult.warning && (
                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl text-[11px] text-amber-500/80 leading-relaxed italic font-medium">
                  <strong>Protocol Note:</strong> {visionResult.warning}
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {visionResult && !visionResult.success && (
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-xl text-red-500 text-xs font-bold text-center uppercase tracking-widest">
              {visionResult.error || 'Model Execution Failure'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
