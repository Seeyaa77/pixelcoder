import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eqqelabmsvwmvwrpamjc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

const STORAGE_KEY = 'pixelcoder_session_v2'

export const getStoredSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Storage read failed:', e)
  }
  return {
    isLoggedIn: false,
    username: 'Guest_Knight',
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
    clearedStages: {
      python: [1],
      cpp: [1],
      javascript: [1]
    }
  }
}

export const saveStoredSession = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Storage save failed:', e)
  }
}

// Fetch live leaderboard directly from Supabase
export const fetchLiveLeaderboard = async () => {
  try {
    const { data, error } = await supabase
      .from('pixelcoder_profiles')
      .select('id, username, total_xp, current_streak, weapon_name, armor, role')
      .order('total_xp', { ascending: false })
      .limit(20)

    if (error) {
      console.warn('Supabase leaderboard fetch warning:', error.message)
      return null
    }
    return data
  } catch (err) {
    console.warn('Network error fetching leaderboard:', err)
    return null
  }
}

// Register user to live Supabase backend
export const registerUserBackend = async (username, email, password) => {
  try {
    const cleanUsername = username.trim()
    const cleanEmail = email.trim().toLowerCase()

    // Check if username already exists
    const { data: existing } = await supabase
      .from('pixelcoder_profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle()

    if (existing) {
      return { success: false, error: 'Username already taken. Please pick another!' }
    }

    const newProfile = {
      username: cleanUsername,
      email: cleanEmail,
      password_hash: password, // Note: In production, hash via edge function
      total_xp: 0,
      current_streak: 1,
      hp: 100,
      max_hp: 100,
      armor: 20,
      weapon_name: 'Pixel Blade',
      weapon_atk: 25,
      gold: 150,
      potions: 3,
      role: 'user',
      cleared_stages: { python: [1], cpp: [1], javascript: [1] }
    }

    const { data, error } = await supabase
      .from('pixelcoder_profiles')
      .insert([newProfile])
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { 
      success: true, 
      user: {
        isLoggedIn: true,
        ...data,
        clearedStages: data.cleared_stages || { python: [1], cpp: [1], javascript: [1] }
      } 
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Login user from live Supabase backend
export const loginUserBackend = async (username, password) => {
  try {
    const cleanUsername = username.trim()
    
    const { data, error } = await supabase
      .from('pixelcoder_profiles')
      .select('*')
      .eq('username', cleanUsername)
      .maybeSingle()

    if (error || !data) {
      return { success: false, error: 'User not found. Check username or register first!' }
    }

    if (data.password_hash && data.password_hash !== password) {
      return { success: false, error: 'Incorrect password!' }
    }

    return {
      success: true,
      user: {
        isLoggedIn: true,
        ...data,
        clearedStages: data.cleared_stages || { python: [1], cpp: [1], javascript: [1] }
      }
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// Sync progress to Supabase
export const syncProgressToBackend = async (userState) => {
  if (!userState.isLoggedIn || !userState.username || userState.username.startsWith('Guest')) {
    return
  }

  try {
    await supabase
      .from('pixelcoder_profiles')
      .update({
        total_xp: userState.total_xp,
        current_streak: userState.current_streak,
        hp: userState.hp,
        armor: userState.armor,
        weapon_name: userState.weapon_name,
        weapon_atk: userState.weapon_atk,
        gold: userState.gold,
        potions: userState.potions,
        cleared_stages: userState.clearedStages,
        updated_at: new Date().toISOString()
      })
      .eq('username', userState.username)
  } catch (err) {
    console.warn('Sync failed:', err)
  }
}
