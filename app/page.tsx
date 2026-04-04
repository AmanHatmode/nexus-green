'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import jsPDF from 'jspdf';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import OfficerAccess from '@/components/OfficerAccess';

// Dynamic import for Map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Dashboard() {
  const [isOfficerAuthorized, setIsOfficerAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'forecast' | 'reports'>('map');
  const [metrics, setMetrics] = useState({ avg_temp: 0, traffic_flow: 0, agent_count: 0 });
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [advisoryText, setAdvisoryText] = useState('Select a critical zone on the map to generate AI advisory.');
  const [isAdvisoryLoading, setIsAdvisoryLoading] = useState(false);
  
  // Resource Modal State
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resourceForm, setResourceForm] = useState({ name: '', badge_id: '' });
  const [isResourceAdding, setIsResourceAdding] = useState(false);

  // Dispatch State
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchMessage, setDispatchMessage] = useState('');

  // Vision State
  const [visionFile, setVisionFile] = useState<File | null>(null);
  const [visionPreview, setVisionPreview] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState<any>(null);
  const [isVisionLoading, setIsVisionLoading] = useState(false);

  // Forecast State
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [isForecastLoading, setIsForecastLoading] = useState(false);

  // Thermal Camera Mode
  const [isThermal, setIsThermal] = useState(false);

  // Command Log
  const [commandLog, setCommandLog] = useState<{time: string; msg: string; type: string}[]>([
    { time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', second:'2-digit'}), msg: 'NexusGreen Command System initialized.', type: 'info' },
    { time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', second:'2-digit'}), msg: 'Officer NMC-NEXUS-001 authenticated.', type: 'success' },
  ]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'success' | 'critical') => {
    const time = new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
    setCommandLog(prev => [{ time, msg, type }, ...prev].slice(0, 12));
  };

  // Live Alert Ticker
  const ALERT_POOL = [
    { zone: 'Sitabuldi', msg: 'Surface temp crossed 47Â°C â€” vendor clearance protocol initiated.', level: 'critical' },
    { zone: 'Itwari', msg: 'AQI index at 224 â€” air quality RED alert issued.', level: 'critical' },
    { zone: 'Kamptee Road', msg: 'Freight density 508 v/h â€” emergency rerouting active.', level: 'warning' },
    { zone: 'Dharampeth', msg: 'Heat index at 43Â°C near Lata Mangeshkar Hospital â€” cool zone activated.', level: 'warning' },
    { zone: 'Hingna MIDC', msg: 'Particulate matter PM2.5 at 89 Âµg/mÂ³ â€” factory shutdown order sent.', level: 'critical' },
    { zone: 'Mahal', msg: 'Crowd density exceeding 1,200/hectare â€” ORS distribution dispatched.', level: 'warning' },
    { zone: 'Ambazari', msg: 'Lake evaporation causing 78% relative humidity spike â€” advisory issued.', level: 'info' },
    { zone: 'Wadi', msg: 'Rail crossing gridlock â€” 14-minute delay. Signal override requested.', level: 'warning' },
    { zone: 'Civil Lines', msg: 'NMC Emergency Operations Centre has been notified of regional heat event.', level: 'info' },
    { zone: 'Gopal Nagar', msg: 'Open drainage AQI spike detected â€” NMC sanitation team dispatched.', level: 'warning' },
  ];
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  // Location Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setAdvisoryText('Generating classified field advisory for searched location...');
    setIsAdvisoryLoading(true);
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', India')}`);
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        const { lat, lon, display_name } = geoData[0];
        
        const temp = Math.round((35 + Math.random() * 10) * 10) / 10;
        const aqi = Math.round(100 + Math.random() * 150);
        const traffic = Math.round(200 + Math.random() * 500);
        
        let tempWeight = 3; if (temp > 40) tempWeight = 10; else if (temp >= 35) tempWeight = 6;
        let aqiWeight = 3; if (aqi > 200) aqiWeight = 10; else if (aqi >= 150) aqiWeight = 6;
        let trafficWeight = 3; if (traffic > 500) trafficWeight = 10; else if (traffic >= 300) trafficWeight = 6;
        
        const risk_score = Math.round(((tempWeight * 0.4) + (aqiWeight * 0.3) + (trafficWeight * 0.3)) * 10) / 10;
        let color = 'green'; if (risk_score >= 7) color = 'red'; else if (risk_score >= 4) color = 'yellow';
        
        const zoneName = display_name.split(',')[0];
        const zone = {
          ward_name: zoneName,
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          temperature: temp,
          aqi: aqi,
          traffic_density: traffic,
          risk_score: risk_score,
          color: color,
          hist_max_temp: Math.round((temp + 3 + Math.random() * 3) * 10) / 10,
          hist_max_aqi: Math.round(aqi + 30 + Math.random() * 50),
          hist_max_risk: Math.min(10, Math.round((risk_score + 1) * 10) / 10)
        };
        
        setActiveTab('map');
        setSelectedZone(zone);
        addLog(`SCAN INITIATED — Zone: ${zoneName} | Risk: ${risk_score}/10 | Temp: ${temp}°C`, risk_score >= 7 ? 'critical' : risk_score >= 4 ? 'warn' : 'info');

        fetch('/api/advisory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ward_name: zone.ward_name,
            city: 'India',
            temperature: zone.temperature,
            aqi: zone.aqi,
            traffic_density: zone.traffic_density,
            risk_score: zone.risk_score,
            hist_max_temp: zone.hist_max_temp,
            hist_max_aqi: zone.hist_max_aqi
          })
        }).then(r => r.json()).then(d => {
           if (d.advisory) setAdvisoryText(d.advisory);
           else setAdvisoryText('Error generating advisory. Please try again.');
           setIsAdvisoryLoading(false);
           addLog(`Advisory generated for ${zoneName}.`, 'success');
        }).catch(err => {
           setAdvisoryText('Error generating advisory.');
           setIsAdvisoryLoading(false);
        });
      } else {
        alert("Location not found in India");
        setIsAdvisoryLoading(false);
        setAdvisoryText("Search failed.");
      }
    } catch (e) {
      console.error(e);
      setIsAdvisoryLoading(false);
      setAdvisoryText("Network error during search.");
    }
    setIsSearching(false);
  };

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // 1. Fetch Global Metrics on Mount
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/api/metrics');
        const data = await res.json();
        if (data.success) {
          setMetrics(data);
        }
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      }
    }
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // 1 minute
    
    // Fetch Forecast on Mount
    async function fetchForecast() {
      setIsForecastLoading(true);
      try {
        const res = await fetch('/api/forecast?t=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          setForecastData(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch forecast", err);
      }
      setIsForecastLoading(false);
    }
    fetchForecast();

    return () => clearInterval(interval);
  }, []);

  // 2. Fetch AI Advisory when a zone is clicked
  const handleZoneClick = async (zone: any) => {
    setSelectedZone(zone);
    setAdvisoryText('Generating classified field advisory...');
    setIsAdvisoryLoading(true);
    setDispatchMessage('');
    setIsThermal(false);
    addLog(`SCAN INITIATED — Zone: ${zone.ward_name} | Risk: ${zone.risk_score}/10 | Temp: ${zone.temperature}°C`, zone.risk_score >= 7 ? 'critical' : zone.risk_score >= 4 ? 'warn' : 'info');

    try {
      const res = await fetch('/api/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ward_name: zone.ward_name,
          city: zone.city || zone.state || 'India',
          temperature: zone.temperature,
          aqi: zone.aqi,
          traffic_density: zone.traffic_density,
          risk_score: zone.risk_score,
          hist_max_temp: zone.hist_max_temp,
          hist_max_aqi: zone.hist_max_aqi
        })
      });

      const data = await res.json();
      if (data.advisory) {
        setAdvisoryText(data.advisory);
      } else {
        throw new Error('No advisory in response');
      }
    } catch (err) {
      console.error(err);
      setAdvisoryText('Error generating advisory. Please try again.');
    } finally {
      setIsAdvisoryLoading(false);
      addLog(`Advisory generated for ${zone.ward_name}.`, 'success');
    }
  };

  // 3. Dispatch Action Button
  const handleDispatch = async () => {
    if (!selectedZone) return;
    setIsDispatching(true);
    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ward_name: selectedZone.ward_name })
      });
      const data = await res.json();
      if (data.success) {
        setDispatchMessage('âœ… Agents Dispatched Successfully!');
        addLog(`DISPATCH APPROVED â€” 3 Field Units deployed to ${selectedZone.ward_name}.`, 'success');
      }
    } catch {
      setDispatchMessage('âŒ Dispatch failed');
      addLog(`DISPATCH FAILED for ${selectedZone.ward_name}.`, 'critical');
    }
    setIsDispatching(false);
  };

  // 4. Generate PDF Report Action
  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Nexus-Green Urban Report', 20, 20);
    doc.setFontSize(14);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 30);
    doc.text(`Average City Temp: ${metrics.avg_temp}Â°C`, 20, 45);
    doc.text(`Overall Traffic Flow: ${metrics.traffic_flow}%`, 20, 55);
    doc.text(`Active Field Agents: ${metrics.agent_count}`, 20, 65);
    
    if (selectedZone) {
      doc.text(`-- Focused Area: ${selectedZone.ward_name} --`, 20, 85);
      doc.text(`Temp: ${selectedZone.temperature}Â°C | AQI: ${selectedZone.aqi}`, 20, 95);
      doc.setFontSize(11);
      const splitText = doc.splitTextToSize(`Advisory: ${advisoryText}`, 170);
      doc.text(splitText, 20, 105);
    }
    doc.save('nexus-green-report.pdf');
  };

  // 5. Add Resource Submission
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResourceAdding(true);
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: resourceForm.name, badge_id: resourceForm.badge_id, zone: 'Unassigned' })
      });
      if (res.ok) {
        setIsResourceModalOpen(false);
        setResourceForm({ name: '', badge_id: '' });
        // Optimistically update metrics
        setMetrics(prev => ({ ...prev, agent_count: prev.agent_count + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
    setIsResourceAdding(false);
  };

  // 6. Handle Google Cloud Vision Upload
  const handleVisionUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visionFile) return;
    setIsVisionLoading(true);
    setVisionResult(null);

    const formData = new FormData();
    formData.append('photo', visionFile);

    try {
      const res = await fetch('/api/cloud-vision', { method: 'POST', body: formData });
      const data = await res.json();
      setVisionResult(data);
    } catch (err) {
      setVisionResult({ success: false, error: 'Network error generating vision report.' });
    }
    setIsVisionLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVisionFile(file);
      setVisionPreview(URL.createObjectURL(file));
      setVisionResult(null);
    }
  };

  if (!isOfficerAuthorized) {
    return <OfficerAccess onAuthorize={() => setIsOfficerAuthorized(true)} />;
  }

  return (
    <main className="flex h-screen w-full bg-[#0a0a0a] text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#222] bg-[#111] p-5 flex flex-col justify-between z-20 overflow-hidden">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center font-bold text-white">N</div>
            <h1 className="text-xl font-bold tracking-tight text-white">Nexus<span className="text-emerald-400">Green</span></h1>
          </div>
          
          <nav className="space-y-2 mb-6">
            <button onClick={() => setActiveTab('map')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'map' ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-[#222] text-slate-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Live Map
            </button>
            <button onClick={() => setActiveTab('forecast')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'forecast' ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-[#222] text-slate-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              7-Day Forecast
            </button>
            <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'reports' ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-[#222] text-slate-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Field Reports
            </button>
          </nav>

          {/* Command Log */}
          <div className="border-t border-[#222] pt-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Incident Command Log
            </div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {commandLog.map((log, i) => (
                <div key={i} className="text-[10px] leading-tight">
                  <span className="text-slate-600">{log.time} â€” </span>
                  <span className={log.type === 'critical' ? 'text-red-400' : log.type === 'warn' ? 'text-amber-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-400'}>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 border-b border-[#222] flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-md z-20 absolute top-0 w-full gap-4">
          <div className="shrink-0 flex items-center gap-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Indian Heat &amp; Traffic</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time urban intelligence dashboard</p>
            </div>
            
            <form onSubmit={handleSearch} className="flex border border-[#333] rounded-lg overflow-hidden focus-within:border-emerald-500 bg-black/50">
               <input type="text" placeholder="Search Location in India..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-sm text-white px-4 py-2 focus:outline-none w-[260px] md:w-[320px] placeholder:text-slate-500" />
               <button type="submit" disabled={isSearching} className="bg-[#222] hover:bg-[#333] px-3 py-2 text-emerald-400 transition-colors flex items-center justify-center min-w-[50px]">
                  {isSearching ? <span className="animate-spin h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full"></span> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>}
               </button>
            </form>
          </div>

          {/* LIVE ALERT TICKER */}
          <div className={`flex-1 bg-black/60 border rounded-lg px-4 py-2 flex items-center gap-3 overflow-hidden transition-opacity duration-300 ${tickerVisible ? 'opacity-100' : 'opacity-0'} ${ALERT_POOL[tickerIndex].level === 'critical' ? 'border-red-500/50' : ALERT_POOL[tickerIndex].level === 'warning' ? 'border-amber-500/40' : 'border-blue-500/30'}`}>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shrink-0 ${ALERT_POOL[tickerIndex].level === 'critical' ? 'bg-red-600 text-white animate-pulse' : ALERT_POOL[tickerIndex].level === 'warning' ? 'bg-amber-500 text-black' : 'bg-blue-600 text-white'}`}>
              {ALERT_POOL[tickerIndex].level === 'critical' ? 'ðŸ”´ CRITICAL' : ALERT_POOL[tickerIndex].level === 'warning' ? 'âš ï¸ WARNING' : 'â„¹ï¸ INFO'}
            </span>
            <span className="text-xs font-bold text-white shrink-0">{ALERT_POOL[tickerIndex].zone}:</span>
            <span className="text-xs text-slate-300 truncate">{ALERT_POOL[tickerIndex].msg}</span>
            <span className="text-[10px] text-slate-500 shrink-0 font-mono">{new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})} IST</span>
          </div>

          <button onClick={handleGeneratePDF} className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            Generate PDF Report
          </button>
        </header>

        {activeTab === 'map' && (
          <>
            <div className="absolute inset-0 z-0 pt-20">
              <Map onZoneClick={handleZoneClick} selectedZone={selectedZone} />
            </div>

            {/* Foreground Overlay Panels */}
            <div className="pt-24 px-8 pb-8 z-10 w-full h-full flex flex-col justify-end pointer-events-none">
              <div className="grid grid-cols-3 gap-6 pointer-events-auto shadow-2xl">
                
                {/* Panel 1 - Advisory */}
                <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-[#161b22]/90 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    AI Live Advisory
                  </h3>
                  
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex-1 overflow-y-auto max-h-48 mb-3 scrollbar-thin">
                    {selectedZone && (selectedZone.hist_max_temp - selectedZone.temperature <= 5) && (
                      <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl mb-4 flex items-start gap-2 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                        <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <div>
                          <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Critical Warning</div>
                          <p className="text-[10px] text-slate-300 leading-relaxed">
                            The current temperature ({selectedZone.temperature}°C) is within 5°C of the 5-year historical maximum ({selectedZone.hist_max_temp}°C). The temperature could potentially rise to match the historical maximum at any moment. 
                            <br/><br/><span className="text-emerald-400 font-semibold">Suggested Action:</span> Ensure cooling centers are fully operational. Dispatch hydration units to high-traffic areas immediately. Display public warnings on local digital boards.
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-300 uppercase">{selectedZone ? selectedZone.ward_name : 'Monitoring Overview'}</span>
                      {selectedZone && <span className={`w-2 h-2 rounded-full ${selectedZone.color === 'red' ? 'bg-red-500' : selectedZone.color === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedZone && <span className="text-emerald-400 font-semibold text-xs block mb-1">GEMINI SAYS:</span>}
                      {advisoryText}
                    </p>
                  </div>
                  
                  {selectedZone && (
                     <div className="mt-auto">
                       {dispatchMessage ? (
                         <div className="text-sm font-bold text-emerald-400 text-center py-2">{dispatchMessage}</div>
                       ) : (
                         <button onClick={handleDispatch} disabled={isDispatching || isAdvisoryLoading} className="w-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 py-3 rounded-lg transition-colors border border-emerald-500/20">
                            {isDispatching ? 'DISPATCHING...' : 'APPROVE & DISPATCH →'}
                         </button>
                       )}
                     </div>
                  )}
                </div>

                {/* Panel 2 - Metrics */}
                <div className="glass-panel rounded-2xl p-6 border border-white/5 col-span-2 flex flex-col justify-between bg-[#161b22]/90 transition-all duration-500">
                  {selectedZone ? (
                    <div className="flex h-full gap-6 min-h-[290px]">
                      {/* Image Column - Made much larger */}
                      <div className="w-[65%] rounded-xl overflow-hidden relative border border-white/10 group bg-slate-900 shadow-xl">
                         <iframe 
                           src={`https://maps.google.com/maps?layer=c&cbll=${selectedZone.lat},${selectedZone.lng}&cbp=0,0,0,0,0&output=svembed`} 
                           className="w-full h-full absolute inset-0 opacity-100" 
                           frameBorder={0} 
                           scrolling="no" 
                           marginHeight={0} 
                           marginWidth={0}
                         ></iframe>
                         {/* Thermal Camera Overlay */}
                         {isThermal && (
                           <div className="absolute inset-0 z-20 pointer-events-none" style={{background: 'linear-gradient(135deg, rgba(255,0,0,0.55) 0%, rgba(255,100,0,0.45) 30%, rgba(255,200,0,0.3) 60%, rgba(0,100,255,0.25) 100%)', mixBlendMode: 'multiply'}}></div>
                         )}
                         {isThermal && (
                           <div className="absolute inset-0 z-20 pointer-events-none" style={{backdropFilter: 'saturate(3) hue-rotate(300deg) contrast(1.4)'}}></div>
                         )}
                         {/* Top control bar */}
                         <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between">
                           <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                             <span className="text-[10px] font-bold text-white uppercase tracking-widest">NMC Field Cam {selectedZone.ward_name.substring(0,3).toUpperCase()}-{Math.floor(Math.random()*90)+10}</span>
                           </div>
                           <button onClick={() => setIsThermal(t => !t)} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-sm transition-all ${isThermal ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(255,100,0,0.7)]' : 'bg-black/70 text-slate-300 hover:bg-black/90'}`}>
                             {isThermal ? '🌡 THERMAL ON' : '🌡 THERMAL'}
                           </button>
                         </div>
                         <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12 pb-4 px-5 pointer-events-none z-10">
                            <span className="text-white font-bold text-2xl drop-shadow-lg">{selectedZone.ward_name}</span>
                            <span className={`font-bold text-xs uppercase tracking-widest drop-shadow-lg flex items-center gap-2 mt-1 ${isThermal ? 'text-orange-400' : 'text-amber-400'}`}>
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border border-white/20"></span>
                              {isThermal ? 'INFRARED THERMAL ANALYSIS ACTIVE' : 'Live Street View Feed'}
                            </span>
                         </div>
                      </div>
                      
                      {/* Stats Column */}
                      <div className="w-[35%] flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-1">
                             <h3 className="text-lg font-bold text-white leading-tight">Zone Intelligence</h3>
                             <button onClick={() => setSelectedZone(null)} className="text-xs bg-[#222] hover:bg-[#333] px-2 py-1 rounded text-slate-300 transition-colors">Close</button>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-mono mb-3 flex items-center gap-1.5 bg-emerald-500/10 w-fit px-2 py-1 rounded border border-emerald-500/20">
                             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                             DATA LIVE AT: {currentTime}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 flex-1">
                          <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col justify-center relative overflow-hidden">
                            <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-widest relative z-10">Air Quality</div>
                            <div className={`text-2xl font-bold relative z-10 ${selectedZone.aqi > 150 ? 'text-red-500' : selectedZone.aqi > 100 ? 'text-amber-500' : 'text-emerald-500'}`}>{selectedZone.aqi}</div>
                            <div className="text-[9px] text-slate-400 relative z-10 mt-1 font-mono">5Y MAX: <span className="text-white font-bold">{selectedZone.hist_max_aqi}</span></div>
                          </div>
                          <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col justify-center relative overflow-hidden">
                            <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-widest relative z-10">Risk Score</div>
                            <div className={`text-2xl font-bold relative z-10 ${selectedZone.color === 'red' ? 'text-red-500' : selectedZone.color === 'yellow' ? 'text-amber-500' : 'text-emerald-500'}`}>{selectedZone.risk_score} / 10</div>
                            <div className={`absolute bottom-0 left-0 h-1 w-full ${selectedZone.color === 'red' ? 'bg-red-500' : selectedZone.color === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                            <div className="text-[9px] text-slate-400 relative z-10 mt-1 font-mono flex items-center justify-between">
                               <span>5Y MAX: <span className="text-white font-bold">{selectedZone.hist_max_risk}</span></span>
                            </div>
                            <div className={`text-[9px] font-bold mt-1.5 uppercase relative z-10 flex items-center gap-1 ${selectedZone.risk_score >= 7 ? 'text-red-500' : 'text-emerald-400'}`}>
                               <span className={`w-1.5 h-1.5 rounded-full ${selectedZone.risk_score >= 7 ? 'bg-red-500' : 'bg-emerald-400'} animate-pulse`}></span>
                               {selectedZone.risk_score >= 7 ? 'UNSAFE TO GO OUTSIDE' : 'SAFE TO GO OUTSIDE'}
                            </div>
                          </div>
                          <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col justify-center relative overflow-hidden">
                            <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-widest relative z-10">Heat Profile</div>
                            <div className="text-2xl font-bold text-white relative z-10">{selectedZone.temperature}°C</div>
                            <div className="text-[9px] text-slate-400 relative z-10 mt-1 font-mono">5Y MAX: <span className="text-white font-bold">{selectedZone.hist_max_temp}°C</span></div>
                          </div>
                          <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                            <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-widest">Traffic Vol</div>
                            <div className="text-2xl font-bold text-white">{selectedZone.traffic_density} <span className="text-xs font-normal text-slate-500">v/h</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">City Metrics Overview (Live)</h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                          <div className="text-xs text-slate-500 font-bold mb-1 uppercase">Avg Temp</div>
                          <div className="text-2xl font-bold text-white">{metrics.avg_temp}°C</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                           <div className="text-xs text-slate-500 font-bold mb-1 uppercase">Traffic Flow</div>
                           <div className="text-2xl font-bold text-white">{metrics.traffic_flow}%</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                           <div className="text-xs text-slate-500 font-bold mb-1 uppercase">Field Agents</div>
                           <div className="text-2xl font-bold text-white">{metrics.agent_count}</div>
                        </div>
                        <button onClick={() => setIsResourceModalOpen(true)} className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 flex flex-col justify-center items-center hover:bg-emerald-500/20 transition-all group cursor-pointer">
                           <svg className="w-6 h-6 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                           <span className="text-emerald-400 text-sm font-bold mt-1">Add Resource</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </>
        )}

        {/* Forecast View */}
        {activeTab === 'forecast' && (
           <div className="pt-24 px-8 w-full h-full flex flex-col overflow-y-auto pb-10">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
               <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               7-Day Predictive Heat Forecast
            </h2>
             <p className="text-slate-400 text-sm max-w-2xl mb-8">AI-driven meteorological predictions highlighting upcoming heat spikes and critical resource deployment risk windows over the next 7 days in Nagpur.</p>

             {isForecastLoading ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-emerald-400 gap-3">
                    <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    <span className="text-sm font-bold animate-pulse">Running Predictive Models...</span>
                 </div>
             ) : (
                <div className="flex flex-col gap-8 max-w-6xl pb-20">
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#161b22] h-[400px] flex flex-col shadow-lg">
                        <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Multi-Zone Temperature Trend (°C)</h3>
                        <p className="text-xs text-slate-400 mb-4 font-medium">Predictive comparative analysis between high-density concrete areas and ecological green corridors.</p>
                        <div className="flex-1 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorInd" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorUrb" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                              <XAxis dataKey="label" stroke="#888" tick={{fill: '#888', fontSize: 12}} />
                              <YAxis stroke="#888" tick={{fill: '#888', fontSize: 12}} domain={['auto', 'auto']} />
                              <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                              />
                              <Area type="monotone" name="Industrial Zones" dataKey="industrial_zone" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorInd)" />
                              <Area type="monotone" name="Urban Core" dataKey="urban_core" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorUrb)" />
                              <Area type="monotone" name="Green Corridors" dataKey="green_belt" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGreen)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#161b22] h-[280px] flex flex-col shadow-lg">
                        <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Heat Danger Risk Score (1-10)</h3>
                        <p className="text-xs text-slate-400 mb-6 font-medium">Values &gt; 7 necessitate mandatory public heat advisories.</p>
                        <div className="flex-1 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecastData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                              <XAxis dataKey="label" stroke="#888" tick={{fill: '#888', fontSize: 12}} />
                              <YAxis stroke="#888" tick={{fill: '#888', fontSize: 12}} domain={[0, 10]} />
                              <RechartsTooltip cursor={{fill: '#222'}} contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', color: '#fff' }} />
                              <Bar dataKey="risk_score" name="Risk Score" radius={[4, 4, 0, 0]}>
                                {forecastData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.risk_score >= 7 ? '#ef4444' : entry.risk_score >= 4 ? '#f59e0b' : '#10b981'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                    </div>
                </div>
             )}
           </div>
        )}

        {/* Reports View (Google Vision) */}
        {activeTab === 'reports' && (
           <div className="pt-24 px-8 w-full h-full flex flex-col overflow-y-auto pb-10">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
               <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
               Google Vision Field Analysis
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mb-8">Upload a dashboard or drone image. It will securely route to the official Google Cloud Vision API to detect heat-reflective materials, physical risk conditions, and evaluate safety indicators.</p>

            <div className="grid grid-cols-2 gap-8 max-w-5xl">
              {/* Upload Column */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#161b22]">
                <form onSubmit={handleVisionUpload} className="flex flex-col h-full">
                  <label className="block text-sm font-bold text-white mb-4">Upload Field Photograph</label>
                  
                  <div className="flex-1 min-h-[200px] border-2 border-dashed border-[#333] rounded-xl flex flex-col items-center justify-center relative bg-black/40 hover:bg-[#1a1a1a] transition-colors cursor-pointer group mb-4 overflow-hidden">
                    <input type="file" onChange={handleFileChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    
                    {visionPreview ? (
                      <img src={visionPreview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <>
                        <svg className="w-10 h-10 text-slate-500 mb-2 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        <span className="text-slate-400 text-sm font-medium">Click or drag image file here</span>
                        <span className="text-slate-600 text-xs mt-1">Supports strict JPEG, PNG, WEBP natively</span>
                      </>
                    )}
                  </div>

                  <button type="submit" disabled={!visionFile || isVisionLoading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    {isVisionLoading ? (
                      <><span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span> Analyzing in Cloud...</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Run Cloud Vision Model</>
                    )}
                  </button>
                </form>
              </div>

              {/* Output Column */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#161b22] flex flex-col">
                <h3 className="text-sm font-bold text-white mb-4 uppercase">Vision API Output</h3>

                {!visionResult && !isVisionLoading && (
                  <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                    No image strictly verified by Vision AI.
                  </div>
                )}

                {isVisionLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center text-emerald-400 gap-3">
                      <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                      <span className="text-sm font-bold animate-pulse">Running Label Detection...</span>
                   </div>
                )}

                {visionResult && visionResult.success && (
                  <div className="flex-1 flex flex-col gap-6">
                    <div>
                      <div className="text-xs font-bold text-slate-400 mb-2 uppercase">Identified Urban Labels</div>
                      <div className="flex flex-wrap gap-2">
                        {visionResult.labels?.map((label: string, i: number) => (
                           <span key={i} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold font-mono">
                             #{label}
                           </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1 bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="text-xs text-slate-500 font-bold mb-1 uppercase">Estimated Heat Risk</div>
                        <div className={`text-2xl font-bold ${visionResult.heatRiskEstimate >= 7 ? 'text-red-500' : visionResult.heatRiskEstimate >= 4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {visionResult.heatRiskEstimate} / 10
                        </div>
                      </div>
                      
                      <div className="flex-1 bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="text-xs text-slate-500 font-bold mb-1 uppercase">Explicit Content Scan</div>
                        <div className={`text-2xl font-bold flex items-center gap-2 ${visionResult.isSafe ? 'text-emerald-500' : 'text-red-500'}`}>
                          {visionResult.isSafe ? (
                            <><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> CLEAN</>
                          ) : 'FLAGGED'}
                        </div>
                      </div>
                    </div>

                    {visionResult.warning && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-xs text-amber-500">
                        <strong>Demo Note:</strong> {visionResult.warning}
                      </div>
                    )}
                  </div>
                )}

                {visionResult && !visionResult.success && (
                   <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm font-medium text-center">
                     {visionResult.error || 'Failed to process image through Vision API.'}
                   </div>
                )}

              </div>
            </div>
          </div>
        )}

      </section>

      {/* Add Resource Modal */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#111] border border-[#333] p-6 rounded-xl w-[400px]">
            <h3 className="text-xl font-bold text-white mb-4">Add Field Agent</h3>
            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Agent Name</label>
                <input required value={resourceForm.name} onChange={e => setResourceForm({...resourceForm, name: e.target.value})} type="text" className="w-full bg-black border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Badge ID</label>
                <input required value={resourceForm.badge_id} onChange={e => setResourceForm({...resourceForm, badge_id: e.target.value})} type="text" className="w-full bg-black border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="NMC-00X" />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setIsResourceModalOpen(false)} className="px-4 py-2 rounded text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isResourceAdding} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-medium transition-colors">
                  {isResourceAdding ? 'Adding...' : 'Add Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

