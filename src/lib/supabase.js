import { createClient } from '@supabase/supabase-js'
import {
  SESSION_TTL_MS,
  clearFailedAttempts,
  createSession,
  getLockoutRemainingMs,
  hashPassword,
  isSessionValid,
  isValidEmail,
  isValidUsername,
  recordFailedAttempt,
  sanitizeUser,
  validatePassword,
  verifyPassword,
} from './auth'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eqqelabmsvwmvwrpamjc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_iQQDQsHVHdQ8FArAaatLAw_dewthkMJ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

const STORAGE_KEY = 'pixelcoder_session_v3'

/**
 * Explicit column list for every profile read/write. Deliberately excludes
 * password_hash so it can never be spread into React state or localStorage.
 * password_hash is fetched only by the login/change-password lookups below,
 * with its own explicit `, password_hash` suffix.
 */
const PROFILE_COLUMNS = [
  'id',
  'username',
  'email',
  'role',
  'total_xp',
  'current_streak',
  'hp',
  'max_hp',
  'armor',
  'weapon_name',
  'weapon_atk',
  'gold',
  'potions',
  'cleared_stages',
  'created_at',
  'updated_at',
].join(', ')

const TRACKS = ['python', 'cpp', 'javascript']
const DEFAULT_CLEARED_STAGES = { python: [], cpp: [], javascript: [] }

const loggedOutSession = () => ({
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
  clearedStages: { ...DEFAULT_CLEARED_STAGES },
})

const clampInt = (value, min, max, fallback) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(parsed)))
}

const normalizeClearedStages = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...DEFAULT_CLEARED_STAGES }
  }
  const result = {}
  for (const track of TRACKS) {
    const list = Array.isArray(value[track]) ? value[track] : []
    result[track] = [
      ...new Set(list.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n >= 1 && n <= 999)),
    ].sort((a, b) => a - b)
  }
  return result
}

/** Escape PostgREST/LIKE wildcards so user input cannot widen a filter. */
const escapeLike = (value) => String(value).replace(/[\\%_]/g, '\\$&')

const looksLikeEmail = (value) => value.includes('@')

/* ------------------------------------------------------------------ */
/* Session persistence                                                 */
/* ------------------------------------------------------------------ */

export const getStoredSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return loggedOutSession()

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return loggedOutSession()

    const session = sanitizeUser(parsed)
    if (session.isLoggedIn !== true) return loggedOutSession()

    // Old sessions predate expiresAt. Stamp one TTL window once, then enforce.
    if (!session.expiresAt) {
      session.expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()
    }

    if (!isSessionValid(session)) {
      clearStoredSession()
      return loggedOutSession()
    }

    // Guard against legacy blobs written with `{...row}` that included the hash.
    delete session.password_hash
    delete session.passwordHash
    return session
  } catch (e) {
    console.warn('Storage read failed:', e)
    return loggedOutSession()
  }
}

export const saveStoredSession = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeUser(data)))
  } catch (e) {
    console.warn('Storage save failed:', e)
  }
}

export const clearStoredSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.warn('Storage clear failed:', e)
  }
}

/* ------------------------------------------------------------------ */
/* Leaderboard                                                         */
/* ------------------------------------------------------------------ */

// Fetch live real users from Supabase leaderboard.
// Explicit columns only — password_hash must never be selectable client-side.
export const fetchLiveLeaderboard = async () => {
  try {
    const { data, error } = await supabase
      .from('pixelcoder_profiles')
      .select('id, username, total_xp, current_streak, weapon_name, armor, role')
      .order('total_xp', { ascending: false })
      .limit(50)

    if (error) {
      console.warn('Supabase leaderboard fetch warning:', error.message)
      return []
    }
    return (data || []).map((row) => sanitizeUser(row))
  } catch (err) {
    console.warn('Network error fetching leaderboard:', err)
    return []
  }
}

// Admin overview: deliberately excludes email and other PII, because this
// runs with the public anon key. Moderation still requires a service role.
const ADMIN_COLUMNS = [
  'id',
  'username',
  'role',
  'total_xp',
  'gold',
  'current_streak',
  'cleared_stages',
  'created_at',
  'updated_at',
].join(', ')

export const fetchAdminOverview = async () => {
  try {
    const { data, error } = await supabase
      .from('pixelcoder_profiles')
      .select(ADMIN_COLUMNS)
      .order('total_xp', { ascending: false })
      .limit(500)

    if (error) return { players: [], error: `Could not load players: ${error.message}` }
    return { players: (data || []).map((row) => sanitizeUser(row)), error: null }
  } catch (err) {
    return { players: [], error: (err && err.message) || 'Network error while loading players.' }
  }
}

/* ------------------------------------------------------------------ */
/* Registration                                                        */
/* ------------------------------------------------------------------ */

// Register new real player in Supabase.
export const registerUserBackend = async (username, email, password) => {
  try {
    const cleanUsername = String(username || '').trim()
    const cleanEmail = String(email || '').trim().toLowerCase()

    if (!isValidUsername(cleanUsername)) {
      return {
        success: false,
        error: 'Username must be 3-20 characters and contain only letters, numbers, or underscores.',
      }
    }
    if (!isValidEmail(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' }
    }

    const passwordCheck = validatePassword(password, cleanUsername)
    if (!passwordCheck.valid) {
      return { success: false, error: passwordCheck.message }
    }

    // Two exact-match lookups instead of `.or()` so input can never inject
    // PostgREST filter syntax. `ilike` + escapeLike gives case-insensitive
    // duplicate detection without letting `%`/`_` act as wildcards.
    const { data: usernameRows, error: usernameError } = await supabase
      .from('pixelcoder_profiles')
      .select('id')
      .ilike('username', escapeLike(cleanUsername))
      .limit(1)

    if (usernameError) {
      console.warn('Username lookup failed:', usernameError.message)
      return { success: false, error: 'Could not verify username availability. Please try again.' }
    }
    if (usernameRows && usernameRows.length > 0) {
      return { success: false, error: 'Username already taken. Please choose another!' }
    }

    const { data: emailRows, error: emailError } = await supabase
      .from('pixelcoder_profiles')
      .select('id')
      .ilike('email', escapeLike(cleanEmail))
      .limit(1)

    if (emailError) {
      console.warn('Email lookup failed:', emailError.message)
      return { success: false, error: 'Could not verify email availability. Please try again.' }
    }
    if (emailRows && emailRows.length > 0) {
      return { success: false, error: 'Email already registered. Try logging in!' }
    }

    const passwordHash = await hashPassword(password)

    const newProfile = {
      username: cleanUsername,
      email: cleanEmail,
      password_hash: passwordHash,
      total_xp: 100,
      current_streak: 1,
      hp: 100,
      max_hp: 100,
      armor: 20,
      weapon_name: 'Pixel Blade',
      weapon_atk: 25,
      gold: 150,
      potions: 3,
      role: 'user',
      cleared_stages: { ...DEFAULT_CLEARED_STAGES },
    }

    const { data, error } = await supabase
      .from('pixelcoder_profiles')
      .insert([newProfile])
      .select(PROFILE_COLUMNS)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: createSession(data) }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Registration failed.' }
  }
}

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

const lockoutMessage = (remainingMs) =>
  `Too many failed attempts. Try again in ${Math.max(1, Math.ceil(remainingMs / 1000))}s.`

// Login with username OR email.
export const loginUserBackend = async (identifier, password) => {
  try {
    const cleanIdentifier = String(identifier || '').trim()
    if (!cleanIdentifier || typeof password !== 'string' || password.length === 0) {
      return { success: false, error: 'Please enter your username/email and password.' }
    }

    const remainingMs = getLockoutRemainingMs(cleanIdentifier)
    if (remainingMs > 0) {
      return { success: false, error: lockoutMessage(remainingMs) }
    }

    // Explicit column list + password_hash for verification only.
    let query = supabase
      .from('pixelcoder_profiles')
      .select(`${PROFILE_COLUMNS}, password_hash`)
      .limit(1)

    if (looksLikeEmail(cleanIdentifier)) {
      query = query.ilike('email', escapeLike(cleanIdentifier.toLowerCase()))
    } else {
      // Case-insensitive but wildcard-escaped, so `%` cannot match other rows.
      query = query.ilike('username', escapeLike(cleanIdentifier))
    }

    const { data: rows, error } = await query

    if (error) {
      console.warn('Login lookup failed:', error.message)
      return { success: false, error: 'Could not reach the account service. Please try again.' }
    }

    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) {
      recordFailedAttempt(cleanIdentifier)
      return { success: false, error: 'Incorrect username/email or password.' }
    }

    const verification = await verifyPassword(password, row.password_hash)
    if (!verification.ok) {
      const throttle = recordFailedAttempt(cleanIdentifier)
      if (throttle.remainingMs > 0) {
        return { success: false, error: lockoutMessage(throttle.remainingMs) }
      }
      return { success: false, error: 'Incorrect username/email or password.' }
    }

    // Successful login. If the row was legacy plaintext (or an older iteration
    // count), transparently upgrade it to the current PBKDF2 parameters.
    if (verification.needsUpgrade) {
      try {
        const upgradedHash = await hashPassword(password)
        const { error: upgradeError } = await supabase
          .from('pixelcoder_profiles')
          .update({ password_hash: upgradedHash, updated_at: new Date().toISOString() })
          .eq('id', row.id)
        if (upgradeError) {
          // Non-fatal: the user still gets in, but the row stays legacy until
          // the next successful login / owner-run rotation.
          console.warn('Password hash upgrade failed (non-blocking):', upgradeError.message)
        }
      } catch (upgradeErr) {
        console.warn('Password hash upgrade failed (non-blocking):', upgradeErr)
      }
    }

    clearFailedAttempts(cleanIdentifier)
    return { success: true, user: createSession(sanitizeUser(row)) }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Login failed.' }
  }
}

/* ------------------------------------------------------------------ */
/* Account management                                                  */
/* ------------------------------------------------------------------ */

export const changePasswordBackend = async (username, currentPassword, newPassword) => {
  try {
    const cleanUsername = String(username || '').trim()
    if (!isValidUsername(cleanUsername)) {
      return { success: false, error: 'Invalid account.' }
    }
    if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
      return { success: false, error: 'Current password is required.' }
    }

    const remainingMs = getLockoutRemainingMs(cleanUsername)
    if (remainingMs > 0) {
      return { success: false, error: lockoutMessage(remainingMs) }
    }

    const passwordCheck = validatePassword(newPassword, cleanUsername)
    if (!passwordCheck.valid) {
      return { success: false, error: passwordCheck.message }
    }
    if (newPassword === currentPassword) {
      return { success: false, error: 'New password must be different from the current password.' }
    }

    const { data: rows, error } = await supabase
      .from('pixelcoder_profiles')
      .select('id, password_hash')
      .eq('username', cleanUsername)
      .limit(1)

    if (error) {
      console.warn('Password lookup failed:', error.message)
      return { success: false, error: 'Could not verify the account. Please try again.' }
    }

    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) {
      recordFailedAttempt(cleanUsername)
      return { success: false, error: 'Current password is incorrect.' }
    }

    const verification = await verifyPassword(currentPassword, row.password_hash)
    if (!verification.ok) {
      const throttle = recordFailedAttempt(cleanUsername)
      if (throttle.remainingMs > 0) {
        return { success: false, error: lockoutMessage(throttle.remainingMs) }
      }
      return { success: false, error: 'Current password is incorrect.' }
    }

    const newHash = await hashPassword(newPassword)
    const { error: updateError } = await supabase
      .from('pixelcoder_profiles')
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq('id', row.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    clearFailedAttempts(cleanUsername)
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Password change failed.' }
  }
}

const AVATAR_URL_MAX = 500
const CHARACTER_NAME_PATTERN = /^[A-Za-z0-9 &_'-]{1,40}$/

/**
 * Update only the presentation fields we allow clients to touch.
 * `avatar_url` and `character_name` are added by migration 0001; until then
 * this returns the database error instead of silently swallowing it.
 */
export const updateProfileBackend = async (username, fields = {}) => {
  try {
    const cleanUsername = String(username || '').trim()
    if (!isValidUsername(cleanUsername)) {
      return { success: false, error: 'Invalid account.' }
    }

    const patch = {}

    if (Object.prototype.hasOwnProperty.call(fields, 'avatar_url')) {
      const raw = fields.avatar_url
      if (raw === null || raw === '') {
        patch.avatar_url = null
      } else {
        const value = String(raw).trim()
        if (value.length > AVATAR_URL_MAX) {
          return { success: false, error: 'Avatar URL is too long.' }
        }
        let parsed
        try {
          parsed = new URL(value)
        } catch {
          return { success: false, error: 'Avatar URL must be a valid http(s) URL.' }
        }
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          return { success: false, error: 'Avatar URL must be a valid http(s) URL.' }
        }
        patch.avatar_url = parsed.toString()
      }
    }

    if (Object.prototype.hasOwnProperty.call(fields, 'character_name')) {
      const value = String(fields.character_name || '').trim()
      if (!CHARACTER_NAME_PATTERN.test(value)) {
        return {
          success: false,
          error: "Character name must be 1-40 characters (letters, numbers, spaces, & _ - ').",
        }
      }
      patch.character_name = value
    }

    if (Object.keys(patch).length === 0) {
      return { success: false, error: 'No supported profile fields to update.' }
    }

    const { data, error } = await supabase
      .from('pixelcoder_profiles')
      .update(patch)
      .eq('username', cleanUsername)
      .select(PROFILE_COLUMNS)
      .maybeSingle()

    if (error) {
      return { success: false, error: error.message }
    }
    if (!data) {
      return { success: false, error: 'Account not found.' }
    }

    return { success: true, user: sanitizeUser(data) }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Profile update failed.' }
  }
}

/* ------------------------------------------------------------------ */
/* Progress sync                                                       */
/* ------------------------------------------------------------------ */

// Sync progress to Supabase. Only whitelisted gameplay columns are sent;
// values are clamped so a compromised client cannot inflate them arbitrarily
// (the migration's trigger is the server-side enforcement of this).
export const syncProgressToBackend = async (userState) => {
  if (!userState?.isLoggedIn || !userState?.username) {
    return
  }
  if (!isValidUsername(userState.username)) {
    console.warn('Sync skipped: invalid username in session.')
    return
  }
  if (userState.expiresAt && !isSessionValid(userState)) {
    return
  }

  try {
    const maxHp = clampInt(userState.max_hp, 1, 100000, 100)
    const payload = {
      total_xp: clampInt(userState.total_xp, 0, 10000000, 0),
      current_streak: clampInt(userState.current_streak, 0, 10000, 1),
      hp: clampInt(userState.hp, 0, maxHp, maxHp),
      max_hp: maxHp,
      armor: clampInt(userState.armor, 0, 100000, 0),
      weapon_name: String(userState.weapon_name || 'Pixel Blade').slice(0, 60),
      weapon_atk: clampInt(userState.weapon_atk, 0, 100000, 0),
      gold: clampInt(userState.gold, 0, 100000000, 0),
      potions: clampInt(userState.potions, 0, 100000, 0),
      cleared_stages: normalizeClearedStages(userState.clearedStages),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('pixelcoder_profiles')
      .update(payload)
      .eq('username', userState.username)

    if (error) {
      console.warn('Sync failed:', error.message)
    }
  } catch (err) {
    console.warn('Sync failed:', err instanceof Error ? err.message : err)
  }
}
