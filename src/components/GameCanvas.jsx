import React, { useEffect, useRef, useState } from 'react';
import { Shield, Heart, Sword, Sparkles, AlertOctagon } from 'lucide-react';

export default function GameCanvas({ 
  currentTrack, 
  stageNumber, 
  stageTitle, 
  combatAction, // null | 'player_attack' | 'monster_attack'
  isEvaluating,
  playerHp,
  playerMaxHp = 100,
  playerArmor = 20,
  weaponName = 'Pixel Blade',
  weaponAtk = 25,
  monsterHp = 100,
  streak = 1,
  onCombatAnimationEnd
}) {
  const canvasRef = useRef(null);
  const [animState, setAnimState] = useState('idle'); // 'idle' | 'player_slashing' | 'monster_attacking' | 'monster_dying'
  const [combatLog, setCombatLog] = useState('');

  // Handle combat triggers
  useEffect(() => {
    if (combatAction === 'player_attack') {
      setAnimState('player_slashing');
      setCombatLog('⚔️ CRITICAL STRIKE! Player slashed the monster for 100 DMG!');
      const timer = setTimeout(() => {
        setAnimState('monster_dying');
        const deathTimer = setTimeout(() => {
          setAnimState('idle');
          if (onCombatAnimationEnd) onCombatAnimationEnd();
        }, 1200);
        return () => clearTimeout(deathTimer);
      }, 900);
      return () => clearTimeout(timer);
    } else if (combatAction === 'monster_attack') {
      setAnimState('monster_attacking');
      const dmg = Math.max(8, 20 - Math.floor(playerArmor / 3));
      setCombatLog(`💥 MONSTER RETALIATION! Monster struck player for ${dmg} DMG (${playerArmor} Armor absorbed)!`);
      const timer = setTimeout(() => {
        setAnimState('idle');
        if (onCombatAnimationEnd) onCombatAnimationEnd();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [combatAction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Load Player Sprites
    const playerIdleFrames = [
      '/assets/platformer/Character/Animations/Idle/idle1.png',
      '/assets/platformer/Character/Animations/Idle/idle2.png',
    ].map(src => { const img = new Image(); img.src = src; return img; });

    const playerRunFrames = [
      '/assets/platformer/Character/Animations/Run/run1.png',
      '/assets/platformer/Character/Animations/Run/run2.png',
      '/assets/platformer/Character/Animations/Run/run3.png',
      '/assets/platformer/Character/Animations/Run/run4.png',
    ].map(src => { const img = new Image(); img.src = src; return img; });

    // Load Monster Sprites (Demon for Python/JS, Blood Monster for C++)
    const monsterDir = currentTrack === 'cpp' ? 'blood_monster' : 'demon';
    const monsterPrefix = currentTrack === 'cpp' ? 'Blood Monster_A' : 'Demon_A';

    const monsterIdleSheet = new Image();
    monsterIdleSheet.src = `/assets/monsters/${monsterDir}/${monsterPrefix}_Idle.png`;

    const monsterAttackSheet = new Image();
    monsterAttackSheet.src = `/assets/monsters/${monsterDir}/${monsterPrefix}_Attack01.png`;

    const monsterHurtSheet = new Image();
    monsterHurtSheet.src = `/assets/monsters/${monsterDir}/${monsterPrefix}_Hurt.png`;

    const monsterDeathSheet = new Image();
    monsterDeathSheet.src = `/assets/monsters/${monsterDir}/${monsterPrefix}_Death.png`;

    let animationFrameId;
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Screen shake on monster attack
      if (animState === 'monster_attacking' && tick % 4 < 2) {
        ctx.save();
        ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
      } else {
        ctx.save();
      }

      // 1. Retro Arena Backdrop (Neobrutalism Pastel)
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (currentTrack === 'python') {
        grad.addColorStop(0, '#A7D7C5');
        grad.addColorStop(1, '#F3F6F4');
      } else if (currentTrack === 'cpp') {
        grad.addColorStop(0, '#C7D2FE');
        grad.addColorStop(1, '#F3F6F4');
      } else {
        grad.addColorStop(0, '#BAE6FD');
        grad.addColorStop(1, '#F3F6F4');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Arena Platforms & Ground
      const groundY = 145;
      ctx.fillStyle = '#7D8D39';
      ctx.fillRect(0, groundY, canvas.width, 12);
      ctx.fillStyle = '#556224';
      ctx.fillRect(0, groundY + 12, canvas.width, 4);
      ctx.fillStyle = '#C4CEB5';
      ctx.fillRect(0, groundY + 16, canvas.width, canvas.height - (groundY + 16));

      // Grid Lines
      ctx.fillStyle = '#1E2522';
      ctx.fillRect(0, groundY, canvas.width, 3);
      for (let x = 0; x < canvas.width; x += 32) {
        ctx.fillRect(x, groundY + 16, 2, canvas.height);
      }

      // 2. Battle Stage Decor: Torches & Banners
      // Left Torch
      ctx.fillStyle = '#8B5A2B';
      ctx.fillRect(45, 110, 6, 35);
      ctx.fillStyle = tick % 10 < 5 ? '#F59E0B' : '#EF4444';
      ctx.fillRect(43, 102, 10, 10);

      // Right Torch
      ctx.fillStyle = '#8B5A2B';
      ctx.fillRect(canvas.width - 55, 110, 6, 35);
      ctx.fillStyle = tick % 8 < 4 ? '#EF4444' : '#F59E0B';
      ctx.fillRect(canvas.width - 57, 102, 10, 10);

      // 3. Combat Positions
      let playerX = 140;
      let playerY = 113;
      let monsterX = canvas.width - 240;
      let monsterY = 65;

      if (animState === 'player_slashing') {
        // Player lunges across screen towards monster
        playerX = 140 + Math.min(220, (tick % 40) * 8);
      } else if (animState === 'monster_attacking') {
        // Monster leaps towards player
        monsterX = (canvas.width - 240) - Math.min(180, (tick % 30) * 8);
      }

      // 4. Render Player Character
      let playerImg;
      if (animState === 'player_slashing' || isEvaluating) {
        const frameIdx = Math.floor(tick / 6) % playerRunFrames.length;
        playerImg = playerRunFrames[frameIdx];
      } else {
        const frameIdx = Math.floor(tick / 18) % playerIdleFrames.length;
        playerImg = playerIdleFrames[frameIdx];
      }

      if (playerImg && playerImg.complete && playerImg.naturalWidth > 0) {
        // Red flash if hit
        if (animState === 'monster_attacking' && tick % 6 < 3) {
          ctx.filter = 'sepia(1) saturate(5) hue-rotate(-50deg)';
        }
        ctx.drawImage(playerImg, playerX, playerY, 36, 36);
        ctx.filter = 'none';
      }

      // Draw Player Slash Arc if slashing
      if (animState === 'player_slashing') {
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(playerX + 36, playerY + 16, 26, -0.6, 1.2);
        ctx.stroke();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(playerX + 36, playerY + 16, 24, -0.5, 1.1);
        ctx.stroke();
      }

      // 5. Render Monster Boss (100x100 spritesheet)
      let activeMonsterSheet = monsterIdleSheet;
      let numFrames = 6;
      let frameSpeed = 10;

      if (animState === 'monster_dying') {
        activeMonsterSheet = monsterDeathSheet;
        numFrames = 4;
        frameSpeed = 12;
      } else if (animState === 'player_slashing') {
        activeMonsterSheet = monsterHurtSheet;
        numFrames = 4;
        frameSpeed = 8;
      } else if (animState === 'monster_attacking') {
        activeMonsterSheet = monsterAttackSheet;
        numFrames = 7;
        frameSpeed = 7;
      }

      if (activeMonsterSheet && activeMonsterSheet.complete && activeMonsterSheet.naturalWidth > 0) {
        const frameIndex = Math.min(numFrames - 1, Math.floor(tick / frameSpeed) % numFrames);
        const sourceX = frameIndex * 100;

        // Flash white on hit
        if (animState === 'player_slashing' && tick % 4 < 2) {
          ctx.filter = 'brightness(2.5)';
        }
        
        // Draw 100x100 monster scaled to 80x80
        ctx.drawImage(
          activeMonsterSheet,
          sourceX, 0, 100, 100,
          monsterX, monsterY, 86, 86
        );
        ctx.filter = 'none';
      }

      // 6. Overhead HUD on Canvas
      // Player Name & HP Pill
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 2;
      ctx.fillRect(80, 20, 140, 32);
      ctx.strokeRect(80, 20, 140, 32);

      ctx.fillStyle = '#1E2522';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`PLAYER (LVL ${stageNumber})`, 88, 32);

      // Player Mini Health Bar
      const playerHpRatio = Math.max(0, playerHp / playerMaxHp);
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(88, 36, 120, 8);
      ctx.fillStyle = playerHpRatio > 0.3 ? '#10B981' : '#EF4444';
      ctx.fillRect(88, 36, 120 * playerHpRatio, 8);
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 1;
      ctx.strokeRect(88, 36, 120, 8);

      // Monster Name & HP Pill
      const monsterName = currentTrack === 'cpp' ? 'BLOOD GOLEM' : 'SYNTAX DEMON';
      const mPillX = canvas.width - 220;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 2;
      ctx.fillRect(mPillX, 20, 140, 32);
      ctx.strokeRect(mPillX, 20, 140, 32);

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`${monsterName} LV.${stageNumber}`, mPillX + 8, 32);

      // Monster Mini Health Bar
      const curMonsterHp = animState === 'monster_dying' ? 0 : monsterHp;
      const mHpRatio = Math.max(0, curMonsterHp / 100);
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(mPillX + 8, 36, 120, 8);
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(mPillX + 8, 36, 120 * mHpRatio, 8);
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 1;
      ctx.strokeRect(mPillX + 8, 36, 120, 8);

      // Damage Floating Text
      if (animState === 'player_slashing') {
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('-100 CRIT!', monsterX + 20, monsterY - 5);
      } else if (animState === 'monster_attacking') {
        const dmg = Math.max(8, 20 - Math.floor(playerArmor / 3));
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`-${dmg} HP!`, playerX, playerY - 10);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [animState, currentTrack, stageNumber, playerHp, playerArmor, monsterHp, isEvaluating]);

  return (
    <div className="w-full neo-box p-3 bg-white mb-6">
      
      {/* Top Banner & Stats HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 mb-2 border-b-2 border-[#1E2522]">
        
        {/* Left: Combat Info */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#EF4444] rounded-full border border-black inline-block"></span>
          <span className="w-3 h-3 bg-[#F59E0B] rounded-full border border-black inline-block"></span>
          <span className="w-3 h-3 bg-[#7D8D39] rounded-full border border-black inline-block"></span>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1E2522] ml-2">
            COMBAT ARENA // STAGE {stageNumber}: {stageTitle}
          </span>
        </div>

        {/* Right: RPG Stats HUD */}
        <div className="flex items-center gap-3 font-mono text-xs">
          
          {/* Health Bar */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FEE2E2] border-2 border-[#1E2522] font-bold">
            <Heart className="w-4 h-4 text-[#DC2626] fill-[#DC2626]" />
            <span className="text-[#991B1B]">{playerHp} / {playerMaxHp} HP</span>
          </div>

          {/* Armor Bar */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#DBEAFE] border-2 border-[#1E2522] font-bold">
            <Shield className="w-4 h-4 text-[#2563EB] fill-[#2563EB]" />
            <span className="text-[#1E40AF]">{playerArmor} DEF</span>
          </div>

          {/* Weapon Bar */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FEF3C7] border-2 border-[#1E2522] font-bold">
            <Sword className="w-4 h-4 text-[#D97706]" />
            <span className="text-[#92400E]">{weaponName} (+{weaponAtk} ATK)</span>
          </div>

        </div>

      </div>

      {/* HTML5 Canvas */}
      <div className="relative border-3 border-[#1E2522] bg-[#F3F6F4] overflow-hidden rounded-sm">
        <canvas 
          ref={canvasRef} 
          width={720} 
          height={180} 
          className="w-full h-auto block pixelated"
        />
      </div>

      {/* Combat Log Ticker */}
      {combatLog && (
        <div className="mt-2 px-3 py-1 bg-[#F3F6F4] border-2 border-[#1E2522] font-mono text-xs text-[#1E2522] flex items-center justify-between">
          <span>{combatLog}</span>
          <span className="text-[10px] text-gray-500 font-bold uppercase">Combat Engine v2.0</span>
        </div>
      )}

    </div>
  );
}
