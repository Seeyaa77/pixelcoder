import React, { useState, useEffect } from 'react';
import { Shield, Sword, Heart, Trophy, Terminal, ArrowRight, Sparkles, CheckCircle2, Lock, Flame } from 'lucide-react';
import { PythonIcon, CppIcon, JavaScriptIcon } from './Icons';
import { fetchLiveLeaderboard } from '../lib/supabase';

export default function HomePage({ onOpenAuth }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchLiveLeaderboard().then(data => {
      if (data && data.length > 0) {
        setLeaderboard(data.slice(0, 5));
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F6F4] text-[#1E2522] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="w-full bg-[#FFFFFF] border-b-4 border-[#1E2522] sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 neo-box-olive flex items-center justify-center font-bold text-white">
              <Sword className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-[#1E2522]">
                PIXEL<span className="text-[#7D8D39]">CODER</span>
              </span>
              <span className="text-[10px] ml-2 font-mono font-bold uppercase px-1.5 py-0.5 bg-[#7D8D39] text-white border border-[#1E2522]">
                RPG ARENA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="neo-button text-xs px-3.5 py-1.5 bg-white text-[#1E2522] hover:bg-[#F3F6F4]"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="neo-button text-xs px-4 py-1.5 bg-[#7D8D39] text-white hover:bg-[#8fa042]"
            >
              Sign Up & Play
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl w-full mx-auto px-4 py-12 sm:py-16 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E7EEDB] border-2 border-[#1E2522] font-mono text-xs font-bold text-[#586526] mb-5">
          <Sparkles className="w-3.5 h-3.5 text-[#7D8D39]" />
          <span>w3schools-Aligned 2D Pixel Combat Web Game</span>
        </div>

        <h1 className="font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#1E2522] max-w-4xl leading-none mb-6">
          MASTER CODE BY <span className="text-[#7D8D39] underline decoration-4 decoration-[#1E2522]">SLASHING MONSTERS</span>
        </h1>

        <p className="font-mono text-sm sm:text-base text-gray-700 max-w-2xl mb-8 leading-relaxed">
          Step into a 16-bit retro RPG dungeon. Solve interactive programming tasks in Python, C++, and JavaScript. Cast spells, deal critical slashes, defend your HP against vicious bosses, and claim your place on the live Supabase leaderboard.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button
            onClick={() => onOpenAuth('register')}
            className="neo-button text-sm px-6 py-3 bg-[#7D8D39] text-white hover:bg-[#8fa042] flex items-center gap-2"
          >
            <Sword className="w-4 h-4" />
            <span>START QUEST NOW (FREE)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenAuth('login')}
            className="neo-button text-sm px-6 py-3 bg-white text-[#1E2522] hover:bg-[#F3F6F4]"
          >
            EXISTING HERO SIGN IN
          </button>
        </div>

        {/* Interactive Combat Mockup Graphic */}
        <div className="w-full max-w-3xl neo-box p-3 bg-white shadow-[8px_8px_0px_#1E2522]">
          <div className="bg-[#151B18] px-3 py-1.5 flex items-center justify-between border-b-2 border-black mb-2 text-white font-mono text-xs">
            <span>PIXELCODER_ARENA_PREVIEW // REAL-TIME RPG COMBAT</span>
            <span className="text-[#10B981]">● SYSTEM LIVE</span>
          </div>

          <div className="relative bg-gradient-to-b from-[#A7D7C5] to-[#F3F6F4] border-2 border-[#1E2522] h-48 flex items-center justify-between px-8 sm:px-16 overflow-hidden">
            {/* Player Preview */}
            <div className="flex flex-col items-center">
              <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 border border-[#1E2522] mb-1">
                Player (100 HP)
              </span>
              <img 
                src="/assets/platformer/Character/Animations/Idle/idle1.png" 
                alt="Knight Hero" 
                className="w-14 h-14 pixelated"
              />
            </div>

            {/* Battle Slash Action */}
            <div className="flex flex-col items-center">
              <span className="px-3 py-1 bg-[#FEE2E2] border-2 border-[#1E2522] font-mono text-xs font-bold text-[#DC2626] mb-1 animate-pulse">
                CRIT -100 HP!
              </span>
              <span className="font-mono text-xs font-extrabold text-[#7D8D39]">
                ⚔️ CASTING CODE SPELL ⚔️
              </span>
            </div>

            {/* Monster Preview */}
            <div className="flex flex-col items-center">
              <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 border border-[#1E2522] mb-1 text-red-600">
                Syntax Demon (Boss)
              </span>
              <img 
                src="/assets/monsters/demon/Demon_A_Idle.png" 
                alt="Demon Boss" 
                className="w-20 h-20 pixelated object-cover object-left"
              />
            </div>
          </div>
        </div>

      </section>

      {/* 3 Tracks Showcase */}
      <section className="bg-white border-y-4 border-[#1E2522] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-10">
            <h2 className="font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#1E2522]">
              SELECT YOUR CODING PATH
            </h2>
            <p className="font-mono text-xs text-gray-600 mt-1">
              Each language features 15 hand-crafted stages with theory, coding challenges, and bosses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Python Card */}
            <div className="neo-box p-5 bg-[#F3F6F4] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white border-2 border-[#1E2522] flex items-center justify-center p-2 mb-4">
                  <PythonIcon className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-xl uppercase text-[#1E2522] mb-2">
                  Python Track
                </h3>
                <p className="font-mono text-xs text-gray-700 leading-relaxed mb-4">
                  Master clean scripting, dynamic data types, loops, lists, dictionaries, and object-oriented wizardry.
                </p>
                <div className="space-y-1.5 font-mono text-xs text-[#586526] font-bold">
                  <div>✓ Variables & Type Casting</div>
                  <div>✓ Conditionals & Range Loops</div>
                  <div>✓ Dungeon Boss: Pixel Dragon</div>
                </div>
              </div>
              <button
                onClick={() => onOpenAuth('register')}
                className="neo-button text-xs py-2 w-full mt-6 bg-[#3776AB] text-white hover:bg-[#2e628e]"
              >
                Enroll Python
              </button>
            </div>

            {/* C++ Card */}
            <div className="neo-box p-5 bg-[#F3F6F4] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white border-2 border-[#1E2522] flex items-center justify-center p-2 mb-4">
                  <CppIcon className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-xl uppercase text-[#1E2522] mb-2">
                  C++ Track
                </h3>
                <p className="font-mono text-xs text-gray-700 leading-relaxed mb-4">
                  Delve into high-performance systems engineering, pointers, memory addresses, references, and STL vectors.
                </p>
                <div className="space-y-1.5 font-mono text-xs text-[#00599C] font-bold">
                  <div>✓ Explicit Typing & I/O Streams</div>
                  <div>✓ Memory Pointers & References</div>
                  <div>✓ Dungeon Boss: Memory Golem</div>
                </div>
              </div>
              <button
                onClick={() => onOpenAuth('register')}
                className="neo-button text-xs py-2 w-full mt-6 bg-[#00599C] text-white hover:bg-[#004482]"
              >
                Enroll C++
              </button>
            </div>

            {/* JavaScript Card */}
            <div className="neo-box p-5 bg-[#F3F6F4] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-[#F7DF1E] border-2 border-[#1E2522] flex items-center justify-center p-2 mb-4">
                  <JavaScriptIcon className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-xl uppercase text-[#1E2522] mb-2">
                  JavaScript Track
                </h3>
                <p className="font-mono text-xs text-gray-700 leading-relaxed mb-4">
                  Build modern web spells with ES6+, Arrow Functions, Template Literals, Promises, Async/Await, and Web Storage.
                </p>
                <div className="space-y-1.5 font-mono text-xs text-[#854D0E] font-bold">
                  <div>✓ Template Literals & Arrays</div>
                  <div>✓ Functional Map & Filter</div>
                  <div>✓ Dungeon Boss: WebGL Hydra</div>
                </div>
              </div>
              <button
                onClick={() => onOpenAuth('register')}
                className="neo-button text-xs py-2 w-full mt-6 bg-[#F7DF1E] text-black hover:bg-[#e6cf17]"
              >
                Enroll JavaScript
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Live Hall of Fame Preview */}
      <section className="max-w-6xl w-full mx-auto px-4 py-12">
        <div className="neo-box p-6 bg-white">
          <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#1E2522]">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#7D8D39]" />
              <h3 className="font-extrabold text-lg uppercase text-[#1E2522]">
                Live Supabase Hall of Fame
              </h3>
            </div>
            <button
              onClick={() => onOpenAuth('register')}
              className="font-mono text-xs font-bold text-[#586526] hover:underline"
            >
              Sign up to claim your rank ❯
            </button>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-4 text-center font-mono text-xs text-gray-500">
              Loading real players from Supabase PostgreSQL database...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
              {leaderboard.map((user, idx) => (
                <div key={user.id || idx} className="p-3 border-2 border-[#1E2522] bg-[#F3F6F4] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">#{idx + 1}</span>
                    <div>
                      <div className="font-bold text-[#1E2522]">{user.username}</div>
                      <div className="text-[10px] text-gray-500">{user.weapon_name || 'Pixel Blade'}</div>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#7D8D39]">
                    {(user.total_xp || 0).toLocaleString()} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t-4 border-[#1E2522] bg-white p-6 font-mono text-xs text-center text-gray-600">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>PIXELCODER © 2026 • React + Supabase • 2D Retro RPG Learning Platform</span>
          <div className="flex items-center gap-4">
            <button onClick={() => onOpenAuth('login')} className="hover:underline">Login</button>
            <span>•</span>
            <button onClick={() => onOpenAuth('register')} className="hover:underline">Register</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
