/**
 * Pure(ish) authentication helpers for PixelCoder.
 *
 * Passwords are hashed with PBKDF2-SHA256 (WebCrypto). The stored format is:
 *   pbkdf2$<iterations>$<base64 salt>$<base64 derived key>
 *
 * Legacy rows created before this module stored the raw password in
 * `password_hash`. verifyPassword() still accepts those values and reports
 * `needsUpgrade: true` so callers can transparently re-hash on next login.
 *
 * This module intentionally has no dependency on Supabase or React so it can
 * be unit tested in isolation (Node 19+ exposes WebCrypto + btoa/atob).
 */

export const PBKDF2_ITERATIONS = 210000
export const PBKDF2_SALT_BYTES = 16
export const PBKDF2_KEY_BYTES = 32

export const SESSION_TTL_DAYS = 7
export const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000

export const MAX_FAILED_ATTEMPTS = 5
export const LOCKOUT_MS = 30 * 1000

const PBKDF2_PREFIX = 'pbkdf2'
const THROTTLE_STORAGE_KEY = 'pixelcoder_login_throttle_v1'

/** Deliberately small, ordered by how often they appear in breach lists. */
export const COMMON_PASSWORDS = [
  'password',
  'password1',
  '12345678',
  '123456789',
  'qwerty123',
  'letmein',
  'iloveyou',
  'admin123',
  'welcome1',
  'monkey123',
]

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/

/** Base64 helpers are hand-rolled so this module does not depend on Buffer. */
const btoaImpl = typeof globalThis.btoa === 'function' ? globalThis.btoa.bind(globalThis) : null
const atobImpl = typeof globalThis.atob === 'function' ? globalThis.atob.bind(globalThis) : null

function bytesToBase64(bytes) {
  if (!btoaImpl) throw new Error('base64 encoding is not available in this environment')
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
  return btoaImpl(binary)
}

function base64ToBytes(value) {
  if (!atobImpl) throw new Error('base64 decoding is not available in this environment')
  const binary = atobImpl(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function getWebCrypto() {
  const webcrypto = globalThis.crypto
  if (!webcrypto || !webcrypto.subtle) {
    throw new Error('WebCrypto is unavailable. PixelCoder auth requires a secure context (HTTPS or localhost).')
  }
  return webcrypto
}

async function derivePbkdf2(password, salt, iterations) {
  const webcrypto = getWebCrypto()
  const passwordBytes = new TextEncoder().encode(password)
  const keyMaterial = await webcrypto.subtle.importKey('raw', passwordBytes, { name: 'PBKDF2' }, false, [
    'deriveBits',
  ])
  const bits = await webcrypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    PBKDF2_KEY_BYTES * 8,
  )
  return new Uint8Array(bits)
}

/**
 * Hash a plaintext password with a fresh random salt.
 * @param {string} password
 * @returns {Promise<string>} `pbkdf2$210000$<salt>$<hash>`
 */
export async function hashPassword(password) {
  if (typeof password !== 'string') throw new TypeError('password must be a string')
  const salt = getWebCrypto().getRandomValues(new Uint8Array(PBKDF2_SALT_BYTES))
  const derived = await derivePbkdf2(password, salt, PBKDF2_ITERATIONS)
  return `${PBKDF2_PREFIX}$${PBKDF2_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(derived)}`
}

function timingSafeEqualBytes(a, b) {
  const length = Math.max(a.length, b.length)
  let diff = a.length ^ b.length
  for (let i = 0; i < length; i += 1) {
    diff |= (a[i] || 0) ^ (b[i] || 0)
  }
  return diff === 0
}

function timingSafeEqualStrings(a, b) {
  const length = Math.max(a.length, b.length)
  let diff = a.length ^ b.length
  for (let i = 0; i < length; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diff === 0
}

function parseStoredHash(stored) {
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== PBKDF2_PREFIX) return null
  const iterations = Number.parseInt(parts[1], 10)
  if (!Number.isInteger(iterations) || iterations < 1) return null
  if (!parts[2] || !parts[3]) return null
  return { iterations, saltB64: parts[2], hashB64: parts[3] }
}

/**
 * Verify a plaintext password against a stored value.
 *
 * Legacy plaintext rows (pre-PBKDF2) still verify, but are flagged for upgrade.
 * Failures never throw for malformed input; they return { ok: false }.
 *
 * @param {string} password
 * @param {string|null|undefined} stored
 * @returns {Promise<{ ok: boolean, needsUpgrade: boolean }>}
 */
export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string' || stored.length === 0) {
    return { ok: false, needsUpgrade: false }
  }

  const parsed = parseStoredHash(stored)

  // Legacy plaintext row: compare raw values, then re-hash on success.
  if (!parsed) {
    const ok = timingSafeEqualStrings(password, stored)
    return { ok, needsUpgrade: ok }
  }

  try {
    const salt = base64ToBytes(parsed.saltB64)
    const expected = base64ToBytes(parsed.hashB64)
    const actual = await derivePbkdf2(password, salt, parsed.iterations)
    const ok = timingSafeEqualBytes(actual, expected)
    return { ok, needsUpgrade: ok && parsed.iterations < PBKDF2_ITERATIONS }
  } catch (err) {
    console.warn('Password verification failed:', err instanceof Error ? err.message : err)
    return { ok: false, needsUpgrade: false }
  }
}

/**
 * @param {string} password
 * @param {string} [username]
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePassword(password, username = '') {
  if (typeof password !== 'string' || password.length === 0) {
    return { valid: false, message: 'Password is required.' }
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' }
  }
  if (password.length > 200) {
    return { valid: false, message: 'Password must be 200 characters or fewer.' }
  }
  const normalized = password.toLowerCase()
  if (username && normalized === String(username).trim().toLowerCase()) {
    return { valid: false, message: 'Password cannot be the same as your username.' }
  }
  if (COMMON_PASSWORDS.includes(normalized)) {
    return { valid: false, message: 'That password is too common. Choose something less guessable.' }
  }
  return { valid: true, message: '' }
}

export function isValidUsername(username) {
  return typeof username === 'string' && USERNAME_PATTERN.test(username)
}

export function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_PATTERN.test(email)
}

/** Convenience used by the UI strength meter (0-4). */
export function passwordStrength(password) {
  if (typeof password !== 'string' || password.length === 0) return 0
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return Math.min(4, score)
}

/**
 * Build the client session object persisted in localStorage.
 * Never contains password_hash (sanitizeUser strips it).
 *
 * @param {object} user
 * @param {number} [ttlDays]
 * @returns {object}
 */
export function createSession(user, ttlDays = SESSION_TTL_DAYS) {
  const now = Date.now()
  const safeTtl = Number.isFinite(ttlDays) && ttlDays > 0 ? ttlDays : SESSION_TTL_DAYS
  return {
    ...sanitizeUser(user),
    isLoggedIn: true,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + safeTtl * 24 * 60 * 60 * 1000).toISOString(),
  }
}

/**
 * Strict session check: a session must be logged in and have a well-formed,
 * future expiresAt. Legacy sessions without expiresAt are handled by the
 * caller (supabase.getStoredSession stamps them once).
 *
 * @param {object|null|undefined} session
 * @param {number} [now]
 * @returns {boolean}
 */
export function isSessionValid(session, now = Date.now()) {
  if (!session || typeof session !== 'object' || session.isLoggedIn !== true) return false
  if (typeof session.expiresAt !== 'string') return false
  const expiry = Date.parse(session.expiresAt)
  return Number.isFinite(expiry) && expiry > now
}

const DEFAULT_CLEARED_STAGES = () => ({ python: [], cpp: [], javascript: [] })

/**
 * Remove secrets from a profile row / session before it reaches React state,
 * localStorage, or the console.
 *
 * Keeps unknown fields (forward compatible) but always drops password_hash.
 * Maps database `cleared_stages` to the camelCase `clearedStages` the UI uses.
 *
 * @param {object|null|undefined} row
 * @returns {object}
 */
export function sanitizeUser(row) {
  if (!row || typeof row !== 'object') return {}
  const clean = { ...row }
  delete clean.password_hash
  delete clean.passwordHash

  const stages = clean.cleared_stages ?? clean.clearedStages
  delete clean.cleared_stages
  clean.clearedStages =
    stages && typeof stages === 'object' && !Array.isArray(stages) ? stages : DEFAULT_CLEARED_STAGES()

  return clean
}

/* ------------------------------------------------------------------ */
/* Failed-login throttle (pure core + localStorage adapters)          */
/* ------------------------------------------------------------------ */

/**
 * @param {{ attempts?: number, lockedUntil?: number }} state
 * @param {number} [now]
 * @returns {{ attempts: number, lockedUntil: number }}
 */
export function applyFailedAttempt(state, now = Date.now()) {
  const previous = state && typeof state === 'object' ? state : {}
  const lockedUntil = Number.isFinite(previous.lockedUntil) ? previous.lockedUntil : 0
  if (lockedUntil > now) return { attempts: 0, lockedUntil }

  const attempts = (Number.isFinite(previous.attempts) ? previous.attempts : 0) + 1
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    // Reset the counter so the user gets a fresh budget after the lockout.
    return { attempts: 0, lockedUntil: now + LOCKOUT_MS }
  }
  return { attempts, lockedUntil: 0 }
}

/**
 * @param {{ lockedUntil?: number }|null|undefined} state
 * @param {number} [now]
 * @returns {boolean}
 */
export function isLockedOut(state, now = Date.now()) {
  return Boolean(state && Number.isFinite(state.lockedUntil) && state.lockedUntil > now)
}

export function throttleKey(identifier) {
  return String(identifier || '').trim().toLowerCase()
}

function readThrottleMap() {
  try {
    if (typeof localStorage === 'undefined') return {}
    const raw = localStorage.getItem(THROTTLE_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function writeThrottleMap(map) {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(THROTTLE_STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* localStorage unavailable (private mode / quota) — throttle degrades to no-op */
  }
}

export function getThrottleState(identifier, now = Date.now()) {
  const key = throttleKey(identifier)
  const entry = readThrottleMap()[key] || { attempts: 0, lockedUntil: 0 }
  return {
    attempts: Number.isFinite(entry.attempts) ? entry.attempts : 0,
    lockedUntil: Number.isFinite(entry.lockedUntil) ? entry.lockedUntil : 0,
    remainingMs: Math.max(0, (entry.lockedUntil || 0) - now),
  }
}

export function getLockoutRemainingMs(identifier, now = Date.now()) {
  return getThrottleState(identifier, now).remainingMs
}

export function recordFailedAttempt(identifier, now = Date.now()) {
  const key = throttleKey(identifier)
  if (!key) return { attempts: 0, lockedUntil: 0, remainingMs: 0 }
  const map = readThrottleMap()
  const next = applyFailedAttempt(map[key], now)
  map[key] = next
  writeThrottleMap(map)
  return { ...next, remainingMs: Math.max(0, next.lockedUntil - now) }
}

export function clearFailedAttempts(identifier) {
  const key = throttleKey(identifier)
  if (!key) return
  const map = readThrottleMap()
  if (!(key in map)) return
  delete map[key]
  writeThrottleMap(map)
}
