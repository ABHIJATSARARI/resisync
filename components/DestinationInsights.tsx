import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Trip, UserProfile } from '../types';
import { getDestinationInsights } from '../services/geminiService';

interface DestinationInsightsProps {
  trip?: Trip;
  profile: UserProfile | null;
}

const DestinationInsights: React.FC<DestinationInsightsProps> = ({ trip, profile }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInsight = async () => {
      if (trip && profile) {
        setLoading(true);
        const data = await getDestinationInsights(trip.country, profile);
        setInsight(data);
        setLoading(false);
      }
    };
    fetchInsight();
  }, [trip, profile]);

  if (!trip) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 h-full flex items-center justify-center text-center text-slate-400">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className="text-left">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Destination Intel</p>
                <p className="text-xs text-slate-400">Select or add a trip to see local insights</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 h-full flex flex-col lg:flex-row gap-5 relative group">
        {/* Left: Header & Info */}
        <div className="lg:w-56 shrink-0 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                </div>
                <div>
                    <h3 className="text-base font-heading font-bold text-slate-800 dark:text-white leading-tight">Destination Intel</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span className="text-brand-600 dark:text-brand-400 font-bold">{trip.country}</span>
                    </p>
                </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{trip.isSchengen ? '90' : '180'}</p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">Day Limit</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{trip.isSchengen ? '🇪🇺' : '🌍'}</p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">{trip.isSchengen ? 'Schengen' : 'Non-EU'}</p>
                </div>
            </div>
            
            <button className="mt-3 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors uppercase tracking-wide flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                PDF Brief
            </button>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-slate-200 dark:bg-slate-700/50 self-stretch"></div>
        <div className="lg:hidden h-px bg-slate-200 dark:bg-slate-700/50 w-full"></div>

        {/* Right: Content */}
        <div className="flex-grow overflow-y-auto max-h-[200px] lg:max-h-[140px] pr-2 custom-scrollbar">
            {loading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="flex gap-3">
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                </div>
            ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0 prose-headings:mt-2 prose-headings:mb-1 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    <ReactMarkdown>
                        {insight || "Analyzing destination protocols..."}
                    </ReactMarkdown>
                </div>
            )}
        </div>
    </div>
  );
};

export default DestinationInsights;