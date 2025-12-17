import React, { useEffect, useState } from 'react';
import { ComplianceStatus, RiskLevel } from '../types';

interface SmartAdviceProps {
  status: ComplianceStatus | null;
}

const TypewriterText = ({ text, speed = 15 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

const SmartAdvice: React.FC<SmartAdviceProps> = ({ status }) => {
  if (!status) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 dark:from-black dark:to-slate-900 text-white p-5 h-full min-h-[280px] flex flex-col relative overflow-hidden group rounded-3xl border border-white/10 shadow-2xl bg-noise">
      
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 rounded-full mix-blend-screen filter blur-[80px] -mr-16 -mt-16 pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[60px] -ml-16 -mb-16 pointer-events-none"></div>
      
      {/* Header */}
      <div className="z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded-lg border border-white/10 shadow backdrop-blur-sm">
                <svg className="w-4 h-4 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            </div>
            <div>
                <h3 className="text-sm font-heading font-bold text-white leading-tight">AI Strategy</h3>
                <div className="flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium tracking-wide uppercase">Live</span>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="z-10 flex-grow flex flex-col gap-3 overflow-y-auto custom-scrollbar">
        <div className="bg-white/5 rounded-xl p-4 border border-white/5 shadow-inner backdrop-blur-sm hover:bg-white/10 transition-colors">
            <h4 className="text-[9px] font-bold text-brand-300 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Recommendation
            </h4>
            <div className="text-xs leading-relaxed text-slate-200 font-light min-h-[2.5rem]">
                <TypewriterText text={status.recommendation} speed={20} />
            </div>
        </div>

        {status.taxResidencyRisk.length > 0 && (
            <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
                <h4 className="text-[9px] font-bold text-red-300 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Attention
                </h4>
                {status.taxResidencyRisk.map((risk, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-red-950/40 p-2 rounded-lg mb-1 border border-red-500/10">
                        <span className="text-[10px] text-red-100 font-medium flex items-center gap-1.5">
                             <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                             {risk.country}
                        </span>
                        <span className="font-mono text-[9px] text-red-200 bg-red-500/20 px-1 py-0.5 rounded">{risk.daysSpent}/{risk.threshold}d</span>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="z-10 mt-auto pt-3 border-t border-white/5 flex justify-between items-center">
        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Gemini Pro</span>
        <button className="text-[9px] text-brand-300 hover:text-white transition-colors font-bold uppercase tracking-wide flex items-center gap-1">
            Report
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default SmartAdvice;