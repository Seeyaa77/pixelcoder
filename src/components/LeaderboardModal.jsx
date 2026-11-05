import React from 'react';
import { X, Trophy, Medal, Sparkles, Flame } from 'lucide-react';

export default function LeaderboardModal({ isOpen, onClose, currentXp, currentUsername }) {
  if (!isOpen) return null;

  // Mock global competitive players + current user
  const leaderboardData = [
    { rank: 1, name: 'BitMaster_99', xp: 4250, stages: 15, streak: 12, track: 'C++' },
    { rank: 2, name: 'CyberViper', xp: 3890, stages: 14, streak: 9, track: 'Python' },
    { rank: 3, name: 'PixelQueen', xp: 3450, stages: 13, streak: 7, track: 'JavaScript' },
    { rank: 4, name: 'GlitchKnight', xp: 2800, stages: 11, streak: 5, track: 'Python' },
    { rank: 5, name: currentUsername || 'You (Player)', xp: Math.max(currentXp, 100), stages: 4, streak: 2, track: 'Python', isYou: true },
    { rank: 6, name: 'NullPointer', xp: 1950, stages: 8, streak: 3, track: 'C++' },
    { rank: 7, name: 'CodeNinja', xp: 1600, stages: 6, streak: 4, track: 'JavaScript' },
    { rank: 8, name: 'SyntaxHero', xp: 1200, stages: 5, streak: 2, track: 'Python' },
  ].sort((a, b) => b.xp - a.xp).map((item, index) => ({ ...item, rank: index + 1 }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white border-4 border-[#1E2522] shadow-[8px_8px_0px_#1E2522] overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#7D8D39] text-white p-4 flex items-center justify-between border-b-4 border-[#1E2522]">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#FDE047]" />
            <div>
              <h2 className="font-extrabold text-lg uppercase tracking-tight">
                Global Hall of Fame
              </h2>
              <p className="text-[11px] font-mono opacity-90">
                Authoritative Leaderboard • Real-Time RLS Sync
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-white text-[#1E2522] border-2 border-[#1E2522] flex items-center justify-center font-bold hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <table className="w-full text-left border-collapse border-3 border-[#1E2522]">
            <thead>
              <tr className="bg-[#F3F6F4] border-b-3 border-[#1E2522] font-mono text-xs uppercase text-[#1E2522]">
                <th className="p-2.5 border-r-2 border-[#1E2522] w-12 text-center">#</th>
                <th className="p-2.5 border-r-2 border-[#1E2522]">Player</th>
                <th className="p-2.5 border-r-2 border-[#1E2522] text-center">Track</th>
                <th className="p-2.5 border-r-2 border-[#1E2522] text-center">Stages</th>
                <th className="p-2.5 text-right">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1E2522] font-mono text-xs">
              {leaderboardData.map((row) => {
                const isTop3 = row.rank <= 3;
                return (
                  <tr 
                    key={row.rank}
                    className={`${
                      row.isYou 
                        ? 'bg-[#FEF3C7] font-bold' 
                        : isTop3 
                          ? 'bg-[#FAFAF9]' 
                          : 'bg-white hover:bg-[#F3F6F4]'
                    }`}
                  >
                    <td className="p-2.5 border-r-2 border-[#1E2522] text-center font-bold">
                      {row.rank === 1 && '🥇'}
                      {row.rank === 2 && '🥈'}
                      {row.rank === 3 && '🥉'}
                      {row.rank > 3 && row.rank}
                    </td>
                    <td className="p-2.5 border-r-2 border-[#1E2522] flex items-center gap-2">
                      <span className="font-sans font-bold text-[#1E2522]">
                        {row.name}
                      </span>
                      {row.isYou && (
                        <span className="text-[10px] bg-[#7D8D39] text-white px-1.5 py-0.2 border border-[#1E2522]">
                          YOU
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 border-r-2 border-[#1E2522] text-center">
                      <span className="px-1.5 py-0.5 bg-[#E7EEDB] text-[#586526] font-bold text-[10px] border border-[#1E2522]">
                        {row.track}
                      </span>
                    </td>
                    <td className="p-2.5 border-r-2 border-[#1E2522] text-center">
                      {row.stages} / 15
                    </td>
                    <td className="p-2.5 text-right font-extrabold text-[#7D8D39]">
                      {row.xp.toLocaleString()} XP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F3F6F4] p-3 border-t-3 border-[#1E2522] flex items-center justify-between font-mono text-xs">
          <span className="text-gray-600">
            Rank updates after each verified stage clear.
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
