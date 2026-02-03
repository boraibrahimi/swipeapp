import React, { useState, useEffect } from 'react';
import { EntryScreen } from './components/EntryScreen';
import { SwipeDeck } from './components/SwipeDeck';
import { CompletionScreen } from './components/CompletionScreen';
import { AppPhase, Decision } from './types';
import { LAST_USER_KEY, STORAGE_KEY_PREFIX, PRINCIPLES_LIST } from './constants';

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>('entry');
  const [userName, setUserName] = useState<string>('');
  const [finalDecisions, setFinalDecisions] = useState<Record<string, Decision>>({});

  useEffect(() => {
    // Check for existing session
    const lastUser = localStorage.getItem(LAST_USER_KEY);
    if (lastUser) {
      setUserName(lastUser);
      // Check if they finished or are in progress
      const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${lastUser}`);
      if (data) {
        const parsed = JSON.parse(data);
        const decisionCount = Object.keys(parsed.decisions || {}).length;
        
        if (decisionCount >= PRINCIPLES_LIST.length) {
          setFinalDecisions(parsed.decisions);
          setPhase('complete');
        } else {
          setPhase('swiping');
        }
      } else {
        setPhase('entry');
      }
    }
  }, []);

  const handleStart = (name: string) => {
    setUserName(name);
    localStorage.setItem(LAST_USER_KEY, name);
    
    // Check if this specific user has previous data
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${name}`);
    if (data) {
        const parsed = JSON.parse(data);
        const decisionCount = Object.keys(parsed.decisions || {}).length;
        if (decisionCount >= PRINCIPLES_LIST.length) {
            setFinalDecisions(parsed.decisions);
            setPhase('complete');
            return;
        }
    }
    setPhase('swiping');
  };

  const handleComplete = (decisions: Record<string, Decision>) => {
    setFinalDecisions(decisions);
    setPhase('complete');
  };

  const handleReset = () => {
    localStorage.removeItem(LAST_USER_KEY);
    setUserName('');
    setPhase('entry');
    setFinalDecisions({});
  };

  return (
    <main className="antialiased text-slate-100 bg-slate-950 min-h-screen">
      {phase === 'entry' && (
        <EntryScreen onStart={handleStart} />
      )}
      
      {phase === 'swiping' && (
        <SwipeDeck 
          userName={userName} 
          onComplete={handleComplete} 
        />
      )}
      
      {phase === 'complete' && (
        <CompletionScreen 
          userName={userName} 
          decisions={finalDecisions} 
          onReset={handleReset} 
        />
      )}
    </main>
  );
};

export default App;
