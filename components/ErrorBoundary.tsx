'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI — defaults to the NexusGreen styled error screen. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production you'd ship this to an error-tracking service (Sentry, etc.)
    console.error('[NexusGreen] Unhandled render error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex h-screen w-full bg-[#0a0a0a] text-slate-200 items-center justify-center p-8">
          <div className="max-w-lg w-full bg-[#111] border border-red-500/20 rounded-2xl p-10 shadow-2xl relative overflow-hidden">
            {/* Red top bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />

            {/* Icon */}
            <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Copy */}
            <h2 className="text-xl font-black text-white uppercase tracking-tight text-center mb-2">
              System Fault Detected
            </h2>
            <p className="text-slate-500 text-sm text-center font-medium mb-6">
              NexusGreen encountered an unexpected rendering error. The incident has been logged.
            </p>

            {/* Error detail (collapsible) */}
            {this.state.error && (
              <details className="mb-6 bg-black/50 border border-white/5 rounded-xl p-4">
                <summary className="text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer select-none">
                  Technical Details
                </summary>
                <pre className="mt-3 text-[10px] text-red-400/80 font-mono whitespace-pre-wrap break-all leading-relaxed">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Retry Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-white/5"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
