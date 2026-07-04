import {
  ABSOLUTE_MAX_CLAIM_USD,
  HARVEST_COOLDOWN_MS,
  HARVEST_UNLOCK_MILESTONE,
  MIN_HARVEST_USD,
  SOLANA_ADDRESS_RE,
  STAGE_MAX_USD_PER_HOUR,
} from './constants.js';
import { getPlayerRecord } from './store.js';

function clampStageIdx(milestoneIdx) {
  if (typeof milestoneIdx !== 'number' || !Number.isFinite(milestoneIdx)) return 0;
  return Math.min(Math.max(Math.floor(milestoneIdx), 0), STAGE_MAX_USD_PER_HOUR.length - 1);
}

export function maxAllowedUsd(milestoneIdx, hoursElapsed) {
  const stageIdx = clampStageIdx(milestoneIdx);
  const hourlyCap = STAGE_MAX_USD_PER_HOUR[stageIdx];
  const maxAccrualHours = HARVEST_COOLDOWN_MS / (60 * 60 * 1000);
  const hours = Math.min(Math.max(hoursElapsed, 0), maxAccrualHours);
  return Math.min(Math.max(MIN_HARVEST_USD, hourlyCap * Math.max(hours, 1)), ABSOLUTE_MAX_CLAIM_USD);
}

export function validateWithdrawRequest(body) {
  const playerId = typeof body.playerId === 'string' ? body.playerId.trim() : '';
  const wallet = typeof body.wallet === 'string' ? body.wallet.trim() : '';
  const usd = body.usd;
  const sol = body.sol;
  const solPrice = body.solPrice;
  const milestoneIdx = body.milestoneIdx;
  const score = body.score;
  const cps = body.cps;

  if (!playerId || playerId.length < 8 || playerId.length > 64) {
    throw new Error('Invalid player session.');
  }

  if (!SOLANA_ADDRESS_RE.test(wallet)) {
    throw new Error('Invalid Solana wallet address.');
  }

  if (typeof usd !== 'number' || !Number.isFinite(usd) || usd < MIN_HARVEST_USD) {
    throw new Error(`Minimum withdraw is $${MIN_HARVEST_USD.toFixed(2)}.`);
  }

  if (typeof sol !== 'number' || !Number.isFinite(sol) || sol <= 0) {
    throw new Error('Invalid SOL amount.');
  }

  if (typeof solPrice !== 'number' || !Number.isFinite(solPrice) || solPrice <= 0) {
    throw new Error('Invalid SOL price.');
  }

  if (typeof milestoneIdx !== 'number' || milestoneIdx < HARVEST_UNLOCK_MILESTONE) {
    throw new Error('Withdraw unlocks at Stage 3 (Pumpfun Graduation).');
  }

  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
    throw new Error('Invalid game score.');
  }

  if (typeof cps !== 'number' || !Number.isFinite(cps) || cps < 0) {
    throw new Error('Invalid CPS value.');
  }

  const player = getPlayerRecord(playerId);
  const now = Date.now();

  if (player?.lastClaimAt && now - player.lastClaimAt < HARVEST_COOLDOWN_MS) {
    throw new Error('Withdraw cooldown active. Try again later.');
  }

  const maxAccrualHours = HARVEST_COOLDOWN_MS / (60 * 60 * 1000);
  const hoursElapsed = player?.lastClaimAt
    ? (now - player.lastClaimAt) / (60 * 60 * 1000)
    : maxAccrualHours;

  const allowedUsd = maxAllowedUsd(milestoneIdx, hoursElapsed);
  let reviewRequired = false;
  let reviewReason = null;

  if (usd > allowedUsd) {
    reviewRequired = true;
    reviewReason = `Claim $${usd.toFixed(2)} exceeds auto-limit $${allowedUsd.toFixed(2)} for stage ${milestoneIdx + 1}.`;
  }

  if (usd > ABSOLUTE_MAX_CLAIM_USD) {
    throw new Error('Claim amount exceeds maximum allowed payout.');
  }

  const expectedSol = usd / solPrice;
  if (Math.abs(expectedSol - sol) / expectedSol > 0.05) {
    throw new Error('SOL amount does not match USD quote.');
  }

  return {
    playerId,
    wallet,
    usd,
    sol,
    solPrice,
    milestoneIdx,
    score,
    cps,
    reviewRequired,
    reviewReason,
  };
}
