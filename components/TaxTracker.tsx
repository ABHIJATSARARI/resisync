import React, { useMemo } from 'react';
import { Trip, RiskLevel } from '../types';

interface TaxTrackerProps {
  trips: Trip[]; // These trips can be mixed (real + simulated)
}

const TaxTracker: React.FC<TaxTrackerProps> = ({ trips }) => {
  // Calculate days spent per country in the current year, separating real and sim
  const countryStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const stats: Record<string, { realDays: number, simDays: number, countryCode?: string }> = {};

    trips.forEach(trip => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      
      if (start.getFullYear() === currentYear || end.getFullYear() === currentYear) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        if (!stats[trip.country]) {
            stats[trip.country] = { realDays: 0, simDays: 0, countryCode: trip.countryCode };
        }
        
        if (trip.isSimulation) {
            stats[trip.country].simDays += days;
        } else {
            stats[trip.country].realDays += days;
        }

        if (trip.countryCode) stats[trip.country].countryCode = trip.countryCode;
      }
    });

    // Create array and sort by Total days (real + sim)
    return Object.entries(stats)
        .map(([country, data]) => ({ country, ...data, totalDays: data.realDays + data.simDays }))
        .sort((a, b) => b.totalDays - a.totalDays)
        .slice(0, 4); 
  }, [trips]);

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 h-full min-h-[280px] flex flex-col relative rounded-3xl border border-white/20 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
        
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

        <div className="flex justify-between items-start mb-4 z-10">
            <div>
                <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                    Tax Residency
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase mt-0.5 ml-4">FY {new Date().getFullYear()}</p>
            </div>
            <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 border border-slate-200 dark:border-slate-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
        </div>

        <div className="space-y-3 flex-grow z-10 overflow-y-auto pr-1 custom-scrollbar">
            {countryStats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20 py-6">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">No footprint yet</p>
                </div>
            ) : (
                countryStats.map((stat, idx) => {
                    const realPercentage = Math.min((stat.realDays / 183) * 100, 100);
                    // The sim bar starts where real ends
                    const simPercentage = Math.min((stat.simDays / 183) * 100, 100 - realPercentage); 

                    // Determine color based on Total (Real + Sim) risk
                    const totalDays = stat.realDays + stat.simDays;
                    
                    let colorClass = 'bg-emerald-500';
                    let simColorClass = 'bg-emerald-300 dark:bg-emerald-700';
                    let bgClass = 'bg-emerald-500/10';
                    let textClass = 'text-emerald-700 dark:text-emerald-400';
                    
                    if (totalDays > 150) {
                        colorClass = 'bg-red-500';
                        simColorClass = 'bg-red-300 dark:bg-red-800';
                        bgClass = 'bg-red-500/10';
                        textClass = 'text-red-700 dark:text-red-400';
                    } else if (totalDays > 90) {
                        colorClass = 'bg-amber-500';
                        simColorClass = 'bg-amber-300 dark:bg-amber-800';
                        bgClass = 'bg-amber-500/10';
                        textClass = 'text-amber-700 dark:text-amber-400';
                    }

                    return (
                        <div key={idx} className="group relative">
                            <div className="flex items-center gap-3 mb-1.5">
                                <div className="relative w-7 h-5 shadow-sm rounded-sm overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                                    {stat.countryCode ? (
                                        <img 
                                            src={`https://flagcdn.com/w40/${stat.countryCode.toLowerCase()}.png`}
                                            alt={stat.country}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[8px]">{stat.country[0]}</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="font-bold text-slate-700 dark:text-slate-200 text-xs truncate">{stat.country}</span>
                                        <div className="flex gap-1">
                                            {stat.simDays > 0 && (
                                                <span className={`text-[9px] font-bold text-slate-400 px-1`}>
                                                    +{stat.simDays}
                                                </span>
                                            )}
                                            <span className={`text-[10px] font-bold ${textClass} px-1.5 py-0.5 rounded ${bgClass}`}>
                                                {stat.realDays + stat.simDays}d
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                        {/* Real Days Bar */}
                                        <div 
                                            className={`h-full ${colorClass} transition-all duration-1000 relative`} 
                                            style={{ width: `${realPercentage}%` }}
                                        ></div>
                                        
                                        {/* Simulated Days Bar (Striped) */}
                                        <div 
                                            className={`h-full ${simColorClass} transition-all duration-1000 relative opacity-70`}
                                            style={{ 
                                                width: `${simPercentage}%`,
                                                backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
                                                backgroundSize: '10px 10px'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50 z-10">
             <div className="flex items-center justify-between text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                <span>Safe Zone</span>
                <span className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-red-500"></div>
                    Limit: 183 Days
                </span>
             </div>
        </div>
    </div>
  );
};

export default TaxTracker;