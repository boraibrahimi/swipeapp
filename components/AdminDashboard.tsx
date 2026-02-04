import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PRINCIPLES_LIST, THEME } from '../constants';
import { Button } from './Button';
import { Decision } from '../types';

interface AdminDashboardProps {
  onExit: () => void;
}

interface AggregatedPrinciple {
  id: string;
  text: string;
  keepCount: number;
  totalVotes: number;
  score: number; // percentage kept
  top5Count: number; // How many times it appeared in top 5
  top5Score: number; // Weighted score (Rank 1 = 5pts, Rank 5 = 1pt)
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState<AggregatedPrinciple[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      // Fetch all rows from principle_results
      // Columns: user_name (text), decisions (jsonb), ranked_principles (jsonb)
      const { data, error } = await supabase
        .from('principle_results')
        .select('*');

      if (error) throw error;

      if (!data || data.length === 0) {
        setRankings([]);
        setTotalSessions(0);
        return;
      }

      setTotalSessions(data.length);

      // Aggregate votes
      const stats: Record<string, { kept: number; total: number; top5Count: number; top5Score: number }> = {};
      
      // Initialize stats for all known principles
      PRINCIPLES_LIST.forEach(p => {
        stats[p.id] = { kept: 0, total: 0, top5Count: 0, top5Score: 0 };
      });

      data.forEach((row: any) => {
        // Handle Decisions
        // row.decisions is a JSONB object: { "principle-id": "kept" | "discarded" }
        const decisions = row.decisions as Record<string, Decision>;
        if (decisions) {
          Object.entries(decisions).forEach(([principleId, decision]) => {
            if (stats[principleId]) {
              stats[principleId].total += 1;
              if (decision === 'kept') {
                stats[principleId].kept += 1;
              }
            }
          });
        }

        // Handle Ranked Principles (Top 5)
        // row.ranked_principles is a JSONB array: ["principle-id-a", "principle-id-b", ...]
        const rankedIds = row.ranked_principles as string[];
        if (rankedIds && Array.isArray(rankedIds)) {
            rankedIds.forEach((id, index) => {
                if (stats[id]) {
                    stats[id].top5Count += 1;
                    // Weighted score: Rank 1 gets 5 pts, Rank 5 gets 1 pt
                    stats[id].top5Score += (5 - index); 
                }
            });
        }
      });

      // Calculate scores and sort
      const results: AggregatedPrinciple[] = PRINCIPLES_LIST.map(p => {
        const s = stats[p.id];
        return {
          id: p.id,
          text: p.text,
          keepCount: s.kept,
          totalVotes: s.total,
          score: s.total > 0 ? (s.kept / s.total) * 100 : 0,
          top5Count: s.top5Count,
          top5Score: s.top5Score
        };
      })
      .filter(p => p.totalVotes > 0) // Only show principles that have been voted on
      // Sort priority: Top 5 Weighted Score -> Keep % -> Keep Count
      .sort((a, b) => b.top5Score - a.top5Score || b.score - a.score || b.keepCount - a.keepCount);

      setRankings(results);

    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${THEME.colors.background} p-6`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${THEME.colors.textPrimary}`}>Executive Consensus</h1>
            <p className={`text-sm ${THEME.colors.textSecondary}`}>
              Aggregated results from {totalSessions} session{totalSessions !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="outline" onClick={onExit} className="py-2 px-4 text-sm">
            Exit Admin
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Analyzing patterns...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-900/20 border border-rose-900/50 p-6 rounded-xl text-center">
            <p className="text-rose-400 mb-2">Connection Error</p>
            <p className="text-sm text-slate-400 mb-4">{error}</p>
            <p className="text-xs text-slate-500">Ensure Supabase URL and Key are configured and table 'principle_results' exists.</p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-500">No voting data available yet.</p>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            {rankings.map((item, index) => (
              <div 
                key={item.id}
                className={`${THEME.colors.card} border ${THEME.colors.border} p-4 rounded-xl flex items-center gap-4 relative overflow-hidden`}
              >
                {/* Background indication for high rankers */}
                {index < 3 && (
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-700'}`}></div>
                )}

                {/* Rank */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-slate-800 rounded-full font-bold text-slate-300 z-10">
                  #{index + 1}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 z-10">
                  <h3 className={`font-semibold ${THEME.colors.textPrimary} truncate`}>{item.text}</h3>
                  
                  {/* Stats Bar */}
                  <div className="flex items-center gap-4 mt-2">
                    {/* Approval Rating */}
                    <div className="flex items-center gap-2 flex-1">
                        <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden max-w-[100px]">
                            <div 
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${item.score}%` }}
                            />
                        </div>
                        <span className="text-xs text-slate-500">
                            {item.score.toFixed(0)}% kept
                        </span>
                    </div>

                    {/* Top 5 Frequency Badge */}
                    {item.top5Count > 0 && (
                        <div className="flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2l1 2h9l-4.5 3.5 2 5.5-5.5-4-5.5 4 2-5.5L0 4h9l1-2z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-bold text-indigo-400">{item.top5Count}</span>
                        </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right hidden sm:block z-10">
                  <div className="text-lg font-bold text-slate-200">{item.keepCount}</div>
                  <div className="text-xs text-slate-500 uppercase">Total Votes</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};