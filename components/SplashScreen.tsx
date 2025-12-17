import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [videoEnded, setVideoEnded] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 600);
    }, 300);
  };

  // Fallback timeout in case video doesn't load
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!videoEnded) {
        handleVideoEnd();
      }
    }, 8000); // 8 second max timeout
    return () => clearTimeout(timeout);
  }, [videoEnded]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center transition-all duration-600 ${
        fadeOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Video Container */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl shadow-brand-500/20 border border-white/10">
          <video
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            className="w-full h-full object-cover"
          >
            <source src={`${import.meta.env.BASE_URL}logo.mp4`} type="video/mp4" />
          </video>
          
          {/* Overlay Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none"></div>
        </div>

        {/* Brand Name */}
        <div className={`mt-8 text-center transition-all duration-700 ${videoEnded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tight">
            Resi<span className="text-brand-400">Sync</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2 tracking-widest uppercase">
            Digital Nomad Compliance
          </p>
        </div>

        {/* Loading Indicator */}
        {!videoEnded && (
          <div className="mt-8 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Corner Accents */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-white/10 rounded-tl-2xl"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-white/10 rounded-tr-2xl"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-white/10 rounded-bl-2xl"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-white/10 rounded-br-2xl"></div>

      {/* Version */}
      <div className="absolute bottom-6 text-center w-full">
        <p className="text-slate-600 text-xs tracking-wider">v1.0.0 • Made for Digital Nomads</p>
      </div>
    </div>
  );
};

export default SplashScreen;
