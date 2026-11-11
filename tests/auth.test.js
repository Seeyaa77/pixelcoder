import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PBKDF2_ITERATIONS,
  hashPassword,
  verifyPassword,
  validatePassword,
  passwordStrength,
  isValidUsername,
  isValidEmail,
  createSession,
  isSessionValid,
  sanitizeUser,
  applyFailedAttempt,
  isLockedOut,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_MS
} from '../src/lib/auth.js';

test('hashPassword produces a salted PBKDF2 record, never the plaintext', async () => {
  const hash = await hashPassword('CorrectHorse42!');
  assert.match(hash, new RegExp(`^pbkdf2\\$${PBKDF2_ITERATIONS}\\$`));
  assert.ok(!hash.includes('CorrectHorse42!'));
  const parts = hash.split('$');
  assert.equal(parts.length, 4);
  assert.equal(Buffer.from(parts[2], 'base64').length, 16, '16-byte salt');
  assert.equal(Buffer.from(parts[3], 'base64').length, 32, '32-byte derived key');
});

test('same password hashed twice yields different salts', async () => {
  const a = await hashPassword('SamePassword123');
  const b = await hashPassword('SamePassword123');
  assert.notEqual(a, b);
});

test('verifyPassword accepts the right password and rejects the wrong one', async () => {
  const hash = await hashPassword('CorrectHorse42!');
  assert.deepEqual(await verifyPassword('CorrectHorse42!', hash), { ok: true, needsUpgrade: false });
  assert.equal((await verifyPassword('correcthorse42!', hash)).ok, false);
  assert.equal((await verifyPassword('', hash)).ok, false);
});

test('legacy plaintext rows verify and are flagged for upgrade', async () => {
  assert.deepEqual(await verifyPassword('legacy-pass', 'legacy-pass'), { ok: true, needsUpgrade: true });
  assert.equal((await verifyPassword('nope', 'legacy-pass')).ok, false, 'wrong legacy password fails');
});

test('verifyPassword never throws on malformed stored values', async () => {
  for (const stored of [null, undefined, '', 'pbkdf2$abc$x$y', 'pbkdf2$210000$!!!$!!!', 42]) {
    const result = await verifyPassword('whatever', stored);
    assert.equal(result.ok, false, `stored=${String(stored)}`);
    assert.equal(result.needsUpgrade, false);
  }
});

test('validatePassword enforces length, username match, and common passwords', () => {
  assert.equal(validatePassword('').valid, false);
  assert.equal(validatePassword('short').valid, false);
  assert.equal(validatePassword('x'.repeat(201)).valid, false);
  assert.equal(validatePassword('MyUsername', 'myusername').valid, false);
  assert.equal(validatePassword('password', 'hero').valid, false, 'common password rejected');
  assert.equal(validatePassword('Dragon_Slayer_99').valid, true);
});

test('passwordStrength scores 0-4', () => {
  assert.equal(passwordStrength(''), 0);
  assert.equal(passwordStrength('abcdefgh'), 1);
  assert.equal(passwordStrength('abcdefghijkl'), 2);
  assert.equal(passwordStrength('Abcdefghijkl'), 3);
  assert.equal(passwordStrength('Abcdefghijkl9'), 4);
  assert.equal(passwordStrength('Abcdefghijkl9!x'), 4, 'capped at 4');
});

test('username and email validation', () => {
  assert.equal(isValidUsername('PixelKnight'), true);
  assert.equal(isValidUsername('pixel_knight_1'), true);
  assert.equal(isValidUsername('ab'), false);
  assert.equal(isValidUsername('a'.repeat(21)), false);
  assert.equal(isValidUsername('bad name'), false);
  assert.equal(isValidUsername('drop;table'), false);
  assert.equal(isValidEmail('hero@example.com'), true);
  assert.equal(isValidEmail('hero@example'), false);
  assert.equal(isValidEmail('not-an-email'), false);
});

test('createSession never leaks the password hash and stamps expiry', () => {
  const session = createSession({
    id: 1,
    username: 'Aria',
    email: 'aria@example.com',
    password_hash: 'pbkdf2$210000$a$b',
    cleared_stages: { python: [1, 2], cpp: [], javascript: [] }
  });
  assert.equal(session.isLoggedIn, true);
  assert.equal(session.password_hash, undefined);
  assert.deepEqual(session.clearedStages, { python: [1, 2], cpp: [], javascript: [] });
  assert.equal(session.cleared_stages, undefined);
  assert.ok(Date.parse(session.expiresAt) > Date.now());
  assert.equal(isSessionValid(session), true);
});

test('sanitizeUser keeps forward-compatible fields but strips secrets', () => {
  const clean = sanitizeUser({
    username: 'Guest',
    password_hash: 'secret',
    passwordHash: 'secret2',
    isGuest: true,
    ownedWeapons: ['Pixel Blade'],
    hintsUnlocked: ['python:1']
  });
  assert.equal(clean.password_hash, undefined);
  assert.equal(clean.passwordHash, undefined);
  assert.equal(clean.isGuest, true);
  assert.deepEqual(clean.ownedWeapons, ['Pixel Blade']);
  assert.deepEqual(clean.hintsUnlocked, ['python:1']);
  assert.deepEqual(clean.clearedStages, { python: [], cpp: [], javascript: [] }, 'default is empty, not pre-cleared');
});

test('sessions expire and malformed sessions are rejected', () => {
  const session = createSession({ username: 'Aria' }, 7);
  assert.equal(isSessionValid(session, Date.now() + 8 * 24 * 60 * 60 * 1000), false);
  assert.equal(isSessionValid({ ...session, expiresAt: 'not-a-date' }), false);
  assert.equal(isSessionValid({ username: 'Aria' }), false);
  assert.equal(isSessionValid(null), false);
});

test('failed-login throttle locks after 5 misses for 30s', () => {
  const now = 1_000_000;
  let state = { attempts: 0, lockedUntil: 0 };
  for (let i = 0; i < MAX_FAILED_ATTEMPTS - 1; i += 1) {
    state = applyFailedAttempt(state, now);
    assert.equal(isLockedOut(state, now), false);
  }
  state = applyFailedAttempt(state, now);
  assert.equal(state.lockedUntil, now + LOCKOUT_MS);
  assert.equal(isLockedOut(state, now), true);
  assert.equal(isLockedOut(state, now + LOCKOUT_MS + 1), false);
});
