import {
  CPS_SCALE_PER_LEVEL,
  DEFAULT_UPGRADES,
  MAX_CLICK_MULTIPLIER,
  MAX_OFFLINE_MS,
  MILESTONE_TARGETS,
  getAccrualRate,
} from '../shared/gameBalance.js';

const SAVE_VERSION = 1;
const STORAGE_KEY = 'balls_game_save_v1';

export { DEFAULT_UPGRADES, MILESTONE_TARGETS };

function clampNumber(value, min, max, fallback) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

export function computeCpsFromUpgrades(upgrades) {
  return upgrades.reduce((sum, upgrade) => {
    let gained = 0;
    for (let level = 0; level < upgrade.multiplier; level++) {
      gained += upgrade.cpsBonus * (1 + level * CPS_SCALE_PER_LEVEL);
    }
    return sum + gained;
  }, 0);
}

export function computeClickMultiplierFromUpgrades(upgrades) {
  const bonus = upgrades.reduce((sum, u) => sum + u.multiplier * u.clickBonus, 0);
  return Math.min(1 + bonus, MAX_CLICK_MULTIPLIER);
}

function mergeUpgrades(saved) {
  return DEFAULT_UPGRADES.map((def) => {
    const row = Array.isArray(saved) ? saved.find((u) => u.id === def.id) : null;
    if (!row) return { ...def };

    return {
      ...def,
      cost: clampNumber(row.cost, def.cost, Number.MAX_SAFE_INTEGER, def.cost),
      multiplier: clampNumber(row.multiplier, 0, 999, 0),
    };
  });
}

function mergeVault(saved) {
  const vault = saved && typeof saved === 'object' ? saved : {};
  const harvestCooldownEndsAt =
    typeof vault.harvestCooldownEndsAt === 'number' && vault.harvestCooldownEndsAt > 0
      ? vault.harvestCooldownEndsAt
      : null;

  return {
    pendingUsd: clampNumber(vault.pendingUsd, 0, 1_000_000, 0),
    harvestCooldownEndsAt,
    cooldownStarted: Boolean(vault.cooldownStarted),
  };
}

export function syncMilestoneIdx(score, milestoneIdx) {
  let idx = clampNumber(milestoneIdx, 0, MILESTONE_TARGETS.length, 0);
  while (idx < MILESTONE_TARGETS.length && score >= MILESTONE_TARGETS[idx]) {
    idx++;
  }
  return idx;
}

export function createDefaultGameState() {
  return {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    score: 0,
    cps: 0,
    clickMultiplier: 1,
    milestoneIdx: 0,
    upgrades: DEFAULT_UPGRADES.map((u) => ({ ...u })),
    vault: {
      pendingUsd: 0,
      harvestCooldownEndsAt: null,
      cooldownStarted: false,
    },
    offlineMs: 0,
    offlineBallGain: 0,
    offlineUsdGain: 0,
  };
}

export function loadGameSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultGameState();

    const parsed = JSON.parse(raw);
    if (parsed?.version !== SAVE_VERSION) return createDefaultGameState();

    const upgrades = mergeUpgrades(parsed.upgrades);
    const cps = computeCpsFromUpgrades(upgrades);
    const clickMultiplier = computeClickMultiplierFromUpgrades(upgrades);
    let score = clampNumber(parsed.score, 0, Number.MAX_SAFE_INTEGER, 0);
    const vault = mergeVault(parsed.vault);
    let milestoneIdx = syncMilestoneIdx(score, parsed.milestoneIdx);

    const savedAt = typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now();
    const offlineMs = Math.min(Math.max(0, Date.now() - savedAt), MAX_OFFLINE_MS);

    let offlineBallGain = 0;
    let offlineUsdGain = 0;

    if (offlineMs > 0) {
      const offlineSec = offlineMs / 1000;
      offlineBallGain = cps * offlineSec;
      const accrualRate = getAccrualRate(cps, milestoneIdx, score);
      offlineUsdGain = accrualRate * offlineSec;
      score += offlineBallGain;
      milestoneIdx = syncMilestoneIdx(score, milestoneIdx);
      vault.pendingUsd += offlineUsdGain;
    }

    return {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      score,
      cps,
      clickMultiplier,
      milestoneIdx,
      upgrades,
      vault,
      offlineMs,
      offlineBallGain,
      offlineUsdGain,
    };
  } catch {
    return createDefaultGameState();
  }
}

export function saveGameSave(state) {
  try {
    const payload = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      score: state.score,
      cps: state.cps,
      clickMultiplier: state.clickMultiplier,
      milestoneIdx: state.milestoneIdx,
      upgrades: state.upgrades.map(({ id, cost, multiplier }) => ({ id, cost, multiplier })),
      vault: {
        pendingUsd: state.vault.pendingUsd,
        harvestCooldownEndsAt: state.vault.harvestCooldownEndsAt,
        cooldownStarted: state.vault.cooldownStarted,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode failures
  }
}

export function clearGameSave() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
