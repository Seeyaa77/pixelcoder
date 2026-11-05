import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-pixelcoder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'ey-demo-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Local Storage Progress Persistence Fallback
const STORAGE_KEY = 'pixelcoder_progress_v1'

export const loadLocalProgress = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Storage read error:', e)
  }
  return {
    xp: 0,
    streak: 1,
    role: 'user', // 'user' or 'admin'
    username: 'PixelKnight',
    clearedStages: {
      python: [1],
      cpp: [1],
      javascript: [1]
    }
  }
}

export const saveLocalProgress = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Storage save error:', e)
  }
}
