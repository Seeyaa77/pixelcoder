import React, { useEffect, useState } from 'react';
import { RefreshCw, Trophy, Users } from 'lucide-react';
import NeoModal from './ui/NeoModal';
import NeoButton from './ui/NeoButton';
import Spinner from './ui/Spinner';
import { fetchLiveLeaderboard } from '../lib/supabase';

function RankBadge({ rank }) {
  if (rank === 1) {
    return (
      <span className="inline-flex min-w-8 justify-center border border-black bg-[#F59E0B] px-1.5 py-0.5 font-extrabold text-black">
        #1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex min-w-8 justify-center border border-black bg-gray-300 px-1.5 py-0.5 font-extrabold text-black">
        #2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex min-w-8 justify-center border border-black bg-amber-700 px-1.5 py-0.5 font-extrabold text-white">
        #3
      </span>
    );
  }
  return <span className="font-bold">#{rank}</span>;
}

export default function LeaderboardModal({ isOpen, onClose, currentUsername }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;

    fetchLiveLeaderboard()
      .then((liveData) => {
        if (cancelled) return;
        if (Array.isArray(liveData)) {
          setLeaderboard(liveData);
          setError(null);
        } else {
          setLeaderboard([]);
          setError('The leaderboard returned an unexpected response. Please try again.');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('Leaderboard load failed:', err);
        setLeaderboard([]);
        setError('Could not reach the live leaderboard. Check your connection and retry.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, reloadKey]);

  const loadData = () => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  const handleClose = () => {
    setLoading(true);
    setError(null);
    onClose?.();
  };

  return (
    <NeoModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Live Leaderboard"
      description="Supabase profiles • zero dummy data"
      icon={<Trophy className="h-6 w-6 text-[#FDE047]" aria-hidden="true" />}
      size="xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-gray-600">
            {loading ? 'Syncing…' : `${leaderboard.length} verified player${leaderboard.length === 1 ? '' : 's'}`}
          </span>
          <NeoButton variant="dark" size="sm" onClick={handleClose}>
            Close
          </NeoButton>
        </div>
      }
    >
      <div className="flex flex-col gap-3 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-gray-600">Ranked by total XP · Top 50 heroes</span>
          <NeoButton
            variant="secondary"
            size="sm"
            onClick={loadData}
            loading={loading}
            aria-label="Refresh leaderboard"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </NeoButton>
        </div>

        {loading ? (
          <div className="flex min-h-32 flex-col items-center justify-center gap-2 border-3 border-[#1E2522] bg-[#F3F6F4] p-6 text-center">
            <Spinner size="md" label="Loading leaderboard" />
            <p className="text-[11px] text-gray-600">Querying live Supabase PostgreSQL database…</p>
          </div>
        ) : error ? (
          <div role="alert" className="flex flex-col items-center gap-2 border-3 border-[#1E2522] bg-[#FEE2E2] p-6 text-center">
            <span className="text-sm font-extrabold uppercase text-[#991B1B]">Leaderboard unavailable</span>
            <p className="text-[11px] text-[#7F1D1D]">{error}</p>
            <NeoButton variant="danger" size="sm" onClick={loadData}>
              Retry
            </NeoButton>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center gap-2 border-3 border-[#1E2522] bg-[#F3F6F4] p-6 text-center">
            <Users className="h-8 w-8 text-[#7D8D39]" aria-hidden="true" />
            <span className="text-sm font-extrabold uppercase text-[#1E2522]">No players ranked yet</span>
            <p className="max-w-sm text-[11px] text-gray-600">
              Register or log in and clear a stage to claim the first spot on the board.
            </p>
            <NeoButton variant="primary" size="sm" onClick={loadData}>
              Check again
            </NeoButton>
          </div>
        ) : (
          <>
            {/* Mobile card list (<640px) */}
            <ul className="flex flex-col gap-2 sm:hidden" aria-label="Leaderboard entries">
              {leaderboard.map((row, idx) => {
                const rank = idx + 1;
                const isYou = row.username === currentUsername;
                return (
                  <li
                    key={row.id || idx}
                    className={`border-2 border-[#1E2522] p-2.5 ${
                      isYou ? 'bg-[#FEF3C7]' : rank === 1 ? 'bg-[#FEF9C3]' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <RankBadge rank={rank} />
                        <span className="truncate font-sans font-bold text-[#1E2522]">{row.username}</span>
                        {row.role === 'admin' ? (
                          <span className="border border-black bg-red-600 px-1 py-0.5 text-[9px] font-bold uppercase text-white">
                            Admin
                          </span>
                        ) : null}
                        {isYou ? (
                          <span className="border border-[#1E2522] bg-[#7D8D39] px-1.5 py-0.5 text-[10px] text-white">
                            YOU
                          </span>
                        ) : null}
                      </div>
                      <span className="shrink-0 font-extrabold text-[#7D8D39]">
                        {(row.total_xp || 0).toLocaleString()} XP
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[10px] text-gray-600">
                      <span className="truncate">⚔ {row.weapon_name || 'Pixel Blade'}</span>
                      <span>🔥 {row.current_streak || 1} day streak</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Desktop table (>=640px) */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full border-collapse border-3 border-[#1E2522] text-left">
                <caption className="sr-only">Live player leaderboard ranked by total XP</caption>
                <thead>
                  <tr className="border-b-3 border-[#1E2522] bg-[#F3F6F4] font-mono text-xs uppercase text-[#1E2522]">
                    <th scope="col" className="w-14 border-r-2 border-[#1E2522] p-2.5 text-center">
                      Rank
                    </th>
                    <th scope="col" className="border-r-2 border-[#1E2522] p-2.5">
                      Player
                    </th>
                    <th scope="col" className="border-r-2 border-[#1E2522] p-2.5 text-center">
                      Weapon
                    </th>
                    <th scope="col" className="border-r-2 border-[#1E2522] p-2.5 text-center">
                      Streak
                    </th>
                    <th scope="col" className="p-2.5 text-right">
                      XP Score
                    </th>
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
                          isYou ? 'bg-[#FEF3C7] font-bold' : rank === 1 ? 'bg-[#FEF9C3]' : 'bg-white hover:bg-[#F3F6F4]'
                        }`}
                      >
                        <td className="border-r-2 border-[#1E2522] p-2.5 text-center">
                          <RankBadge rank={rank} />
                        </td>
                        <td className="border-r-2 border-[#1E2522] p-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-bold text-[#1E2522]">{row.username}</span>
                            {row.role === 'admin' ? (
                              <span className="border border-black bg-red-600 px-1 py-0.5 text-[9px] font-mono font-bold uppercase text-white">
                                Admin
                              </span>
                            ) : null}
                            {isYou ? (
                              <span className="border border-[#1E2522] bg-[#7D8D39] px-1.5 py-0.5 text-[10px] text-white">
                                YOU
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="border-r-2 border-[#1E2522] p-2.5 text-center text-[11px]">
                          {row.weapon_name || 'Pixel Blade'}
                        </td>
                        <td className="border-r-2 border-[#1E2522] p-2.5 text-center">
                          {row.current_streak || 1} Days
                        </td>
                        <td className="p-2.5 text-right font-extrabold text-[#7D8D39]">
                          {(row.total_xp || 0).toLocaleString()} XP
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </NeoModal>
  );
}
