const HISTORY_KEY = 'balls_withdraw_history';
const MAX_LOCAL_HISTORY = 20;

export function loadLocalWithdrawHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendLocalWithdrawHistory(entry) {
  try {
    const next = [entry, ...loadLocalWithdrawHistory()].slice(0, MAX_LOCAL_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch {
    return loadLocalWithdrawHistory();
  }
}

export function mergeWithdrawHistory(localEntries, remoteEntries) {
  const map = new Map();

  for (const entry of [...remoteEntries, ...localEntries]) {
    const key = entry.id || `${entry.createdAt}-${entry.wallet}-${entry.usd}`;
    if (!map.has(key)) map.set(key, entry);
  }

  return [...map.values()].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, MAX_LOCAL_HISTORY);
}
