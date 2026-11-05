import React from 'react';
import { Trophy, ShieldAlert, Sparkles, ShoppingBag, User, LogIn, Sword } from 'lucide-react';
import { PythonIcon, CppIcon, JavaScriptIcon, PixelCoinIcon } from './Icons';

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
    { id: 'python', label: 'Python', icon: PythonIcon },
    { id: 'cpp', label: 'C++', icon: CppIcon },
    { id: 'javascript', label: 'JavaScript', icon: JavaScriptIcon },
  ];

  return (
    <header className="w-full bg-[#FFFFFF] border-b-4 border-[#1E2522] sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 neo-box-olive flex items-center justify-center font-bold text-white">
            <Sword className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-[#1E2522]">
                PIXEL<span className="text-[#7D8D39]">CODER</span>
              </span>
              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.2 bg-[#7D8D39] text-white border border-[#1E2522]">
                RPG Combat
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#586526] -mt-0.5">
              Battle Monsters • Learn Coding
            </p>
          </div>
        </div>

        {/* Language Track Selector with Real Vector Icons */}
        <div className="flex items-center gap-1.5 bg-[#F3F6F4] p-1 border-3 border-[#1E2522] shadow-[2px_2px_0px_#1E2522]">
          {tracks.map(t => {
            const isActive = currentTrack === t.id;
            const IconComp = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTrack(t.id)}
                className={`px-2.5 py-1 font-mono font-bold text-xs uppercase transition-all flex items-center gap-1.5 border-2 ${
                  isActive 
                    ? 'bg-[#7D8D39] text-white border-[#1E2522] shadow-[2px_2px_0px_#1E2522]' 
                    : 'bg-white text-[#1E2522] border-transparent hover:border-[#1E2522]'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls & RPG Buttons */}
        <div className="flex items-center gap-2">
          
          {/* XP Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FEF3C7] border-2 border-[#1E2522] shadow-[2px_2px_0px_#1E2522] font-mono font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="text-[#92400E]">{playerState.total_xp} XP</span>
          </div>

          {/* Gold Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-[#FEF08A] border-2 border-[#1E2522] shadow-[2px_2px_0px_#1E2522] font-mono font-bold text-xs text-[#854D0E]">
            <PixelCoinIcon className="w-3.5 h-3.5" />
            <span>{playerState.gold}</span>
          </div>

          {/* Armory Button */}
          <button 
            onClick={onOpenInventory}
            className="neo-button text-xs px-2.5 py-1 gap-1 flex items-center bg-[#F3F6F4] text-[#1E2522] hover:bg-[#E7EEDB]"
            title="Armory & Inventory"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#7D8D39]" />
            <span className="hidden sm:inline">Armory</span>
          </button>

          {/* Leaderboard Button */}
          <button 
            onClick={onOpenLeaderboard}
            className="neo-button text-xs px-2.5 py-1 gap-1 flex items-center bg-[#F3F6F4] text-[#1E2522] hover:bg-[#E7EEDB]"
            title="Live Supabase Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="hidden sm:inline">Rankings</span>
          </button>

          {/* User Auth Pill / Exit */}
          {playerState.isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2 py-1 bg-[#DCFCE7] border-2 border-[#1E2522] font-mono font-bold text-xs text-[#166534]">
                <User className="w-3 h-3 text-[#16A34A]" />
                <span className="max-w-[70px] truncate">{playerState.username}</span>
                {playerState.role === 'admin' && (
                  <span className="text-[9px] bg-red-600 text-white px-1 py-0.1 uppercase ml-0.5">Admin</span>
                )}
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
              className="neo-button text-xs px-3 py-1 gap-1.5 flex items-center bg-[#7D8D39] text-white"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Admin Button - ONLY VISIBLE IF ROLE IS ADMIN! */}
          {playerState.isLoggedIn && playerState.role === 'admin' && (
            <button 
              onClick={onOpenAdmin}
              className="neo-button text-xs px-2.5 py-1 gap-1 flex items-center bg-[#EF4444] text-white hover:bg-[#DC2626]"
              title="Admin & Anti-Cheat Hub"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
