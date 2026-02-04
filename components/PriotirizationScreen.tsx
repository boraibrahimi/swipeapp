import React, { useState, useEffect } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { Button } from './Button';
import { Principle } from '../types';
import { THEME } from '../constants';

interface PrioritizationScreenProps {
  keptPrinciples: Principle[];
  onConfirm: (rankedIds: string[]) => void;
}

export const PrioritizationScreen: React.FC<PrioritizationScreenProps> = ({ keptPrinciples, onConfirm }) => {
  const [rankedIds, setRankedIds] = useState<string[]>([]);
  
  // Calculate requirements
  const maxSlots = 5;
  const totalAvailable = keptPrinciples.length;
  const requiredSlots = Math.min(maxSlots, totalAvailable);
  const isComplete = rankedIds.length === requiredSlots;

  const handleToggle = (id: string) => {
    if (rankedIds.includes(id)) {
      // Remove if already selected
      setRankedIds(prev => prev.filter(item => item !== id));
    } else {
      // Add if space available
      if (rankedIds.length < maxSlots) {
        setRankedIds(prev => [...prev, id]);
      }
    }
  };

  const getPrinciple = (id: string) => keptPrinciples.find(p => p.id === id);

  return (
    <div className={`min-h-screen ${THEME.colors.background} flex flex-col p-6`}>
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        
        {/* Header */}
        <div className="text-center mb-8 animate-in slide-in-from-top-4 duration-500">
          <h1 className={`text-2xl font-bold ${THEME.colors.textPrimary}`}>Core Priorities</h1>
          <p className={`${THEME.colors.textSecondary} mt-2`}>
            Drag to reorder. Select top <span className="text-indigo-400 font-bold">{requiredSlots}</span> principles.
          </p>
        </div>

        {/* Reorderable List Area */}
        <div className="mb-8">
            <Reorder.Group axis="y" values={rankedIds} onReorder={setRankedIds} className="space-y-3">
                {rankedIds.map((id, index) => {
                    const principle = getPrinciple(id);
                    if (!principle) return null;
                    
                    return (
                        <Reorder.Item key={id} value={id}>
                            <div className="relative h-16 rounded-xl border-2 border-indigo-500/50 bg-indigo-900/20 flex items-center px-4 cursor-grab active:cursor-grabbing hover:bg-indigo-900/30 transition-colors">
                                <div className="absolute left-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-indigo-500 text-white pointer-events-none">
                                    {index + 1}
                                </div>
                                <div className="ml-12 w-full pr-8">
                                    <span className="text-white font-medium truncate block select-none">
                                        {principle.text}
                                    </span>
                                </div>
                                <div 
                                    className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-500 hover:text-rose-400 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent drag start if clicking remove
                                        handleToggle(id);
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </div>
                            </div>
                        </Reorder.Item>
                    );
                })}
            </Reorder.Group>

            {/* Empty Slots Placeholders */}
            <div className="space-y-3 mt-3">
                {Array.from({ length: requiredSlots - rankedIds.length }).map((_, i) => {
                     // The visual index for the empty slot
                     const displayIndex = rankedIds.length + i + 1;
                     return (
                        <div 
                            key={`empty-${displayIndex}`}
                            className="relative h-16 rounded-xl border-2 border-dashed border-slate-800 bg-slate-900/50 flex items-center px-4"
                        >
                            <div className="absolute left-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-slate-800 text-slate-500">
                                {displayIndex}
                            </div>
                            <div className="ml-12 w-full">
                                <span className="text-slate-600 text-sm italic">
                                    {i === 0 ? 'Select next principle...' : 'Waiting...'}
                                </span>
                            </div>
                        </div>
                     );
                })}
            </div>
        </div>

        {/* Selection Pool */}
        <div className="flex-1 overflow-y-auto pb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                Kept Principles ({keptPrinciples.length - rankedIds.length} remaining)
            </h3>
            <div className="flex flex-wrap gap-2">
                {keptPrinciples.map(p => {
                    const isSelected = rankedIds.includes(p.id);
                    if (isSelected) return null;

                    return (
                        <button
                            key={p.id}
                            onClick={() => handleToggle(p.id)}
                            disabled={rankedIds.length >= maxSlots}
                            className={`
                                text-left px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium transition-all
                                hover:bg-slate-700 hover:border-slate-600 active:scale-95
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            {p.text}
                        </button>
                    )
                })}
            </div>
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-slate-800 mt-4">
            <Button 
                fullWidth 
                disabled={!isComplete} 
                onClick={() => onConfirm(rankedIds)}
                variant={isComplete ? 'primary' : 'secondary'}
            >
                Confirm Priorities
            </Button>
        </div>

      </div>
    </div>
  );
};