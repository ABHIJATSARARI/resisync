import React, { useState } from 'react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const GOALS = [
  "Tax Optimization",
  "Visa Freedom",
  "Adventure / Travel",
  "Work-Life Balance",
  "Cultural Immersion",
  "Networking"
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    nationality: '',
    currentLocation: '',
    travelGoals: []
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const toggleGoal = (goal: string) => {
    setProfile(prev => {
      const goals = prev.travelGoals.includes(goal)
        ? prev.travelGoals.filter(g => g !== goal)
        : [...prev.travelGoals, goal];
      return { ...prev, travelGoals: goals };
    });
  };

  const isStep1Valid = profile.nationality.trim() !== '' && profile.currentLocation.trim() !== '';
  const isStep2Valid = profile.travelGoals.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 bg-grid-pattern animate-in fade-in duration-500">
      {/* Dynamic Backglow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-2xl bg-white/5 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden relative flex flex-col min-h-[500px]">
        
        {/* Top Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800/50">
             <div 
                className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
             ></div>
        </div>

        <div className="p-12 flex-grow flex flex-col justify-center relative z-10">
            {step === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-10 fade-in duration-500">
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-500/30 mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <h2 className="text-4xl font-heading font-bold text-white tracking-tight">Setup Identity</h2>
                        <p className="text-slate-400 text-lg">Initialize your global compliance shield.</p>
                    </div>

                    <div className="space-y-6 max-w-sm mx-auto w-full">
                        <div className="group">
                            <label className="block text-xs font-bold text-brand-300 uppercase tracking-widest mb-2 group-focus-within:text-brand-400 transition-colors">Passport Nationality</label>
                            <input
                                type="text"
                                value={profile.nationality}
                                onChange={e => setProfile({...profile, nationality: e.target.value})}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-white placeholder:text-slate-600 transition-all text-lg"
                                placeholder="e.g. United States"
                            />
                        </div>
                         <div className="group">
                            <label className="block text-xs font-bold text-brand-300 uppercase tracking-widest mb-2 group-focus-within:text-brand-400 transition-colors">Current Base</label>
                            <input
                                type="text"
                                value={profile.currentLocation}
                                onChange={e => setProfile({...profile, currentLocation: e.target.value})}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-white placeholder:text-slate-600 transition-all text-lg"
                                placeholder="e.g. Bali, Indonesia"
                            />
                        </div>
                    </div>
                     
                     <div className="pt-4 max-w-sm mx-auto w-full">
                        <button
                            onClick={handleNext}
                            disabled={!isStep1Valid}
                            className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-xl shadow-brand-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Continue →
                        </button>
                     </div>
                </div>
            )}

            {step === 2 && (
                 <div className="space-y-8 animate-in slide-in-from-right-10 fade-in duration-500">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-heading font-bold text-white">Strategic Priorities</h2>
                        <p className="text-slate-400">What drives your nomadic lifestyle?</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                        {GOALS.map(goal => (
                            <button
                                key={goal}
                                onClick={() => toggleGoal(goal)}
                                className={`p-4 rounded-2xl border text-sm font-semibold transition-all text-left flex items-center justify-between group
                                    ${profile.travelGoals.includes(goal)
                                        ? 'border-brand-500 bg-brand-500/20 text-white ring-1 ring-brand-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                                        : 'border-slate-700 hover:border-slate-500 bg-slate-800/30 text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                {goal}
                                {profile.travelGoals.includes(goal) && (
                                    <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4 max-w-lg mx-auto w-full pt-6">
                        <button onClick={handleBack} className="px-8 py-4 text-slate-400 font-bold hover:text-white transition-colors">Back</button>
                        <button
                            onClick={handleNext}
                            disabled={!isStep2Valid}
                            className="flex-1 py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-xl shadow-brand-500/20 transition-all transform hover:scale-[1.02]"
                        >
                            Confirm Selection
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                 <div className="text-center space-y-8 animate-in zoom-in-95 fade-in duration-500 py-4 flex flex-col items-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-2 animate-bounce">
                         <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    
                    <div>
                        <h2 className="text-4xl font-heading font-bold text-white mb-4">Systems Calibrated</h2>
                        <p className="text-slate-300 text-lg max-w-md mx-auto leading-relaxed">
                            We've configured your compliance shield for a <strong className="text-white">{profile.nationality}</strong> passport holder.
                        </p>
                    </div>

                    <button
                        onClick={() => onComplete(profile)}
                        className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/20 transition-all transform hover:scale-105 hover:-translate-y-1"
                    >
                        Launch Dashboard
                    </button>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;