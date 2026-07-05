import { SOCIAL_TASK_DEFS, getSocialBonusRate } from '../shared/gameBalance.js';

const STORAGE_KEY = 'balls_social_tasks_v1';

function defaultState() {
  return { completed: {} };
}

export function loadSocialTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const completed =
      parsed?.completed && typeof parsed.completed === 'object' ? parsed.completed : {};
    return { completed };
  } catch {
    return defaultState();
  }
}

export function saveSocialTasks(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode
  }
}

export function getCompletedTaskIds(state = loadSocialTasks()) {
  return SOCIAL_TASK_DEFS.filter((task) => Boolean(state.completed[task.id])).map((task) => task.id);
}

export function getSocialBonusFromStorage() {
  return getSocialBonusRate(getCompletedTaskIds());
}

export function isValidXPostUrl(value) {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, '');
    if (host !== 'x.com' && host !== 'twitter.com') return false;

    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 3 || parts[1] !== 'status') return false;
    return /^\d+$/.test(parts[2]);
  } catch {
    return false;
  }
}

export function completeSocialTask(taskId, postUrl) {
  if (!SOCIAL_TASK_DEFS.some((task) => task.id === taskId)) {
    return { ok: false, error: 'Unknown task.' };
  }

  if (!isValidXPostUrl(postUrl)) {
    return { ok: false, error: 'Paste a valid X post link (x.com/user/status/123...).' };
  }

  const state = loadSocialTasks();
  if (state.completed[taskId]) {
    return { ok: false, error: 'Task already verified.' };
  }

  state.completed[taskId] = {
    url: postUrl.trim(),
    completedAt: Date.now(),
  };
  saveSocialTasks(state);

  return { ok: true, bonusRate: getSocialBonusRate(getCompletedTaskIds(state)) };
}

export function clearSocialTasks() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export { SOCIAL_TASK_DEFS };
