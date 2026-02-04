import React, { useState, useEffect } from 'react';
import { EntryScreen } from './components/EntryScreen';
import { SwipeDeck } from './components/SwipeDeck';
import { PrioritizationScreen } from './components/PrioritizationScreen';
import { CompletionScreen } from './components/CompletionScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { AppPhase, Decision } from './types';
import { LAST_USER_KEY, STORAGE_KEY_PREFIX, PRINCIPLES_LIST } from './constants';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>('entry');
  const [userName, setUserName] = useState<string>('');
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [rankedIds, setRankedIds] = useState<string[]>([]);

  useEffect(() => {
    // Check for existing session
    const lastUser = localStorage.getItem(LAST_USER_KEY);
    if (lastUser) {
      if (lastUser.toLowerCase() === 'egzon') {
        setUserName(lastUser);
        setPhase('admin');
        return;
      }

      setUserName(lastUser);
      // Check if they finished or are in progress
      const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${lastUser}`);
      if (data) {
        const parsed = JSON.parse(data);
        const decisionCount = Object.keys(parsed.decisions || {}).length;
        
        // Restore state
        setDecisions(parsed.decisions || {});
        if (parsed.rankedPrinciples) {
            setRankedIds(parsed.rankedPrinciples);
        }

        if (decisionCount >= PRINCIPLES_LIST.length) {
            // They finished swiping. Did they finish prioritizing?
            // If they have rankedPrinciples (or if they kept 0 principles), they are done.
            // Otherwise, they need to prioritize.
            
            const keptCount = Object.values(parsed.decisions).filter(d => d === 'kept').length;
            
            if (keptCount > 0 && (!parsed.rankedPrinciples || parsed.rankedPrinciples.length === 0)) {
                setPhase('prioritization');
            } else {
                setPhase('complete');
            }
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
    
    // Admin check
    if (name.toLowerCase() === 'egzon') {
      setPhase('admin');
      return;
    }
    
    // Check if this specific user has previous data
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${name}`);
    if (data) {
        const parsed = JSON.parse(data);
        setDecisions(parsed.decisions || {});
        if (parsed.rankedPrinciples) setRankedIds(parsed.rankedPrinciples);

        const decisionCount = Object.keys(parsed.decisions || {}).length;
        if (decisionCount >= PRINCIPLES_LIST.length) {
            const keptCount = Object.values(parsed.decisions).filter(d => d === 'kept').length;
            if (keptCount > 0 && (!parsed.rankedPrinciples || parsed.rankedPrinciples.length === 0)) {
                setPhase('prioritization');
            } else {
                setPhase('complete');
            }
            return;
        }
    }
    setPhase('swiping');
  };

  const saveResultsToSupabase = async () => {
    // Ensure we have a username, fallback to localStorage if state is somehow missing
    const userToSave = userName || localStorage.getItem(LAST_USER_KEY) || 'Anonymous';
    
    console.log('Attempting to save results to Supabase...', { 
        user: userToSave, 
        decisionsCount: Object.keys(decisions).length, 
        rankedCount: rankedIds.length 
    });

    try {
      const { data, error } = await supabase.from('principle_results').insert({
        user_name: userToSave,
        decisions: decisions,
        ranked_principles: rankedIds, 
        completed_at: new Date().toISOString()
      }).select();
      
      if (error) {
        console.error('Supabase INSERT Error:', error);
        alert(`Error saving to database: ${error.message}. Please verify the table 'principle_results' exists and has correct permissions.`);
      } else {
        console.log('Results saved successfully:', data);
      }
    } catch (err: any) {
      console.error('Unexpected error saving results:', err);
      alert(`Unexpected error saving results: ${err.message}`);
    }
  };

  const handleSwipeComplete = (newDecisions: Record<string, Decision>) => {
    setDecisions(newDecisions);
    
    const keptCount = Object.values(newDecisions).filter(d => d === 'kept').length;
    
    if (keptCount > 0) {
        setPhase('prioritization');
    } else {
        setPhase('complete');
    }
  };

  const handlePrioritizationComplete = (ids: string[]) => {
      setRankedIds(ids);
      
      // Update local storage with the final ranked list
      const dataStr = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userName}`);
      if (dataStr) {
          const data = JSON.parse(dataStr);
          data.rankedPrinciples = ids;
          localStorage.setItem(`${STORAGE_KEY_PREFIX}${userName}`, JSON.stringify(data));
      }
      // Note: Data is NOT saved here anymore, it is saved via the button on CompletionScreen
      setPhase('complete');
  };

  const handleReset = () => {
    localStorage.removeItem(LAST_USER_KEY);
    setUserName('');
    setDecisions({});
    setRankedIds([]);
    setPhase('entry');
  };

  const getKeptPrinciples = () => {
      return PRINCIPLES_LIST.filter(p => decisions[p.id] === 'kept');
  };

  return (
    <main className="antialiased text-slate-100 bg-slate-950 min-h-screen">
      {phase === 'entry' && (
        <EntryScreen onStart={handleStart} />
      )}
      
      {phase === 'swiping' && (
        <SwipeDeck 
          userName={userName} 
          onComplete={handleSwipeComplete} 
        />
      )}

      {phase === 'prioritization' && (
        <PrioritizationScreen 
            keptPrinciples={getKeptPrinciples()}
            onConfirm={handlePrioritizationComplete}
        />
      )}
      
      {phase === 'complete' && (
        <CompletionScreen 
          userName={userName} 
          decisions={decisions}
          rankedPrinciples={rankedIds}
          onReset={handleReset} 
          onSubmit={saveResultsToSupabase}
        />
      )}

      {phase === 'admin' && (
        <AdminDashboard onExit={handleReset} />
      )}
    </main>
  );
};

export default App;