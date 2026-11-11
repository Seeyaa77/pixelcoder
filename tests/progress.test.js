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

  assert.equal(cleared.total_xp, 100);
  assert.equal(cleared.gold, 150 + STAGE_CLEAR_GOLD);
  assert.equal(cleared.current_streak, 2);
  assert.deepEqual(getClearedStages(cleared, 'python'), [1]);
  assert.equal(isStageUnlocked(cleared, 'python', 2), true);
  assert.equal(isStageUnlocked(cleared, 'python', 3), false);

  const repeated = applyStageClear(cleared, 'python', 1, 100);
  assert.equal(repeated, cleared, 'repeat clear must return the same reference (no farming)');
  assert.equal(repeated.total_xp, 100);
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

test('failure damage reduces HP and revives at 50 HP losing a potion', () => {
  const hurt = applyStageFail(stateWith({ hp: 100 }), 15);
  assert.equal(hurt.hp, 85);

  const down = applyStageFail(stateWith({ hp: 10, potions: 2 }), 15);
  assert.equal(down.hp, 50);
  assert.equal(down.potions, 1);

  const noPotions = applyStageFail(stateWith({ hp: 10, potions: 0 }), 15);
  assert.equal(noPotions.potions, 0, 'potions never go negative');
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
