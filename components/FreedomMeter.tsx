import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { ComplianceStatus, RiskLevel } from '../types';

interface FreedomMeterProps {
  status: ComplianceStatus | null;
  loading: boolean;
  isSimulationMode?: boolean;
  isRetrying?: boolean;
}

const FreedomMeter: React.FC<FreedomMeterProps> = ({ status, loading, isSimulationMode = false, isRetrying = false }) => {
  // Determine if we should show the loader.
  // We show it if we are loading, OR if we don't have a status yet.
  const showLoader = loading || !status;

  // Dynamic Color Logic
  let strokeColor = '#10b981'; // Emerald
  let secondaryColor = '#d1fae5'; // Light Emerald
  let glowColor = 'rgba(16, 185, 129, 0.4)';

  if (status) {
      if (isSimulationMode) {
          strokeColor = '#a855f7'; // Purple
          secondaryColor = '#f3e8ff'; // Light Purple
          glowColor = 'rgba(168, 85, 247, 0.4)';
      } else {
          if (status.riskLevel === RiskLevel.WARNING) {
              strokeColor = '#f59e0b'; // Amber
              secondaryColor = '#fef3c7';
              glowColor = 'rgba(245, 158, 11, 0.4)';
          }
          if (status.riskLevel === RiskLevel.DANGER) {
              strokeColor = '#ef4444'; // Red
              secondaryColor = '#fee2e2';
              glowColor = 'rgba(239, 68, 68, 0.4)';
          }
      }
  }

  const data = status ? [{ name: 'Used', value: status.schengenDaysUsed, fill: strokeColor }] : [];
  
  return (
    <div className="h-full w-full flex flex-col items-center relative p-6">
        
        {/* --- LOADING OVERLAY --- */}
        {/* We use an absolute overlay with backdrop-blur to prevent layout shifts. */}
        {showLoader && (
            <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[2rem] transition-all duration-500 ${status ? 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md' : ''}`}>
                
                {isRetrying ? (
                    // RETRY ANIMATION: Spinning gears / Active processing
                     <>
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            {/* Outer Ring */}
                            <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
                            {/* Spinner */}
                            <div className="absolute inset-0 border-4 border-t-brand-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            {/* Inner Gear Icon */}
                             <div className="animate-spin-slow">
                                <svg className="w-12 h-12 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                             </div>
                        </div>
                        <div className="mt-6 flex flex-col items-center">
                            <span className="text-brand-600 dark:text-brand-400 font-bold tracking-widest text-xs uppercase animate-pulse">
                                Optimizing Protocols...
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1">
                                Rerouting Intelligence
                            </span>
                        </div>
                     </>
                ) : (
                    // STANDARD ANIMATION: Calibrating Pulse
                    <>
                        <div className="w-32 h-32 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 animate-ping opacity-20"></div>
                        </div>
                        <div className="text-slate-400 dark:text-slate-500 font-bold tracking-widest text-xs uppercase mt-6 animate-pulse">
                            Calibrating Shield...
                        </div>
                    </>
                )}
            </div>
        )}

        {/* Header */}
        <div className="w-full flex justify-between items-start z-10 mb-4 transition-opacity duration-300">
            <div>
                <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <svg className={`w-5 h-5 ${isSimulationMode ? 'text-purple-500' : 'text-brand-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    Schengen Shield
                </h3>
            </div>
            {status && (
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide shadow-sm backdrop-blur-md ${
                    isSimulationMode ? 'bg-purple-100 text-purple-600 border-purple-200' :
                    status.riskLevel === RiskLevel.SAFE ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                    status.riskLevel === RiskLevel.WARNING ? 'bg-amber-100 text-amber-600 border-amber-200' :
                    'bg-red-100 text-red-600 border-red-200'
                }`}>
                    {status.riskLevel}
                </div>
            )}
        </div>

        {/* Chart Container - Fixed Height approach for Recharts stability */}
        {/* We keep this rendered but blur it/overlay it if loading */}
        {status && (
             <>
                <div className="relative w-full h-[240px] flex items-center justify-center">
                    {/* Glow Effect */}
                    <div 
                        className="absolute w-40 h-40 rounded-full blur-2xl opacity-20 transition-colors duration-1000"
                        style={{ backgroundColor: strokeColor }}
                    ></div>

                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                            cx="50%" 
                            cy="50%" 
                            innerRadius="70%" 
                            outerRadius="100%" 
                            barSize={16} 
                            data={data} 
                            startAngle={180} 
                            endAngle={-180}
                        >
                                <PolarAngleAxis type="number" domain={[0, 90]} angleAxisId={0} tick={false} />
                                <RadialBar
                                dataKey="value"
                                cornerRadius={100}
                                background={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                                className="drop-shadow-lg"
                                />
                        </RadialBarChart>
                    </ResponsiveContainer>

                    {/* Central Shield Icon & Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className={`mb-1 transition-colors duration-500 ${
                                isSimulationMode ? 'text-purple-500' : 'text-brand-500'
                        }`}>
                            <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L12 11l-6-6 1.414-1.414L12 8.172l4.293-4.293 1.414 1.414z" clipRule="evenodd" opacity="0" /><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18L18 7.5V13c0 4.1-2.55 8.08-6 9.58-3.45-1.5-6-5.48-6-9.58V7.5l6-3.32z"/></svg>
                        </div>
                        <div className={`text-4xl font-heading font-bold tracking-tighter drop-shadow-sm transition-colors duration-500 ${isSimulationMode ? 'text-purple-600 dark:text-purple-400' : 'text-slate-900 dark:text-white'}`}>
                            {status.schengenDaysRemaining}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mt-1">
                            Days Left
                        </div>
                    </div>
                </div>

                {/* Footer Metrics */}
                <div className="w-full grid grid-cols-2 gap-4 pt-4 mt-auto">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
                        <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Used</div>
                        <div className="text-lg font-bold text-slate-700 dark:text-slate-200">{status.schengenDaysUsed} <span className="text-[10px] font-normal text-slate-400">/ 90</span></div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
                        <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Reset</div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate" title={status.resetDate || "N/A"}>
                            {status.resetDate ? status.resetDate : "Rolling"}
                        </div>
                    </div>
                </div>
             </>
        )}
        
        {/* Placeholder structure to maintain height if no status yet */}
        {!status && (
            <div className="w-full h-[300px]"></div>
        )}
    </div>
  );
};

export default FreedomMeter;