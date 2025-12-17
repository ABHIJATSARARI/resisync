import React, { useState, useEffect, useCallback } from 'react';
import FreedomMeter from './components/FreedomMeter';
import Timeline from './components/Timeline';
import SmartAdvice from './components/SmartAdvice';
import TaxTracker from './components/TaxTracker';
import AiAssistant from './components/AiAssistant';
import Onboarding from './components/Onboarding';
import { WorldMap } from './components/WorldMap';
import DestinationInsights from './components/DestinationInsights';
import DocumentWallet from './components/DocumentWallet';
import SplashScreen from './components/SplashScreen';
import AppTour from './components/AppTour';
import { analyzeCompliance, parseTravelText } from './services/geminiService';
import { Trip, ComplianceStatus, UserProfile } from './types';

// Simple UUID generator fallback
const generateId = () => Math.random().toString(36).substr(2, 9);

const SCHENGEN_COUNTRIES = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Czech Republic", "Denmark", 
  "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", 
  "Italy", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", 
  "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Slovakia", 
  "Slovenia", "Spain", "Sweden", "Switzerland"
];

const INITIAL_TRIPS: Trip[] = [
  { id: '1', country: 'Spain', countryCode: 'ES', startDate: '2023-10-01', endDate: '2023-11-15', isSchengen: true, notes: 'Client meetings in Madrid' },
  { id: '2', country: 'UK', countryCode: 'GB', startDate: '2023-11-16', endDate: '2023-12-20', isSchengen: false, notes: 'Visiting family' },
  { id: '3', country: 'France', countryCode: 'FR', startDate: '2024-01-05', endDate: '2024-02-05', isSchengen: true },
];

// Color Palettes
const THEMES = {
  default: {
    // Indigo Palette
    50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 
    400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 
    800: '#3730a3', 900: '#312e81', 950: '#1e1b4b'
  },
  india: {
    // Saffron/Orange Palette
    50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
    400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
    800: '#9a3412', 900: '#7c2d12', 950: '#431407'
  }
};

// --- Reusable Dashboard Card Component ---
const DashboardCard = ({ 
    children, 
    className = "", 
    delay = 0,
    noPadding = false 
}: { 
    children: React.ReactNode, 
    className?: string, 
    delay?: number,
    noPadding?: boolean 
}) => (
  <div 
    className={`relative overflow-hidden rounded-[2rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-slate-700/50 shadow-2xl transition-all duration-700 hover:shadow-brand-500/10 dark:hover:shadow-brand-500/5 hover:border-brand-500/20 group animate-in fade-in slide-in-from-bottom-6 fill-mode-backwards bg-noise ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Tech corners (Subtle Frame) */}
    <div className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-slate-200/50 dark:border-slate-700/50 rounded-tl-2xl opacity-40 group-hover:opacity-100 group-hover:border-brand-500/40 transition-all duration-500 z-10 pointer-events-none"></div>
    <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-slate-200/50 dark:border-slate-700/50 rounded-tr-2xl opacity-40 group-hover:opacity-100 group-hover:border-brand-500/40 transition-all duration-500 z-10 pointer-events-none"></div>
    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-slate-200/50 dark:border-slate-700/50 rounded-bl-2xl opacity-40 group-hover:opacity-100 group-hover:border-brand-500/40 transition-all duration-500 z-10 pointer-events-none"></div>
    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-slate-200/50 dark:border-slate-700/50 rounded-br-2xl opacity-40 group-hover:opacity-100 group-hover:border-brand-500/40 transition-all duration-500 z-10 pointer-events-none"></div>
    
    <div className={`h-full w-full ${noPadding ? '' : 'p-0'}`}>
        {children}
    </div>
  </div>
);

const App: React.FC = () => {
  // Splash & Tour State - Always show on every refresh
  const [showSplash, setShowSplash] = useState(true);
  const [showTour, setShowTour] = useState(false);

  // Initialize trips from localStorage or fallback to initial
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem('resisync_trips');
      return saved ? JSON.parse(saved) : INITIAL_TRIPS;
    } catch (e) {
      return INITIAL_TRIPS;
    }
  });

  // Simulation State
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [simulationTrips, setSimulationTrips] = useState<Trip[]>([]);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const [status, setStatus] = useState<ComplianceStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRetrying, setIsRetrying] = useState(false); // New state for retries

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parseInput, setParseInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  
  // User Profile for Personalization
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('resisync_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Combine real and simulation trips for analysis if mode is active
  const activeTrips = isSimulationMode ? [...trips, ...simulationTrips] : trips;

  // Save real trips to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('resisync_trips', JSON.stringify(trips));
  }, [trips]);

  // Theme State
  const [darkMode, setDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'default' | 'india'>('default');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Validation State
  const [formErrors, setFormErrors] = useState<{country?: string, startDate?: string, endDate?: string}>({});
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);

  // New Trip Form State
  const [newTrip, setNewTrip] = useState<Partial<Trip>>({
    country: '', startDate: '', endDate: '', isSchengen: false, notes: '', document: undefined
  });

  // Apply Theme & Dark Mode
  useEffect(() => {
    // Toggle Dark Mode Class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Inject CSS Variables for Brand Colors
    const palette = THEMES[currentTheme];
    const root = document.documentElement;
    Object.entries(palette).forEach(([shade, value]) => {
      root.style.setProperty(`--brand-${shade}`, value);
    });
  }, [darkMode, currentTheme]);

  const runAnalysis = useCallback(async () => {
    if (!userProfile) return; // Wait for onboarding
    setLoading(true);
    setIsRetrying(false); // Reset retry state
    
    // Use activeTrips (real + sim) for analysis, pass callback for retry UI
    const result = await analyzeCompliance(activeTrips, userProfile, () => setIsRetrying(true));
    
    setStatus(result);
    setLoading(false);
    setIsRetrying(false);
  }, [activeTrips, userProfile]);

  useEffect(() => {
    // Increased debounce to 2000ms to avoid rate limiting during hot reloads or typing
    const timer = setTimeout(() => {
        runAnalysis();
    }, 2000);
    return () => clearTimeout(timer);
  }, [runAnalysis]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('resisync_profile', JSON.stringify(profile));
  };

  const resetForm = () => {
    setNewTrip({ country: '', startDate: '', endDate: '', isSchengen: false, notes: '', document: undefined });
    setFormErrors({});
    setShowErrorAnimation(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
    resetForm();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewTrip(prev => ({ ...prev, document: { name: file.name, file: file } }));
    }
  };

  const removeFile = () => {
    setNewTrip(prev => ({ ...prev, document: undefined }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Robust Auto-Schengen Logic
  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const countryInput = e.target.value;
    const isSchengenStrict = SCHENGEN_COUNTRIES.some(sc => countryInput.toLowerCase().includes(sc.toLowerCase()));

    setNewTrip(prev => ({
        ...prev,
        country: countryInput,
        isSchengen: isSchengenStrict
    }));
    
    if (formErrors.country) setFormErrors({...formErrors, country: undefined});
  };

  const handleAddTrip = () => {
    const errors: {country?: string, startDate?: string, endDate?: string} = {};
    if (!newTrip.country?.trim()) errors.country = "Country is required";
    if (!newTrip.startDate) errors.startDate = "Start date is required";
    if (!newTrip.endDate) errors.endDate = "End date is required";
    if (newTrip.startDate && newTrip.endDate && newTrip.startDate > newTrip.endDate) {
        errors.endDate = "End date cannot be before start date";
    }
    if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setShowErrorAnimation(true);
        setTimeout(() => setShowErrorAnimation(false), 800);
        return;
    }
    if (newTrip.country && newTrip.startDate && newTrip.endDate) {
      const tripToAdd: Trip = { ...newTrip, id: generateId() } as Trip;
      
      if (isSimulationMode) {
          // Add to simulation state with flag
          setSimulationTrips([...simulationTrips, { ...tripToAdd, isSimulation: true }]);
      } else {
          // Add to real trips
          setTrips([...trips, tripToAdd]);
      }
      closeModal();
    }
  };

  const handleDeleteTrip = (id: string) => {
    // Check if it's in real or sim
    if (simulationTrips.some(t => t.id === id)) {
        setSimulationTrips(simulationTrips.filter(t => t.id !== id));
    } else {
        setTrips(trips.filter(t => t.id !== id));
    }
    if (selectedTripId === id) setSelectedTripId(null);
  };

  const handleAttachDocument = (tripId: string, file: File) => {
    setTrips(prev => prev.map(t => {
        if (t.id === tripId) {
            return { ...t, document: { name: file.name, file } };
        }
        return t;
    }));
  };

  const handleSmartParse = async () => {
    if (!parseInput.trim()) return;
    setIsParsing(true);
    const parsed = await parseTravelText(parseInput);
    setIsParsing(false);
    if (parsed.country) {
        setNewTrip(prev => ({
            ...prev,
            ...parsed,
            isSchengen: parsed.isSchengen !== undefined ? parsed.isSchengen : true
        }));
        setFormErrors({});
    }
  };

  const handleTripSelect = (trip: Trip) => {
    setSelectedTripId(trip.id);
  };

  const getSelectedTrip = () => {
    return activeTrips.find(t => t.id === selectedTripId) || null;
  }

  // Identify current trip for insights (or selected trip)
  const getDisplayTrip = () => {
    // Default logic for the bottom row component
    const today = new Date();
    // Sort by date
    const sorted = [...activeTrips].sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    // Find active trip
    const active = sorted.find(t => new Date(t.startDate) <= today && new Date(t.endDate) >= today);
    if (active) return active;

    // Or find next upcoming trip
    const next = sorted.find(t => new Date(t.startDate) > today);
    return next || sorted[sorted.length - 1]; // Fallback to last trip
  };

  return (
    <div className={`min-h-screen relative font-inter transition-colors duration-500 overflow-x-hidden
      ${currentTheme === 'india' 
        ? 'bg-orange-50 dark:bg-slate-950' 
        : 'bg-slate-100 dark:bg-slate-950'}`}
    >
      {/* Splash Screen - Shows on every page load */}
      {showSplash && (
        <SplashScreen onComplete={() => {
          setShowSplash(false);
          setShowTour(true);
        }} />
      )}

      {/* App Tour - Shows after splash */}
      {showTour && <AppTour onComplete={() => setShowTour(false)} />}

      {/* Dynamic Background Texture */}
      <div className={`fixed inset-0 pointer-events-none z-0 opacity-40 dark:opacity-20 transition-opacity duration-1000
        ${currentTheme === 'india' ? 'bg-india-pattern' : 'bg-grid-pattern'}`} 
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-t from-slate-200/50 via-transparent to-white/50 dark:from-slate-950 dark:via-transparent dark:to-slate-900/50"></div>

      {/* Onboarding Modal */}
      {!userProfile && <Onboarding onComplete={handleOnboardingComplete} />}
      
      {/* Document Wallet Overlay */}
      {isWalletOpen && <DocumentWallet trips={trips} onClose={() => setIsWalletOpen(false)} onAttachDocument={handleAttachDocument} />}

      {/* --- Floating Header --- */}
      <header className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8 mb-8">
         <div className="max-w-7xl mx-auto">
             <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-2xl shadow-lg p-3 flex justify-between items-center transition-all duration-300">
                {/* Brand */}
                <div className="flex items-center gap-3 pl-2">
                   <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg transform hover:rotate-6 transition-all duration-500 ring-2 ring-white/20">
                      <img src={`${import.meta.env.BASE_URL}logo.png`} alt="ResiSync" className="w-full h-full object-cover" />
                   </div>
                   <div className="hidden sm:block">
                      <h1 className="text-xl font-heading font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                        ResiSync
                      </h1>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {isSimulationMode ? 'Future Simulation' : 'Compliance Shield'}
                      </p>
                   </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => setIsWalletOpen(true)}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative group"
                        title="Wallet"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                    </button>
                    
                     <button 
                        onClick={() => {
                            setIsSimulationMode(!isSimulationMode);
                            if(isSimulationMode) setSimulationTrips([]); // Reset on exit
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border text-xs font-bold uppercase tracking-wide ${
                            isSimulationMode 
                            ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent'
                        }`}
                    >
                        {isSimulationMode ? 'Sim Active' : 'Simulate'}
                    </button>

                    <button 
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                    >
                        {darkMode ? (
                            <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        ) : (
                             <svg className="w-5 h-5 text-indigo-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                        )}
                    </button>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                    <button 
                        onClick={openModal}
                        className={`text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2 ${
                            isSimulationMode 
                            ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30' 
                            : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/30'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        <span className="hidden sm:inline text-xs font-bold uppercase tracking-wide">{isSimulationMode ? 'Add Sim' : 'New Trip'}</span>
                    </button>
                </div>
             </div>
         </div>
      </header>

      {/* --- Main Dashboard Content --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-min">
            
            {/* 1. Freedom Shield (Top Left - Key Status) */}
            <DashboardCard className="md:col-span-4 lg:col-span-3 min-h-[380px]" delay={100} noPadding>
                <FreedomMeter 
                    status={status} 
                    loading={loading} 
                    isSimulationMode={isSimulationMode}
                    isRetrying={isRetrying} 
                />
            </DashboardCard>

            {/* 2. World Map (Top Center/Right - Context) */}
            <DashboardCard className="md:col-span-8 lg:col-span-6 min-h-[380px]" delay={200} noPadding>
                <WorldMap trips={activeTrips} onSelectTrip={handleTripSelect} selectedTrip={getSelectedTrip()} profile={userProfile} />
            </DashboardCard>

            {/* 3. Smart Advice (Right Column - AI Strategy) */}
            <DashboardCard className="md:col-span-12 lg:col-span-3 min-h-[280px] lg:min-h-[380px]" delay={300} noPadding>
                 <SmartAdvice status={status} />
            </DashboardCard>

            {/* 4. Timeline (Full Width on second row - Main Action Area) */}
            <DashboardCard className="md:col-span-12 lg:col-span-8 min-h-[280px]" delay={400} noPadding>
                <Timeline trips={activeTrips} onDelete={handleDeleteTrip} />
            </DashboardCard>

            {/* 5. Tax Tracker (Right side of row 2) */}
            <DashboardCard className="md:col-span-6 lg:col-span-4 min-h-[280px]" delay={500} noPadding>
                <TaxTracker trips={activeTrips} />
            </DashboardCard>

            {/* 6. Destination Insights (Bottom - Horizontal Layout) */}
            <DashboardCard className="md:col-span-6 lg:col-span-12" delay={600} noPadding>
                <DestinationInsights trip={getDisplayTrip()} profile={userProfile} />
            </DashboardCard>

        </div>

      </main>

      {/* Floating AI Assistant */}
      <AiAssistant trips={activeTrips} profile={userProfile} />

      {/* Modal for Adding Trips */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden scale-100 transition-transform border border-white/20 dark:border-slate-700 ring-1 ring-black/5">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
                    <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {isSimulationMode && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded uppercase tracking-wider">Sim Mode</span>}
                        {isSimulationMode ? 'Simulate Trip' : 'Plan a Journey'}
                    </h3>
                    <button onClick={closeModal} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-6 space-y-5 bg-noise">
                    
                    {/* Smart Parsing Feature */}
                    <div className={`bg-gradient-to-br border rounded-2xl p-4 transition-all focus-within:ring-2 ${
                        isSimulationMode 
                        ? 'from-purple-50/80 to-transparent dark:from-purple-900/20 border-purple-100 dark:border-purple-800 focus-within:ring-purple-500/20' 
                        : 'from-brand-50/80 to-transparent dark:from-brand-900/20 border-brand-100 dark:border-brand-800 focus-within:ring-brand-500/20'
                    }`}>
                        <label className={`block text-xs font-bold mb-2 flex items-center gap-2 uppercase tracking-wide ${
                            isSimulationMode ? 'text-purple-700 dark:text-purple-300' : 'text-brand-700 dark:text-brand-300'
                        }`}>
                             <svg className={`w-4 h-4 ${isSimulationMode ? 'text-purple-500' : 'text-brand-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            AI Quick Add
                        </label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={parseInput}
                                onChange={(e) => setParseInput(e.target.value)}
                                placeholder="e.g., 'London for 2 weeks starting tomorrow'"
                                className={`flex-1 text-sm bg-white dark:bg-slate-800 border-0 shadow-sm rounded-xl p-3 focus:ring-2 placeholder:text-slate-400 text-slate-800 dark:text-slate-100 ${
                                    isSimulationMode ? 'focus:ring-purple-500' : 'focus:ring-brand-500'
                                }`}
                            />
                            <button 
                                onClick={handleSmartParse}
                                disabled={isParsing}
                                className={`text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg disabled:opacity-50 transition-all ${
                                    isSimulationMode 
                                    ? 'bg-purple-600 shadow-purple-500/20 hover:bg-purple-700' 
                                    : 'bg-brand-600 shadow-brand-500/20 hover:bg-brand-700'
                                }`}
                            >
                                {isParsing ? '...' : 'Go'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Destination <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={newTrip.country}
                                onChange={handleCountryChange}
                                className={`w-full bg-slate-50 dark:bg-slate-800/50 border rounded-xl p-3.5 outline-none focus:ring-2 transition-all dark:text-white ${
                                    formErrors.country 
                                    ? 'border-red-300 focus:ring-red-200 bg-red-50/50' 
                                    : 'border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-brand-100'
                                }`}
                                placeholder="Search country..."
                            />
                            {formErrors.country && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">{formErrors.country}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Start <span className="text-red-500">*</span></label>
                                <input 
                                    type="date" 
                                    value={newTrip.startDate}
                                    onChange={(e) => {
                                        setNewTrip({...newTrip, startDate: e.target.value});
                                        if (formErrors.startDate) setFormErrors({...formErrors, startDate: undefined});
                                    }}
                                    className={`w-full bg-slate-50 dark:bg-slate-800/50 border rounded-xl p-3.5 outline-none focus:ring-2 transition-all dark:text-white ${
                                        formErrors.startDate 
                                        ? 'border-red-300 focus:ring-red-200' 
                                        : 'border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-brand-100'
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">End <span className="text-red-500">*</span></label>
                                <input 
                                    type="date" 
                                    value={newTrip.endDate}
                                    onChange={(e) => {
                                        setNewTrip({...newTrip, endDate: e.target.value});
                                        if (formErrors.endDate) setFormErrors({...formErrors, endDate: undefined});
                                    }}
                                    className={`w-full bg-slate-50 dark:bg-slate-800/50 border rounded-xl p-3.5 outline-none focus:ring-2 transition-all dark:text-white ${
                                        formErrors.endDate 
                                        ? 'border-red-300 focus:ring-red-200' 
                                        : 'border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-brand-100'
                                    }`}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
                            <textarea
                                value={newTrip.notes || ''}
                                onChange={(e) => setNewTrip({...newTrip, notes: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-brand-100 focus:border-brand-500 outline-none resize-none h-20 text-sm dark:text-white"
                                placeholder="Add context for the AI..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Proof of Travel</label>
                            <div className="flex items-center gap-2">
                                <label className="cursor-pointer bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 w-full justify-center border-dashed border-2">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                    {newTrip.document ? 'Change File' : 'Upload Ticket/Visa'}
                                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
                                </label>
                            </div>
                            {newTrip.document && (
                                <div className="mt-2 flex items-center gap-3 bg-brand-50 dark:bg-brand-900/20 px-3 py-2 rounded-lg border border-brand-100 dark:border-brand-800/50">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-brand-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-xs font-semibold text-brand-900 dark:text-brand-100 truncate">{newTrip.document.name}</span>
                                        <span className="text-[10px] text-brand-600 dark:text-brand-300">{formatFileSize(newTrip.document.file.size)}</span>
                                    </div>
                                    <button onClick={removeFile} className="text-brand-400 hover:text-red-500 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30 cursor-pointer" onClick={() => setNewTrip({...newTrip, isSchengen: !newTrip.isSchengen})}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${newTrip.isSchengen ? 'bg-emerald-500 border-emerald-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                                {newTrip.isSchengen && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                            </div>
                            <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                                Schengen Area Trip
                                {newTrip.country && SCHENGEN_COUNTRIES.some(sc => newTrip.country?.toLowerCase().includes(sc.toLowerCase())) && (
                                    <span className="text-[9px] bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 px-1.5 py-0.5 rounded-full font-bold">AUTO-DETECTED</span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button 
                        onClick={closeModal}
                        className="px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAddTrip}
                        className={`text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-xl transition-all 
                            ${showErrorAnimation 
                                ? 'bg-red-600 animate-pulse hover:bg-red-700' 
                                : isSimulationMode
                                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                                    : 'bg-brand-600 hover:bg-brand-700 hover:scale-105 shadow-brand-500/20'
                            }`}
                    >
                        {showErrorAnimation ? 'Check Fields' : (isSimulationMode ? 'Simulate Trip' : 'Add to Timeline')}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;