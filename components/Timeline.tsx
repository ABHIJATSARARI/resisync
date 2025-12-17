import React, { useState } from 'react';
import { Trip } from '../types';

interface TimelineProps {
  trips: Trip[];
  onDelete: (id: string) => void;
}

// Helper to map common nomad destinations to codes if missing
const getCountryCode = (trip: Trip): string | null => {
  if (trip.countryCode) return trip.countryCode.toLowerCase();
  
  const map: Record<string, string> = {
    'spain': 'es', 'uk': 'gb', 'united kingdom': 'gb', 'france': 'fr', 'germany': 'de',
    'italy': 'it', 'portugal': 'pt', 'usa': 'us', 'united states': 'us', 'america': 'us',
    'japan': 'jp', 'thailand': 'th', 'indonesia': 'id', 'bali': 'id', 
    'mexico': 'mx', 'canada': 'ca', 'australia': 'au', 'croatia': 'hr', 
    'greece': 'gr', 'netherlands': 'nl', 'switzerland': 'ch', 'ireland': 'ie',
    'vietnam': 'vn', 'singapore': 'sg', 'malaysia': 'my', 'china': 'cn',
    'india': 'in', 'brazil': 'br', 'argentina': 'ar', 'colombia': 'co'
  };
  return map[trip.country.toLowerCase()] || null;
}

const Timeline: React.FC<TimelineProps> = ({ trips, onDelete }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Sort trips by date
  const sortedTrips = [...trips].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // --- Calendar Logic ---
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Generate days for the grid (Current month + next 2 months)
  const getCalendarDays = () => {
    const days = [];
    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 3, 0); // 3 months roughly
    
    // Add padding for start of week
    const startDay = start.getDay() === 0 ? 6 : start.getDay() - 1; // Mon start
    for(let i=0; i<startDay; i++) days.push(null);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
    }
    return days;
  };

  const calendarDays = getCalendarDays();

  const getTripForDay = (date: Date) => {
    return trips.find(t => {
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        // Reset hours for comparison
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        const current = new Date(date);
        current.setHours(0,0,0,0);
        return current >= start && current <= end;
    });
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 min-h-[280px] relative rounded-3xl border border-white/20 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col bg-noise">
      
      {/* Header with Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 relative z-10 gap-3">
        <div>
            <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-white flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                 Movement Log
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase mt-0.5 ml-4">Scheduled Itinerary</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                    viewMode === 'list' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
                Pass
            </button>
            <button 
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                    viewMode === 'calendar' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
                Calendar
            </button>
        </div>
      </div>
      
      {/* --- LIST VIEW --- */}
      {viewMode === 'list' && (
        <div className="overflow-x-auto hide-scroll pb-4 relative z-10 flex-grow">
            {/* Decorative Line Background only for list */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0"></div>

            <div className="flex items-center gap-0 min-w-max px-2 py-3 h-full">
            {sortedTrips.length === 0 ? (
                <div className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    </div>
                    <h4 className="text-slate-900 dark:text-white font-medium text-sm">No trips planned</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Add your first destination</p>
                </div>
            ) : (
                sortedTrips.map((trip, index) => {
                const start = new Date(trip.startDate);
                const end = new Date(trip.endDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                const countryCode = getCountryCode(trip);
                
                const now = new Date();
                const isActive = now >= start && now <= end;
                const isFuture = start > now;
                const isPast = end < now;

                // Simulation Styles
                const simStyles = trip.isSimulation 
                    ? "border-purple-300 dark:border-purple-700 border-dashed bg-purple-50 dark:bg-purple-900/10" 
                    : "";

                return (
                    <div key={trip.id} className="relative group flex items-center h-full">
                        <div className="relative min-w-[220px] px-3">
                            {/* Line Segment */}
                            <div className={`absolute top-1/2 left-0 w-full h-[2px] -z-10 transition-colors ${
                                isActive ? 'bg-brand-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 
                                isFuture ? 'bg-slate-200 dark:bg-slate-700' :
                                'bg-slate-300 dark:bg-slate-600'
                            }`}></div>
                            
                            <div className={`
                                p-0 rounded-xl border backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative z-10 flex flex-col h-full group-hover:z-20 overflow-hidden
                                ${trip.isSchengen && !trip.isSimulation
                                    ? 'border-emerald-200/50 dark:border-emerald-800/50 bg-white dark:bg-slate-800' 
                                    : !trip.isSimulation 
                                        ? 'border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800'
                                        : ''}
                                ${simStyles}
                                ${isActive ? 'ring-2 ring-brand-500 shadow-md shadow-brand-500/10' : ''}
                            `}>
                                {/* Active Badge */}
                                {isActive && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-b-md shadow-sm z-20 animate-pulse">
                                        NOW
                                    </div>
                                )}

                                {/* Top Section: Country & Flag */}
                                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                         <div className={`relative w-8 h-8 shadow-sm rounded-lg overflow-hidden shrink-0 ${trip.isSchengen ? 'ring-2 ring-emerald-400/50' : 'ring-1 ring-slate-200 dark:ring-slate-600'}`}>
                                            {countryCode ? (
                                                <img 
                                                    src={`https://flagcdn.com/w80/${countryCode}.png`}
                                                    alt={trip.country}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">{trip.country.substring(0,2)}</div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate max-w-[100px]">
                                                {trip.country}
                                            </h4>
                                            <div className="flex gap-1 mt-0.5">
                                                {trip.isSchengen && <span className="text-[8px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-1 py-0.5 rounded">EU</span>}
                                                {trip.isSimulation && <span className="text-[8px] font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 px-1 py-0.5 rounded">SIM</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onDelete(trip.id)}
                                        className="text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>

                                {/* Bottom Section: Dates */}
                                <div className="p-2.5 flex items-center justify-between text-[10px]">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">IN</span>
                                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                                            {new Date(trip.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-col items-center px-1">
                                        <div className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded-full">
                                            {days}d
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">OUT</span>
                                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                                            {new Date(trip.endDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Connection Dot */}
                            {index < sortedTrips.length - 1 && (
                                <div className={`absolute top-1/2 -right-2 w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center transition-colors ${
                                    isActive ? 'bg-brand-500 border-white dark:border-slate-900' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                                }`}>
                                    <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-white' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                </div>
                            )}
                        </div>
                    </div>
                );
                })
            )}
            </div>
        </div>
      )}

      {/* --- CALENDAR VIEW --- */}
      {viewMode === 'calendar' && (
        <div className="w-full flex-grow flex flex-col animate-in fade-in duration-300">
             {/* Days Header */}
             <div className="grid grid-cols-7 gap-1 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">{day}</div>
                ))}
             </div>
             
             {/* Calendar Grid */}
             <div className="grid grid-cols-7 gap-1 auto-rows-fr flex-grow">
                 {calendarDays.map((date, idx) => {
                     if (!date) return <div key={idx} className="bg-transparent"></div>;

                     const trip = getTripForDay(date);
                     const isToday = date.toDateString() === new Date().toDateString();
                     const isFirstDay = date.getDate() === 1;

                     return (
                         <div 
                            key={idx} 
                            className={`
                                relative p-1 min-h-[50px] rounded-lg border flex flex-col justify-between transition-colors
                                ${isToday ? 'ring-2 ring-brand-500 z-10' : ''}
                                ${trip 
                                    ? (trip.isSimulation
                                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 border-dashed'
                                        : trip.isSchengen 
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                                            : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800')
                                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/50'
                                }
                            `}
                         >
                             <div className="flex justify-between items-start">
                                 <span className={`text-[10px] font-semibold ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
                                     {date.getDate()}
                                 </span>
                                 {isFirstDay && <span className="text-[8px] font-bold text-slate-400 uppercase">{date.toLocaleString('default', { month: 'short' })}</span>}
                             </div>
                             
                             {trip && (
                                 <div className="mt-1">
                                     <div className={`text-[8px] font-bold truncate px-1 py-0.5 rounded ${
                                         trip.isSimulation
                                         ? 'text-purple-700 bg-purple-100 dark:bg-purple-900 dark:text-purple-300'
                                         : trip.isSchengen 
                                            ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300' 
                                            : 'text-indigo-700 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300'
                                     }`}>
                                         {trip.country}
                                     </div>
                                 </div>
                             )}
                         </div>
                     );
                 })}
             </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;