import React, { useEffect, useRef, useState } from 'react';
import { Heart, Sword, Sparkles, User, Crosshair } from 'lucide-react';

export default function GameCanvas({ 
  currentTrack, 
  stageNumber, 
  stageTitle, 
  combatAction, // null | 'player_attack' | 'monster_attack'
  isEvaluating,
  playerHp,
  playerMaxHp = 100,
  characterName = 'Royal Soldier',
  weaponName = 'Steel Sword',
  weaponAtk = 25,
  monsterHp = 100,
  streak = 1,
  isCleared = false,
  onCombatAnimationEnd
}) {
  const canvasRef = useRef(null);
  const [animState, setAnimState] = useState('idle'); // 'idle' | 'soldier_attacking' | 'orc_attacking' | 'orc_dying'
  const [combatLog, setCombatLog] = useState('');

  // Handle combat triggers
    useEffect(() => {
      // If stage is already cleared, show dead monster permanently
      if (isCleared) {
        setAnimState('orc_dying');
        return;
      }
    
      if (combatAction === 'player_attack') {
        setAnimState('soldier_attacking');
        setCombatLog('CRITICAL STRIKE! Royal Soldier slashed the Orc for 100 DMG!');
        const timer = setTimeout(() => {
          setAnimState('orc_dying');
          // Don't reset to idle - stay dead!
          if (onCombatAnimationEnd) {
            setTimeout(() => onCombatAnimationEnd(), 1200);
          }
        }, 850);
        return () => clearTimeout(timer);
      } else if (combatAction === 'monster_attack') {
        setAnimState('orc_attacking');
        setCombatLog('ORC RETALIATION! Orc clubbed Royal Soldier for 15 DMG!');
        const timer = setTimeout(() => {
          setAnimState('idle');
          if (onCombatAnimationEnd) onCombatAnimationEnd();
        }, 950);
        return () => clearTimeout(timer);
      }
    }, [combatAction, isCleared]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Load Soldier Spritesheets (100x100 split with shadows)
    const soldierIdle = new Image();
    soldierIdle.src = '/assets/characters/soldier/Soldier_Idle.png';

    const soldierAttack = new Image();
    soldierAttack.src = '/assets/characters/soldier/Soldier_Attack01.png';

    const soldierHurt = new Image();
    soldierHurt.src = '/assets/characters/soldier/Soldier_Hurt.png';

    const soldierDeath = new Image();
    soldierDeath.src = '/assets/characters/soldier/Soldier_Death.png';

    // Load Orc Spritesheets (100x100 split with shadows)
    const orcIdle = new Image();
    orcIdle.src = '/assets/monsters/orc/Orc_Idle.png';

    const orcAttack = new Image();
    orcAttack.src = '/assets/monsters/orc/Orc_Attack01.png';

    const orcHurt = new Image();
    orcHurt.src = '/assets/monsters/orc/Orc_Hurt.png';

    const orcDeath = new Image();
    orcDeath.src = '/assets/monsters/orc/Orc_Death.png';

    let animationFrameId;
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Screen shake on Orc attack
      if (animState === 'orc_attacking' && tick % 4 < 2) {
        ctx.save();
        ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
      } else {
        ctx.save();
      }

      // 1. Retro Arena Backdrop (Close-Up Duel Ring)
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#B8D0A4');
      grad.addColorStop(0.7, '#D4E2C6');
      grad.addColorStop(1, '#F3F6F4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground platform
      const groundY = 138;
      ctx.fillStyle = '#7D8D39';
      ctx.fillRect(0, groundY, canvas.width, 10);
      ctx.fillStyle = '#556224';
      ctx.fillRect(0, groundY + 10, canvas.width, 4);
      ctx.fillStyle = '#C4CEB5';
      ctx.fillRect(0, groundY + 14, canvas.width, canvas.height - (groundY + 14));

      // Arena border lines
      ctx.fillStyle = '#1E2522';
      ctx.fillRect(0, groundY, canvas.width, 2.5);
      for (let x = 0; x < canvas.width; x += 32) {
        ctx.fillRect(x, groundY + 14, 2, canvas.height);
      }

      // 2. Character & Monster Positions (Close to each other so they look BIG!)
      let soldierX = 40;
      let soldierY = 46;
      let orcX = 210;
      let orcY = 46;

      if (animState === 'soldier_attacking') {
        // Soldier lunges forward ONCE, smoothly
        const progress = Math.min(1, tick / 25);
        soldierX = 40 + (progress * 100);
      } else if (animState === 'orc_attacking') {
        // Orc lunges forward ONCE, smoothly
        const progress = Math.min(1, tick / 25);
        orcX = 210 - (progress * 95);
      }

      // 3. Draw Soldier (Player)
      let activeSoldierSheet = soldierIdle;
      let soldierFrames = 6;
      let soldierSpeed = 10;

      if (animState === 'soldier_attacking') {
        activeSoldierSheet = soldierAttack;
        soldierFrames = 6;
        soldierSpeed = 6;
      } else if (animState === 'orc_attacking') {
        activeSoldierSheet = soldierHurt;
        soldierFrames = 4;
        soldierSpeed = 8;
      }

      if (activeSoldierSheet && activeSoldierSheet.complete && activeSoldierSheet.naturalWidth > 0) {
        const frameIndex = Math.min(soldierFrames - 1, Math.floor(tick / soldierSpeed) % soldierFrames);
        const sourceX = frameIndex * 100;

        // Flash red if hurt
        if (animState === 'orc_attacking' && tick % 4 < 2) {
          ctx.filter = 'sepia(1) saturate(5) hue-rotate(-50deg)';
        }

        // Render Soldier at FULL 100x100 resolution!
        ctx.drawImage(
          activeSoldierSheet,
          sourceX, 0, 100, 100,
          soldierX, soldierY, 105, 105
        );
        ctx.filter = 'none';
      }

      // 4. Draw Orc (Enemy)
      let activeOrcSheet = orcIdle;
      let orcFrames = 6;
      let orcSpeed = 10;

      if (animState === 'orc_dying') {
        activeOrcSheet = orcDeath;
        orcFrames = 4;
        orcSpeed = 12;
      } else if (animState === 'soldier_attacking') {
        activeOrcSheet = orcHurt;
        orcFrames = 4;
        orcSpeed = 7;
      } else if (animState === 'orc_attacking') {
        activeOrcSheet = orcAttack;
        orcFrames = 6;
        orcSpeed = 6;
      }

      if (activeOrcSheet && activeOrcSheet.complete && activeOrcSheet.naturalWidth > 0) {
        // For death animation: stop at last frame, don't loop
        let frameIndex;
        if (animState === 'orc_dying') {
          frameIndex = Math.min(orcFrames - 1, Math.floor(tick / orcSpeed));
        } else {
          frameIndex = Math.min(orcFrames - 1, Math.floor(tick / orcSpeed) % orcFrames);
        }
        const sourceX = frameIndex * 100;

        // Flash white on hit
        if (animState === 'soldier_attacking' && tick % 4 < 2) {
          ctx.filter = 'brightness(2.5)';
        }

        // Flip Orc horizontally to face LEFT
        ctx.save();
        ctx.translate(orcX + 52.5, orcY);
        ctx.scale(-1, 1);
        ctx.drawImage(
          activeOrcSheet,
          sourceX, 0, 100, 100,
          -52.5, 0, 105, 105
        );
        ctx.restore();
        ctx.filter = 'none';
      }

      // 5. Overhead Status Bars directly on Canvas
      // Soldier Name & HP Bar
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 2;
      ctx.fillRect(15, 12, 125, 26);
      ctx.strokeRect(15, 12, 125, 26);

      ctx.fillStyle = '#1E2522';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(characterName.toUpperCase(), 22, 22);

      const pHpRatio = Math.max(0, playerHp / playerMaxHp);
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(22, 26, 110, 6);
      ctx.fillStyle = pHpRatio > 0.3 ? '#10B981' : '#EF4444';
      ctx.fillRect(22, 26, 110 * pHpRatio, 6);
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 1;
      ctx.strokeRect(22, 26, 110, 6);

      // Orc Name & HP Bar
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 2;
      ctx.fillRect(canvas.width - 140, 12, 125, 26);
      ctx.strokeRect(canvas.width - 140, 12, 125, 26);

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`ORC BRAWLER LV.${stageNumber}`, canvas.width - 132, 22);

      const curOrcHp = animState === 'orc_dying' ? 0 : monsterHp;
      const oHpRatio = Math.max(0, curOrcHp / 100);
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(canvas.width - 132, 26, 110, 6);
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(canvas.width - 132, 26, 110 * oHpRatio, 6);
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 1;
      ctx.strokeRect(canvas.width - 132, 26, 110, 6);

      // Floating Combat Slashes / Damage popups
      if (animState === 'soldier_attacking') {
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('CRIT -100!', orcX + 10, orcY + 10);
      } else if (animState === 'orc_attacking') {
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('-15 HP!', soldierX + 25, soldierY + 10);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [animState, currentTrack, stageNumber, playerHp, monsterHp, characterName, isCleared]);

  return (
    <div className="w-full neo-box p-3 bg-white">
      
      {/* Top Combat Info */}
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b-2 border-[#1E2522]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#EF4444] rounded-full border border-black inline-block"></span>
          <span className="w-2.5 h-2.5 bg-[#F59E0B] rounded-full border border-black inline-block"></span>
          <span className="w-2.5 h-2.5 bg-[#7D8D39] rounded-full border border-black inline-block"></span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#1E2522] ml-1">
            DUEL ARENA // STAGE {stageNumber}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="flex items-center gap-1 px-2 py-0.5 bg-[#FEE2E2] border border-[#1E2522] text-[#991B1B] font-bold">
            <Heart className="w-3 h-3 fill-[#DC2626] text-[#DC2626]" />
            {playerHp}/{playerMaxHp} HP
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-[#FEF3C7] border border-[#1E2522] text-[#92400E] font-bold">
            <Sword className="w-3 h-3 text-[#D97706]" />
            {weaponName}
          </span>
        </div>
      </div>

      {/* HTML5 Canvas - Sized 380x180 so characters at 100x100 are BIG and CLOSE! */}
      <div className="relative border-3 border-[#1E2522] bg-[#F3F6F4] overflow-hidden rounded-sm">
        <canvas 
          ref={canvasRef} 
          width={380} 
          height={180} 
          className="w-full h-auto block pixelated"
        />
      </div>

      {/* Combat Log Ticker */}
      {combatLog && (
        <div className="mt-1.5 px-2.5 py-1 bg-[#F3F6F4] border-2 border-[#1E2522] font-mono text-[11px] text-[#1E2522] flex items-center justify-between">
          <span>{combatLog}</span>
          <span className="text-[9px] text-[#586526] font-bold uppercase">Duel Engine</span>
        </div>
      )}

    </div>
  );
}
