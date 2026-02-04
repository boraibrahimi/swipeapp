import React, { useState, useEffect, useCallback } from 'react';
import { SwipeCard } from './SwipeCard';
import { PRINCIPLES_LIST, STORAGE_KEY_PREFIX } from '../constants';
import { SwipeDirection, Decision } from '../types';
import { THEME } from '../constants';
import { Button } from './Button';

interface SwipeDeckProps {
  userName: string;
  onComplete: (decisions: Record<string, Decision>) => void;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({ userName, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  
  // Load previous progress if any
  useEffect(() => {
    const savedData = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userName}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.decisions) {
          setDecisions(parsed.decisions);
          setCurrentIndex(Object.keys(parsed.decisions).length);
        }
      } catch (e) {
        console.error("Failed to load progress", e);
      }
    }
  }, [userName]);

  const updateStorage = (newDecisions: Record<string, Decision>) => {
     localStorage.setItem(`${STORAGE_KEY_PREFIX}${userName}`, JSON.stringify({
      userName,
      decisions: newDecisions,
      lastUpdated: new Date().toISOString()
    }));
  };

  const handleSwipe = useCallback((direction: SwipeDirection) => {
    const currentPrinciple = PRINCIPLES_LIST[currentIndex];
    if (!currentPrinciple) return;

    const decision: Decision = direction === SwipeDirection.RIGHT ? 'kept' : 'discarded';
    
    // Optimistic Update
    const newDecisions = { ...decisions, [currentPrinciple.id]: decision };
    setDecisions(newDecisions);
    updateStorage(newDecisions);

    // Move next
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    // Check completion
    if (nextIndex >= PRINCIPLES_LIST.length) {
      onComplete(newDecisions);
    }
  }, [currentIndex, decisions, userName, onComplete]);

  const handleUndo = useCallback(() => {
    if (currentIndex === 0) return;

    const prevIndex = currentIndex - 1;
    const prevPrinciple = PRINCIPLES_LIST[prevIndex];
    
    // Remove the decision
    const newDecisions = { ...decisions };
    delete newDecisions[prevPrinciple.id];
    
    setDecisions(newDecisions);
    setCurrentIndex(prevIndex);
    updateStorage(newDecisions);
  }, [currentIndex, decisions, userName]);

  // Render logic: Only render top 3 cards
  const visiblePrinciples = PRINCIPLES_LIST.slice(currentIndex, currentIndex + 3);

  // Helper for manual buttons
  const manualSwipe = (dir: SwipeDirection) => {
    handleSwipe(dir);
  };

  const progress = (currentIndex / PRINCIPLES_LIST.length) * 100;

  return (
    <div className={`flex flex-col h-screen ${THEME.colors.background} overflow-hidden`}>
      {/* Header / Progress */}
      <div className="px-6 pt-6 pb-2 z-50">
        <div className="flex justify-between items-end mb-4">
          {/* Undo Button */}
          <button 
            onClick={handleUndo}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              currentIndex === 0 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 14 4 9l5-5"/>
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>
            </svg>
            Undo
          </button>

          <div className="text-right">
            <h3 className="text-slate-400 text-xs font-medium tracking-wider mb-1">PROGRESS</h3>
            <span className="text-slate-200 font-mono text-sm">
              {currentIndex} / {PRINCIPLES_LIST.length}
            </span>
          </div>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card Stack Container */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm aspect-[3/4]">
          {visiblePrinciples.map((principle, i) => (
            <SwipeCard
              key={principle.id}
              principle={principle}
              index={i}
              isFront={i === 0}
              onSwipe={handleSwipe}
            />
          )).reverse()} 
          
          {visiblePrinciples.length === 0 && (
            <div className="flex items-center justify-center h-full text-slate-500">
              Preparing prioritization...
            </div>
          )}
        </div>
      </div>

      {/* Manual Controls */}
      <div className="px-8 pb-10 pt-4 flex gap-6 justify-center z-50 max-w-md mx-auto w-full">
        <Button 
          variant="outline" 
          onClick={() => manualSwipe(SwipeDirection.LEFT)}
          className="flex-1 border-rose-900/50 text-rose-400 hover:bg-rose-950/30 py-4"
          disabled={visiblePrinciples.length === 0}
        >
          Discard
        </Button>
        <Button 
          variant="outline" 
          onClick={() => manualSwipe(SwipeDirection.RIGHT)}
          className="flex-1 border-emerald-900/50 text-emerald-400 hover:bg-emerald-950/30 py-4"
          disabled={visiblePrinciples.length === 0}
        >
          Keep
        </Button>
      </div>
    </div>
  );
};