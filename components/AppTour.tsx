import React, { useState, useEffect } from 'react';

interface AppTourProps {
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    id: 1,
    title: "Welcome to ResiSync",
    subtitle: "Your Digital Nomad Companion",
    description: "Navigate the complex world of visa regulations, tax residency rules, and travel compliance with AI-powered intelligence.",
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
    color: "from-brand-500 to-purple-600",
    bgPattern: "radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)"
  },
  {
    id: 2,
    title: "Schengen Shield",
    subtitle: "90/180 Day Rule Tracker",
    description: "Stay compliant with the Schengen Area's strict 90-day rule. Our real-time tracker monitors your days used and remaining within the rolling 180-day window.",
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
      </svg>
    ),
    color: "from-emerald-500 to-teal-600",
    bgPattern: "radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)"
  },
  {
    id: 3,
    title: "Tax Residency Intelligence",
    subtitle: "Avoid Unintended Tax Obligations",
    description: "Track days spent in each country and get alerts when you're approaching tax residency thresholds (typically 183 days). Stay tax-efficient while traveling.",
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path>
      </svg>
    ),
    color: "from-amber-500 to-orange-600",
    bgPattern: "radial-gradient(circle at 20% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)"
  },
  {
    id: 4,
    title: "AI-Powered Insights",
    subtitle: "Personalized Strategy from Gemini",
    description: "Get real-time recommendations powered by Google's Gemini AI. Understand destination-specific rules, visa requirements, and optimal travel strategies.",
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
      </svg>
    ),
    color: "from-purple-500 to-pink-600",
    bgPattern: "radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)"
  },
  {
    id: 5,
    title: "Simulation Mode",
    subtitle: "Plan Before You Travel",
    description: "Test future trips before booking. See how planned travel affects your compliance status and tax exposure without committing to actual travel.",
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
      </svg>
    ),
    color: "from-cyan-500 to-blue-600",
    bgPattern: "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)"
  },
  {
    id: 6,
    title: "You're All Set!",
    subtitle: "Start Your Journey",
    description: "ResiSync is your trusted companion for borderless living. Add your trips, track your compliance, and travel with confidence.",
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
      </svg>
    ),
    color: "from-rose-500 to-red-600",
    bgPattern: "radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.15) 0%, transparent 50%)"
  }
];

const AppTour: React.FC<AppTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setDirection('next');
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setDirection('prev');
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isLastStep, isFirstStep]);

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0" style={{ background: step.bgPattern }}></div>
      
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}></div>

      {/* Logo in corner */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="ResiSync" className="w-10 h-10 rounded-xl shadow-lg" />
        <span className="text-white font-heading font-bold text-lg hidden sm:block">ResiSync</span>
      </div>

      {/* Skip Button */}
      <button 
        onClick={handleSkip}
        className="absolute top-6 right-6 text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
      >
        Skip Tour
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
        </svg>
      </button>

      {/* Main Content Card */}
      <div className="relative max-w-lg w-full">
        <div 
          key={currentStep}
          className={`bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl animate-in ${
            direction === 'next' ? 'slide-in-from-right-8' : 'slide-in-from-left-8'
          } fade-in duration-500`}
        >
          {/* Icon */}
          <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} p-4 text-white shadow-xl shadow-brand-500/20`}>
            {step.icon}
          </div>

          {/* Step Counter */}
          <div className="text-center mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Step {step.id} of {TOUR_STEPS.length}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white text-center mb-2">
            {step.title}
          </h2>
          
          {/* Subtitle */}
          <p className={`text-sm font-semibold text-center mb-4 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
            {step.subtitle}
          </p>

          {/* Description */}
          <p className="text-slate-300 text-center leading-relaxed text-sm md:text-base">
            {step.description}
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentStep ? 'next' : 'prev');
                  setCurrentStep(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep 
                    ? 'w-8 bg-gradient-to-r ' + step.color
                    : idx < currentStep 
                      ? 'bg-white/40' 
                      : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="flex-1 py-3 px-6 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex-1 py-3 px-6 rounded-xl bg-gradient-to-r ${step.color} text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02]`}
            >
              {isLastStep ? 'Get Started' : 'Next'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-600 text-xs hidden md:flex items-center gap-4">
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono">←</kbd>
          <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono">→</kbd>
          Navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono">Esc</kbd>
          Skip
        </span>
      </div>
    </div>
  );
};

export default AppTour;
