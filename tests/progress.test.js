import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MAX_STAGE_NUMBER,
  STAGE_CLEAR_GOLD,
  POTION_COST,
  POTION_HEAL,
  createDefaultProgress,
  getClearedStages,
  isStageUnlocked,
  applyStageClear,
  applyStageFail,
  drinkPotion,
  buyPotion,
  hintKey,
  unlockHint,
  equipWeapon,
  selectCharacter,
  armorReduction,
  damageAfterArmor,
  armorUpgradeCost,
  upgradeArmor,
  ARMOR_MAX,
  ARMOR_STEP,
  weaponXpBonus,
  xpLevel
} from '../src/lib/progress.js';

const stateWith = (patch) => ({ ...createDefaultProgress(), ...patch });

test('fresh progress: nothing cleared, stage 1 unlocked, stage 2 locked', () => {
  const state = createDefaultProgress();
  assert.deepEqual(getClearedStages(state, 'python'), []);
  assert.equal(isStageUnlocked(state, 'python', 1), true);
  assert.equal(isStageUnlocked(state, 'python', 2), false);
  assert.equal(isStageUnlocked(state, 'python', 0), false);
  assert.equal(isStageUnlocked(state, 'unknown-track', 1), true);
  assert.equal(state.total_xp, 0);
  assert.equal(state.gold, 150);
});

test('getClearedStages tolerates corrupt / legacy shapes', () => {
  assert.deepEqual(getClearedStages(null, 'python'), []);
  assert.deepEqual(getClearedStages({ clearedStages: null }, 'python'), []);
  assert.deepEqual(getClearedStages({ clearedStages: { python: 'nope' } }, 'python'), []);
});

test('clearing stage 1 rewards once, unlocks 2, and is idempotent', () => {
  const start = createDefaultProgress();
  const cleared = applyStageClear(start, 'python', 1, 100);

  // Starter weapon (25 atk) adds a +5 XP weapon bonus on top of the stage XP.
  assert.equal(cleared.total_xp, 105);
  assert.equal(cleared.gold, 150 + STAGE_CLEAR_GOLD);
  assert.equal(cleared.current_streak, 2);
  assert.deepEqual(getClearedStages(cleared, 'python'), [1]);
  assert.equal(isStageUnlocked(cleared, 'python', 2), true);
  assert.equal(isStageUnlocked(cleared, 'python', 3), false);

  const repeated = applyStageClear(cleared, 'python', 1, 100);
  assert.equal(repeated, cleared, 'repeat clear must return the same reference (no farming)');
  assert.equal(repeated.total_xp, 105, 'repeat clear adds no XP (stage 100 + weapon 5)');
});

test('tracks are independent', () => {
  const state = applyStageClear(createDefaultProgress(), 'python', 1, 100);
  assert.deepEqual(getClearedStages(state, 'cpp'), []);
  assert.equal(isStageUnlocked(state, 'cpp', 2), false);
  assert.equal(isStageUnlocked(state, 'python', 2), true);
});

test('cleared stage list stays sorted and unique', () => {
  let state = createDefaultProgress();
  state = applyStageClear(state, 'cpp', 3, 10);
  state = applyStageClear(state, 'cpp', 1, 10);
  state = applyStageClear(state, 'cpp', 2, 10);
  assert.deepEqual(getClearedStages(state, 'cpp'), [1, 2, 3]);
});

test('stage clear ignores invalid input', () => {
  const state = createDefaultProgress();
  assert.equal(applyStageClear(state, 'python', 'abc', 100), state);
  assert.equal(applyStageClear(state, 'python', 0, 100), state);
  assert.equal(applyStageClear(null, 'python', 1, 100), null);
});

test('failure damage is reduced by armor, then revives at 50 HP losing a potion', () => {
  // Default armor is 20 → 20% blocked → ceil(15 * 0.8) = 12 damage.
  const hurt = applyStageFail(stateWith({ hp: 100 }), 15);
  assert.equal(hurt.hp, 88);

  const unarmored = applyStageFail(stateWith({ hp: 100, armor: 0 }), 15);
  assert.equal(unarmored.hp, 85);

  const down = applyStageFail(stateWith({ hp: 10, potions: 2 }), 15);
  assert.equal(down.hp, 50);
  assert.equal(down.potions, 1);

  const noPotions = applyStageFail(stateWith({ hp: 10, potions: 0 }), 15);
  assert.equal(noPotions.potions, 0, 'potions never go negative');
});

test('armor reduces damage proportionally and is capped', () => {
  assert.equal(armorReduction(20), 0.2);
  assert.equal(armorReduction(60), 0.6);
  assert.equal(armorReduction(999), 0.6, 'never above the 60% cap');
  assert.equal(armorReduction(0), 0);
  assert.equal(armorReduction(undefined), 0);

  assert.equal(damageAfterArmor(15, 0), 15);
  assert.equal(damageAfterArmor(15, 20), 12);
  assert.equal(damageAfterArmor(15, 30), 11);
  assert.equal(damageAfterArmor(15, 60), 6);
  assert.equal(damageAfterArmor(0, 60), 0, 'no hit, no damage');
  assert.equal(damageAfterArmor(1, 60), 1, 'never below 1 damage');
});

test('armor upgrades cost gold, add a plate, and stop at the cap', () => {
  assert.equal(armorUpgradeCost(20), 180);
  assert.equal(armorUpgradeCost(0), 100);

  const poor = upgradeArmor(stateWith({ armor: 20, gold: 100 }));
  assert.equal(poor.armor, 20, 'cannot afford → untouched');
  assert.equal(poor.gold, 100);

  const upgraded = upgradeArmor(stateWith({ armor: 20, gold: 500 }));
  assert.equal(upgraded.armor, 20 + ARMOR_STEP);
  assert.equal(upgraded.gold, 500 - 180);

  const maxed = upgradeArmor(stateWith({ armor: ARMOR_MAX, gold: 9999 }));
  assert.equal(maxed.armor, ARMOR_MAX);
  assert.equal(maxed.gold, 9999, 'no gold burned at max');

  const nearlyMaxed = upgradeArmor(stateWith({ armor: ARMOR_MAX - 5, gold: 9999 }));
  assert.equal(nearlyMaxed.armor, ARMOR_MAX, 'never exceeds the cap');
});

test('weapon attack adds bonus XP on a clear (never cosmetic)', () => {
  assert.equal(weaponXpBonus(0), 0);
  assert.equal(weaponXpBonus(25), 5);
  assert.equal(weaponXpBonus(45), 9);
  assert.equal(weaponXpBonus(undefined), 0);
  assert.equal(weaponXpBonus(-50), 0, 'negative attack never steals XP');

  const base = applyStageClear(stateWith({ weapon_atk: 0 }), 'python', 1, 100);
  assert.equal(base.total_xp, 100, 'starter weapon adds nothing');

  const armed = applyStageClear(stateWith({ weapon_atk: 45 }), 'python', 1, 100);
  assert.equal(armed.total_xp, 109, '45 atk adds 9 XP');

  const repeat = applyStageClear(armed, 'python', 1, 100);
  assert.equal(repeat.total_xp, 109, 'repeat clear is still a no-op');
});

test('drinkPotion heals 35 capped at max_hp and consumes a potion', () => {
  const healed = drinkPotion(stateWith({ hp: 40, potions: 2 }));
  assert.equal(healed.hp, 40 + POTION_HEAL);
  assert.equal(healed.potions, 1);

  const capped = drinkPotion(stateWith({ hp: 90, potions: 1 }));
  assert.equal(capped.hp, 100);

  const full = stateWith({ hp: 100, potions: 3 });
  assert.equal(drinkPotion(full), full, 'no potion wasted at full HP');

  const empty = stateWith({ hp: 30, potions: 0 });
  assert.equal(drinkPotion(empty), empty, 'cannot drink without potions');
});

test('buyPotion requires 50 gold', () => {
  const poor = stateWith({ gold: POTION_COST - 1 });
  assert.equal(buyPotion(poor), poor);

  const rich = buyPotion(stateWith({ gold: POTION_COST, potions: 0 }));
  assert.equal(rich.gold, 0);
  assert.equal(rich.potions, 1);
});

test('equipWeapon buys once, then re-equipping is free', () => {
  const weapon = { name: 'Dragon Slayer', cost: 100, atk: 40 };
  const bought = equipWeapon(stateWith({ gold: 150 }), weapon);
  assert.equal(bought.gold, 50);
  assert.equal(bought.weapon_name, 'Dragon Slayer');
  assert.equal(bought.weapon_atk, 40);
  assert.ok(bought.ownedWeapons.includes('Dragon Slayer'));

  const again = equipWeapon(bought, weapon);
  assert.equal(again, bought, 'already equipped is a no-op');

  const switchedBack = equipWeapon(bought, { name: 'Pixel Blade', cost: 0, atk: 25 });
  assert.equal(switchedBack.gold, 50, 'switching back to an owned weapon is free');
  assert.equal(switchedBack.weapon_name, 'Pixel Blade');

  const reEquip = equipWeapon(switchedBack, { name: 'Dragon Slayer', cost: 100, atk: 40 });
  assert.equal(reEquip.gold, 50, 're-equipping an owned weapon never charges again');

  const poor = stateWith({ gold: 10, ownedWeapons: ['Pixel Blade'] });
  assert.equal(equipWeapon(poor, weapon), poor, 'cannot buy what you cannot afford');
});

test('unlockHint charges once per stage and never twice', () => {
  const key = hintKey('python', 1);
  const paid = unlockHint(stateWith({ gold: 100 }), key, 25);
  assert.equal(paid.gold, 75);
  assert.ok(paid.hintsUnlocked.includes(key));

  const repeat = unlockHint(paid, key, 25);
  assert.equal(repeat, paid, 'purchased hints are not charged again');

  const poor = stateWith({ gold: 0 });
  assert.equal(unlockHint(poor, hintKey('python', 2), 25), poor);
  assert.equal(unlockHint(null, key, 0), null);
});

test('selectCharacter stores the skin name', () => {
  const state = selectCharacter(createDefaultProgress(), 'Pixel Mage');
  assert.equal(state.character_name, 'Pixel Mage');
  assert.equal(selectCharacter(state, 'Pixel Mage'), state);
});

test('xpLevel follows the 250 * level curve', () => {
  assert.deepEqual(xpLevel(0), { level: 1, current: 0, next: 250, pct: 0 });
  assert.equal(xpLevel(249).level, 1);
  assert.equal(xpLevel(250).level, 2);
  assert.equal(xpLevel(250).current, 0);
  assert.equal(xpLevel(250).next, 500);
  assert.equal(xpLevel(750).level, 3);
  assert.equal(xpLevel(750 + 500 + 750).level, 4);
  assert.equal(xpLevel(-50).level, 1);
  assert.equal(xpLevel(NaN).level, 1);
});

test('stage numbering constant matches the syllabus (15 stages per track)', () => {
  assert.equal(MAX_STAGE_NUMBER, 15);
});
