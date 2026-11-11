// First-run onboarding flag, kept out of the HowToPlay component so the
// tutorial itself can be lazy-loaded without pulling it into the main bundle.

export const HOWTO_STORAGE_KEY = 'pixelcoder_howto_seen_v1';

/** True when the player already finished/skipped the onboarding with "Don't show again". */
export function hasSeenHowToPlay() {
  try {
    return window.localStorage.getItem(HOWTO_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Persist that the player does not want to see the onboarding again. */
export function markHowToPlaySeen() {
  try {
    window.localStorage.setItem(HOWTO_STORAGE_KEY, '1');
  } catch {
    /* storage unavailable (private mode) — silently ignore */
  }
}

/** Clear the persisted flag (useful for "Replay tutorial" actions). */
export function resetHowToPlaySeen() {
  try {
    window.localStorage.removeItem(HOWTO_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Per-tab guard so onboarding does not reopen on every navigation. */
export const ONBOARD_SESSION_KEY = 'pixelcoder_howto_shown_session';

export function wasOnboardingShownThisSession() {
  try {
    return window.sessionStorage.getItem(ONBOARD_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function markOnboardingShownThisSession() {
  try {
    window.sessionStorage.setItem(ONBOARD_SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearOnboardingSession() {
  try {
    window.sessionStorage.removeItem(ONBOARD_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
