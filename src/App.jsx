import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GameCanvas from './components/GameCanvas';
import StageSelector from './components/StageSelector';
import CodePlayground from './components/CodePlayground';
import LeaderboardModal from './components/LeaderboardModal';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import InventoryModal from './components/InventoryModal';
import HomePage from './components/HomePage';
import HowToPlay, { hasSeenHowToPlay } from './components/HowToPlay';
import { useToast } from './components/ui/Toast';
import { SYLLABUS_TRACKS } from './data/syllabus';
import { getStoredSession, saveStoredSession, clearStoredSession, syncProgressToBackend } from './lib/supabase';
import {
  createDefaultProgress,
  getClearedStages,
  applyStageClear,
  applyStageFail,
  usePotion as drinkPotion,
  buyPotion,
  equipWeapon,
  selectCharacter,
  isStageUnlocked,
  hintKey,
  unlockHint,
  xpLevel
} from './lib/progress';
import { Heart } from 'lucide-react';
import { PixelCoinIcon } from './components/Icons';

const ONBOARD_SESSION_KEY = 'pixelcoder_howto_shown_session';

export default function App() {
  const toast = useToast();
  const [currentTrackId, setCurrentTrackId] = useState('python');
  const [currentStageNumber, setCurrentStageNumber] = useState(1);
  const [playerState, setPlayerState] = useState(getStoredSession());
  const [language, setLanguage] = useState(() => {
    try {
      const stored = window.localStorage.getItem('pixelcoder_language');
      return stored === 'id' ? 'id' : 'en';
    } catch {
      return 'en';
    }
  }); // 'en' | 'id'

  // Combat State
  const [combatAction, setCombatAction] = useState(null);
  const [monsterHp, setMonsterHp] = useState(100);

  // Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isHowToOpen, setIsHowToOpen] = useState(false);

  const currentTrack = SYLLABUS_TRACKS[currentTrackId] || SYLLABUS_TRACKS.python;
  const currentStage = currentTrack.stages.find(s => s.stageNumber === currentStageNumber) || currentTrack.stages[0];

  const clearedStages = getClearedStages(playerState, currentTrackId);
  const isCurrentStageCleared = clearedStages.includes(currentStageNumber);
  const levelInfo = xpLevel(playerState.total_xp);

  // Persist UI language and keep <html lang> in sync for a11y / SEO.
  useEffect(() => {
    try {
      window.localStorage.setItem('pixelcoder_language', language);
    } catch {
      /* storage may be unavailable */
    }
    document.documentElement.lang = language;
  }, [language]);

  // Sync to local storage and remote Supabase
  useEffect(() => {
    saveStoredSession(playerState);
    if (playerState.isLoggedIn && !playerState.isGuest) {
      syncProgressToBackend(playerState);
    }
  }, [playerState]);

  // First-run onboarding: auto-open once per session for signed-in players.
  useEffect(() => {
    if (!playerState.isLoggedIn) return;
    try {
      const alreadyShown = sessionStorage.getItem(ONBOARD_SESSION_KEY) === '1';
      if (!alreadyShown && !hasSeenHowToPlay()) {
        sessionStorage.setItem(ONBOARD_SESSION_KEY, '1');
        // eslint-disable-next-line react/set-state-in-effect -- onboarding opens once per session, driven by storage
        setIsHowToOpen(true);
      }
    } catch {
      if (!hasSeenHowToPlay()) setIsHowToOpen(true);
    }
  }, [playerState.isLoggedIn]);

  // Reset monster HP when stage changes - but keep dead (0 HP) if stage already cleared
    useEffect(() => {
      const isCleared = (playerState.clearedStages[currentTrackId] || []).includes(currentStageNumber);
      // eslint-disable-next-line react/set-state-in-effect -- monster HP must follow the selected stage
      setMonsterHp(isCleared ? 0 : 100);
      setCombatAction(null);
    }, [currentStageNumber, currentTrackId, playerState.clearedStages]);

  const handleSelectTrack = (trackId) => {
    setCurrentTrackId(trackId);
    setCurrentStageNumber(1);
  };

  const handleStageClear = (stageNum, xpAwarded, _entropy) => {
      setMonsterHp(0);
      setPlayerState(prev => applyStageClear(prev, currentTrackId, stageNum, xpAwarded));
    };

  const handleStageFailed = () => {
    setPlayerState(prev => applyStageFail(prev, 15));
  };

  const handleNextStage = () => {
    const next = currentStageNumber + 1;
    if (next <= currentTrack.stages.length && isStageUnlocked(playerState, currentTrackId, next)) {
      setCurrentStageNumber(next);
    }
  };

  const handleSelectStage = (stageNumber) => {
    if (!isStageUnlocked(playerState, currentTrackId, stageNumber)) {
      toast.warning(`Stage ${stageNumber} masih terkunci. Selesaikan stage sebelumnya dulu!`);
      return;
    }
    setCurrentStageNumber(stageNumber);
  };

  // Inventory & Consumable Actions
  const handleUsePotion = () => {
    if (playerState.potions <= 0) {
      toast.warning('Potion habis! Beli potion dulu di Inventory.');
      return;
    }
    if (playerState.hp >= playerState.max_hp) {
      toast.info('HP kamu sudah penuh.');
      return;
    }
    setPlayerState(prev => drinkPotion(prev));
  };

  const handleBuyPotion = () => {
    if (playerState.gold < 50) {
      toast.error('Gold tidak cukup untuk membeli potion (butuh 50).');
      return;
    }
    setPlayerState(prev => buyPotion(prev));
  };

  const handleEquipWeapon = (weapon) => {
    if (playerState.weapon_name === weapon.name) return;
    const owned = Array.isArray(playerState.ownedWeapons)
      ? playerState.ownedWeapons
      : ['Pixel Blade'];
    if (!owned.includes(weapon.name) && playerState.gold < weapon.cost) {
      toast.error('Gold tidak cukup untuk membeli senjata ini!');
      return;
    }
    setPlayerState(prev => equipWeapon(prev, weapon));
  };

  const handleBuyHint = (cost) => {
    const key = hintKey(currentTrackId, currentStageNumber);
    if (playerState.gold < cost) {
      toast.error('Gold tidak cukup untuk membeli hint.');
      return;
    }
    if ((playerState.hintsUnlocked || []).includes(key)) return;
    setPlayerState(prev => unlockHint(prev, key, cost));
    toast.success('Hint unlocked', { description: 'Hint ini tersimpan permanen untuk stage ini.' });
  };

  const handleSelectCharacter = (charName) => {
    setPlayerState(prev => selectCharacter(prev, charName));
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setPlayerState(prev => {
      const base = {
        ...createDefaultProgress(),
        ...authenticatedUser,
        isLoggedIn: true,
        isGuest: false
      };

      if (!prev.isGuest) return base;

      // A guest just created an account: keep the progress they earned locally.
      const mergedCleared = { ...(base.clearedStages || {}) };
      Object.entries(prev.clearedStages || {}).forEach(([track, stages]) => {
        mergedCleared[track] = Array.from(new Set([...(mergedCleared[track] || []), ...(stages || [])])).sort(
          (a, b) => a - b
        );
      });

      return {
        ...base,
        total_xp: Math.max(Number(base.total_xp) || 0, Number(prev.total_xp) || 0),
        gold: Math.max(Number(base.gold) || 0, Number(prev.gold) || 0),
        clearedStages: mergedCleared,
        ownedWeapons: Array.from(
          new Set([...(base.ownedWeapons || ['Pixel Blade']), ...(prev.ownedWeapons || [])])
        ),
        hintsUnlocked: Array.from(new Set([...(base.hintsUnlocked || []), ...(prev.hintsUnlocked || [])]))
      };
    });
  };

  const handleStartTrial = () => {
    setPlayerState({
      ...createDefaultProgress(),
      isLoggedIn: true,
      isGuest: true,
      username: 'Guest',
      character_name: 'Royal Soldier'
    });
    toast.success('Mode tamu aktif', {
      description: 'Progres tersimpan di browser ini. Daftar kapan saja untuk menyimpannya ke akun.'
    });
  };

  const handleSignOut = () => {
    clearStoredSession();
    try {
      sessionStorage.removeItem(ONBOARD_SESSION_KEY);
    } catch {
      /* ignore */
    }
    setPlayerState(createDefaultProgress());
  };

  const openAuthWithMode = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // If user is not logged in, render the Homepage!
  if (!playerState.isLoggedIn) {
    return (
      <>
        <HomePage
          onOpenAuth={openAuthWithMode}
          onOpenHowToPlay={() => setIsHowToOpen(true)}
          onStartTrial={handleStartTrial}
        />
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          language={language}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // If user is logged in, show the Combat Arena dashboard
  return (
    <div className="min-h-screen bg-[#F3F6F4] text-[#1E2522] flex flex-col font-sans">
      
      {/* Top HUD Navigation */}
      <Navbar
        currentTrack={currentTrackId}
        onSelectTrack={handleSelectTrack}
        playerState={playerState}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenHowToPlay={() => setIsHowToOpen(true)}
        onOpenAuth={() => openAuthWithMode('login')}
        onSignOut={handleSignOut}
      />

      {/* Guest-mode notice: progress is local until an account is created */}
      {playerState.isGuest && (
        <div className="border-b-2 border-[#1E2522] bg-[#FEF08A] px-3 py-1.5 font-mono text-[10px] sm:text-xs">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-[#854D0E]">
              MODE TAMU — progres hanya tersimpan di browser ini.
            </span>
            <button
              type="button"
              onClick={() => openAuthWithMode('register')}
              className="neo-button bg-[#7D8D39] px-2 py-1 text-[10px] font-bold uppercase text-white hover:bg-[#8fa042] sm:text-xs"
            >
              Simpan ke akun
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-3">
        
        {/* Compact Level Banner */}
        <div className="neo-box p-2.5 bg-white flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base uppercase tracking-tight text-[#1E2522]">
              {currentTrack.name} Track // Stage {currentStageNumber}: {currentStage.title}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span
              className="hidden sm:inline-flex items-center gap-1 border-2 border-[#1E2522] bg-[#E0E7FF] px-2 py-1 font-bold text-[#3730A3]"
              title={`${levelInfo.current} / ${levelInfo.next} XP to next level`}
            >
              Lv.{levelInfo.level}
            </span>
            <button
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="neo-button text-[11px] py-1 px-2 bg-[#E0E7FF] text-[#3730A3] hover:bg-[#C7D2FE] flex items-center gap-1"
              title={language === 'en' ? 'Switch to Indonesian' : 'Ganti ke English'}
            >
              <span className="font-bold">{language === 'en' ? '🇬🇧 EN' : '🇮🇩 ID'}</span>
            </button>

            <button
              onClick={handleUsePotion}
              disabled={playerState.potions <= 0 || playerState.hp >= playerState.max_hp}
              className="neo-button text-[11px] py-1 px-2 bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA] flex items-center gap-1"
            >
              <Heart className="w-3.5 h-3.5 fill-[#DC2626] text-[#DC2626]" />
              <span>Potion ({playerState.potions})</span>
            </button>

            <button
              onClick={() => setIsInventoryOpen(true)}
              className="neo-button text-[11px] py-1 px-2.5 bg-[#FEF08A] text-[#854D0E] hover:bg-[#FDE047] flex items-center gap-1"
            >
              <PixelCoinIcon className="w-3 h-3" />
              <span>{playerState.gold}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Game Arena: Left Combat Canvas & Roadmap, Right Code & Task */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          
          {/* Left Column (5 Cols): Close-up Combat Arena + Roadmap */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            
            {/* 2D Combat Canvas with Soldier & Orc */}
                        <GameCanvas
                          currentTrack={currentTrackId}
                          stageNumber={currentStageNumber}
                          stageTitle={currentStage.title}
                          combatAction={combatAction}
                          playerHp={playerState.hp}
                          playerMaxHp={playerState.max_hp}
                          characterName={playerState.character_name || 'Royal Soldier'}
                          weaponName={playerState.weapon_name || 'Steel Sword'}
                          weaponAtk={playerState.weapon_atk || 25}
                          monsterHp={monsterHp}
                          streak={playerState.current_streak}
                          isCleared={isCurrentStageCleared}
                          onCombatAnimationEnd={() => setCombatAction(null)}
                        />

            {/* Stage Roadmap Selector */}
            <StageSelector
              stages={currentTrack.stages}
              currentStageNumber={currentStageNumber}
              clearedStageNumbers={clearedStages}
              onSelectStage={handleSelectStage}
            />

          </div>

          {/* Right Column (7 Cols): Theory, Task & Code Editor */}
          <div className="lg:col-span-7">
            <CodePlayground
              stage={currentStage}
              trackId={currentTrackId}
              language={language}
              playerGold={playerState.gold}
              hintUnlocked={(playerState.hintsUnlocked || []).includes(
                hintKey(currentTrackId, currentStageNumber)
              )}
              onBuyHint={handleBuyHint}
              isCleared={isCurrentStageCleared}
              onStageClear={handleStageClear}
              onStageFailed={handleStageFailed}
              onNextStage={handleNextStage}
              hasNextStage={currentStageNumber < currentTrack.stages.length}
              onCombatTrigger={(action) => setCombatAction(action)}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-4 border-[#1E2522] bg-white p-3 font-mono text-xs text-center text-gray-600">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            PIXELCODER RPG • Hero: <strong>{playerState.character_name || 'Royal Soldier'}</strong> ({playerState.username})
          </span>
          <span className="text-[#586526] font-bold">
            Tiny RPG Pack: Soldier vs Orc • Live Supabase Connected
          </span>
        </div>
      </footer>

      {/* Modals */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUsername={playerState.username}
      />

      {playerState.role === 'admin' && (
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        language={language}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        playerState={playerState}
        onEquipWeapon={handleEquipWeapon}
        onSelectCharacter={handleSelectCharacter}
        onUsePotion={handleUsePotion}
        onBuyPotion={handleBuyPotion}
      />

      <HowToPlay
        isOpen={isHowToOpen}
        onClose={() => setIsHowToOpen(false)}
        language={language}
        onRequestAuth={() => {
          setIsHowToOpen(false);
          openAuthWithMode('login');
        }}
      />

    </div>
  );
}
