const SOUND_MUTED_KEY = 'balls_sound_muted';

export function loadSoundMutedPreference() {
  try {
    const stored = localStorage.getItem(SOUND_MUTED_KEY);
    if (stored === null) return true;
    return stored === 'true';
  } catch {
    return true;
  }
}

export function saveSoundMutedPreference(muted) {
  try {
    localStorage.setItem(SOUND_MUTED_KEY, String(muted));
  } catch {
    // ignore
  }
}
