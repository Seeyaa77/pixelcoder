import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Database, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import NeoModal from './ui/NeoModal';
import NeoBadge from './ui/NeoBadge';
import Spinner from './ui/Spinner';
import { fetchAdminOverview } from '../lib/supabase';
import { summarizePlayers } from '../lib/admin';
import { SYLLABUS_TRACKS } from '../data/syllabus';

const TABS = [
  { id: 'metrics', label: 'Metrics', icon: Database },
  { id: 'users', label: 'Players', icon: Users },
  { id: 'integrity', label: 'Integrity', icon: ShieldCheck }
];

const SEVERITY_TONE = {
  CRITICAL: 'danger',
  HIGH: 'amber',
  MEDIUM: 'amber',
  LOW: 'neutral'
};

function StatCard({ label, value, hint }) {
  return (
    <div className="neo-box bg-white p-3">
      <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-[#586526]">{label}</p>
      <p className="mt-1 font-mono text-2xl font-extrabold leading-none text-[#1E2522]">{value}</p>
      {hint ? <p className="mt-1 font-mono text-[10px] text-gray-500">{hint}</p> : null}
    </div>
  );
}

function EmptyRow({ children }) {
  return <p className="border-2 border-dashed border-[#1E2522] bg-[#F3F6F4] p-4 text-center font-mono text-xs">{children}</p>;
}

/**
 * Read-only moderation dashboard.
 *
 * Everything shown here comes from the public profile rows fetched with the
 * anon key, so it is intentionally read-only: banning, deleting or editing
 * accounts needs a service-role key and must never run in the browser.
 */
export default function AdminPanel({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('metrics');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const summary = useMemo(() => summarizePlayers(players, SYLLABUS_TRACKS), [players]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAdminOverview();
    if (result.error) {
      setError(result.error);
      setPlayers([]);
    } else {
      setPlayers(result.players);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react/set-state-in-effect -- fetching live rows when the modal opens
    load();
  }, [isOpen, load]);

  const totalStageSlots = summary.stats.players * 45;

  return (
    <NeoModal isOpen={isOpen} onClose={onClose} title="Admin Console" icon={<ShieldCheck className="h-4 w-4" />} size="lg">
      <div className="space-y-3 font-mono text-xs text-[#1E2522]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-2 border-[#1E2522] bg-[#FEF3C7] px-2 py-1.5">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#92400E]">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            Read-only view · moderation needs a server-side service key
          </span>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="neo-button inline-flex items-center gap-1 bg-white px-2 py-1 text-[10px] font-bold uppercase disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Admin sections">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-h-9 items-center gap-1.5 border-2 border-[#1E2522] px-2 py-1 text-[10px] font-bold uppercase ${
                  selected ? 'bg-[#7D8D39] text-white' : 'bg-white hover:bg-[#E7EEDB]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {tab.label}
                {tab.id === 'integrity' && summary.anomalies.length > 0 ? (
                  <span className="border border-current px-1 text-[9px]">{summary.anomalies.length}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 p-6">
            <Spinner label="Loading players" />
            <span className="text-xs">Loading live players…</span>
          </div>
        )}

        {!loading && error && (
          <div className="space-y-2 border-2 border-[#1E2522] bg-[#FEE2E2] p-3">
            <p className="text-xs font-bold text-[#991B1B]">{error}</p>
            <p className="text-[10px] text-[#991B1B]">
              The anon key can only read public columns. Check the Supabase URL/key in .env, then retry.
            </p>
          </div>
        )}

        {!loading && !error && activeTab === 'metrics' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatCard label="Players" value={summary.stats.players} hint="all rows readable with the anon key" />
              <StatCard label="Total XP" value={summary.stats.totalXp.toLocaleString('en-US')} hint={`ceiling ${summary.stats.xpCeiling.toLocaleString('en-US')} XP`} />
              <StatCard label="Avg XP" value={summary.stats.avgXp.toLocaleString('en-US')} hint="mean across players" />
              <StatCard label="Stages cleared" value={summary.stats.totalCleared} hint={`${summary.stats.avgCleared} per player`} />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatCard label="New (24h)" value={summary.stats.newlyJoined} />
              <StatCard label="Active (24h)" value={summary.stats.activeRecently} />
              <StatCard label="Completion" value={totalStageSlots ? `${Math.round((summary.stats.totalCleared / totalStageSlots) * 100)}%` : '—'} hint="cleared ÷ 45 per player" />
              <StatCard label="Anomalies" value={summary.anomalies.length} />
            </div>
            <div className="neo-box bg-white p-3">
              <h3 className="mb-2 text-[10px] font-bold uppercase text-[#586526]">Cleared stages by track</h3>
              {['python', 'cpp', 'javascript'].map((trackId) => {
                const value = summary.stats.byTrack[trackId] || 0;
                const max = Math.max(1, ...Object.values(summary.stats.byTrack));
                return (
                  <div key={trackId} className="mb-1.5 flex items-center gap-2 text-[10px]">
                    <span className="w-20 uppercase">{trackId}</span>
                    <span className="h-3 flex-1 border-2 border-[#1E2522] bg-[#F3F6F4]">
                      <span className="block h-full bg-[#7D8D39]" style={{ width: `${Math.round((value / max) * 100)}%` }} />
                    </span>
                    <span className="w-8 text-right font-bold">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && !error && activeTab === 'users' && (
          <div className="space-y-2">
            {summary.table.length === 0 ? (
              <EmptyRow>No players yet. Sign-ups will appear here.</EmptyRow>
            ) : (
              <div className="max-h-[360px] overflow-auto border-2 border-[#1E2522]">
                <table className="w-full border-collapse text-left text-[10px]">
                  <thead className="sticky top-0 bg-[#E7EEDB] text-[9px] uppercase">
                    <tr>
                      <th className="border-b-2 border-[#1E2522] px-2 py-1.5">Player</th>
                      <th className="border-b-2 border-[#1E2522] px-2 py-1.5">Role</th>
                      <th className="border-b-2 border-[#1E2522] px-2 py-1.5 text-right">XP</th>
                      <th className="border-b-2 border-[#1E2522] px-2 py-1.5 text-right">Cleared</th>
                      <th className="border-b-2 border-[#1E2522] px-2 py-1.5 text-right">Gold</th>
                      <th className="border-b-2 border-[#1E2522] px-2 py-1.5 text-right">Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.table.map((row) => (
                      <tr key={row.id} className="odd:bg-white even:bg-[#F3F6F4]">
                        <td className="border-b border-[#1E2522]/20 px-2 py-1 font-bold">{row.username}</td>
                        <td className="border-b border-[#1E2522]/20 px-2 py-1">
                          <NeoBadge tone={row.role === 'admin' ? 'olive' : 'neutral'} size="sm">
                            {row.role}
                          </NeoBadge>
                        </td>
                        <td className="border-b border-[#1E2522]/20 px-2 py-1 text-right">{row.xp.toLocaleString('en-US')}</td>
                        <td className="border-b border-[#1E2522]/20 px-2 py-1 text-right">
                          {row.clearedCount}
                          <span className="text-gray-500">/45</span>
                        </td>
                        <td className="border-b border-[#1E2522]/20 px-2 py-1 text-right">{row.gold.toLocaleString('en-US')}</td>
                        <td className="border-b border-[#1E2522]/20 px-2 py-1 text-right">{row.streak}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-[10px] text-gray-500">
              Emails are intentionally not fetched: the anon key is public, so this view only reads gameplay columns.
            </p>
          </div>
        )}

        {!loading && !error && activeTab === 'integrity' && (
          <div className="space-y-2">
            {summary.anomalies.length === 0 ? (
              <EmptyRow>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  No anomalies found in the readable player rows.
                </span>
              </EmptyRow>
            ) : (
              <ul className="space-y-1.5">
                {summary.anomalies.map((anomaly, index) => (
                  <li
                    key={`${anomaly.username}-${anomaly.type}-${index}`}
                    className="flex flex-wrap items-center gap-2 border-2 border-[#1E2522] bg-white px-2 py-1.5"
                  >
                    <NeoBadge tone={SEVERITY_TONE[anomaly.severity] || 'neutral'} size="sm">
                      {anomaly.severity}
                    </NeoBadge>
                    <span className="font-bold">{anomaly.username}</span>
                    <span className="text-[9px] uppercase text-[#586526]">{anomaly.type}</span>
                    <span className="w-full text-[10px] text-gray-700 sm:w-auto sm:flex-1">{anomaly.detail}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[10px] text-gray-500">
              Checks are heuristics from public rows (XP ceiling, impossible stage ids, odd gold). They flag, they never ban.
            </p>
          </div>
        )}
      </div>
    </NeoModal>
  );
}
