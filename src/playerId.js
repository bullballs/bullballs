const PLAYER_ID_KEY = 'balls_player_id';

function createPlayerId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getPlayerId() {
  try {
    const existing = localStorage.getItem(PLAYER_ID_KEY);
    if (existing) return existing;
    const next = createPlayerId();
    localStorage.setItem(PLAYER_ID_KEY, next);
    return next;
  } catch {
    return createPlayerId();
  }
}
