import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Flame, Heart, Sword } from 'lucide-react';

const SCENE_W = 380;
const SCENE_H = 180;
const ASPECT = SCENE_W / SCENE_H;

const SPRITE_SOURCES = {
  soldierIdle: '/assets/characters/soldier/Soldier_Idle.png',
  soldierAttack: '/assets/characters/soldier/Soldier_Attack01.png',
  soldierHurt: '/assets/characters/soldier/Soldier_Hurt.png',
  soldierDeath: '/assets/characters/soldier/Soldier_Death.png',
  orcIdle: '/assets/monsters/orc/Orc_Idle.png',
  orcAttack: '/assets/monsters/orc/Orc_Attack01.png',
  orcHurt: '/assets/monsters/orc/Orc_Hurt.png',
  orcDeath: '/assets/monsters/orc/Orc_Death.png',
};

// Module-level sprite cache: images are decoded once and reused across remounts.
const spriteCache = new Map();
let spriteFailureCount = 0;

function preloadSprite(src) {
  if (spriteCache.has(src)) return spriteCache.get(src);

  const entry = { status: 'loading', image: null };
  if (typeof window === 'undefined' || typeof window.Image === 'undefined') {
    entry.status = 'error';
    spriteFailureCount += 1;
    spriteCache.set(src, entry);
    return entry;
  }

  const image = new Image();
  entry.image = image;
  image.onload = () => {
    entry.status = image.naturalWidth > 0 ? 'ready' : 'error';
    if (entry.status === 'error') spriteFailureCount += 1;
  };
  image.onerror = () => {
    entry.status = 'error';
    spriteFailureCount += 1;
  };
  image.src = src;
  spriteCache.set(src, entry);
  return entry;
}

function getReadySprite(key) {
  const entry = spriteCache.get(SPRITE_SOURCES[key]);
  return entry && entry.status === 'ready' ? entry.image : null;
}

/**
 * Blocky fallback fighter so the arena still renders if a sprite is missing.
 */
function drawFallbackFighter(ctx, x, y, { facing = 1, palette, flash = false, dead = false }) {
  ctx.save();
  ctx.translate(x, y);
  if (facing === -1) {
    ctx.translate(100, 0);
    ctx.scale(-1, 1);
  }
  if (dead) {
    ctx.translate(0, 46);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(-46, -10);
  }

  const skin = flash ? '#FFFFFF' : palette.skin;
  const armor = flash ? '#F3F6F4' : palette.armor;
  const dark = palette.dark;

  ctx.fillStyle = dark;
  ctx.fillRect(14, 86, 72, 6);
  ctx.fillStyle = '#00000022';
  ctx.fillRect(10, 92, 84, 4);

  // Legs
  ctx.fillStyle = dark;
  ctx.fillRect(34, 64, 12, 26);
  ctx.fillRect(56, 64, 12, 26);
  // Torso
  ctx.fillStyle = armor;
  ctx.fillRect(30, 34, 42, 34);
  ctx.strokeStyle = dark;
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 34, 42, 34);
  // Head
  ctx.fillStyle = skin;
  ctx.fillRect(34, 10, 34, 28);
  ctx.strokeRect(34, 10, 34, 28);
  // Helmet / horns
  ctx.fillStyle = armor;
  ctx.fillRect(30, 4, 42, 12);
  // Eyes
  ctx.fillStyle = dark;
  ctx.fillRect(42, 22, 5, 5);
  ctx.fillRect(56, 22, 5, 5);
  // Weapon
  ctx.fillStyle = palette.weapon;
  ctx.fillRect(78, 26, 6, 46);
  ctx.fillStyle = dark;
  ctx.fillRect(74, 70, 14, 5);

  ctx.restore();
}

function drawCanvasText(ctx, text, x, y, { color = '#1E2522', size = 8, align = 'left' } = {}) {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px "JetBrains Mono", monospace`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
}

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
  onCombatAnimationEnd,
}) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [animState, setAnimState] = useState(isCleared ? 'orc_dying' : 'idle');
  const animStateRef = useRef(animState);
  const statsRef = useRef({
    playerHp,
    playerMaxHp,
    monsterHp,
    characterName,
    stageNumber,
    currentTrack,
  });
  const onCombatAnimationEndRef = useRef(onCombatAnimationEnd);

  // Keep the latest props available to the single rAF loop without restarting it.
  useEffect(() => {
    animStateRef.current = animState;
  }, [animState]);

  useEffect(() => {
    onCombatAnimationEndRef.current = onCombatAnimationEnd;
  }, [onCombatAnimationEnd]);

  useEffect(() => {
    statsRef.current = {
      playerHp,
      playerMaxHp,
      monsterHp,
      characterName,
      stageNumber,
      currentTrack,
    };
  }, [playerHp, playerMaxHp, monsterHp, characterName, stageNumber, currentTrack]);

  // Combat choreography. State transitions run on timers so the declarative
  // render path stays pure (no synchronous setState inside the effect body).
  useEffect(() => {
    const timers = [];

    if (isCleared) {
      timers.push(setTimeout(() => setAnimState('orc_dying'), 0));
      return () => timers.forEach(clearTimeout);
    }

    if (combatAction === 'player_attack') {
      timers.push(setTimeout(() => setAnimState('soldier_attacking'), 0));
      timers.push(setTimeout(() => setAnimState('orc_dying'), 850));
      timers.push(
        setTimeout(() => {
          onCombatAnimationEndRef.current?.();
        }, 2050),
      );
    } else if (combatAction === 'monster_attack') {
      timers.push(setTimeout(() => setAnimState('orc_attacking'), 0));
      timers.push(
        setTimeout(() => {
          setAnimState('idle');
          onCombatAnimationEndRef.current?.();
        }, 950),
      );
    } else {
      timers.push(setTimeout(() => setAnimState('idle'), 0));
    }

    return () => timers.forEach(clearTimeout);
  }, [combatAction, isCleared]);

  // Preload sprites once; the render loop reads the cache every frame.
  useEffect(() => {
    Object.values(SPRITE_SOURCES).forEach(preloadSprite);
  }, []);

  // Single animation loop: devicePixelRatio sizing, resize handling and
  // automatic pause while the document is hidden.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const raf = { id: null };
    const loop = { tick: 0 };
    const anim = { last: null, startTick: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const cssWidth = Math.max(1, wrapper.clientWidth || SCENE_W);
      const cssHeight = Math.round(cssWidth / ASPECT);

      const nextWidth = Math.round(cssWidth * dpr);
      const nextHeight = Math.round(cssHeight * dpr);
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
      canvas.style.height = 'auto';
      ctx.imageSmoothingEnabled = false;
    };

    const render = () => {
      loop.tick += 1;
      const { playerHp: hp, playerMaxHp: maxHp, monsterHp: mHp, characterName: hero, stageNumber: stage } =
        statsRef.current;
      const state = animStateRef.current;

      if (state !== anim.last) {
        anim.last = state;
        anim.startTick = loop.tick;
      }
      const stateTick = loop.tick - anim.startTick;

      const scaleX = canvas.width / SCENE_W;
      const scaleY = canvas.height / SCENE_H;
      ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, SCENE_W, SCENE_H);

      ctx.save();
      // Screen shake on Orc attack
      if (state === 'orc_attacking' && loop.tick % 4 < 2) {
        ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
      }

      // 1. Retro arena backdrop
      const grad = ctx.createLinearGradient(0, 0, 0, SCENE_H);
      grad.addColorStop(0, '#B8D0A4');
      grad.addColorStop(0.7, '#D4E2C6');
      grad.addColorStop(1, '#F3F6F4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SCENE_W, SCENE_H);

      // Ground platform
      const groundY = 138;
      ctx.fillStyle = '#7D8D39';
      ctx.fillRect(0, groundY, SCENE_W, 10);
      ctx.fillStyle = '#556224';
      ctx.fillRect(0, groundY + 10, SCENE_W, 4);
      ctx.fillStyle = '#C4CEB5';
      ctx.fillRect(0, groundY + 14, SCENE_W, SCENE_H - (groundY + 14));

      // Arena border lines
      ctx.fillStyle = '#1E2522';
      ctx.fillRect(0, groundY, SCENE_W, 2.5);
      for (let x = 0; x < SCENE_W; x += 32) {
        ctx.fillRect(x, groundY + 14, 2, SCENE_H);
      }

      // 2. Character positions
      let soldierX = 40;
      const soldierY = 46;
      let orcX = 210;
      const orcY = 46;

      if (state === 'soldier_attacking') {
        const progress = Math.min(1, stateTick / 25);
        soldierX = 40 + progress * 100;
      } else if (state === 'orc_attacking') {
        const progress = Math.min(1, stateTick / 25);
        orcX = 210 - progress * 95;
      }

      // 3. Soldier
      let soldierSheet = getReadySprite('soldierIdle');
      let soldierFrames = 6;
      let soldierSpeed = 10;

      if (state === 'soldier_attacking') {
        soldierSheet = getReadySprite('soldierAttack');
        soldierFrames = 6;
        soldierSpeed = 6;
      } else if (state === 'orc_attacking') {
        soldierSheet = getReadySprite('soldierHurt');
        soldierFrames = 4;
        soldierSpeed = 8;
      }

      if (soldierSheet) {
        const frameIndex = Math.min(soldierFrames - 1, Math.floor(loop.tick / soldierSpeed) % soldierFrames);
        if (state === 'orc_attacking' && loop.tick % 4 < 2) {
          ctx.filter = 'sepia(1) saturate(5) hue-rotate(-50deg)';
        }
        ctx.drawImage(soldierSheet, frameIndex * 100, 0, 100, 100, soldierX, soldierY, 105, 105);
        ctx.filter = 'none';
      } else {
        drawFallbackFighter(ctx, soldierX, soldierY, {
          facing: 1,
          palette: { skin: '#E8C39E', armor: '#4B6CB7', dark: '#1E2522', weapon: '#CBD5E1' },
          flash: state === 'orc_attacking' && loop.tick % 4 < 2,
          dead: state === 'orc_attacking' && loop.tick % 8 < 2,
        });
      }

      // 4. Orc
      let orcSheet = getReadySprite('orcIdle');
      let orcFrames = 6;
      let orcSpeed = 10;

      if (state === 'orc_dying') {
        orcSheet = getReadySprite('orcDeath');
        orcFrames = 4;
        orcSpeed = 12;
      } else if (state === 'soldier_attacking') {
        orcSheet = getReadySprite('orcHurt');
        orcFrames = 4;
        orcSpeed = 7;
      } else if (state === 'orc_attacking') {
        orcSheet = getReadySprite('orcAttack');
        orcFrames = 6;
        orcSpeed = 6;
      }

      if (orcSheet) {
        let frameIndex;
        if (state === 'orc_dying') {
          frameIndex = Math.min(orcFrames - 1, Math.floor(stateTick / orcSpeed));
        } else {
          frameIndex = Math.min(orcFrames - 1, Math.floor(loop.tick / orcSpeed) % orcFrames);
        }
        if (state === 'soldier_attacking' && loop.tick % 4 < 2) {
          ctx.filter = 'brightness(2.5)';
        }
        ctx.save();
        ctx.translate(orcX + 52.5, orcY);
        ctx.scale(-1, 1);
        ctx.drawImage(orcSheet, frameIndex * 100, 0, 100, 100, -52.5, 0, 105, 105);
        ctx.restore();
        ctx.filter = 'none';
      } else {
        drawFallbackFighter(ctx, orcX, orcY, {
          facing: -1,
          palette: { skin: '#7F9A4E', armor: '#4E5924', dark: '#1E2522', weapon: '#A16207' },
          flash: state === 'soldier_attacking' && loop.tick % 4 < 2,
          dead: state === 'orc_dying',
        });
      }

      // 5. Overhead status bars
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 2;
      ctx.fillRect(15, 12, 125, 26);
      ctx.strokeRect(15, 12, 125, 26);

      const heroLabel = String(hero || 'Hero').toUpperCase().slice(0, 16);
      drawCanvasText(ctx, heroLabel, 22, 22);

      const safeMaxHp = Math.max(1, maxHp || 1);
      const pHpRatio = Math.max(0, Math.min(1, (hp ?? 0) / safeMaxHp));
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(22, 26, 110, 6);
      ctx.fillStyle = pHpRatio > 0.3 ? '#10B981' : '#EF4444';
      ctx.fillRect(22, 26, 110 * pHpRatio, 6);
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 1;
      ctx.strokeRect(22, 26, 110, 6);

      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 2;
      ctx.fillRect(SCENE_W - 140, 12, 125, 26);
      ctx.strokeRect(SCENE_W - 140, 12, 125, 26);

      drawCanvasText(ctx, `ORC BRAWLER LV.${stage ?? 1}`, SCENE_W - 132, 22, { color: '#EF4444' });

      const currentOrcHp = state === 'orc_dying' ? 0 : (mHp ?? 0);
      const oHpRatio = Math.max(0, Math.min(1, currentOrcHp / 100));
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(SCENE_W - 132, 26, 110, 6);
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(SCENE_W - 132, 26, 110 * oHpRatio, 6);
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 1;
      ctx.strokeRect(SCENE_W - 132, 26, 110, 6);

      // Damage popups
      if (state === 'soldier_attacking') {
        drawCanvasText(ctx, 'CRIT -100!', orcX + 10, orcY + 10, { color: '#EF4444', size: 12 });
      } else if (state === 'orc_attacking') {
        drawCanvasText(ctx, '-15 HP!', soldierX + 25, soldierY + 10, { color: '#EF4444', size: 12 });
      }

      if (spriteFailureCount > 0) {
        drawCanvasText(ctx, 'SPRITE FALLBACK ACTIVE', 8, SCENE_H - 6, { color: '#586526', size: 7 });
      }

      ctx.restore();
      raf.id = requestAnimationFrame(render);
    };

    const start = () => {
      if (raf.id !== null) return;
      raf.id = requestAnimationFrame(render);
    };

    const stop = () => {
      if (raf.id === null) return;
      cancelAnimationFrame(raf.id);
      raf.id = null;
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();

    let observer = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(resize);
      observer.observe(wrapper);
    } else {
      window.addEventListener('resize', resize);
    }

    document.addEventListener('visibilitychange', handleVisibility);
    if (!document.hidden) start();

    return () => {
      stop();
      if (observer) observer.disconnect();
      else window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const combatLog =
    !isCleared && combatAction === 'player_attack'
      ? 'CRITICAL STRIKE! Royal Soldier slashed the Orc for 100 DMG!'
      : !isCleared && combatAction === 'monster_attack'
        ? 'ORC RETALIATION! Orc clubbed Royal Soldier for 15 DMG!'
        : '';

  return (
    <div className="w-full neo-box bg-white p-2.5 sm:p-3">
      {/* Top Combat Info */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5 border-b-2 border-[#1E2522] pb-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex shrink-0 items-center gap-1" aria-hidden="true">
            <span className="inline-block h-2.5 w-2.5 rounded-full border border-black bg-[#EF4444]" />
            <span className="inline-block h-2.5 w-2.5 rounded-full border border-black bg-[#F59E0B]" />
            <span className="inline-block h-2.5 w-2.5 rounded-full border border-black bg-[#7D8D39]" />
          </span>
          <span className="truncate font-mono text-[10px] font-bold uppercase tracking-wider text-[#1E2522] sm:text-[11px]">
            DUEL ARENA // STAGE {stageNumber}
            {stageTitle ? ` · ${stageTitle}` : ''}
          </span>
        </div>

        {isEvaluating ? (
          <span className="flex items-center gap-1 border border-[#1E2522] bg-[#E0E7FF] px-2 py-0.5 font-mono text-[10px] font-bold text-[#3730A3]">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#3730A3]" aria-hidden="true" />
            Evaluating…
          </span>
        ) : null}
      </div>

      {/* Arena badges */}
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
        <span className="flex items-center gap-1 border border-[#1E2522] bg-[#FEE2E2] px-2 py-0.5 font-bold text-[#991B1B]">
          <Heart className="h-3 w-3 fill-[#DC2626] text-[#DC2626]" aria-hidden="true" />
          {playerHp}/{playerMaxHp} HP
        </span>
        <span className="flex items-center gap-1 border border-[#1E2522] bg-[#FEF3C7] px-2 py-0.5 font-bold text-[#92400E]">
          <Sword className="h-3 w-3 text-[#D97706]" aria-hidden="true" />
          <span className="max-w-[110px] truncate">{weaponName}</span>
          <span className="hidden sm:inline">+{weaponAtk} ATK</span>
        </span>
        <span className="flex items-center gap-1 border border-[#1E2522] bg-[#FEF08A] px-2 py-0.5 font-bold text-[#854D0E]">
          <Flame className="h-3 w-3 text-[#D97706]" aria-hidden="true" />
          {streak} Streak
        </span>
      </div>

      {/* HTML5 Canvas — CSS width follows the card, backing store is DPR-scaled */}
      <div ref={wrapperRef} className="relative w-full overflow-hidden rounded-sm border-3 border-[#1E2522] bg-[#F3F6F4]">
        <canvas
          ref={canvasRef}
          width={SCENE_W}
          height={SCENE_H}
          role="img"
          aria-label={`Duel arena for stage ${stageNumber}${stageTitle ? `: ${stageTitle}` : ''}. ${
            characterName || 'Hero'
          } with ${playerHp} of ${playerMaxHp} HP against an orc with ${monsterHp} HP.`}
          className="pixelated block h-auto w-full"
        >
          Animated pixel-art duel between your hero and a stage monster.
        </canvas>

        {spriteFailureCount > 0 ? (
          <span
            className="pointer-events-none absolute right-1 top-1 flex items-center gap-1 border border-[#1E2522] bg-[#FEF3C7]/95 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#92400E]"
            title="Some sprite sheets could not be loaded; drawing fallback fighters."
          >
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            Fallback art
          </span>
        ) : null}
      </div>

      {/* Combat Log Ticker */}
      {combatLog ? (
        <div
          role="status"
          className="mt-1.5 flex flex-wrap items-center justify-between gap-1 border-2 border-[#1E2522] bg-[#F3F6F4] px-2.5 py-1 font-mono text-[10px] text-[#1E2522] sm:text-[11px]"
        >
          <span className="min-w-0 break-words">{combatLog}</span>
          <span className="text-[9px] font-bold uppercase text-[#586526]">Duel Engine</span>
        </div>
      ) : null}
    </div>
  );
}
