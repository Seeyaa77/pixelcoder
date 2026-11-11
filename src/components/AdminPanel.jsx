import React, { useRef, useState } from 'react';
import { Ban, Database, Inbox, ShieldAlert, Users } from 'lucide-react';
import NeoModal from './ui/NeoModal';
import NeoButton from './ui/NeoButton';
import NeoBadge from './ui/NeoBadge';
import { useToast } from './ui/toast-context';

const INITIAL_AUDIT_LOGS = [
  {
    id: 'LOG-8812',
    user: 'bot_runner_01',
    type: 'RAPID_SUBMISSION_BOT',
    detail: 'Completed stage in 240ms with 0 keystrokes',
    ip: '182.253.11.44',
    time: '2m ago',
    severity: 'HIGH',
  },
  {
    id: 'LOG-8813',
    user: 'script_kiddie',
    type: 'PAYLOAD_INJECTION_SQLI',
    detail: "Submitted: '; DROP TABLE stages;--",
    ip: '114.124.8.190',
    time: '14m ago',
    severity: 'CRITICAL',
  },
  {
    id: 'LOG-8814',
    user: 'exploit_test',
    type: 'STAGE_SKIP_ATTEMPT',
    detail: 'Tried unlocking Stage 15 with 0 prior cleared stages',
    ip: '36.85.92.10',
    time: '1h ago',
    severity: 'HIGH',
  },
  {
    id: 'LOG-8815',
    user: 'BitMaster_99',
    type: 'CLEAN_VERIFICATION',
    detail: 'Cleared Stage 5 C++ via authoritative AST check',
    ip: '103.21.244.1',
    time: '2h ago',
    severity: 'OK',
  },
];

const TABS = [
  { id: 'anticheat', label: 'Anti-Cheat Logs', icon: ShieldAlert },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'metrics', label: 'Database Stats', icon: Database },
];

const USERS = [
  { id: 'u1', name: 'PixelKnight (Current User)', meta: 'Role: Admin / Developer', status: 'ACTIVE', tone: 'olive' },
  { id: 'u2', name: 'BitMaster_99', meta: 'Total XP: 4,250 • Cleared: 15 Stages', status: 'VERIFIED', tone: 'success' },
];

function EmptyState({ title, hint }) {
  return (
    <div className="flex flex-col items-center gap-2 border-2 border-dashed border-[#1E2522] bg-[#F3F6F4] p-6 text-center font-mono">
      <Inbox className="h-7 w-7 text-[#7D8D39]" aria-hidden="true" />
      <p className="text-xs font-extrabold uppercase text-[#1E2522]">{title}</p>
      <p className="max-w-xs text-[11px] text-gray-600">{hint}</p>
    </div>
  );
}

export default function AdminPanel({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('anticheat');
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const tabRefs = useRef({});
  const toast = useToast();

  const handleTabKeyDown = (event) => {
    const currentIndex = TABS.findIndex((tab) => tab.id === activeTab);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = TABS.length - 1;
    else return;

    event.preventDefault();
    const nextTab = TABS[nextIndex];
    setActiveTab(nextTab.id);
    tabRefs.current[nextTab.id]?.focus();
  };

  const handleBlock = (log) => {
    setAuditLogs((prev) => prev.filter((entry) => entry.id !== log.id));
    toast.warning('Mitigation applied', {
      description: `${log.ip} blocked and ${log.user}'s score was reset.`,
    });
  };

  return (
    <NeoModal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Console // Anti-Cheat Security Hub"
      description="Authoritative server logs & database invariant monitor"
      icon={<ShieldAlert className="h-6 w-6 text-[#EF4444]" aria-hidden="true" />}
      size="xl"
      headerClassName="bg-[#1E2522] text-white"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="min-w-0 break-words text-gray-600">Powered by Supabase PostgreSQL Security Engine</span>
          <NeoButton variant="dark" size="sm" onClick={onClose}>
            Dismiss
          </NeoButton>
        </div>
      }
    >
      <div className="flex flex-col font-mono text-xs">
        <div
          role="tablist"
          aria-label="Admin console sections"
          className="flex gap-1.5 overflow-x-auto border-b-3 border-[#1E2522] bg-[#F3F6F4] px-1 pt-1 no-scrollbar sm:gap-2 sm:px-2"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tab.id === 'anticheat' ? ` (${auditLogs.length})` : '';
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[tab.id] = node;
                }}
                id={`admin-tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`admin-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={handleTabKeyDown}
                className={`flex min-h-11 shrink-0 items-center gap-1.5 border-2 border-b-0 border-[#1E2522] px-2.5 py-1.5 text-[10px] font-bold uppercase transition-colors sm:px-3 sm:text-xs ${
                  isActive
                    ? 'translate-y-[2px] bg-white text-[#1E2522]'
                    : 'bg-[#E3EBD0] text-gray-600 hover:bg-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {tab.label}
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-3">
          {activeTab === 'anticheat' ? (
            <div
              role="tabpanel"
              id="admin-panel-anticheat"
              aria-labelledby="admin-tab-anticheat"
              tabIndex={0}
              className="flex flex-col gap-3 focus-visible:outline-none"
            >
              <div className="mb-0.5 flex flex-wrap items-center justify-between gap-1 text-[11px] text-gray-600">
                <span>Real-Time Edge Function Security Audit</span>
                <span className="font-bold text-[#047857]">● System Active</span>
              </div>

              {auditLogs.length === 0 ? (
                <EmptyState
                  title="No audit events"
                  hint="The anti-cheat queue is clear. New suspicious submissions will appear here in real time."
                />
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`border-2 border-[#1E2522] p-2.5 sm:p-3 ${
                      log.severity === 'CRITICAL'
                        ? 'bg-[#FEE2E2]'
                        : log.severity === 'HIGH'
                          ? 'bg-[#FEF3C7]'
                          : 'bg-[#ECFDF5]'
                    }`}
                  >
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                      <span className="min-w-0 break-words text-[11px] font-bold text-[#1E2522]">
                        {log.id} • {log.user} ({log.ip})
                      </span>
                      <NeoBadge
                        tone={
                          log.severity === 'CRITICAL' ? 'danger' : log.severity === 'HIGH' ? 'amber' : 'success'
                        }
                        size="sm"
                      >
                        {log.type}
                      </NeoBadge>
                    </div>
                    <p className="mb-1 break-words text-[11px] text-[#1E2522]">{log.detail}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-600">
                      <span>Detected {log.time}</span>
                      {log.severity !== 'OK' ? (
                        <button
                          type="button"
                          onClick={() => handleBlock(log)}
                          className="flex min-h-11 items-center gap-1 border-2 border-[#1E2522] bg-white px-2 font-bold text-red-700 transition-colors hover:bg-red-100"
                        >
                          <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                          Block IP / Reset Score
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}

          {activeTab === 'users' ? (
            <div
              role="tabpanel"
              id="admin-panel-users"
              aria-labelledby="admin-tab-users"
              tabIndex={0}
              className="space-y-2 focus-visible:outline-none"
            >
              {USERS.length === 0 ? (
                <EmptyState
                  title="No users loaded"
                  hint="User records will appear once profiles are fetched from Supabase."
                />
              ) : (
                USERS.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col gap-2 border-2 border-[#1E2522] bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <strong className="break-words text-[#1E2522]">{user.name}</strong>
                      <div className="text-[11px] text-gray-500">{user.meta}</div>
                    </div>
                    <NeoBadge tone={user.tone} size="sm" className="self-start sm:self-auto">
                      {user.status}
                    </NeoBadge>
                  </div>
                ))
              )}
            </div>
          ) : null}

          {activeTab === 'metrics' ? (
            <div
              role="tabpanel"
              id="admin-panel-metrics"
              aria-labelledby="admin-tab-metrics"
              tabIndex={0}
              className="focus-visible:outline-none"
            >
              <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
                <div className="border-2 border-[#1E2522] bg-[#E7EEDB] p-3">
                  <div className="text-2xl font-bold text-[#586526]">45</div>
                  <div className="mt-1 text-[11px] font-bold uppercase">Curriculum Stages</div>
                </div>
                <div className="border-2 border-[#1E2522] bg-[#FEF3C7] p-3">
                  <div className="text-2xl font-bold text-[#B45309]">99.9%</div>
                  <div className="mt-1 text-[11px] font-bold uppercase">RLS Policy Coverage</div>
                </div>
                <div className="border-2 border-[#1E2522] bg-[#FEE2E2] p-3">
                  <div className="text-2xl font-bold text-[#DC2626]">0</div>
                  <div className="mt-1 text-[11px] font-bold uppercase">Breaches Detected</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </NeoModal>
  );
}
