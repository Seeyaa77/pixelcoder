import React, { useEffect, useState } from 'react';
import { ArrowRight, HelpCircle, Sparkles, Sword, Trophy } from 'lucide-react';
import { PythonIcon, CppIcon, JavaScriptIcon } from './Icons';
import NeoButton from './ui/NeoButton';
import Spinner from './ui/Spinner';
import { fetchLiveLeaderboard } from '../lib/supabase';

const TRACK_CARDS = [
  {
    key: 'python',
    name: 'Python Track',
    Icon: PythonIcon,
    iconBoxClass: 'bg-white',
    accentClass: 'text-[#586526]',
    buttonClass: 'bg-[#3776AB] text-white hover:bg-[#2e628e]',
    blurb:
      'Master clean scripting, dynamic data types, loops, lists, dictionaries, and object-oriented wizardry.',
    bullets: ['Variables & Type Casting', 'Conditionals & Range Loops', 'Dungeon Boss: Pixel Dragon'],
  },
  {
    key: 'cpp',
    name: 'C++ Track',
    Icon: CppIcon,
    iconBoxClass: 'bg-white',
    accentClass: 'text-[#00599C]',
    buttonClass: 'bg-[#00599C] text-white hover:bg-[#004482]',
    blurb:
      'Delve into high-performance systems engineering, pointers, memory addresses, references, and STL vectors.',
    bullets: ['Explicit Typing & I/O Streams', 'Memory Pointers & References', 'Dungeon Boss: Memory Golem'],
  },
  {
    key: 'javascript',
    name: 'JavaScript Track',
    Icon: JavaScriptIcon,
    iconBoxClass: 'bg-[#F7DF1E]',
    accentClass: 'text-[#854D0E]',
    buttonClass: 'bg-[#F7DF1E] text-black hover:bg-[#e6cf17]',
    blurb:
      'Build modern web spells with ES6+, Arrow Functions, Template Literals, Promises, Async/Await, and Web Storage.',
    bullets: ['Template Literals & Arrays', 'Functional Map & Filter', 'Dungeon Boss: WebGL Hydra'],
  },
];

export default function HomePage({ onOpenAuth, onOpenHowToPlay, onStartTrial }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setStatus('loading');
      try {
        const data = await fetchLiveLeaderboard();
        if (cancelled) return;
        setLeaderboard(Array.isArray(data) ? data.slice(0, 5) : []);
        setStatus('ready');
      } catch (error) {
        console.warn('Hall of Fame load failed:', error);
        if (!cancelled) {
          setLeaderboard([]);
          setStatus('error');
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F6F4] font-sans text-[#1E2522]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b-4 border-[#1E2522] bg-white px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="neo-box-olive flex h-10 w-10 shrink-0 items-center justify-center font-bold text-white">
              <Sword className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-xl font-extrabold tracking-tight text-[#1E2522] sm:text-2xl">
                PIXEL<span className="text-[#7D8D39]">CODER</span>
              </span>
              <span className="border border-[#1E2522] bg-[#7D8D39] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-white sm:text-[10px]">
                RPG ARENA
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {onOpenHowToPlay ? (
              <button
                type="button"
                onClick={onOpenHowToPlay}
                className="neo-button inline-flex min-h-11 items-center justify-center gap-1.5 bg-white px-2.5 py-1.5 font-mono text-[11px] text-[#1E2522] hover:bg-[#F3F6F4] sm:px-3.5 sm:text-xs"
              >
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                <span>How to Play</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="neo-button inline-flex min-h-11 items-center justify-center bg-white px-3 py-1.5 font-mono text-[11px] text-[#1E2522] hover:bg-[#F3F6F4] sm:px-3.5 sm:text-xs"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="neo-button inline-flex min-h-11 items-center justify-center bg-[#7D8D39] px-3 py-1.5 font-mono text-[11px] text-white hover:bg-[#8fa042] sm:px-4 sm:text-xs"
            >
              Sign Up &amp; Play
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-3 py-10 text-center sm:px-4 sm:py-16">
        <div className="mb-5 inline-flex items-center gap-2 border-2 border-[#1E2522] bg-[#E7EEDB] px-2.5 py-1 font-mono text-[10px] font-bold text-[#586526] sm:px-3 sm:text-xs">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#7D8D39]" aria-hidden="true" />
          <span>w3schools-Aligned 2D Pixel Combat Web Game</span>
        </div>

        <h1 className="mb-6 max-w-4xl text-3xl font-black uppercase leading-none tracking-tight text-[#1E2522] sm:text-6xl">
          MASTER CODE BY{' '}
          <span className="text-[#7D8D39] underline decoration-4 decoration-[#1E2522]">
            SLASHING MONSTERS
          </span>
        </h1>

        <p className="mb-8 max-w-2xl font-mono text-xs leading-relaxed text-gray-700 sm:text-base">
          Step into a 16-bit retro RPG dungeon. Solve interactive programming tasks in Python, C++, and
          JavaScript. Cast spells, deal critical slashes, defend your HP against vicious bosses, and claim your
          place on the live Supabase leaderboard.
        </p>

        {/* Hero CTAs */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <NeoButton variant="primary" size="lg" onClick={() => onOpenAuth('register')}>
            <Sword className="h-4 w-4" aria-hidden="true" />
            <span>START QUEST NOW (FREE)</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </NeoButton>
          <NeoButton variant="secondary" size="lg" onClick={() => onOpenAuth('login')}>
            EXISTING HERO SIGN IN
          </NeoButton>
          {onStartTrial ? (
            <button
              type="button"
              onClick={onStartTrial}
              className="neo-button inline-flex min-h-11 items-center justify-center gap-1.5 bg-white px-4 py-2 font-mono text-[11px] font-bold uppercase text-[#1E2522] hover:bg-[#F3F6F4] sm:text-xs"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              <span>Try as guest — no account</span>
            </button>
          ) : null}
        </div>

        {/* Interactive Combat Mockup Graphic */}
        <div className="neo-box w-full max-w-3xl bg-white p-2 shadow-[8px_8px_0px_#1E2522] sm:p-3">
          <div className="mb-2 flex items-center justify-between gap-2 border-b-2 border-black bg-[#151B18] px-2 py-1.5 font-mono text-[9px] text-white sm:px-3 sm:text-xs">
            <span className="min-w-0 truncate">PIXELCODER_ARENA_PREVIEW // REAL-TIME RPG COMBAT</span>
            <span className="shrink-0 text-[#10B981]">● SYSTEM LIVE</span>
          </div>

          <div className="relative flex h-44 items-center justify-between gap-2 overflow-hidden border-2 border-[#1E2522] bg-gradient-to-b from-[#A7D7C5] to-[#F3F6F4] px-2 sm:h-48 sm:px-16">
            {/* Player Preview */}
            <div className="flex shrink-0 flex-col items-center">
              <span className="mb-1 border border-[#1E2522] bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold sm:text-[10px]">
                Player (100 HP)
              </span>
              <img
                src="/assets/platformer/Character/Animations/Idle/idle1.png"
                alt="Knight Hero"
                width="56"
                height="56"
                className="pixelated h-12 w-12 object-contain sm:h-14 sm:w-14"
              />
            </div>

            {/* Battle Slash Action */}
            <div className="flex min-w-0 flex-col items-center">
              <span className="mb-1 animate-pulse border-2 border-[#1E2522] bg-[#FEE2E2] px-2 py-1 font-mono text-[9px] font-bold text-[#DC2626] sm:text-xs">
                CRIT -100 HP!
              </span>
              <span className="text-center font-mono text-[9px] font-extrabold text-[#7D8D39] sm:text-xs">
                ⚔️ CASTING CODE SPELL ⚔️
              </span>
            </div>

            {/* Monster Preview */}
            <div className="flex shrink-0 flex-col items-center">
              <span className="mb-1 border border-[#1E2522] bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-red-600 sm:text-[10px]">
                Syntax Demon
              </span>
              <img
                src="/assets/monsters/demon/Demon_A_Idle.png"
                alt="Demon Boss"
                width="80"
                height="80"
                className="pixelated h-16 w-16 object-cover object-left sm:h-20 sm:w-20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Tracks Showcase */}
      <section className="border-y-4 border-[#1E2522] bg-white px-3 py-10 sm:px-4 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#1E2522] sm:text-3xl">
              SELECT YOUR CODING PATH
            </h2>
            <p className="mt-1 font-mono text-[11px] text-gray-600 sm:text-xs">
              Each language features 15 hand-crafted stages with theory, coding challenges, and bosses.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
            {TRACK_CARDS.map(({ key, name, Icon, iconBoxClass, accentClass, buttonClass, blurb, bullets }) => (
              <div key={key} className="neo-box flex flex-col justify-between bg-[#F3F6F4] p-4 sm:p-5">
                <div>
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center border-2 border-[#1E2522] p-2 ${iconBoxClass}`}
                  >
                    <Icon className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-xl font-extrabold uppercase text-[#1E2522]">{name}</h3>
                  <p className="mb-4 font-mono text-xs leading-relaxed text-gray-700">{blurb}</p>
                  <div className={`space-y-1.5 font-mono text-xs font-bold ${accentClass}`}>
                    {bullets.map((bullet) => (
                      <div key={bullet}>✓ {bullet}</div>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className={`neo-button mt-6 inline-flex min-h-11 w-full items-center justify-center px-3 py-2 font-mono text-xs ${buttonClass}`}
                >
                  Enroll {name.replace(' Track', '')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Hall of Fame Preview */}
      <section className="mx-auto w-full max-w-6xl px-3 py-10 sm:px-4 sm:py-12">
        <div className="neo-box bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#1E2522] pb-3">
            <div className="flex min-w-0 items-center gap-2">
              <Trophy className="h-6 w-6 shrink-0 text-[#7D8D39]" aria-hidden="true" />
              <h3 className="text-base font-extrabold uppercase text-[#1E2522] sm:text-lg">
                Live Supabase Hall of Fame
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="flex min-h-11 items-center font-mono text-[11px] font-bold text-[#586526] hover:underline sm:text-xs"
            >
              Sign up to claim your rank ❯
            </button>
          </div>

          {status === 'loading' ? (
            <div className="flex flex-col items-center justify-center gap-2 p-6 text-center font-mono text-xs text-gray-500">
              <Spinner size="md" label="Loading leaderboard" />
              <span>Loading real players from Supabase PostgreSQL database…</span>
            </div>
          ) : status === 'error' ? (
            <div
              role="alert"
              className="flex flex-col items-center gap-2 border-2 border-[#1E2522] bg-[#FEE2E2] p-4 text-center font-mono text-xs"
            >
              <p className="font-bold text-[#991B1B]">Could not load the Hall of Fame.</p>
              <p className="text-[11px] text-[#7F1D1D]">Check your connection, then try again.</p>
              <NeoButton variant="danger" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
                Retry
              </NeoButton>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex flex-col items-center gap-2 border-2 border-dashed border-[#1E2522] bg-[#F3F6F4] p-5 text-center font-mono text-xs">
              <Trophy className="h-7 w-7 text-[#7D8D39]" aria-hidden="true" />
              <p className="font-bold uppercase text-[#1E2522]">No heroes ranked yet</p>
              <p className="max-w-sm text-[11px] text-gray-600">
                Be the first adventurer: sign up, clear Stage 1, and claim the top of the board.
              </p>
              <NeoButton variant="primary" size="sm" onClick={() => onOpenAuth('register')}>
                Claim first rank
              </NeoButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 font-mono text-xs sm:grid-cols-2 md:grid-cols-3">
              {leaderboard.map((user, idx) => (
                <div
                  key={user.id || idx}
                  className="flex items-center justify-between gap-2 border-2 border-[#1E2522] bg-[#F3F6F4] p-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 text-sm font-bold">#{idx + 1}</span>
                    <div className="min-w-0">
                      <div className="truncate font-bold text-[#1E2522]">{user.username}</div>
                      <div className="truncate text-[10px] text-gray-500">
                        {user.weapon_name || 'Pixel Blade'}
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 font-extrabold text-[#7D8D39]">
                    {(user.total_xp || 0).toLocaleString()} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t-4 border-[#1E2522] bg-white p-5 font-mono text-xs text-gray-600 sm:p-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <span>PIXELCODER © 2026 • React + Supabase • 2D Retro RPG Learning Platform</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="flex min-h-11 items-center hover:underline"
            >
              Login
            </button>
            <span aria-hidden="true">•</span>
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="flex min-h-11 items-center hover:underline"
            >
              Register
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
