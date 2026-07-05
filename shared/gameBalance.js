/** Shared game balance — imported by frontend + reward server. */

export const MAX_CLICKS_PER_SECOND = 12;
export const MAX_CLICK_MULTIPLIER = 10;
export const CPS_SCALE_PER_LEVEL = 0.12;
export const UPGRADE_COST_MULTIPLIER = 1.22;

export const MILESTONE_LIST = [
  { target: 500, label: '5K MCAP (Jeet Clearance)', badge: 'Jeet Buster' },
  { target: 5000, label: '25K MCAP (Telegram Active)', badge: 'Degen Shiller' },
  { target: 25000, label: '100K MCAP (Pumpfun Graduation)', badge: 'Vanguard Dev' },
  { target: 100000, label: '1M MCAP (Raydium Migration)', badge: 'Trench Master' },
  { target: 400000, label: '10M MCAP (CEX Listing)', badge: 'High Roller' },
  { target: 2500000, label: '100M MCAP (Solana Valhalla)', badge: 'The Bull Summoner' },
];

export const MILESTONE_TARGETS = MILESTONE_LIST.map((m) => m.target);

export const DEFAULT_UPGRADES = [
  { id: 1, name: 'Telegram Shiller', cost: 75, cpsBonus: 0.15, clickBonus: 0, multiplier: 0, desc: 'Spams green candles in chat groups.' },
  { id: 2, name: 'Twitter Bot Army', cost: 400, cpsBonus: 0.55, clickBonus: 0, multiplier: 0, desc: 'Tagging Ansem & influencers on X.' },
  { id: 3, name: 'Call Ansem', cost: 2000, cpsBonus: 2.0, clickBonus: 1, multiplier: 0, desc: 'Get a shill tweet from Ansem.' },
  { id: 4, name: 'Raydium Whale Pump', cost: 10000, cpsBonus: 5.5, clickBonus: 0, multiplier: 0, desc: 'Migrate liquidity pool & grab DEX #1.' },
];

export const MIN_HARVEST_USD = 8;
export const HARVEST_COOLDOWN_MS = 60 * 60 * 1000;
export const HARVEST_UNLOCK_MILESTONE = 2;
export const MAX_HARVEST_CLICKS_PER_5S = 3;

export const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;

export const STAGE_MULTIPLIERS = [1, 1.25, 1.5, 1.85, 2.2, 2.6, 3];
export const CPS_REWARD_RATE = 0.00015;
export const MAX_CPS_BONUS = 0.018;
export const HOLD_REWARD_RATE = 0.0004;
export const MAX_HOLD_BONUS = 0.003;
export const MAX_ACCRUAL_BY_STAGE = [0.008, 0.013, 0.022, 0.035, 0.048, 0.062, 0.078];
export const REWARD_BASE = 0.001;

export const VETERAN_RANKS = [
  'Fresh Jeet',
  'Trench Rat',
  'Pumpfun Survivor',
  'Graduated Degen',
  'Raydium Chad',
  'CEX Whale',
  'Valhalla OG',
];

export const STAGE_MAX_USD_PER_HOUR = [11, 18, 30, 48, 66, 85, 105];
export const ABSOLUTE_MAX_CLAIM_USD = 350;

/** Small USD/sec bonus per completed social task (one-time each). */
export const SOCIAL_TASK_BONUS_PER_SEC = 0.000025;
export const MAX_SOCIAL_TASKS = 2;

export const SOCIAL_TASK_DEFS = [
  {
    id: 'post_ca',
    title: 'Post the $BALLS contract on X',
    description: 'Post the contract address on X, then paste the post link to verify.',
    bonusLabel: '+$0.000025/sec',
  },
  {
    id: 'post_shill',
    title: 'Shill BULL BALLS on X',
    description: 'Share bullballs.fun on X, then paste the post link to verify.',
    bonusLabel: '+$0.000025/sec',
  },
];

export function getSocialBonusRate(completedTaskIds = []) {
  if (!Array.isArray(completedTaskIds)) return 0;
  const completed = new Set(completedTaskIds);
  const count = SOCIAL_TASK_DEFS.filter((task) => completed.has(task.id)).length;
  return Math.min(count * SOCIAL_TASK_BONUS_PER_SEC, SOCIAL_TASK_DEFS.length * SOCIAL_TASK_BONUS_PER_SEC);
}

export const PERKS = [
  { rank: 'Fresh Jeet', mult: '1x', unlock: 'Stage 1' },
  { rank: 'Trench Rat', mult: '1.25x', unlock: 'Stage 2' },
  { rank: 'Pumpfun Survivor', mult: '1.5x', unlock: 'Stage 3' },
  { rank: 'Graduated Degen', mult: '1.85x', unlock: 'Stage 4' },
  { rank: 'Raydium Chad', mult: '2.2x', unlock: 'Stage 5' },
  { rank: 'CEX Whale', mult: '2.6x', unlock: 'Stage 6' },
  { rank: 'Valhalla OG', mult: '3x', unlock: 'Endgame' },
];

export function getCpsGain(upgrade) {
  return upgrade.cpsBonus * (1 + upgrade.multiplier * CPS_SCALE_PER_LEVEL);
}

export function getRewardBreakdown(cps, milestoneIdx, score, socialBonus = 0) {
  const stageIdx = Math.min(milestoneIdx, STAGE_MULTIPLIERS.length - 1);
  const stageMult = STAGE_MULTIPLIERS[stageIdx];
  const cpsBonus = Math.min(cps * CPS_REWARD_RATE, MAX_CPS_BONUS);
  const holdingBonus = Math.min(
    Math.log10(Math.max(score, 1)) * HOLD_REWARD_RATE,
    MAX_HOLD_BONUS
  );
  const subtotal = REWARD_BASE + cpsBonus + holdingBonus;
  const uncapped = subtotal * stageMult + Math.max(0, socialBonus);
  const cap = MAX_ACCRUAL_BY_STAGE[stageIdx];
  const total = Math.min(uncapped, cap);

  return {
    base: REWARD_BASE,
    stageMult,
    cpsBonus,
    holdingBonus,
    socialBonus: Math.max(0, socialBonus),
    subtotal,
    total,
    capped: uncapped > cap,
    rank: VETERAN_RANKS[Math.min(milestoneIdx, VETERAN_RANKS.length - 1)],
  };
}

export function getAccrualRate(cps, milestoneIdx, score, socialBonus = 0) {
  return getRewardBreakdown(cps, milestoneIdx, score, socialBonus).total;
}
