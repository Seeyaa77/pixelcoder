import React, { useState } from 'react';
import { X, ShieldAlert, Users, Database, AlertTriangle, CheckCircle, Ban } from 'lucide-react';

export default function AdminPanel({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('anticheat'); // 'anticheat' | 'users' | 'metrics'

  if (!isOpen) return null;

  // Mock anti-cheat logs
  const auditLogs = [
    { id: 'LOG-8812', user: 'bot_runner_01', type: 'RAPID_SUBMISSION_BOT', detail: 'Completed stage in 240ms with 0 keystrokes', ip: '182.253.11.44', time: '2m ago', severity: 'HIGH' },
    { id: 'LOG-8813', user: 'script_kiddie', type: 'PAYLOAD_INJECTION_SQLI', detail: "Submitted: '; DROP TABLE stages;--", ip: '114.124.8.190', time: '14m ago', severity: 'CRITICAL' },
    { id: 'LOG-8814', user: 'exploit_test', type: 'STAGE_SKIP_ATTEMPT', detail: 'Tried unlocking Stage 15 with 0 prior cleared stages', ip: '36.85.92.10', time: '1h ago', severity: 'HIGH' },
    { id: 'LOG-8815', user: 'BitMaster_99', type: 'CLEAN_VERIFICATION', detail: 'Cleared Stage 5 C++ via authoritative AST check', ip: '103.21.244.1', time: '2h ago', severity: 'OK' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white border-4 border-[#1E2522] shadow-[8px_8px_0px_#1E2522] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1E2522] text-white p-4 flex items-center justify-between border-b-4 border-[#1E2522]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#EF4444]" />
            <div>
              <h2 className="font-extrabold text-lg uppercase tracking-tight">
                Admin Console // Anti-Cheat Security Hub
              </h2>
              <p className="text-[11px] font-mono text-gray-300">
                Authoritative Server Logs & Database Invariant Monitor
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-[#EF4444] text-white border-2 border-black flex items-center justify-center font-bold hover:bg-[#DC2626]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#F3F6F4] px-4 pt-3 flex gap-2 border-b-3 border-[#1E2522]">
          <button
            onClick={() => setActiveTab('anticheat')}
            className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-t-2 border-l-2 border-r-2 border-[#1E2522] ${
              activeTab === 'anticheat' ? 'bg-white -mb-[3px] border-b-0 text-[#1E2522]' : 'bg-gray-200 text-gray-600'
            }`}
          >
            Anti-Cheat Logs ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-t-2 border-l-2 border-r-2 border-[#1E2522] ${
              activeTab === 'users' ? 'bg-white -mb-[3px] border-b-0 text-[#1E2522]' : 'bg-gray-200 text-gray-600'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-t-2 border-l-2 border-r-2 border-[#1E2522] ${
              activeTab === 'metrics' ? 'bg-white -mb-[3px] border-b-0 text-[#1E2522]' : 'bg-gray-200 text-gray-600'
            }`}
          >
            Database Stats
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'anticheat' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between font-mono text-xs text-gray-600 mb-1">
                <span>Real-Time Edge Function Security Audit</span>
                <span className="text-[#10B981] font-bold">● System Active</span>
              </div>

              {auditLogs.map(log => (
                <div 
                  key={log.id} 
                  className={`p-3 border-2 border-[#1E2522] ${
                    log.severity === 'CRITICAL' 
                      ? 'bg-[#FEE2E2]' 
                      : log.severity === 'HIGH' 
                        ? 'bg-[#FEF3C7]' 
                        : 'bg-[#ECFDF5]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#1E2522]">
                      {log.id} • {log.user} ({log.ip})
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#1E2522] ${
                      log.severity === 'CRITICAL' ? 'bg-[#EF4444] text-white' : log.severity === 'HIGH' ? 'bg-[#F59E0B] text-black' : 'bg-[#10B981] text-white'
                    }`}>
                      {log.type}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[#1E2522] mb-1">
                    {log.detail}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span>Detected {log.time}</span>
                    {log.severity !== 'OK' && (
                      <button className="text-red-700 font-bold hover:underline flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Block IP / Reset Score
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="font-mono text-xs space-y-2">
              <div className="p-3 bg-gray-50 border-2 border-[#1E2522] flex justify-between items-center">
                <div>
                  <strong>PixelKnight (Current User)</strong>
                  <div className="text-gray-500 text-[11px]">Role: Admin / Developer</div>
                </div>
                <span className="px-2 py-0.5 bg-[#7D8D39] text-white font-bold text-[10px] border border-black">
                  ACTIVE
                </span>
              </div>
              <div className="p-3 bg-gray-50 border-2 border-[#1E2522] flex justify-between items-center">
                <div>
                  <strong>BitMaster_99</strong>
                  <div className="text-gray-500 text-[11px]">Total XP: 4,250 • Cleared: 15 Stages</div>
                </div>
                <span className="px-2 py-0.5 bg-green-600 text-white font-bold text-[10px] border border-black">
                  VERIFIED
                </span>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="grid grid-cols-3 gap-3 font-mono text-center">
              <div className="p-3 bg-[#E7EEDB] border-2 border-[#1E2522]">
                <div className="text-2xl font-bold text-[#586526]">45</div>
                <div className="text-[11px] uppercase font-bold mt-1">Curriculum Stages</div>
              </div>
              <div className="p-3 bg-[#FEF3C7] border-2 border-[#1E2522]">
                <div className="text-2xl font-bold text-[#B45309]">99.9%</div>
                <div className="text-[11px] uppercase font-bold mt-1">RLS Policy Coverage</div>
              </div>
              <div className="p-3 bg-[#FEE2E2] border-2 border-[#1E2522]">
                <div className="text-2xl font-bold text-[#DC2626]">0</div>
                <div className="text-[11px] uppercase font-bold mt-1">Breaches Detected</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F3F6F4] p-3 border-t-3 border-[#1E2522] flex items-center justify-between font-mono text-xs">
          <span className="text-gray-600">
            Powered by Supabase PostgreSQL Security Engine
          </span>
          <button
            onClick={onClose}
            className="neo-button text-xs py-1 px-4 bg-[#1E2522] text-white hover:bg-[#333E39]"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
}
