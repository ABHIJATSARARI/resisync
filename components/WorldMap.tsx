import React, { useMemo, useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Trip, UserProfile } from '../types';
import { getDestinationInsights } from '../services/geminiService';

interface WorldMapProps {
  trips: Trip[];
  onSelectTrip?: (trip: Trip) => void;
  selectedTrip?: Trip | null;
  profile?: UserProfile | null;
}

// Coordinate mapping for a standard equirectangular projection (approximate for 1000x500 SVG)
// x: 0-1000, y: 0-500
const COUNTRY_COORDS: Record<string, { x: number; y: number }> = {
  // North America
  'US': { x: 230, y: 160 }, 'CA': { x: 200, y: 100 }, 'MX': { x: 200, y: 220 },
  'CR': { x: 230, y: 250 }, 'PA': { x: 240, y: 260 },
  
  // South America
  'BR': { x: 320, y: 350 }, 'AR': { x: 290, y: 420 }, 'CO': { x: 260, y: 280 },
  'CL': { x: 270, y: 400 }, 'PE': { x: 260, y: 320 },

  // Europe
  'GB': { x: 465, y: 130 }, 'UK': { x: 465, y: 130 }, 'IE': { x: 455, y: 130 },
  'FR': { x: 475, y: 155 }, 'ES': { x: 460, y: 170 }, 'PT': { x: 450, y: 170 },
  'DE': { x: 495, y: 145 }, 'IT': { x: 505, y: 165 }, 'NL': { x: 485, y: 140 },
  'BE': { x: 480, y: 145 }, 'CH': { x: 490, y: 155 }, 'AT': { x: 505, y: 150 },
  'GR': { x: 530, y: 180 }, 'PL': { x: 520, y: 140 }, 'SE': { x: 510, y: 100 },
  'NO': { x: 495, y: 100 }, 'FI': { x: 530, y: 95 },  'DK': { x: 495, y: 130 },
  'CZ': { x: 505, y: 145 }, 'HU': { x: 520, y: 155 }, 'HR': { x: 515, y: 160 },
  'RO': { x: 540, y: 160 }, 'BG': { x: 545, y: 170 }, 'TR': { x: 570, y: 180 },

  // Asia
  'RU': { x: 700, y: 100 }, 'CN': { x: 780, y: 190 }, 'JP': { x: 880, y: 180 },
  'KR': { x: 840, y: 180 }, 'IN': { x: 700, y: 240 }, 'TH': { x: 780, y: 260 },
  'VN': { x: 800, y: 260 }, 'ID': { x: 820, y: 310 }, 'MY': { x: 800, y: 290 },
  'SG': { x: 800, y: 300 }, 'PH': { x: 850, y: 270 }, 'AE': { x: 630, y: 220 },
  'SA': { x: 600, y: 220 }, 'IL': { x: 590, y: 200 },

  // Oceania
  'AU': { x: 870, y: 400 }, 'NZ': { x: 970, y: 450 },

  // Africa
  'ZA': { x: 540, y: 400 }, 'EG': { x: 550, y: 210 }, 'MA': { x: 450, y: 190 },
  'KE': { x: 580, y: 300 }, 'NG': { x: 490, y: 270 }, 'GH': { x: 470, y: 270 }
};

const getCoords = (code?: string, name?: string) => {
  if (code && COUNTRY_COORDS[code.toUpperCase()]) return COUNTRY_COORDS[code.toUpperCase()];
  
  // Fallback mapping for common names if code is missing
  if (name) {
    const n = name.toLowerCase();
    if (n.includes('united states') || n.includes('usa') || n.includes('america')) return COUNTRY_COORDS['US'];
    if (n.includes('united kingdom') || n.includes('uk')) return COUNTRY_COORDS['GB'];
    if (n.includes('uae') || n.includes('dubai')) return COUNTRY_COORDS['AE'];
    if (n.includes('bali')) return COUNTRY_COORDS['ID'];
  }
  
  return null;
};

export const WorldMap: React.FC<WorldMapProps> = ({ trips, onSelectTrip, selectedTrip, profile }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  // --- Zoom & Pan State ---
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort and prepare trip coordinates
  const tripPath = useMemo(() => {
    const sorted = [...trips].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    return sorted.map(trip => {
      const coords = getCoords(trip.countryCode, trip.country);
      return { ...trip, coords };
    }).filter(t => t.coords !== null); // Filter out unmapped locations
  }, [trips]);

  // Generate SVG Path for the trajectory
  const trajectoryPath = useMemo(() => {
    if (tripPath.length < 2) return '';
    
    return tripPath.reduce((path, trip, i) => {
      if (i === 0) return `M ${trip.coords!.x} ${trip.coords!.y}`;
      
      const prev = tripPath[i - 1];
      const curr = trip;
      
      // Bezier curve logic for smoother lines
      const midX = (prev.coords!.x + curr.coords!.x) / 2;
      const midY = (prev.coords!.y + curr.coords!.y) / 2;
      const dist = Math.sqrt(Math.pow(curr.coords!.x - prev.coords!.x, 2) + Math.pow(curr.coords!.y - prev.coords!.y, 2));
      const arcFactor = dist * 0.2; 
      const cpY = midY - arcFactor;

      return `${path} Q ${midX} ${cpY} ${curr.coords!.x} ${curr.coords!.y}`;
    }, '');
  }, [tripPath]);

  // Fetch insights when a trip is selected
  useEffect(() => {
    const fetchInsight = async () => {
      if (selectedTrip && profile) {
        setLoading(true);
        setShowPopover(true);
        const data = await getDestinationInsights(selectedTrip.country, profile);
        setInsight(data);
        setLoading(false);

        // Auto-Focus on the selected trip's location
        const coords = getCoords(selectedTrip.countryCode, selectedTrip.country);
        if (coords && containerRef.current) {
            const containerW = containerRef.current.clientWidth;
            const containerH = containerRef.current.clientHeight;
            // Center the map on the country
            // Current map is 1000x500. 
            // Target scale 2 for focus
            const targetK = 2.5;
            const targetX = (containerW / 2) - (coords.x * targetK);
            const targetY = (containerH / 2) - (coords.y * targetK);
            
            setView({ x: targetX, y: targetY, k: targetK });
        }
      }
    };
    fetchInsight();
  }, [selectedTrip, profile]);

  const handleClosePopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPopover(false);
  };

  // --- Controls Handlers ---

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const scaleSensitivity = 0.001;
    const delta = -e.deltaY * scaleSensitivity;
    const newK = Math.min(Math.max(0.5, view.k + delta), 8); // Limits: 0.5x to 8x

    // Zoom towards pointer logic
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new position to keep mouse pointer fixed relative to map content
    const newX = mouseX - ((mouseX - view.x) / view.k) * newK;
    const newY = mouseY - ((mouseY - view.y) / view.k) * newK;

    setView({ k: newK, x: newX, y: newY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - view.x, y: e.clientY - view.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setView(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
      // Zoom into center
      if (!containerRef.current) return;
      const centerK = Math.min(view.k * 1.5, 8);
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const newX = centerX - ((centerX - view.x) / view.k) * centerK;
      const newY = centerY - ((centerY - view.y) / view.k) * centerK;
      setView({ k: centerK, x: newX, y: newY });
  };

  const handleZoomOut = () => {
      if (!containerRef.current) return;
      const centerK = Math.max(view.k / 1.5, 0.5);
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const newX = centerX - ((centerX - view.x) / view.k) * centerK;
      const newY = centerY - ((centerY - view.y) / view.k) * centerK;
      setView({ k: centerK, x: newX, y: newY });
  };

  const handleReset = () => {
      setView({ x: 0, y: 0, k: 1 });
  };

  return (
    <div 
        ref={containerRef}
        className={`relative w-full h-full bg-slate-100 dark:bg-slate-900 overflow-hidden group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
        
        {/* Map Header */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
            <h3 className="text-xl font-heading font-bold text-slate-800 dark:text-white flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                 Global Footprint
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase mt-1 ml-4">Interactive View</p>
        </div>

        {/* --- Controls --- */}
        <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-2">
            <button onClick={handleZoomIn} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300" title="Zoom In">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </button>
            <button onClick={handleZoomOut} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300" title="Zoom Out">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
            </button>
            <button onClick={handleReset} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300" title="Reset View">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            </button>
        </div>

        {/* --- INSIGHT POPOVER OVERLAY --- */}
        {showPopover && selectedTrip && (
            <div className="absolute top-4 right-4 z-50 w-80 max-h-[calc(100%-32px)] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-2xl animate-in fade-in slide-in-from-right-8 duration-300 pointer-events-auto cursor-default">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-lg">
                             {selectedTrip.countryCode ? <img src={`https://flagcdn.com/w40/${selectedTrip.countryCode.toLowerCase()}.png`} className="w-full h-full object-cover rounded-lg" alt="" /> : '✈️'}
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{selectedTrip.country}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">AI Briefing</p>
                         </div>
                    </div>
                    <button 
                        onClick={handleClosePopover}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="space-y-3 animate-pulse">
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                        </div>
                    ) : (
                        <div className="prose prose-xs dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 text-slate-600 dark:text-slate-300">
                             <ReactMarkdown>{insight || "Fetching intelligence..."}</ReactMarkdown>
                        </div>
                    )}
                </div>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide hover:underline">
                        View Full Visa Report →
                    </button>
                </div>
            </div>
        )}

        {/* The World Map SVG Container */}
        {/* We use a transform here to handle Pan/Zoom */}
        <div 
            className="w-full h-full transition-transform duration-75 ease-out"
            style={{ 
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
                transformOrigin: '0 0'
            }}
        >
            <svg viewBox="0 0 1000 500" className="w-[1000px] h-[500px]">
                 <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                    </linearGradient>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-300 dark:text-slate-800" opacity="0.3"/>
                    </pattern>
                 </defs>

                 {/* Grid Background (Coordinate System) */}
                 <rect width="100%" height="100%" fill="url(#grid)" />
                 
                 {/* Latitude Lines */}
                 <line x1="0" y1="250" x2="1000" y2="250" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-700" strokeDasharray="4 4" opacity="0.5" />
                 <line x1="0" y1="125" x2="1000" y2="125" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800" strokeDasharray="2 2" opacity="0.5" />
                 <line x1="0" y1="375" x2="1000" y2="375" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800" strokeDasharray="2 2" opacity="0.5" />

                 {/* World Map Silhouette */}
                 <path 
                    d="M841,130c2,2,8-3,9,0s-1,10-1,10s8-1,11,4c1,2,7-4,7-4s2,9-1,14c-1,1,2,5,5,5c7,0,13-13,20-9c2,1,1,7,4,9
                    c3,2,11,1,11,5c0,4-1,10,3,11c4,2,2,9,6,9c5,0,8,6,8,12c0,3,4,3,4,8c0,5-7,8-11,7c-4-1-8,2-10,7c-1,4-12,4-15,6c-1,1-1,8-7,8
                    c-4,0-3,6-7,5c-5-2-12,1-15,6c-4,5-9,3-14-1c-2-2-7-2-10,0c-1,0-1,5,1,8c2,2,4,4,4,10c0,5-6,6-8,5c-5-1-6,6-8,8c-3,2-9,1-12,4
                    c-2,3-8,2-9,8c0,4-3,4-5,4c-1,0-4,3-3,8c0,4,3,10-1,14c-2,3-8,2-10,4c-3,2-8,6-13,6c-1,0-2-6-5-5c-2,0-3,4-4,6c-3,3-7,2-12-1
                    c-2-1-6,0-9,0c-3,0-8,6-10,3c-3-3-4-8-7-9c-2,0-6,1-8,3c-1,1-2,6-5,5c-3-1-5-6-9-6c-4-1-7-3-11-2c-4,1-10,6-15,3c-3-2-2-8-6-10
                    c-2-1-8-4-9-1c-1,2,0,8-4,8c-3,1-8-3-11,0c-1,1-1,5,1,7c4,5,10,5,13,11c2,4-1,8,0,11c2,3,7,4,7,9c0,2-4,4-4,8c-1,4,1,8,2,10
                    c1,2,6,2,7,5c0,1-1,4-1,7c0,5,5,10,2,13c-3,3-13,2-15,6c-2,3,0,9-3,10c-3,1-8-5-10-2c-3,3-1,9,0,12c0,2-1,5-4,5c-2,0-5-3-7-2
                    c-4,2-4,8-7,10c-2,2-6,0-10,0c-2,0-1,5-2,6c-2,3-9,1-12,1c-2,0-2,6-3,7c0,2,3,5,1,7c-2,2-9,3-11,2c-2-1-3-7-7-6c-4,0-6,7-10,6
                    c-1,0-2-4-4-3c-4,1-6,7-11,7c-3,0-4-5-8-5c-4,0-9,5-13,4c-2,0-4-3-4-7c0-1,3-3,2-5c0-1-6-1-8-1c-2,0-3,3-6,2c-2-1-2-5-4-5
                    c-2,0-6,3-8,3c-3,0-3-5-6-6c-1,0-3,2-5,1c-3-1-4-5-6-8c-2-2,0-8-3-10c-1-1-6,1-7-1c-1-2-3-4,0-6c2-1,4-4,3-8c-1-2-5-1-7-3
                    c-1-1,0-5-1-7c-1-2-5-2-5-6c0-2,4-3,2-7c-1-2-5-1-7-3c-1-2,1-5,0-8c-1-1-5-1-5-4c0-4,5-7,4-11c-1-2-5-1-6-5c-1-2,1-5-1-7
                    c-2-1-6,0-7-2c-1-1,0-5-2-6c-2-1-5-1-6-4c-1-2,0-5-3-6c-3-2-7-1-8-4c-1-1-1-5-3-5c-4-1-6,5-10,2c-3-2-4-7-7-8c-2-1-6-1-6-4
                    c-1-2,1-6-1-8c-2-1-5-1-6-3c-2-2-1-6-4-6c-2,0-5,3-7,2c-3-1-3-7-7-6c-1,0-4,3-5,2c-3-1-2-5-5-6c-2-1-7,1-7-1c-1-2,1-7,0-8
                    c-1-1-6,1-7-1c-1-2,2-4,0-6c-1-1-5,0-6-2c-1-1,0-5-2-6c-2-1-5,0-5-3c0-1,1-4,1-5c-1-1-5-1-5-3c0-2,2-5,1-7c-1-1-4-2-4-4
                    c0-3,3-4,2-7c0-2-4-3-3-6c1-2,6-2,4-7c-1-2-7-1-9-3c-1-1,1-5-1-7c-1-1-3-3-6-2c-2,0-4,4-6,4c-1,0-3-3-5-3c-3,0-5,3-8,2
                    c-2-1-1-7-3-7c-3,0-6,3-9,1c-1-1-1-6-3-6c-3-1-6,2-9,0c-2-1-3-5-6-5c-1,0-3,2-4,1c-3-2-5-5-10-3c-2,1-4,4-7,4c-3,0-3-5-5-5
                    c-3,0-4,5-7,4c-3-1-7-3-8-1c-1,2,1,6-1,7c-1,1-3-1-4,1c-2,2-5,2-7,4c-1,1,0,5-1,6c-2,2-7,2-8,5c-1,2,0,5-2,6c-1,1-4,0-6,2
                    c-2,2-1,7-3,7c-1,0-4-3-6-2c-2,1-2,5-4,6c-3,0-4-6-7-4c-2,1-5,2-5,4c0,2,2,4,0,5c-3,2-5-2-7-1c-2,1-1,5-4,6c-1,1-3,2-3,4
                    c0,3,4,4,3,8c0,2-4,3-4,6c0,2,3,4,2,6c-1,2-5,2-5,5c0,1,2,4,0,5c-2,1-5-1-6,1c-2,2-1,7-4,7c-2,1-5,0-5,2c0,1,2,4,0,5
                    c-2,1-6-1-7,1c-1,2,1,5-1,6c-1,1-4,0-5,2c-1,1,0,5-2,6c-1,1-5,0-5,2c0,1,2,4,0,6c-2,1-6-2-8,0c-1,1,0,4-2,5c-2,1-6-1-7,1
                    c-1,1,1,5-1,6c-1,1-5,1-5,4c0,1,3,3,1,4c-3,1-6-2-9,0c-1,1,0,5-2,5c-1,1-4,0-5,2c-2,2-1,6-4,7c-2,1-6,0-7,2c-1,1,0,4-2,5
                    c-2,1-6,1-7,3c-1,1,0,4-3,5c-2,0-6-1-7,1c-2,2-1,6-4,7c-2,1-6,1-7,3c-1,1,0,4-3,5c-2,0-5-2-7,0c-1,2,0,6-3,7c-2,0-5-2-6,0
                    c-2,2-1,6-4,6c-2,0-6,1-7,3c-1,1,0,4-2,5c-2,1-6,0-7,2c-1,1,0,5-2,6c-1,1-5,1-5,3c0,2,2,4,0,6c-2,1-6-2-8,0c-1,1-1,4-3,4
                    c-4,1-6,5-11,3c-2-1-3-5-6-5c-2,0-4,3-4,6c-1,1-4,0-6,2c-2,2-2,6-4,6c-2,0-5-2-7,0c-2,2,0,6-3,7c-2,1-6,0-7,2c-2,2-1,6-4,7
                    c-2,1-5,0-6,2c-1,2,1,5-1,6c-1,1-5,0-6,2c-1,1,0,5-2,6c-1,1-5,0-5,2c0,1,2,4,0,6c-2,1-5-1-6,0c-2,2,0,5-2,6c-3,1-7-1-8,2
                    c-1,2,2,6-1,7c-1,1-4,0-6,2c-2,2,0,6-3,7c-2,1-5-1-6,0c-2,1-1,5-4,6c-1,1-3,2-3,4c0,3,4,3,2,6c-1,2-6,2-6,5c0,1,3,3,1,4
                    c-2,2-6-1-8,1c-1,1,0,4-2,6c-1,1-4,0-5,2c-2,2,0,6-3,7c-2,1-5-1-6,0c-2,2-1,5-3,6c-2,1-5,0-6,2c-1,1,1,5-1,6c-1,1-5,1-5,3
                    c0,1,2,4,0,5c-2,1-6-1-7,1c-1,2,1,5-1,6c-1,1-5,0-5,2c0,2,2,4,0,6c-2,1-5-1-6,0c-2,1-1,4-3,5c-2,1-5,0-6,2c-1,1,1,5-1,6
                    c-1,1-4,0-5,2c-2,2-1,5-3,7c-2,1-6,1-7,3c-1,1,1,5-1,6c-1,1-4,0-6,2c-1,1,0,4-2,5c-2,1-6,1-7,3c-1,1,1,5-1,6c-2,1-5,1-6,3
                    c-1,1,0,4-2,5c-2,1-5,1-6,3c-1,1,1,4-1,6c-1,1-4,1-5,3c-1,1,0,4-2,5c-2,1-5,1-6,3c-1,1,1,4-1,5c-2,1-4,1-5,3c-2,1-1,5-3,6
                    c-1,1-4,1-5,3c-1,1,1,4-1,5c-2,1-4,1-6,3c-1,1-1,4-3,5c-2,1-4,1-5,3c-1,1,1,4-1,5c-2,1-4,1-6,3c-1,1-1,4-3,5c-2,1-4,1-5,3
                    c-1,1,1,4-1,5c-2,1-4,1-6,3c-1,1-1,4-3,5c-2,1-4,1-5,3" 
                    className="text-slate-300 dark:text-slate-700 fill-current opacity-60 pointer-events-none"
                 />
                 
                 {/* Trajectory Lines */}
                 <path 
                    d={trajectoryPath} 
                    fill="none" 
                    stroke="url(#lineGradient)" 
                    strokeWidth="2" 
                    strokeDasharray="4 2"
                    className="animate-[dash_30s_linear_infinite]"
                    filter="url(#glow)"
                 />

                 {/* Trip Markers */}
                 {tripPath.map((trip, idx) => (
                    <g 
                        key={trip.id} 
                        className="group cursor-pointer" 
                        onClick={(e) => {
                            e.stopPropagation();
                            if(onSelectTrip) onSelectTrip(trip);
                        }}
                    >
                        {/* Pulse Effect (scales inverse to zoom to stay consistent size) */}
                        <circle 
                            cx={trip.coords!.x} 
                            cy={trip.coords!.y} 
                            r={(idx === tripPath.length - 1 ? 12 : 6) / Math.sqrt(view.k)} 
                            className={`opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${trip.isSchengen ? 'fill-emerald-500' : 'fill-indigo-500'}`}
                        >
                            <animate attributeName="opacity" values="0.6;0" dur="2s" repeatCount="indefinite" />
                        </circle>

                        {/* Core Dot (Inverse Scale to keep visual size constant) */}
                        <circle 
                            cx={trip.coords!.x} 
                            cy={trip.coords!.y} 
                            r={4 / Math.sqrt(view.k)}
                            className={`stroke-[0.5] stroke-white dark:stroke-slate-900 transition-all duration-300 ${
                                trip.isSimulation 
                                    ? 'fill-purple-500' 
                                    : trip.isSchengen ? 'fill-emerald-500' : 'fill-indigo-500'
                            }`} 
                        />
                        
                        {/* Simple Tooltip on Hover (hidden if popover is active for this trip) */}
                        {/* We use scale(1/k) to keep the tooltip readable and constant size regardless of zoom */}
                        <g 
                            className={`opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none ${selectedTrip?.id === trip.id && showPopover ? 'hidden' : ''}`}
                            transform={`translate(${trip.coords!.x}, ${trip.coords!.y}) scale(${1/view.k}) translate(15, -45)`}
                        >
                            {/* Card Background */}
                            <rect 
                                x="0" 
                                y="0" 
                                width="140" 
                                height="60" 
                                rx="8" 
                                className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-600 stroke-1 shadow-2xl"
                                filter="url(#glow)"
                            />
                            {/* Country Name */}
                            <text 
                                x="10" 
                                y="20" 
                                className="text-[12px] font-bold fill-slate-800 dark:fill-white"
                                fontSize="12"
                            >
                                {trip.country}
                            </text>
                            {/* Date Range */}
                            <text 
                                x="10" 
                                y="35" 
                                className="text-[9px] fill-slate-500 dark:fill-slate-400"
                                fontSize="9"
                            >
                                {new Date(trip.startDate).toLocaleDateString()}
                            </text>
                            {/* CTA */}
                            <text 
                                x="10" 
                                y="53" 
                                className="text-[8px] font-semibold fill-brand-500 uppercase tracking-wide"
                                fontSize="8"
                            >
                                Click for Intel →
                            </text>
                        </g>
                    </g>
                 ))}
            </svg>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-6 left-6 flex gap-4 text-xs font-semibold z-10 pointer-events-none">
            <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 dark:text-slate-400">Schengen Area</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span className="text-slate-600 dark:text-slate-400">Rest of World</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-slate-600 dark:text-slate-400">Simulation</span>
            </div>
        </div>
    </div>
  );
};