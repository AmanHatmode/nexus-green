'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import nextDynamic from 'next/dynamic';
import jsPDF from 'jspdf';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

import OfficerAccess from '@/components/OfficerAccess';
import AdvisoryPanel from '@/components/AdvisoryPanel';
import MetricsPanel from '@/components/MetricsPanel';
import AlertTicker, { ALERT_POOL } from '@/components/AlertTicker';
import DispatchBoard from '@/components/DispatchBoard';
import ForecastTab from '@/components/ForecastTab';
import FieldReportsTab from '@/components/FieldReportsTab';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ToastProvider, useToast } from '@/components/Toast';
import { MapSkeleton, AdvisoryPanelSkeleton, MetricsPanelSkeleton } from '@/components/Skeletons';

import { INDIA_CITIES, ZoneData } from '@/lib/constants';
import { VisionResult, ForecastEntry, DispatchEntry } from '@/lib/types';

// Dynamic import for Map to avoid SSR issues
const Map = nextDynamic(() => import('@/components/Map'), { ssr: false });

// ── LiveClock (tiny self-contained component) ─────────────────────────────────
const LiveClock = () => {
  const [currentDate, setCurrentDate] = useState('');
  useEffect(() => {
    const fmt = (d: Date) => {
      const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      const day = String(d.getDate()).padStart(2, '0');
      const mon = months[d.getMonth()];
      const yr  = d.getFullYear();
      const hh  = String(d.getHours()).padStart(2, '0');
      const mm  = String(d.getMinutes()).padStart(2, '0');
      const ss  = String(d.getSeconds()).padStart(2, '0');
      return `${day} ${mon} ${yr} · ${hh}:${mm}:${ss} IST`;
    };
    setCurrentDate(fmt(new Date()));
    const timer = setInterval(() => setCurrentDate(fmt(new Date())), 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className="font-mono font-bold text-emerald-400/80">{currentDate || 'CALIBRATING...'}</span>;
};

// ── Dashboard (orchestration layer only) ──────────────────────────────────────
// Inner component so it can consume ToastContext provided by the wrapper below.
function DashboardInner() {
  const { addToast } = useToast();
  // ── Auth ───────────────────────────────────────────────────────────────────
  const [isOfficerAuthorized, setIsOfficerAuthorized] = useState(false);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'map' | 'forecast' | 'reports' | 'heatanalysis' | 'dispatchboard'>('map');

  // ── Global Metrics ─────────────────────────────────────────────────────────
  const [metrics, setMetrics] = useState({ avg_temp: 0, traffic_flow: 0, agent_count: 0 });
  const [displayedMetrics, setDisplayedMetrics] = useState({ avg_temp: 0, traffic_flow: 0, agent_count: 0 });
  const [metricsUpdated, setMetricsUpdated] = useState<string[]>([]);
  const [isMetricsLoading, setIsMetricsLoading] = useState(true);

  // ── Map readiness ───────────────────────────────────────────────────────────
  // Map component is dynamically imported; we show a skeleton until it mounts.
  const [isMapReady, setIsMapReady] = useState(false);

  // ── Zone / Advisory ────────────────────────────────────────────────────────
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [advisoryText, setAdvisoryText] = useState('Select a critical zone on the map to generate AI advisory.');
  const [displayedAdvisory, setDisplayedAdvisory] = useState('Select a critical zone on the map to generate AI advisory.');
  const [isAdvisoryLoading, setIsAdvisoryLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [advisoryConfidence, setAdvisoryConfidence] = useState<number | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Dispatch ───────────────────────────────────────────────────────────────
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [dispatchStep, setDispatchStep] = useState<1 | 2 | 3>(1);
  const [dispatchLog, setDispatchLog] = useState<DispatchEntry[]>([
    { id: 'D-001', zone: 'Sitabuldi',    units: 4, status: 'active',  time: '10:24 IST', type: 'Hydration Unit'   },
    { id: 'D-002', zone: 'Itwari',       units: 2, status: 'active',  time: '10:31 IST', type: 'Medical Response' },
    { id: 'D-003', zone: 'Kamptee Road', units: 3, status: 'pending', time: '10:45 IST', type: 'Traffic Control'  },
  ]);

  // ── Vision ─────────────────────────────────────────────────────────────────
  const [visionFile, setVisionFile] = useState<File | null>(null);
  const [visionPreview, setVisionPreview] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const [isVisionLoading, setIsVisionLoading] = useState(false);

  // ── Forecast ───────────────────────────────────────────────────────────────
  const [forecastData, setForecastData] = useState<ForecastEntry[]>([]);
  const [isForecastLoading, setIsForecastLoading] = useState(false);

  // ── Map extras ─────────────────────────────────────────────────────────────
  const [isThermal, setIsThermal] = useState(false);

  // ── Alert Ticker ───────────────────────────────────────────────────────────
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);

  // ── Command Log (SSR-safe) ─────────────────────────────────────────────────
  const logTimeInitRef = useRef(false);
  const [commandLog, setCommandLog] = useState<{ time: string; msg: string; type: string }[]>([
    { time: '', msg: 'NexusGreen Command System initialized.', type: 'info'    },
    { time: '', msg: 'Officer NMC-NEXUS-001 authenticated.',   type: 'success' },
  ]);

  // ── Search ─────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // ── Resource Modal ─────────────────────────────────────────────────────────
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resourceForm, setResourceForm] = useState({ name: '', badge_id: '' });
  const [isResourceAdding, setIsResourceAdding] = useState(false);

  // ── Memoised Data ──────────────────────────────────────────────────────────
  const scatterData = useMemo(() => INDIA_CITIES.map(c => ({ ...c, x: c.temperature, y: c.aqi })), []);

  const sparklineData = useMemo(() => {
    if (!selectedZone) return [];
    const seed = selectedZone.ward_name.length;
    const base = selectedZone.temperature;
    return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => ({
      name: d,
      val: Math.round((base + Math.sin((seed + i) * 1.5) * 3 + Math.cos(seed * i) * 1.5) * 10) / 10,
    }));
  }, [selectedZone]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const addLog = useCallback((msg: string, type: 'info' | 'warn' | 'success' | 'critical') => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setCommandLog(prev => [{ time, msg, type }, ...prev].slice(0, 12));
  }, []);

  const animateCountUp = useCallback((target: number, key: 'avg_temp' | 'traffic_flow' | 'agent_count') => {
    const duration = 1500;
    const startTime = performance.now();
    const frame = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedMetrics(prev => ({ ...prev, [key]: Math.round(target * eased) }));
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setMetricsUpdated(prev => [...prev, key]);
        setTimeout(() => setMetricsUpdated(prev => prev.filter(k => k !== key)), 2000);
      }
    };
    requestAnimationFrame(frame);
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────

  // Fix SSR hydration on command log timestamps
  useEffect(() => {
    if (!logTimeInitRef.current) {
      logTimeInitRef.current = true;
      const now = new Date();
      const fmt = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCommandLog([
        { time: fmt(now),                               msg: 'NexusGreen Command System initialized.', type: 'info'    },
        { time: fmt(new Date(now.getTime() - 3000)),    msg: 'Officer NMC-NEXUS-001 authenticated.',   type: 'success' },
      ]);
    }
  }, []);

  // Alert ticker rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerVisible(false);
      setTimeout(() => {
        setTickerIndex(i => (i + 1) % ALERT_POOL.length);
        setTickerVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch metrics + forecast on mount
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res  = await fetch('/api/metrics');
        const data = await res.json();
        if (data.success) {
          setMetrics(data);
          animateCountUp(data.avg_temp,     'avg_temp');
          animateCountUp(data.traffic_flow, 'traffic_flow');
          animateCountUp(data.agent_count,  'agent_count');
        }
      } catch (err) {
        console.error('Failed to fetch metrics', err);
        addToast('Could not load city metrics. Retrying in 60 s.', 'warning');
      } finally {
        setIsMetricsLoading(false);
      }
    }
    async function fetchForecast() {
      setIsForecastLoading(true);
      try {
        const res  = await fetch('/api/forecast?t=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        if (data.success) setForecastData(data.data);
      } catch (err) {
        console.error('Failed to fetch forecast', err);
        addToast('Forecast data unavailable. Check your connection.', 'error');
      }
      setIsForecastLoading(false);
    }
    fetchMetrics();
    fetchForecast();
    const interval = setInterval(fetchMetrics, 60_000);
    return () => clearInterval(interval);
  }, [animateCountUp, addToast]);

  // Typewriter effect — fires whenever advisoryText changes
  useEffect(() => {
    if (!advisoryText) return;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    setIsTyping(true);
    setDisplayedAdvisory('');
    let i = 0;
    typingIntervalRef.current = setInterval(() => {
      i++;
      setDisplayedAdvisory(advisoryText.slice(0, i));
      if (i >= advisoryText.length) {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        setIsTyping(false);
      }
    }, 14);
    return () => { if (typingIntervalRef.current) clearInterval(typingIntervalRef.current); };
  }, [advisoryText]);

  // ── API Handlers ───────────────────────────────────────────────────────────

  const handleZoneClick = async (zone: ZoneData) => {
    setSelectedZone(zone);
    setAdvisoryText('Generating classified field advisory...');
    setIsAdvisoryLoading(true);
    setAdvisoryConfidence(null);
    setDispatchMessage('');
    setDispatchStep(1);
    setIsThermal(false);
    addLog(
      `SCAN INITIATED — Zone: ${zone.ward_name} | Risk: ${zone.risk_score}/10 | Temp: ${zone.temperature}°C`,
      zone.risk_score >= 7 ? 'critical' : zone.risk_score >= 4 ? 'warn' : 'info',
    );
    try {
      const res  = await fetch('/api/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ward_name:        zone.ward_name,
          city:             zone.state || 'India',
          temperature:      zone.temperature,
          aqi:              zone.aqi,
          traffic_density:  zone.traffic_density,
          risk_score:       zone.risk_score,
          hist_max_temp:    zone.hist_max_temp ?? null,
          hist_max_aqi:     zone.hist_max_aqi  ?? null,
        }),
      });
      const data = await res.json();
      if (data.advisory) {
        setAdvisoryText(data.advisory);
        const rawConf = Math.round(100 - (zone.risk_score / 10) * 40 - ((zone.temperature - 30) / 20) * 30);
        setAdvisoryConfidence(Math.max(35, Math.min(95, rawConf)));
      } else {
        throw new Error('No advisory in response');
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setAdvisoryText(
        `⚠️ Advisory generation failed for ${zone.ward_name}.\n\nPossible causes:\n• Gemini API quota exceeded\n• Network timeout\n\nDetails: ${msg}\n\nPlease select another zone or try again.`,
      );
      addToast(`Advisory failed for ${zone.ward_name}. Check API connectivity.`, 'error');
    } finally {
      setIsAdvisoryLoading(false);
      addLog(`Advisory generated for ${zone.ward_name}.`, 'success');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setAdvisoryText('Generating classified field advisory for searched location...');
    setIsAdvisoryLoading(true);
    try {
      const geoRes  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', India')}`);
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        const { lat, lon, display_name } = geoData[0];
        const temp    = Math.round((35 + Math.random() * 10) * 10) / 10;
        const aqi     = Math.round(100 + Math.random() * 150);
        const traffic = Math.round(200 + Math.random() * 500);
        let tw = 3; if (temp > 40) tw = 10; else if (temp >= 35) tw = 6;
        let aw = 3; if (aqi  > 200) aw = 10; else if (aqi  >= 150) aw = 6;
        let rw = 3; if (traffic > 500) rw = 10; else if (traffic >= 300) rw = 6;
        const risk_score = Math.round(((tw * 0.4) + (aw * 0.3) + (rw * 0.3)) * 10) / 10;
        let color = 'green'; if (risk_score >= 7) color = 'red'; else if (risk_score >= 4) color = 'yellow';
        const zoneName = display_name.split(',')[0];
        const zone: ZoneData = {
          ward_name:      zoneName,
          state:          'India',
          lat:            parseFloat(lat),
          lng:            parseFloat(lon),
          temperature:    temp,
          aqi:            aqi,
          traffic_density: traffic,
          risk_score:     risk_score,
          color:          color,
          last_updated:   new Date().toISOString(),
          hist_max_temp:  Math.round((temp + 3 + Math.random() * 3) * 10) / 10,
          hist_max_aqi:   Math.round(aqi + 30 + Math.random() * 50),
          hist_max_risk:  Math.min(10, Math.round((risk_score + 1) * 10) / 10),
        };
        setActiveTab('map');
        setSelectedZone(zone);
        addLog(`SCAN INITIATED — Zone: ${zoneName} | Risk: ${risk_score}/10 | Temp: ${temp}°C`, risk_score >= 7 ? 'critical' : risk_score >= 4 ? 'warn' : 'info');
        fetch('/api/advisory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ward_name: zone.ward_name, city: 'India', temperature: zone.temperature, aqi: zone.aqi, traffic_density: zone.traffic_density, risk_score: zone.risk_score, hist_max_temp: zone.hist_max_temp, hist_max_aqi: zone.hist_max_aqi }),
        }).then(r => r.json()).then(d => {
          if (d.advisory) setAdvisoryText(d.advisory);
          else {
            setAdvisoryText('⚠️ Advisory generation failed. Please try again.');
            addToast('Advisory unavailable for this location.', 'error');
          }
          setIsAdvisoryLoading(false);
          addLog(`Advisory generated for ${zoneName}.`, 'success');
        }).catch(() => {
          setAdvisoryText('⚠️ Network error — could not generate advisory.');
          addToast('Network error while generating advisory.', 'error');
          setIsAdvisoryLoading(false);
        });
      } else {
        addToast('Location not found in India. Try a different search term.', 'warning');
        setIsAdvisoryLoading(false);
        setAdvisoryText('Location not found. Try searching a different city or ward name.');
      }
    } catch (e) {
      console.error(e);
      setIsAdvisoryLoading(false);
      setAdvisoryText('⚠️ Network error during search. Please check your connection.');
      addToast('Search failed — network error.', 'error');
    }
    setIsSearching(false);
  };

  const handleDispatchStep = async () => {
    if (!selectedZone) return;
    if (dispatchStep === 1) { setDispatchStep(2); return; }
    if (dispatchStep === 2) {
      setDispatchStep(3);
      setIsDispatching(true);
      try {
        const res  = await fetch('/api/dispatch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ward_name: selectedZone.ward_name }) });
        const data = await res.json();
        if (data.success) {
          setMetrics(prev => ({ ...prev, agent_count: prev.agent_count + 3 }));
          setDisplayedMetrics(prev => ({ ...prev, agent_count: prev.agent_count + 3 }));
          setDispatchMessage(`✅ 3 UNITS DEPLOYED TO ${selectedZone.ward_name.toUpperCase()}`);
          addLog(`DISPATCH APPROVED — 3 Field Units deployed to ${selectedZone.ward_name}.`, 'success');
          addToast(`3 units successfully deployed to ${selectedZone.ward_name}.`, 'success');
          setTimeout(() => { setDispatchStep(1); setDispatchMessage(''); }, 3000);
        } else {
          setDispatchMessage('Dispatch rejected by server.');
          addLog(`DISPATCH REJECTED for ${selectedZone.ward_name}.`, 'critical');
          addToast(`Dispatch rejected for ${selectedZone.ward_name}. Server refused the request.`, 'error');
          setTimeout(() => { setDispatchStep(1); setDispatchMessage(''); }, 3000);
        }
      } catch {
        setDispatchMessage('Dispatch failed — network error.');
        addLog(`DISPATCH FAILED for ${selectedZone.ward_name}.`, 'critical');
        addToast(`Dispatch failed for ${selectedZone.ward_name}. Check your connection.`, 'error');
        setDispatchStep(1);
      }
      setIsDispatching(false);
    }
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.text('Nexus-Green Urban Report', 20, 20);
    doc.setFontSize(14); doc.text(`Date: ${new Date().toLocaleString()}`, 20, 30);
    doc.text(`Average City Temp: ${metrics.avg_temp}°C`, 20, 45);
    doc.text(`Overall Traffic Flow: ${metrics.traffic_flow}%`, 20, 55);
    doc.text(`Active Field Agents: ${metrics.agent_count}`, 20, 65);
    if (selectedZone) {
      doc.text(`-- Focused Area: ${selectedZone.ward_name} --`, 20, 85);
      doc.text(`Temp: ${selectedZone.temperature}°C | AQI: ${selectedZone.aqi}`, 20, 95);
      doc.setFontSize(11);
      doc.text(doc.splitTextToSize(`Advisory: ${advisoryText}`, 170), 20, 105);
    }
    doc.save('nexus-green-report.pdf');
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResourceAdding(true);
    try {
      const res = await fetch('/api/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: resourceForm.name, badge_id: resourceForm.badge_id, zone: 'Unassigned' }) });
      if (res.ok) { setIsResourceModalOpen(false); setResourceForm({ name: '', badge_id: '' }); setMetrics(prev => ({ ...prev, agent_count: prev.agent_count + 1 })); }
    } catch (err) { console.error(err); }
    setIsResourceAdding(false);
  };

  const handleVisionUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visionFile) return;
    setIsVisionLoading(true);
    setVisionResult(null);
    const formData = new FormData();
    formData.append('photo', visionFile);
    try {
      const res  = await fetch('/api/cloud-vision', { method: 'POST', body: formData });
      const data = await res.json();
      setVisionResult(data);
    } catch {
      setVisionResult({ success: false, error: 'Network error generating vision report.' });
    }
    setIsVisionLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setVisionFile(file); setVisionPreview(URL.createObjectURL(file)); setVisionResult(null); }
  };

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!isOfficerAuthorized) {
    return <OfficerAccess onAuthorize={() => setIsOfficerAuthorized(true)} />;
  }

  // Skeleton shown until the dynamically-loaded Map signals it is ready
  const showMapSkeleton = !isMapReady;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="flex h-screen w-full bg-[#0a0a0a] text-slate-200 font-sans">

      {/* ── Sidebar ── */}
      <aside className="w-64 border-r border-[#222] bg-[#111] p-5 flex flex-col justify-between z-20 overflow-hidden shadow-2xl">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 rounded bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center font-bold text-white text-lg">N</div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Nexus<span className="text-emerald-400">Green</span></h1>
          </div>

          {/* Nav */}
          <nav className="space-y-1 mb-8">
            {([
              { id: 'map',           label: 'Live Map',      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { id: 'heatanalysis',  label: 'Heat Analysis', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 3 3 4.5 5 4.5 8 0 3-1.5 5-1.5 5s2-4 4-4a8 8 0 011.657 10.657z' },
              { id: 'dispatchboard',label: 'Dispatch Board', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z' },
              { id: 'forecast',      label: '7-Day Forecast',icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'reports',       label: 'Field Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            ] as const).map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-[#222] text-slate-500 hover:text-slate-300'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon} />
                </svg>
                {label}
              </button>
            ))}
          </nav>

          {/* Command Log */}
          <div className="border-t border-[#222] pt-6">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              Incident Log
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
              {commandLog.map((log, i) => (
                <div key={i} className="text-[10px] leading-tight border-l border-[#222] pl-3 py-0.5">
                  <div className="text-slate-600 font-mono mb-0.5">{log.time}</div>
                  <div className={log.type === 'critical' ? 'text-red-400 font-bold' : log.type === 'warn' ? 'text-amber-400 font-bold' : log.type === 'success' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{log.msg}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="border-t border-[#222] pt-4 mt-4">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-3">System Status</div>
          <div className="space-y-2">
            {([
              { label: 'GEMINI API',   color: 'emerald', status: 'ONLINE'  },
              { label: 'OPEN-METEO',   color: 'emerald', status: 'LIVE'    },
              { label: 'FIREBASE',     color: 'amber',   status: 'STANDBY' },
            ] as const).map(({ label, color, status }) => (
              <div key={label} className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">{label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 bg-${color}-500 rounded-full animate-pulse`} />
                  <span className={`text-${color}-500 font-bold`}>{status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <section className="flex-1 flex flex-col relative overflow-hidden">

        {/* Top Header */}
        <header className="h-20 border-b border-[#222] flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-md z-20 absolute top-0 w-full gap-4">
          <div className="shrink-0 flex items-center gap-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white uppercase">Indian Heat &amp; Traffic</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <LiveClock />
              </p>
            </div>

            {/* Threat Level Badge */}
            {(() => {
              const redCount = INDIA_CITIES.filter(c => c.color === 'red').length;
              let level = 'MODERATE', col = 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10', pulse = '';
              if (redCount >= 15) { level = 'SEVERE'; col = 'text-red-500 border-red-500/30 bg-red-500/10'; pulse = 'animate-pulse'; }
              else if (redCount >= 8) { level = 'HIGH'; col = 'text-amber-500 border-amber-500/30 bg-amber-500/10'; }
              return (
                <div className={`px-3 py-1.5 border rounded-lg flex flex-col items-center justify-center min-w-[100px] ${col} ${pulse}`}>
                  <span className="text-[8px] font-black tracking-[0.2em] uppercase leading-none mb-0.5 opacity-70">Threat Level</span>
                  <span className="text-xs font-black tracking-widest leading-none">{level}</span>
                </div>
              );
            })()}

            {/* Search */}
            <form onSubmit={handleSearch} className="flex border border-[#333] rounded-lg overflow-hidden focus-within:border-emerald-500 bg-black/50 group transition-all">
              <input type="text" placeholder="Search City Ward in India..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent text-sm text-white px-4 py-2 focus:outline-none w-[220px] lg:w-[300px] placeholder:text-slate-600 font-medium" />
              <button type="submit" disabled={isSearching} className="bg-[#222] hover:bg-[#333] px-3 py-2 text-emerald-400 transition-colors flex items-center justify-center min-w-[50px] border-l border-[#333]">
                {isSearching
                  ? <span className="animate-spin h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full" />
                  : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                }
              </button>
            </form>
          </div>

          {/* Alert Ticker */}
          <AlertTicker tickerIndex={tickerIndex} tickerVisible={tickerVisible} />

          <button onClick={handleGeneratePDF} className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-400/20 active:scale-95">
            Generate PDF Report
          </button>
        </header>

        {/* ── Map Tab ── */}
        {activeTab === 'map' && (
          <>
            {/* Map skeleton shown until the dynamic import resolves */}
            {showMapSkeleton && <MapSkeleton />}

            <div className={`absolute inset-0 z-0 pt-20 transition-opacity duration-500 ${isMapReady ? 'opacity-100' : 'opacity-0'}`}>
              <Map
                onZoneClick={handleZoneClick}
                selectedZone={selectedZone}
                onMapReady={() => setIsMapReady(true)}
              />
            </div>

            <div className="pt-24 px-8 pb-8 z-10 w-full h-full flex flex-col justify-end pointer-events-none">
              <div className="grid grid-cols-3 gap-6 pointer-events-auto shadow-2xl">
                {isMapReady ? (
                  <AdvisoryPanel
                    selectedZone={selectedZone}
                    displayedAdvisory={displayedAdvisory}
                    isTyping={isTyping}
                    isAdvisoryLoading={isAdvisoryLoading}
                    advisoryConfidence={advisoryConfidence}
                    dispatchMessage={dispatchMessage}
                    dispatchStep={dispatchStep}
                    isDispatching={isDispatching}
                    onDispatchStep={handleDispatchStep}
                    onCancelDispatch={() => setDispatchStep(1)}
                  />
                ) : (
                  <AdvisoryPanelSkeleton />
                )}
                {isMetricsLoading && !selectedZone ? (
                  <MetricsPanelSkeleton />
                ) : (
                  <MetricsPanel
                    selectedZone={selectedZone}
                    isThermal={isThermal}
                    sparklineData={sparklineData}
                    displayedMetrics={displayedMetrics}
                    metricsUpdated={metricsUpdated}
                    onToggleThermal={() => setIsThermal(t => !t)}
                    onCloseZone={() => setSelectedZone(null)}
                    onOpenResourceModal={() => setIsResourceModalOpen(true)}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Heat Analysis Tab ── */}
        {activeTab === 'heatanalysis' && (
          <div className="pt-24 px-8 w-full h-full flex flex-col overflow-y-auto pb-10 custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">City-Wide Heat Analysis</h2>
                <p className="text-slate-500 text-sm font-medium">Cross-metric correlation between temperature, population density, and vegetation cover.</p>
              </div>
              <div className="flex gap-2">
                <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
                  <div className="text-[9px] text-red-400 font-black uppercase tracking-widest mb-0.5">Critical Hotspots</div>
                  <div className="text-xl font-black text-white">14 Wards</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                  <div className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mb-0.5">Mitigation Active</div>
                  <div className="text-xl font-black text-white">68% Area</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Scatter chart */}
              <div className="col-span-2 glass-panel p-6 rounded-2xl border border-white/5 bg-[#161b22] h-[450px] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Heat vs AQI Correlation</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[9px] text-slate-500 font-bold uppercase">High Risk</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] text-slate-500 font-bold uppercase">Optimal</span></div>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis type="number" dataKey="temperature" name="Temperature" unit="°C" stroke="#666" tick={{ fontSize: 11 }} label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -10, fill: '#666', fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis type="number" dataKey="aqi" name="AQI" stroke="#666" tick={{ fontSize: 11 }} label={{ value: 'AQI Index', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 10, fontWeight: 'bold' }} />
                      <ZAxis type="number" dataKey="risk_score" range={[100, 800]} name="Risk" />
                      <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }} />
                      <Scatter name="Ward Data" data={scatterData} onClick={data => { setSelectedZone(data as unknown as ZoneData); setActiveTab('map'); }} style={{ cursor: 'pointer' }}>
                        {INDIA_CITIES.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color === 'red' ? '#ef4444' : entry.color === 'yellow' ? '#f59e0b' : '#10b981'} fillOpacity={0.7} strokeWidth={2} stroke={entry.color === 'red' ? '#ff7f7f' : '#333'} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top 10 critical wards */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#161b22] flex flex-col shadow-2xl">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Top 10 Critical Wards</h3>
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  {[...INDIA_CITIES].sort((a, b) => b.temperature - a.temperature).slice(0, 10).map((w, i) => (
                    <div key={i} onClick={() => { setSelectedZone(w); setActiveTab('map'); }} className="group cursor-pointer bg-black/40 hover:bg-black/60 p-3 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors uppercase">{w.ward_name}</span>
                        <span className="text-xs font-black text-red-500">{w.temperature}°C</span>
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${(w.temperature / 50) * 100}%` }} />
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">AQI {w.aqi}</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Risk {w.risk_score}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Dispatch Board Tab ── */}
        {activeTab === 'dispatchboard' && (
          <DispatchBoard
            dispatchLog={dispatchLog}
            onNewDeployment={() => { setSelectedZone(null); setActiveTab('map'); }}
          />
        )}

        {/* ── Forecast Tab ── */}
        {activeTab === 'forecast' && (
          <ForecastTab forecastData={forecastData} isForecastLoading={isForecastLoading} />
        )}

        {/* ── Field Reports Tab ── */}
        {activeTab === 'reports' && (
          <FieldReportsTab
            visionFile={visionFile}
            visionPreview={visionPreview}
            visionResult={visionResult}
            isVisionLoading={isVisionLoading}
            onFileChange={handleFileChange}
            onVisionUpload={handleVisionUpload}
          />
        )}
      </section>

      {/* ── Add Resource Modal ── */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#111] border border-white/10 p-8 rounded-2xl w-full max-w-[450px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Register Field Personnel</h3>
            <p className="text-slate-500 text-xs mb-8 font-medium">Add new field units to the active deployment pool.</p>
            <form onSubmit={handleAddResource} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Personnel Name</label>
                <input required value={resourceForm.name} onChange={e => setResourceForm({ ...resourceForm, name: e.target.value })} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="e.g. Officer Rohan Sharma" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Badge Identification</label>
                <input required value={resourceForm.badge_id} onChange={e => setResourceForm({ ...resourceForm, badge_id: e.target.value })} type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500/50 transition-colors uppercase" placeholder="NMC-XXXX" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsResourceModalOpen(false)} className="flex-1 px-4 py-3.5 rounded-xl text-slate-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest border border-white/5">Cancel</button>
                <button type="submit" disabled={isResourceAdding} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  {isResourceAdding ? 'Linking...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// ── Public export — wraps the inner component with ErrorBoundary + ToastProvider
export default function Dashboard() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <DashboardInner />
      </ToastProvider>
    </ErrorBoundary>
  );
}
