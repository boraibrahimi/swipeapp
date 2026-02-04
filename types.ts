export interface Principle {
  id: string;
  text: string;
  category?: string;
}

export enum SwipeDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export type Decision = 'kept' | 'discarded';

export interface UserResults {
  userName: string;
  decisions: Record<string, Decision>;
  rankedPrinciples?: string[]; // IDs of the top 5
  completedAt?: string;
}

export type AppPhase = 'entry' | 'swiping' | 'prioritization' | 'complete' | 'admin';