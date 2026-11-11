import React from 'react';
import { HelpCircle, LogIn, ShieldAlert, ShoppingBag, Sparkles, Sword, Trophy, User } from 'lucide-react';
import { PythonIcon, CppIcon, JavaScriptIcon, PixelCoinIcon } from './Icons';

export default function Navbar({
  currentTrack,
  onSelectTrack,
  playerState,
  onOpenLeaderboard,
  onOpenAdmin,
  onOpenInventory,
  onOpenAuth,
  onSignOut,
  onOpenHowToPlay,
}) {
  const tracks = [
    { id: 'python', label: 'Python', icon: PythonIcon },
    { id: 'cpp', label: 'C++', icon: CppIcon },
    { id: 'javascript', label: 'JavaScript', icon: JavaScriptIcon },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b-4 border-[#1E2522] bg-white px-3 py-2.5 sm:px-4">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border-3 border-[#1E2522] bg-[#7D8D39] font-bold text-white shadow-[3px_3px_0px_#1E2522]">
            <Sword className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-extrabold text-lg tracking-tight text-[#1E2522] sm:text-xl">
                PIXEL<span className="text-[#7D8D39]">CODER</span>
              </span>
              <span className="hidden shrink-0 border border-[#1E2522] bg-[#7D8D39] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-white sm:inline">
                RPG Combat
              </span>
            </div>
            <p className="hidden truncate font-mono text-[10px] text-[#586526] sm:block">
              Battle Monsters • Learn Coding
            </p>
          </div>
        </div>

        {/* Language Track Selector */}
        <div
          role="group"
          aria-label="Select coding track"
          className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto border-3 border-[#1E2522] bg-[#F3F6F4] p-1 shadow-[2px_2px_0px_#1E2522]"
        >
          {tracks.map((track) => {
            const isActive = currentTrack === track.id;
            const IconComp = track.icon;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => onSelectTrack(track.id)}
                aria-pressed={isActive}
                aria-label={`Switch to ${track.label} track`}
                className={`flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap border-2 px-2.5 py-1 font-mono text-xs font-bold uppercase transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7D8D39]/50 focus-visible:ring-offset-1 ${
                  isActive
                    ? 'border-[#1E2522] bg-[#7D8D39] text-white shadow-[2px_2px_0px_#1E2522]'
                    : 'border-transparent bg-white text-[#1E2522] hover:border-[#1E2522]'
                }`}
              >
                <IconComp className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{track.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* XP Badge */}
          <div className="flex shrink-0 items-center gap-1.5 border-2 border-[#1E2522] bg-[#FEF3C7] px-2 py-1 font-mono text-xs font-bold shadow-[2px_2px_0px_#1E2522]">
            <Sparkles className="h-3.5 w-3.5 text-[#D97706]" aria-hidden="true" />
            <span className="text-[#92400E]">
              {playerState.total_xp} XP
              <span className="sr-only"> total experience</span>
            </span>
          </div>

          {/* Gold Badge */}
          <div className="flex shrink-0 items-center gap-1 border-2 border-[#1E2522] bg-[#FEF08A] px-2 py-1 font-mono text-xs font-bold text-[#854D0E] shadow-[2px_2px_0px_#1E2522]">
            <PixelCoinIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {playerState.gold}
              <span className="sr-only"> gold</span>
            </span>
          </div>

          {/* How to Play */}
          {onOpenHowToPlay ? (
            <button
              type="button"
              onClick={onOpenHowToPlay}
              aria-label="How to play"
              title="How to play"
              className="neo-button flex h-11 w-11 items-center justify-center bg-[#E0E7FF] p-0 text-[#3730A3]"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}

          {/* Armory Button */}
          <button
            type="button"
            onClick={onOpenInventory}
            aria-label="Open armory and inventory"
            className="neo-button flex min-h-11 items-center gap-1 bg-[#F3F6F4] px-2.5 py-1 text-xs text-[#1E2522] hover:bg-[#E7EEDB]"
            title="Armory & Inventory"
          >
            <ShoppingBag className="h-4 w-4 text-[#7D8D39]" aria-hidden="true" />
            <span className="hidden sm:inline">Armory</span>
          </button>

          {/* Leaderboard Button */}
          <button
            type="button"
            onClick={onOpenLeaderboard}
            aria-label="Open live leaderboard"
            className="neo-button flex min-h-11 items-center gap-1 bg-[#F3F6F4] px-2.5 py-1 text-xs text-[#1E2522] hover:bg-[#E7EEDB]"
            title="Live Supabase Leaderboard"
          >
            <Trophy className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
            <span className="hidden sm:inline">Rankings</span>
          </button>

          {/* User Auth Pill / Exit */}
          {playerState.isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 border-2 border-[#1E2522] bg-[#DCFCE7] px-2 py-1 font-mono text-xs font-bold text-[#166534]">
                <User className="h-3 w-3 text-[#16A34A]" aria-hidden="true" />
                <span className="max-w-[70px] truncate">{playerState.username}</span>
                {playerState.role === 'admin' ? (
                  <span className="ml-0.5 bg-red-600 px-1 py-0.5 text-[9px] uppercase text-white">Admin</span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="min-h-11 px-1.5 py-1 font-mono text-[10px] text-gray-600 underline hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D8D39]"
                title="Sign out"
                aria-label={`Sign out ${playerState.username}`}
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="neo-button flex min-h-11 items-center gap-1.5 bg-[#7D8D39] px-3 py-1 text-xs text-white"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign In</span>
            </button>
          )}

          {/* Admin Button - only for admins */}
          {playerState.isLoggedIn && playerState.role === 'admin' ? (
            <button
              type="button"
              onClick={onOpenAdmin}
              aria-label="Open admin console"
              className="neo-button flex min-h-11 items-center gap-1 bg-[#EF4444] px-2.5 py-1 text-xs text-white hover:bg-[#DC2626]"
              title="Admin & Anti-Cheat Hub"
            >
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
