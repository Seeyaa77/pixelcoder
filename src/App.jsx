import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GameCanvas from './components/GameCanvas';
import StageSelector from './components/StageSelector';
import CodePlayground from './components/CodePlayground';
import LeaderboardModal from './components/LeaderboardModal';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import InventoryModal from './components/InventoryModal';
import { SYLLABUS_TRACKS } from './data/syllabus';
import { getStoredSession, saveStoredSession, syncProgressToBackend } from './lib/supabase';
import { Heart, Shield, Sword, ShoppingBag, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTrackId, setCurrentTrackId] = useState('python');
  const [currentStageNumber, setCurrentStageNumber] = useState(1);
  const [playerState, setPlayerState] = useState(getStoredSession());

  // Combat State
  const [combatAction, setCombatAction] = useState(null);
  const [monsterHp, setMonsterHp] = useState(100);

  // Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const currentTrack = SYLLABUS_TRACKS[currentTrackId] || SYLLABUS_TRACKS.python;
  const currentStage = currentTrack.stages.find(s => s.stageNumber === currentStageNumber) || currentTrack.stages[0];

  const clearedStages = playerState.clearedStages[currentTrackId] || [1];
  const isCurrentStageCleared = clearedStages.includes(currentStageNumber);

  // Sync to local storage and remote Supabase
  useEffect(() => {
    saveStoredSession(playerState);
    syncProgressToBackend(playerState);
  }, [playerState]);

  // Reset monster HP when stage changes
  useEffect(() => {
    setMonsterHp(100);
    setCombatAction(null);
  }, [currentStageNumber, currentTrackId]);

  const handleSelectTrack = (trackId) => {
    setCurrentTrackId(trackId);
    setCurrentStageNumber(1);
  };

  const handleStageClear = (stageNum, xpAwarded, entropy) => {
    setMonsterHp(0);
    setPlayerState(prev => {
      const trackCleared = prev.clearedStages[currentTrackId] || [];
      const isNewClear = !trackCleared.includes(stageNum);

      const nextTrackCleared = isNewClear 
        ? [...trackCleared, stageNum] 
        : trackCleared;

      const nextStageToUnlock = stageNum + 1;
      if (!nextTrackCleared.includes(nextStageToUnlock) && nextStageToUnlock <= 15) {
        nextTrackCleared.push(nextStageToUnlock);
      }

      return {
        ...prev,
        total_xp: prev.total_xp + (isNewClear ? xpAwarded : 20),
        current_streak: prev.current_streak + (isNewClear ? 1 : 0),
        gold: prev.gold + (isNewClear ? 75 : 15),
        clearedStages: {
          ...prev.clearedStages,
          [currentTrackId]: nextTrackCleared
        }
      };
    });
  };

  const handleStageFailed = () => {
    setPlayerState(prev => {
      const incomingDmg = Math.max(8, 22 - Math.floor(prev.armor / 3));
      const nextHp = prev.hp - incomingDmg;

      if (nextHp <= 0) {
        // Emergency Revive if player knocked out
        return {
          ...prev,
          hp: 50,
          potions: Math.max(0, prev.potions - 1)
        };
      }

      return {
        ...prev,
        hp: nextHp
      };
    });
  };

  const handleNextStage = () => {
    if (currentStageNumber < currentTrack.stages.length) {
      setCurrentStageNumber(prev => prev + 1);
    }
  };

  // Inventory & Consumable Actions
  const handleUsePotion = () => {
    if (playerState.potions > 0 && playerState.hp < playerState.max_hp) {
      setPlayerState(prev => ({
        ...prev,
        hp: Math.min(prev.max_hp, prev.hp + 35),
        potions: prev.potions - 1
      }));
    }
  };

  const handleBuyPotion = () => {
    if (playerState.gold >= 50) {
      setPlayerState(prev => ({
        ...prev,
        gold: prev.gold - 50,
        potions: prev.potions + 1
      }));
    }
  };

  const handleEquipWeapon = (weapon) => {
    if (playerState.weapon_name === weapon.name) return;
    const canAfford = playerState.gold >= weapon.cost;
    if (!canAfford) {
      alert("Not enough gold to purchase this weapon!");
      return;
    }
    setPlayerState(prev => ({
      ...prev,
      gold: prev.gold - weapon.cost,
      weapon_name: weapon.name,
      weapon_atk: weapon.atk
    }));
  };

  const handleEquipArmor = (armor) => {
    if (playerState.armor === armor.def) return;
    const canAfford = playerState.gold >= armor.cost;
    if (!canAfford) {
      alert("Not enough gold to purchase this armor!");
      return;
    }
    setPlayerState(prev => ({
      ...prev,
      gold: prev.gold - armor.cost,
      armor: armor.def
    }));
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setPlayerState(authenticatedUser);
  };

  const handleSignOut = () => {
    const guestState = {
      isLoggedIn: false,
      username: 'Guest_Knight',
      email: '',
      role: 'user',
      total_xp: 0,
      current_streak: 1,
      hp: 100,
      max_hp: 100,
      armor: 20,
      weapon_name: 'Pixel Blade',
      weapon_atk: 25,
      gold: 150,
      potions: 3,
      clearedStages: { python: [1], cpp: [1], javascript: [1] }
    };
    setPlayerState(guestState);
  };

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
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Game Arena */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        
        {/* Banner Info */}
        <div className="neo-box p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-[#F3F6F4] border-2 border-[#1E2522]">
              {currentTrack.icon}
            </span>
            <div>
              <h1 className="font-extrabold text-xl sm:text-2xl uppercase tracking-tight text-[#1E2522]">
                {currentTrack.name} Track: Dungeon {currentStageNumber}
              </h1>
              <p className="text-xs font-mono text-gray-600">
                {currentTrack.tagline} • Monster HP: {monsterHp}/100
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
            {/* Quick potion shortcut */}
            <button
              onClick={handleUsePotion}
              disabled={playerState.potions <= 0 || playerState.hp >= playerState.max_hp}
              className="neo-button text-[11px] py-1 px-2.5 bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA] flex items-center gap-1"
            >
              <Heart className="w-3.5 h-3.5 fill-[#DC2626] text-[#DC2626]" />
              <span>Use Potion (x{playerState.potions})</span>
            </button>

            <button
              onClick={() => setIsInventoryOpen(true)}
              className="neo-button text-[11px] py-1 px-2.5 bg-[#FEF08A] text-[#854D0E] hover:bg-[#FDE047] flex items-center gap-1"
            >
              <span>🪙 {playerState.gold} Gold</span>
            </button>
          </div>
        </div>

        {/* 2D Combat Canvas with Monsters & Slashes */}
        <GameCanvas
          currentTrack={currentTrackId}
          stageNumber={currentStageNumber}
          stageTitle={currentStage.title}
          combatAction={combatAction}
          playerHp={playerState.hp}
          playerMaxHp={playerState.max_hp}
          playerArmor={playerState.armor}
          weaponName={playerState.weapon_name}
          weaponAtk={playerState.weapon_atk}
          monsterHp={monsterHp}
          streak={playerState.current_streak}
          onCombatAnimationEnd={() => setCombatAction(null)}
        />

        {/* Stage Roadmap Selector */}
        <StageSelector
          stages={currentTrack.stages}
          currentStageNumber={currentStageNumber}
          clearedStageNumbers={clearedStages}
          onSelectStage={(num) => setCurrentStageNumber(num)}
        />

        {/* Interactive Theory & Code Challenge Runner */}
        <CodePlayground
          stage={currentStage}
          isCleared={isCurrentStageCleared}
          onStageClear={handleStageClear}
          onStageFailed={handleStageFailed}
          onNextStage={handleNextStage}
          hasNextStage={currentStageNumber < currentTrack.stages.length}
          onCombatTrigger={(action) => setCombatAction(action)}
          playerHp={playerState.hp}
        />

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-4 border-[#1E2522] bg-white p-4 font-mono text-xs text-center text-gray-600">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            PIXELCODER RPG © 2026 • Live Supabase PostgreSQL Sync • Demon & Blood Monster Arena
          </span>
          <span className="text-[#586526] font-bold">
            Authoritative Battle Engine • Neobrutalism UI
          </span>
        </div>
      </footer>

      {/* Modals */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUsername={playerState.username}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        playerState={playerState}
        onEquipWeapon={handleEquipWeapon}
        onEquipArmor={handleEquipArmor}
        onUsePotion={handleUsePotion}
        onBuyPotion={handleBuyPotion}
      />

    </div>
  );
}
