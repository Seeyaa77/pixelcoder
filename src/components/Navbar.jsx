import React from 'react';
import { Trophy, ShieldAlert, Sparkles, Terminal, Flame, ShoppingBag, User, LogIn, Heart, Shield } from 'lucide-react';

export default function Navbar({ 
  currentTrack, 
  onSelectTrack, 
  playerState,
  onOpenLeaderboard, 
  onOpenAdmin,
  onOpenInventory,
  onOpenAuth,
  onSignOut
}) {
  const tracks = [
    { id: 'python', label: 'Python', icon: '🐍' },
    { id: 'cpp', label: 'C++', icon: '⚡' },
    { id: 'javascript', label: 'JavaScript', icon: '✨' },
  ];

  return (
    <header className="w-full bg-[#FFFFFF] border-b-4 border-[#1E2522] sticky top-0 z-40 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 neo-box-olive flex items-center justify-center font-bold text-lg pixelated">
            🎮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-[#1E2522]">
                PIXEL<span className="text-[#7D8D39]">CODER</span>
              </span>
              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 bg-[#7D8D39] text-white border border-[#1E2522]">
                RPG Combat
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#586526] -mt-0.5">
              Battle Monsters • Learn Coding
            </p>
          </div>
        </div>

        {/* Language Track Selector */}
        <div className="flex items-center gap-2 bg-[#F3F6F4] p-1.5 border-3 border-[#1E2522] shadow-[2px_2px_0px_#1E2522]">
          {tracks.map(t => {
            const isActive = currentTrack === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTrack(t.id)}
                className={`px-3 py-1 font-mono font-bold text-xs uppercase transition-all flex items-center gap-1.5 border-2 ${
                  isActive 
                    ? 'bg-[#7D8D39] text-white border-[#1E2522] shadow-[2px_2px_0px_#1E2522]' 
                    : 'bg-white text-[#1E2522] border-transparent hover:border-[#1E2522]'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls & RPG Buttons */}
        <div className="flex items-center gap-2.5">
          
          {/* XP Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FEF3C7] border-3 border-[#1E2522] shadow-[3px_3px_0px_#1E2522] font-mono font-bold text-xs">
            <Sparkles className="w-4 h-4 text-[#D97706]" />
            <span className="text-[#92400E]">{playerState.total_xp} XP</span>
          </div>

          {/* Armory / Inventory Button */}
          <button 
            onClick={onOpenInventory}
            className="neo-button text-xs px-2.5 py-1.5 gap-1.5 flex items-center bg-[#F3F6F4] text-[#1E2522] hover:bg-[#E7EEDB]"
            title="Armory & Inventory"
          >
            <ShoppingBag className="w-4 h-4 text-[#7D8D39]" />
            <span className="hidden sm:inline">Armory</span>
          </button>

          {/* Leaderboard Button */}
          <button 
            onClick={onOpenLeaderboard}
            className="neo-button text-xs px-2.5 py-1.5 gap-1.5 flex items-center bg-[#F3F6F4] text-[#1E2522] hover:bg-[#E7EEDB]"
            title="Live Supabase Leaderboard"
          >
            <Trophy className="w-4 h-4 text-[#F59E0B]" />
            <span className="hidden sm:inline">Rankings</span>
          </button>

          {/* User Auth Pill / Button */}
          {playerState.isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#DCFCE7] border-3 border-[#1E2522] shadow-[3px_3px_0px_#1E2522] font-mono font-bold text-xs text-[#166534]">
                <User className="w-3.5 h-3.5 text-[#16A34A]" />
                <span className="max-w-[80px] truncate">{playerState.username}</span>
              </div>
              <button
                onClick={onSignOut}
                className="text-[10px] font-mono text-gray-500 hover:text-red-600 underline"
                title="Sign out"
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="neo-button text-xs px-3 py-1.5 gap-1.5 flex items-center bg-[#7D8D39] text-white"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

          {/* Admin Button */}
          <button 
            onClick={onOpenAdmin}
            className="neo-button text-xs px-2.5 py-1.5 gap-1 flex items-center bg-[#1E2522] hover:bg-[#333E39] text-white"
            title="Admin & Security Logs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
            <span className="hidden md:inline">Admin</span>
          </button>

        </div>

      </div>
    </header>
  );
}
