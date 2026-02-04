import { Principle } from './types';

// Generate 50 placeholder principles
export const PRINCIPLES_LIST: Principle[] = Array.from({ length: 50 }, (_, i) => ({
  id: `principle-${i + 1}`,
  text: `Principle #${i + 1}`,
  category: i % 3 === 0 ? 'Ethics' : i % 3 === 1 ? 'Strategy' : 'Operations'
}));

// LocalStorage Keys
export const STORAGE_KEY_PREFIX = 'principle_stack_user_';
export const LAST_USER_KEY = 'principle_stack_last_user';

export const THEME = {
  colors: {
    background: 'bg-slate-950',
    card: 'bg-slate-900',
    textPrimary: 'text-slate-50',
    textSecondary: 'text-slate-400',
    accentKeep: 'text-emerald-400',
    accentDiscard: 'text-rose-400',
    border: 'border-slate-800'
  }
};