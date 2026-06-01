'use client';

/* eslint-disable */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface OfficerAccessProps {
  onAuthorize: () => void;
}

export default function OfficerAccess({ onAuthorize }: OfficerAccessProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Form States
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [badgeId, setBadgeId] = useState('');
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | 'info' } | null>(null);

  // Hardcoded required password/badge
  const REQUIRED_BADGE = 'IND-NEXUS-001';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !mobile) {
      setMessage({ text: 'Email and Mobile Number are required.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: 'INITIATING SECURE REGISTRATION...', type: 'info' });

    try {
      // Register with Supabase using email and the badge ID as the password
      const { data, error } = await supabase.auth.signUp({
        email,
        password: REQUIRED_BADGE, // Using badge ID as password behind the scenes
        options: {
          data: {
            mobile_number: mobile,
          }
        }
      });

      if (error) {
        setMessage({ text: `DENIED: ${error.message}`, type: 'error' });
      } else {
        setMessage({ text: 'REGISTRATION LOGGED. Check your email to confirm clearance before logging in.', type: 'success' });
        // Clear fields
        setEmail('');
        setMobile('');
        setTimeout(() => setActiveTab('login'), 3000);
      }
    } catch (err: any) {
      setMessage({ text: 'NETWORK FAILURE.', type: 'error' });
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !badgeId) {
      setMessage({ text: 'CREDENTIALS REQUIRED.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: 'AUTHENTICATING CLEARANCE...', type: 'info' });

    try {
      // EMERGENCY BYPASS FOR DEMO / OFFLINE MODE
      if (email === 'admin@nexus.gov.in' && badgeId === 'IND-NEXUS-001') {
        setMessage({ text: 'EMERGENCY BYPASS ACTIVATED. WELCOME ADMINISTRATOR.', type: 'success' });
        setTimeout(() => onAuthorize(), 1000);
        return;
      }

      // Login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: badgeId 
      });

      if (error) {
        setMessage({ text: `ACCESS DENIED: ${error.message}`, type: 'error' });
      } else {
        setMessage({ text: 'CLEARANCE GRANTED. WELCOME OFFICER.', type: 'success' });
        setTimeout(() => {
          onAuthorize();
        }, 1500);
      }
    } catch (err: any) {
      // Fallback for demo if network fails but credentials are correct
      if (badgeId === REQUIRED_BADGE) {
         setMessage({ text: 'NETWORK OFFLINE. LOCAL CLEARANCE GRANTED.', type: 'success' });
         setTimeout(() => onAuthorize(), 1000);
      } else {
         setMessage({ text: 'NETWORK FAILURE.', type: 'error' });
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at center, #10b981 0%, transparent 100%)', backgroundSize: '150% 150%', backgroundPosition: 'center' }} />
      
      <div className="w-[450px] max-w-[90%] p-8 border border-emerald-900/50 rounded-xl relative z-10 bg-black/80 shadow-[0_0_50px_rgba(16,185,129,0.08)] backdrop-blur-md">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
             <span className="text-emerald-500 text-xl font-black">N</span>
          </div>
          <h2 className="text-emerald-500 font-bold tracking-widest text-lg">NEXUS COMMAND API</h2>
          <p className="text-emerald-900 text-xs tracking-widest mt-1">SECURE CLEARANCE REQUIRED</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex border-b border-emerald-900/50 mb-6">
          <button 
            onClick={() => { setActiveTab('login'); setMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold tracking-widest transition-colors ${activeTab === 'login' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-emerald-900 hover:text-emerald-700'}`}
          >
            AUTHORIZE (LOGIN)
          </button>
          <button 
            onClick={() => { setActiveTab('register'); setMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold tracking-widest transition-colors ${activeTab === 'register' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-emerald-900 hover:text-emerald-700'}`}
          >
            REGISTER BADGE
          </button>
        </div>

        {message && (
          <div className={`p-3 mb-6 border rounded text-xs tracking-widest text-center animate-pulse ${
            message.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 
            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 
            'bg-amber-500/10 border-amber-500/50 text-amber-500'
          }`}>
            {message.text}
          </div>
        )}

        {activeTab === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-[10px] text-emerald-600 font-bold tracking-widest mb-1">OFFICER EMAIL</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-emerald-900/50 text-emerald-400 text-sm tracking-wider px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="officer@nexus.gov.in"
              />
            </div>
            <div>
              <label className="block text-[10px] text-emerald-600 font-bold tracking-widest mb-1">SECURE COMMS (MOBILE)</label>
              <input 
                type="tel" 
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-black/50 border border-emerald-900/50 text-emerald-400 text-sm tracking-wider px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-emerald-950 hover:bg-emerald-900 text-emerald-400 font-bold tracking-widest text-sm py-3 border border-emerald-800 disabled:opacity-50 transition-colors mt-2"
            >
              {isLoading ? 'PROCESSING...' : 'REQUEST CLEARANCE'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] text-emerald-600 font-bold tracking-widest mb-1">OFFICER EMAIL</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-emerald-900/50 text-emerald-400 text-sm tracking-wider px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="officer@nexus.gov.in"
              />
            </div>
            <div>
              <label className="block text-[10px] text-emerald-600 font-bold tracking-widest mb-1">SECURITY BADGE ID</label>
              <input 
                type="text" 
                required
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value.toUpperCase())}
                className="w-full bg-black/50 border border-emerald-900/50 text-emerald-400 text-sm tracking-wider px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-emerald-900/30"
                placeholder="IND-NEXUS-XXX"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-emerald-950 hover:bg-emerald-900 text-emerald-400 font-bold tracking-widest text-sm py-3 border border-emerald-800 disabled:opacity-50 transition-colors mt-2"
            >
              {isLoading ? 'AUTHENTICATING...' : 'ENTER DASHBOARD'}
            </button>
          </form>
        )}
      </div>
      
      {/* Scanline effect overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9InJnYmEoMCwwLDAsMC4xKSIvPjwvc3ZnPg==')] opacity-50 z-50"></div>
    </div>
  );
}
