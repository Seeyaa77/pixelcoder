// Pure analytics + integrity checks for the client-side admin dashboard.
// Everything here is derived from public profile rows, so it must stay
// read-only and must never assume trusted data coming from the database.

export const MAX_STAGE_NUMBER = 15;
export const TRACK_IDS = ['python', 'cpp', 'javascript'];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Sum of the XP a player could ever earn across every stage of every track. */
export function maxEarnableXp(syllabus) {
  return TRACK_IDS.reduce((total, trackId) => {
    const stages = (syllabus && syllabus[trackId] && syllabus[trackId].stages) || [];
    return total + stages.reduce((sum, stage) => sum + (Number(stage.xp) || 0), 0);
  }, 0);
}

/** Normalize `cleared_stages` into { trackId: number[] } regardless of shape. */
export function normalizeClearedStages(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const result = {};
  for (const trackId of TRACK_IDS) {
    const value = source[trackId];
    result[trackId] = Array.isArray(value)
      ? value.map((n) => Number(n)).filter((n) => Number.isFinite(n))
      : [];
  }
  return result;
}

export function countCleared(raw) {
  const normalized = normalizeClearedStages(raw);
  return TRACK_IDS.reduce((sum, trackId) => sum + normalized[trackId].length, 0);
}

function isValidDate(value) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time);
}

/**
 * Summarize profile rows into dashboard stats, table rows and integrity flags.
 * `now` is injectable so the 24h windows are testable.
 */
export function summarizePlayers(players, syllabus, now = Date.now()) {
  const rows = Array.isArray(players) ? players.filter(Boolean) : [];
  const ceiling = maxEarnableXp(syllabus);
  const byTrack = { python: 0, cpp: 0, javascript: 0 };
  const anomalies = [];

  let totalXp = 0;
  let totalCleared = 0;
  let newlyJoined = 0;
  let activeRecently = 0;

  const table = rows.map((player) => {
    const username = String(player.username || '(no username)');
    const xp = Number(player.total_xp) || 0;
    const gold = Number(player.gold) || 0;
    const cleared = normalizeClearedStages(player.cleared_stages);
    const clearedCount = countCleared(cleared);

    totalXp += xp;
    totalCleared += clearedCount;
    for (const trackId of TRACK_IDS) byTrack[trackId] += cleared[trackId].length;

    const created = isValidDate(player.created_at) ? new Date(player.created_at).getTime() : null;
    const updated = isValidDate(player.updated_at) ? new Date(player.updated_at).getTime() : null;
    if (created !== null && now - created <= DAY_MS && created <= now) newlyJoined += 1;
    if (updated !== null && now - updated <= DAY_MS && updated <= now) activeRecently += 1;

    if (ceiling > 0 && xp > ceiling) {
      anomalies.push({
        username,
        severity: 'CRITICAL',
        type: 'XP_ABOVE_CEILING',
        detail: `${xp} XP exceeds the ${ceiling} XP earnable from all 45 stages.`
      });
    }
    if (gold > 25000) {
      anomalies.push({
        username,
        severity: 'MEDIUM',
        type: 'UNUSUAL_GOLD',
        detail: `${gold} gold is far above normal play (25.000 threshold).`
      });
    }
    for (const trackId of TRACK_IDS) {
      const invalid = cleared[trackId].filter((n) => n < 1 || n > MAX_STAGE_NUMBER || !Number.isInteger(n));
      if (invalid.length > 0) {
        anomalies.push({
          username,
          severity: 'HIGH',
          type: 'INVALID_STAGE_ID',
          detail: `${trackId} contains impossible stage ids: ${invalid.slice(0, 5).join(', ')}.`
        });
      }
      if (new Set(cleared[trackId]).size !== cleared[trackId].length) {
        anomalies.push({
          username,
          severity: 'LOW',
          type: 'DUPLICATE_STAGE_ID',
          detail: `${trackId} lists the same stage more than once.`
        });
      }
    }
    if (clearedCount > MAX_STAGE_NUMBER * TRACK_IDS.length) {
      anomalies.push({
        username,
        severity: 'HIGH',
        type: 'TOO_MANY_STAGES',
        detail: `${clearedCount} cleared stages is more than the 45 that exist.`
      });
    }
    if (created !== null && created > now) {
      anomalies.push({
        username,
        severity: 'LOW',
        type: 'FUTURE_TIMESTAMP',
        detail: 'created_at is in the future.'
      });
    }
    if (player.role && !['user', 'admin'].includes(player.role)) {
      anomalies.push({
        username,
        severity: 'MEDIUM',
        type: 'UNKNOWN_ROLE',
        detail: `Role "${player.role}" is not a known role.`
      });
    }

    return {
      id: player.id || username,
      username,
      role: player.role || 'user',
      xp,
      gold,
      clearedCount,
      cleared,
      streak: Number(player.current_streak) || 0,
      createdAt: player.created_at || null,
      updatedAt: player.updated_at || null
    };
  });

  table.sort((a, b) => b.xp - a.xp || a.username.localeCompare(b.username));

  const severityRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  anomalies.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || a.username.localeCompare(b.username));

  return {
    stats: {
      players: rows.length,
      totalXp,
      avgXp: rows.length ? Math.round(totalXp / rows.length) : 0,
      totalCleared,
      avgCleared: rows.length ? Math.round((totalCleared / rows.length) * 10) / 10 : 0,
      newlyJoined,
      activeRecently,
      xpCeiling: ceiling,
      byTrack
    },
    table,
    anomalies
  };
}
