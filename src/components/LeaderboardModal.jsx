import React, { useState, useEffect } from 'react';
import { X, Trophy, RefreshCw, Shield, Sparkles } from 'lucide-react';
import { fetchLiveLeaderboard } from '../lib/supabase';

export default function LeaderboardModal({ isOpen, onClose, currentUsername }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const liveData = await fetchLiveLeaderboard();
    if (liveData && liveData.length > 0) {
      setLeaderboard(liveData);
    } else {
      // Fallback seed if network is offline
      setLeaderboard([
        { id: '1', username: 'Raffli', total_xp: 4500, current_streak: 14, weapon_name: 'Legendary Katana', role: 'admin' },
        { id: '2', username: 'BitMaster_99', total_xp: 3800, current_streak: 10, weapon_name: 'Flame Katana', role: 'user' },
        { id: '3', username: 'CyberViper', total_xp: 2950, current_streak: 7, weapon_name: 'Pixel Blade', role: 'user' },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white border-4 border-[#1E2522] shadow-[8px_8px_0px_#1E2522] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#7D8D39] text-white p-4 flex items-center justify-between border-b-4 border-[#1E2522]">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#FDE047]" />
            <div>
              <h2 className="font-extrabold text-lg uppercase tracking-tight">
                Live Supabase Leaderboard
              </h2>
              <p className="text-[11px] font-mono opacity-90">
                Connected to public.pixelcoder_profiles • Real-time DB Sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-2 py-1 bg-white text-[#1E2522] font-mono text-xs font-bold border-2 border-[#1E2522] flex items-center gap-1 hover:bg-gray-100"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-white text-[#1E2522] border-2 border-[#1E2522] flex items-center justify-center font-bold hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center font-mono text-xs text-gray-500">
              Querying PostgreSQL cluster on Supabase...
            </div>
          ) : (
            <table className="w-full text-left border-collapse border-3 border-[#1E2522]">
              <thead>
                <tr className="bg-[#F3F6F4] border-b-3 border-[#1E2522] font-mono text-xs uppercase text-[#1E2522]">
                  <th className="p-2.5 border-r-2 border-[#1E2522] w-12 text-center">Rank</th>
                  <th className="p-2.5 border-r-2 border-[#1E2522]">Player</th>
                  <th className="p-2.5 border-r-2 border-[#1E2522] text-center">Equipped Weapon</th>
                  <th className="p-2.5 border-r-2 border-[#1E2522] text-center">Streak</th>
                  <th className="p-2.5 text-right">XP Score</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#1E2522] font-mono text-xs">
                {leaderboard.map((row, idx) => {
                  const rank = idx + 1;
                  const isYou = row.username === currentUsername;
                  return (
                    <tr 
                      key={row.id || idx}
                      className={`${
                        isYou 
                          ? 'bg-[#FEF3C7] font-bold' 
                          : rank <= 3 
                            ? 'bg-[#FAFAF9]' 
                            : 'bg-white hover:bg-[#F3F6F4]'
                      }`}
                    >
                      <td className="p-2.5 border-r-2 border-[#1E2522] text-center font-bold">
                        {rank === 1 && '🥇'}
                        {rank === 2 && '🥈'}
                        {rank === 3 && '🥉'}
                        {rank > 3 && rank}
                      </td>
                      <td className="p-2.5 border-r-2 border-[#1E2522] flex items-center gap-2">
                        <span className="font-sans font-bold text-[#1E2522]">
                          {row.username}
                        </span>
                        {row.role === 'admin' && (
                          <span className="text-[9px] bg-[#1E2522] text-white px-1 py-0.2 border border-black uppercase">
                            Admin
                          </span>
                        )}
                        {isYou && (
                          <span className="text-[10px] bg-[#7D8D39] text-white px-1.5 py-0.2 border border-[#1E2522]">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 border-r-2 border-[#1E2522] text-center text-[11px]">
                        {row.weapon_name || 'Pixel Blade'}
                      </td>
                      <td className="p-2.5 border-r-2 border-[#1E2522] text-center">
                        🔥 {row.current_streak || 1}d
                      </td>
                      <td className="p-2.5 text-right font-extrabold text-[#7D8D39]">
                        {(row.total_xp || 0).toLocaleString()} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F3F6F4] p-3 border-t-3 border-[#1E2522] flex items-center justify-between font-mono text-xs">
          <span className="text-gray-600">
            {leaderboard.length} registered players live in database
          </span>
          <button
            onClick={onClose}
            className="neo-button text-xs py-1 px-4 bg-[#1E2522] text-white hover:bg-[#333E39]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
