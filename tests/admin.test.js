import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MAX_STAGE_NUMBER,
  countCleared,
  maxEarnableXp,
  normalizeClearedStages,
  summarizePlayers
} from '../src/lib/admin.js';

const syllabus = {
  python: { stages: [{ xp: 100 }, { xp: 120 }] },
  cpp: { stages: [{ xp: 100 }] },
  javascript: { stages: [{ xp: 150 }] }
};

const DAY = 24 * 60 * 60 * 1000;

test('maxEarnableXp adds every stage of every track', () => {
  assert.equal(maxEarnableXp(syllabus), 470);
  assert.equal(maxEarnableXp({}), 0);
  assert.equal(maxEarnableXp(null), 0);
});

test('normalizeClearedStages tolerates garbage and unknown tracks', () => {
  assert.deepEqual(normalizeClearedStages({ python: [1, '2', 'x', null], rust: [1] }), {
    python: [1, 2, 0],
    cpp: [],
    javascript: []
  });
  assert.deepEqual(normalizeClearedStages(null), { python: [], cpp: [], javascript: [] });
  assert.deepEqual(normalizeClearedStages({ python: 'nope' }), { python: [], cpp: [], javascript: [] });
});

test('countCleared counts across tracks', () => {
  assert.equal(countCleared({ python: [1, 2], cpp: [1], javascript: [] }), 3);
  assert.equal(countCleared(undefined), 0);
});

test('summarizePlayers computes stats, sorting and 24h windows', () => {
  const now = Date.UTC(2026, 10, 11, 12, 0, 0);
  const result = summarizePlayers(
    [
      {
        id: 'a',
        username: 'Aria',
        role: 'user',
        total_xp: 300,
        gold: 500,
        current_streak: 3,
        cleared_stages: { python: [1, 2], cpp: [1], javascript: [] },
        created_at: new Date(now - 2 * DAY).toISOString(),
        updated_at: new Date(now - 60 * 60 * 1000).toISOString()
      },
      {
        id: 'b',
        username: 'Bima',
        role: 'admin',
        total_xp: 900,
        gold: 100,
        current_streak: 0,
        cleared_stages: { python: [1], cpp: [], javascript: [1] },
        created_at: new Date(now - 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now - 30 * 60 * 1000).toISOString()
      }
    ],
    syllabus,
    now
  );

  assert.equal(result.stats.players, 2);
  assert.equal(result.stats.totalXp, 1200);
  assert.equal(result.stats.avgXp, 600);
  assert.equal(result.stats.totalCleared, 5);
  assert.equal(result.stats.avgCleared, 2.5);
  assert.equal(result.stats.newlyJoined, 1);
  assert.equal(result.stats.activeRecently, 2);
  assert.deepEqual(result.stats.byTrack, { python: 3, cpp: 1, javascript: 1 });
  assert.equal(result.stats.xpCeiling, 470);
  assert.deepEqual(result.table.map((row) => row.username), ['Bima', 'Aria']);
  assert.deepEqual(result.anomalies.map((a) => a.type), ['XP_ABOVE_CEILING']);
  assert.equal(result.anomalies[0].username, 'Bima');
});

test('summarizePlayers flags impossible data instead of trusting it', () => {
  const now = Date.UTC(2026, 10, 11, 12, 0, 0);
  const { anomalies } = summarizePlayers(
    [
      {
        username: 'Cheater',
        role: 'god',
        total_xp: 999999,
        gold: 50000,
        cleared_stages: { python: [1, 1, 16, -3], cpp: [], javascript: [] },
        created_at: new Date(now + DAY).toISOString(),
        updated_at: new Date(now).toISOString()
      }
    ],
    syllabus,
    now
  );

  const types = anomalies.map((a) => a.type);
  for (const expected of [
    'XP_ABOVE_CEILING',
    'UNUSUAL_GOLD',
    'INVALID_STAGE_ID',
    'DUPLICATE_STAGE_ID',
    'FUTURE_TIMESTAMP',
    'UNKNOWN_ROLE'
  ]) {
    assert.ok(types.includes(expected), `expected ${expected} in ${types.join(', ')}`);
  }
  assert.equal(anomalies[0].severity, 'CRITICAL');
  assert.ok(MAX_STAGE_NUMBER === 15);
});

test('summarizePlayers handles empty and malformed input', () => {
  const empty = summarizePlayers([], syllabus);
  assert.equal(empty.stats.players, 0);
  assert.equal(empty.stats.avgXp, 0);
  assert.equal(empty.table.length, 0);
  assert.equal(empty.anomalies.length, 0);

  const malformed = summarizePlayers([{ username: 'X', cleared_stages: 'nope' }, null], syllabus);
  assert.equal(malformed.stats.players, 1);
  assert.equal(malformed.table[0].clearedCount, 0);
});
