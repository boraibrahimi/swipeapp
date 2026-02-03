import React, { useState } from 'react';
import { Button } from './Button';
import { THEME } from '../constants';

interface EntryScreenProps {
  onStart: (name: string) => void;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-6 ${THEME.colors.background}`}>
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-2">
          <h1 className={`text-4xl font-bold tracking-tight ${THEME.colors.textPrimary}`}>
            Prioritize.
          </h1>
          <p className={`text-lg ${THEME.colors.textSecondary}`}>
            Define your core principles.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div className="space-y-2">
            <label htmlFor="name" className={`block text-sm font-medium ${THEME.colors.textSecondary}`}>
              Who is swiping today?
            </label>
            <input
              id="name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 bg-slate-900 border ${THEME.colors.border} rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
              placeholder="Enter your name"
            />
          </div>
          
          <Button type="submit" fullWidth disabled={!name.trim()}>
            Start Session
          </Button>
        </form>
      </div>
    </div>
  );
};