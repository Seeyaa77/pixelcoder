// Pure progression helpers for PixelCoder.
// No React, no storage access, no side effects: every function returns a new
// state object (or the same reference when the action is a no-op).
// The state shape stays compatible with src/lib/supabase.js and localStorage.

export const MAX_STAGE_NUMBER = 15;
export const STAGE_CLEAR_GOLD = 75;
export const FAIL_DAMAGE = 15;
export const POTION_HEAL = 35;
export const POTION_COST = 50;
export const XP_PER_LEVEL_BASE = 250;

/**
 * Default player state, matching getStoredSession() in src/lib/supabase.js.
 */
export function createDefaultProgress() {
  return {
    isLoggedIn: false,
    username: '',
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
    ownedWeapons: ['Pixel Blade'],
    hintsUnlocked: [],
    clearedStages: {
      python: [],
      cpp: [],
      javascript: []
    }
  };
}

/**
 * Cleared/unlocked stage numbers for a track (never returns undefined).
 */
export function getClearedStages(state, track) {
  const cleared = state && state.clearedStages ? state.clearedStages[track] : null;
  return Array.isArray(cleared) ? [...cleared] : [];
}

/**
 * A stage is unlocked when it is the first one, already listed, or directly
 * follows a listed stage (App.jsx stores unlocked stages in clearedStages).
 */
export function isStageUnlocked(state, track, stageNumber) {
  const stage = Number(stageNumber);
  if (!Number.isFinite(stage) || stage < 1) return false;
  if (stage === 1) return true;

  const cleared = getClearedStages(state, track);
  return cleared.includes(stage) || cleared.includes(stage - 1);
}

/**
 * Award a first-time stage clear: XP + gold + streak, and unlock the next stage.
 * Repeated clears are idempotent (no double reward).
 */
export function applyStageClear(state, track, stageNumber, xp) {
  if (!state) return state;

  const stage = Number(stageNumber);
  const xpAwarded = Number(xp) || 0;
  const current = getClearedStages(state, track);

  if (!Number.isFinite(stage) || stage < 1 || stage > MAX_STAGE_NUMBER || current.includes(stage)) {
    return state;
  }

  const nextCleared = [...current, stage].sort((a, b) => a - b);

  return {
    ...state,
    total_xp: (Number(state.total_xp) || 0) + xpAwarded,
    current_streak: (Number(state.current_streak) || 0) + 1,
    gold: (Number(state.gold) || 0) + STAGE_CLEAR_GOLD,
    clearedStages: {
      ...(state.clearedStages || {}),
      [track]: nextCleared
    }
  };
}

/**
 * Apply stage failure damage. At 0 HP the player revives at 50 HP and loses
 * one potion (mirrors handleStageFailed in App.jsx).
 */
export function applyStageFail(state, damage = FAIL_DAMAGE) {
  if (!state) return state;

  const incoming = Number(damage);
  const nextHp = (Number(state.hp) || 0) - (Number.isFinite(incoming) ? incoming : FAIL_DAMAGE);

  if (nextHp <= 0) {
    return {
      ...state,
      hp: 50,
      potions: Math.max(0, (Number(state.potions) || 0) - 1)
    };
  }

  return {
    ...state,
    hp: nextHp
  };
}

/**
 * Drink a potion: +35 HP capped at max_hp, costs one potion.
 */
export function drinkPotion(state) {
  if (!state) return state;

  const potions = Number(state.potions) || 0;
  const hp = Number(state.hp) || 0;
  const maxHp = Number(state.max_hp) || 0;
  if (potions <= 0 || hp >= maxHp) return state;

  return {
    ...state,
    hp: Math.min(maxHp, hp + POTION_HEAL),
    potions: potions - 1
  };
}

/**
 * Buy a potion for 50 gold.
 */
export function buyPotion(state) {
  if (!state) return state;

  const gold = Number(state.gold) || 0;
  if (gold < POTION_COST) return state;

  return {
    ...state,
    gold: gold - POTION_COST,
    potions: (Number(state.potions) || 0) + 1
  };
}

/**
 * Equip/purchase a weapon ({ name, cost, atk }). Weapons are bought once:
 * re-equipping an owned weapon is free. No-op when already equipped or when
 * the player cannot afford a new weapon (no alert() in pure code).
 */
export function equipWeapon(state, weapon) {
  if (!state || !weapon) return state;
  if (state.weapon_name === weapon.name) return state;

  const owned = Array.isArray(state.ownedWeapons)
    ? state.ownedWeapons
    : [state.weapon_name || 'Pixel Blade'];
  const alreadyOwned = owned.includes(weapon.name);
  const gold = Number(state.gold) || 0;
  const cost = alreadyOwned ? 0 : Number(weapon.cost) || 0;
  if (gold < cost) return state;

  return {
    ...state,
    gold: gold - cost,
    weapon_name: weapon.name,
    weapon_atk: Number(weapon.atk) || 0,
    ownedWeapons: alreadyOwned ? owned : [...owned, weapon.name]
  };
}

/** Stable key for a purchased hint. */
export function hintKey(track, stageNumber) {
  return `${track}:${Number(stageNumber)}`;
}

/**
 * Unlock a hint permanently for one stage. Costs gold once; repeat calls are
 * no-ops so a hint can never be charged twice.
 */
export function unlockHint(state, key, cost) {
  if (!state || !key) return state;

  const unlocked = Array.isArray(state.hintsUnlocked) ? state.hintsUnlocked : [];
  if (unlocked.includes(key)) return state;

  const gold = Number(state.gold) || 0;
  const price = Number(cost) || 0;
  if (gold < price) return state;

  return {
    ...state,
    gold: gold - price,
    hintsUnlocked: [...unlocked, key]
  };
}

/**
 * Select a character skin.
 */
export function selectCharacter(state, name) {
  if (!state || !name || state.character_name === name) return state;

  return {
    ...state,
    character_name: name
  };
}

/**
 * Level curve: level 1 needs 250 XP to reach level 2, level 2 needs 500, etc.
 * @returns {{level: number, current: number, next: number, pct: number}}
 */
export function xpLevel(xp) {
  let remaining = Math.max(0, Number(xp) || 0);
  let level = 1;

  while (level < 99 && remaining >= XP_PER_LEVEL_BASE * level) {
    remaining -= XP_PER_LEVEL_BASE * level;
    level += 1;
  }

  const next = XP_PER_LEVEL_BASE * level;
  const pct = next > 0 ? Math.min(100, Math.round((remaining / next) * 100)) : 100;

  return { level, current: remaining, next, pct };
}

// Backwards-compatible alias: App.jsx imports this action as `usePotion`.
export const usePotion = drinkPotion;
