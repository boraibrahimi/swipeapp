import React from 'react';
import { Button } from './Button';
import { Decision, Principle } from '../types';
import { PRINCIPLES_LIST, THEME } from '../constants';

interface CompletionScreenProps {
  userName: string;
  decisions: Record<string, Decision>;
  onReset: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({ userName, decisions, onReset }) => {
  const keptPrinciples = PRINCIPLES_LIST.filter(p => decisions[p.id] === 'kept');
  const discardedPrinciples = PRINCIPLES_LIST.filter(p => decisions[p.id] === 'discarded');

  const downloadResults = () => {
    const data = {
      user: userName,
      date: new Date().toISOString(),
      summary: {
        total: PRINCIPLES_LIST.length,
        kept: keptPrinciples.length,
        discarded: discardedPrinciples.length,
      },
      kept: keptPrinciples.map(p => p.text),
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
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full space-y-8 animate-in zoom-in duration-500">
        
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className={`text-3xl font-bold ${THEME.colors.textPrimary}`}>Session Complete</h1>
          <p className={`${THEME.colors.textSecondary}`}>
            Great job, {userName}. You've refined your stack.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
            <div className="text-4xl font-bold text-emerald-400 mb-1">{keptPrinciples.length}</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">Kept</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
            <div className="text-4xl font-bold text-rose-400 mb-1">{discardedPrinciples.length}</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">Discarded</div>
          </div>
        </div>

        <div className="w-full space-y-4 pt-8">
          <Button onClick={downloadResults} fullWidth variant="primary">
            Download Results (JSON)
          </Button>
          
          <Button onClick={onReset} fullWidth variant="secondary">
            Start New Session
          </Button>
        </div>
      </div>
      
      <div className="mt-8 text-center">
         <p className="text-xs text-slate-600">Principle Stack v1.0</p>
      </div>
    </div>
  );
};
