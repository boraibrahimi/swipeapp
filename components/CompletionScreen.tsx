import React, { useState } from 'react';
import { Button } from './Button';
import { Decision, Principle } from '../types';
import { PRINCIPLES_LIST, THEME } from '../constants';

interface CompletionScreenProps {
  userName: string;
  decisions: Record<string, Decision>;
  rankedPrinciples?: string[];
  onReset: () => void;
  onSubmit: () => Promise<void>;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({ 
  userName, 
  decisions, 
  rankedPrinciples = [], 
  onReset,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const keptPrinciples = PRINCIPLES_LIST.filter(p => decisions[p.id] === 'kept');
  const discardedPrinciples = PRINCIPLES_LIST.filter(p => decisions[p.id] === 'discarded');

  // Filter out the ranked ones from the general kept list for display purposes
  const otherKept = keptPrinciples.filter(p => !rankedPrinciples.includes(p.id));
  
  // Get full principle objects for the ranked IDs
  const rankedObjects = rankedPrinciples
    .map(id => PRINCIPLES_LIST.find(p => p.id === id))
    .filter((p): p is Principle => !!p);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit();
    setIsSubmitting(false);
    setHasSubmitted(true);
  };

  const downloadResults = () => {
    const data = {
      user: userName,
      date: new Date().toISOString(),
      summary: {
        total: PRINCIPLES_LIST.length,
        kept: keptPrinciples.length,
        discarded: discardedPrinciples.length,
      },
      top5: rankedObjects.map(p => p.text),
      otherKept: otherKept.map(p => p.text),
      discarded: discardedPrinciples.map(p => p.text)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `principles_${userName}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${THEME.colors.background} p-6 flex flex-col`}>
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full animate-in zoom-in duration-500 pb-20">
        
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mt-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className={`text-2xl font-bold ${THEME.colors.textPrimary}`}>Analysis Complete</h1>
          <p className={`${THEME.colors.textSecondary} text-sm`}>
            {userName}'s Principle Stack
          </p>
        </div>

        {/* Top 5 Section */}
        {rankedObjects.length > 0 && (
          <div className="mb-8">
            <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4 text-center">Core Priorities</h3>
            <div className="space-y-3">
              {rankedObjects.map((p, idx) => (
                <div key={p.id} className="flex items-center p-4 bg-slate-900 border border-indigo-500/30 rounded-xl relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                  <span className="text-2xl font-bold text-indigo-500/50 mr-4 w-6">{idx + 1}</span>
                  <span className="text-white font-medium">{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{keptPrinciples.length}</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">Total Kept</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
            <div className="text-3xl font-bold text-rose-400 mb-1">{discardedPrinciples.length}</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">Discarded</div>
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          {!hasSubmitted ? (
            <Button 
              onClick={handleSubmit} 
              fullWidth 
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Submit to Leaderboard'}
            </Button>
          ) : (
             <div className="w-full py-3 bg-emerald-900/30 border border-emerald-900 rounded-lg text-emerald-400 text-center text-sm font-semibold">
               Results Submitted Successfully
             </div>
          )}

          <Button onClick={downloadResults} fullWidth variant="outline">
            Download Report
          </Button>
          
          <Button onClick={onReset} fullWidth variant="secondary">
            Start New Session
          </Button>
        </div>
      </div>
    </div>
  );
};