import { appConfig } from './config';

function getApiBase() {
  if (appConfig.rewardApi.disabled) return null;
  return appConfig.rewardApi.baseUrl || '/api';
}

export function isRewardApiEnabled() {
  return !appConfig.rewardApi.demoMode && getApiBase() !== null;
}

export function isRewardDemoMode() {
  return appConfig.rewardApi.demoMode;
}

export async function submitWithdrawClaim(payload) {
  if (isRewardDemoMode()) {
    return {
      ok: true,
      claimId: `demo-${Date.now()}`,
      status: 'queued',
      reviewRequired: false,
      message: 'Demo mode — claim recorded locally only.',
      demo: true,
    };
  }

  const base = getApiBase();
  if (!base) {
    throw new Error('Reward API is disabled.');
  }

  const res = await fetch(`${base.replace(/\/$/, '')}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12_000),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Withdraw request failed.');
  }

  return data;
}

export async function fetchWithdrawHistory(playerId) {
  if (isRewardDemoMode()) return [];

  const base = getApiBase();
  if (!base) return [];

  const res = await fetch(`${base.replace(/\/$/, '')}/withdraw/history/${encodeURIComponent(playerId)}`, {
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  return Array.isArray(data.claims) ? data.claims : [];
}
