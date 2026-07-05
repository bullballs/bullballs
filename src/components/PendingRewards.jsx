import React, { useState, useEffect, useRef } from 'react';
import { audio } from './AudioEngine';
import { Coins, Lock, Copy, Check, ShieldAlert, History } from 'lucide-react';
import confetti from 'canvas-confetti';
import WithdrawModal from './WithdrawModal';
import { appConfig } from '../config';
import { getPlayerId } from '../playerId';
import { fetchWithdrawHistory, isRewardDemoMode, submitWithdrawClaim } from '../rewardApi';
import { appendLocalWithdrawHistory, loadLocalWithdrawHistory, mergeWithdrawHistory } from '../withdrawHistory';
import { formatWalletAddress, getOrCreateBurnerWallet } from '../burnerWallet';
import {
  HARVEST_COOLDOWN_MS,
  HARVEST_UNLOCK_MILESTONE,
  MAX_HARVEST_CLICKS_PER_5S,
  MIN_HARVEST_USD,
  getRewardBreakdown,
} from '../../shared/gameBalance.js';

export { getAccrualRate } from '../../shared/gameBalance.js';

const SOL_MINT = appConfig.jupiter.solMint;
const JUP_PRICE_URL = appConfig.jupiter.priceUrl;
const FALLBACK_SOL_PRICE = 80.32;
const SOL_PRICE_POLL_MS = 30_000;

function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

async function fetchSolPrice() {
  const headers = {};
  if (appConfig.jupiter.apiKey) {
    headers['x-api-key'] = appConfig.jupiter.apiKey;
  }

  const res = await fetch(JUP_PRICE_URL, {
    headers,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error('Jupiter price fetch failed');

  const data = await res.json();
  const price = data?.[SOL_MINT]?.usdPrice;
  if (typeof price !== 'number' || price <= 0) throw new Error('Invalid Jupiter price');
  return price;
}

const SolanaIcon = ({ className }) => (
  <svg viewBox="0 0 397 311" fill="currentColor" className={className}>
    <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" />
    <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" />
    <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
  </svg>
);

export default function PendingRewards({ milestoneIdx, cps, score, vault, onVaultChange, socialBonus = 0 }) {
  const { pendingUsd, harvestCooldownEndsAt, cooldownStarted } = vault;
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const [spamWarning, setSpamWarning] = useState(false);
  const [justHarvested, setJustHarvested] = useState(false);
  const [solPrice, setSolPrice] = useState(FALLBACK_SOL_PRICE);
  const [solPriceLive, setSolPriceLive] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawSummary, setWithdrawSummary] = useState(null);
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawSubmitError, setWithdrawSubmitError] = useState('');
  const [withdrawHistory, setWithdrawHistory] = useState(() => loadLocalWithdrawHistory());
  const [burnerAddress, setBurnerAddress] = useState(() => getOrCreateBurnerWallet().publicKey);
  const playerIdRef = useRef(getPlayerId());
  const harvestClickTimesRef = useRef([]);
  const cooldownStartedRef = useRef(cooldownStarted);

  const setPendingUsd = (updater) => {
    onVaultChange((prev) => ({
      ...prev,
      pendingUsd: typeof updater === 'function' ? updater(prev.pendingUsd) : updater,
    }));
  };

  const setHarvestCooldownEndsAt = (value) => {
    onVaultChange((prev) => ({
      ...prev,
      harvestCooldownEndsAt: value,
    }));
  };

  const markCooldownStarted = () => {
    cooldownStartedRef.current = true;
    onVaultChange((prev) => ({ ...prev, cooldownStarted: true }));
  };

  const isWithdrawUnlocked = milestoneIdx >= HARVEST_UNLOCK_MILESTONE;
  const breakdown = getRewardBreakdown(cps, milestoneIdx, score, socialBonus);
  const usdPerSec = breakdown.total;
  const pendingSol = pendingUsd / solPrice;
  const cooldownRemaining = harvestCooldownEndsAt ? Math.max(0, harvestCooldownEndsAt - now) : 0;
  const cooldownReady = isWithdrawUnlocked && cooldownRemaining === 0;
  const meetsMinimum = pendingUsd >= MIN_HARVEST_USD;
  const canHarvest = isWithdrawUnlocked && cooldownReady && meetsMinimum && !spamWarning;

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      const remote = await fetchWithdrawHistory(playerIdRef.current);
      if (!cancelled) {
        setWithdrawHistory(mergeWithdrawHistory(loadLocalWithdrawHistory(), remote));
      }
    };

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPrice = async () => {
      try {
        const price = await fetchSolPrice();
        if (!cancelled) {
          setSolPrice(price);
          setSolPriceLive(true);
        }
      } catch {
        if (!cancelled) setSolPriceLive(false);
      }
    };

    loadPrice();
    const poll = setInterval(loadPrice, SOL_PRICE_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    const accrue = setInterval(() => {
      setPendingUsd(prev => prev + usdPerSec / 10);
    }, 100);
    return () => clearInterval(accrue);
  }, [usdPerSec]);

  useEffect(() => {
    if (isWithdrawUnlocked && !cooldownStartedRef.current) {
      markCooldownStarted();
      setHarvestCooldownEndsAt(Date.now() + HARVEST_COOLDOWN_MS);
    }
  }, [isWithdrawUnlocked]);

  const handleCopySol = () => {
    navigator.clipboard.writeText(pendingSol.toFixed(5));
    setCopied(true);
    audio.playCoin();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWithdraw = () => {
    const clickNow = Date.now();
    harvestClickTimesRef.current = harvestClickTimesRef.current.filter(t => clickNow - t < 5000);

    if (harvestClickTimesRef.current.length >= MAX_HARVEST_CLICKS_PER_5S) {
      setSpamWarning(true);
      audio.playExplosion();
      setTimeout(() => setSpamWarning(false), 4000);
      return;
    }

    harvestClickTimesRef.current.push(clickNow);
    setWithdrawSubmitError('');
    setBurnerAddress(getOrCreateBurnerWallet().publicKey);
    audio.playTap();
    setShowWithdrawModal(true);
  };

  const handleConfirmWithdraw = async (walletAddress) => {
    if (!canHarvest || isSubmittingWithdraw) {
      audio.playTap();
      return;
    }

    const withdrawnUsd = pendingUsd;
    const withdrawnSol = pendingSol;

    setIsSubmittingWithdraw(true);
    setWithdrawSubmitError('');

    try {
      const result = await submitWithdrawClaim({
        playerId: playerIdRef.current,
        wallet: walletAddress,
        usd: withdrawnUsd,
        sol: withdrawnSol,
        solPrice,
        milestoneIdx,
        score,
        cps,
      });

      const historyEntry = {
        id: result.claimId,
        wallet: walletAddress,
        usd: withdrawnUsd,
        sol: withdrawnSol,
        status: result.status || 'queued',
        reviewRequired: Boolean(result.reviewRequired),
        createdAt: Date.now(),
        demo: Boolean(result.demo),
      };

      setWithdrawHistory(appendLocalWithdrawHistory(historyEntry));

      audio.playPowerup();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#39ff14', '#00f0ff', '#ff007f'],
      });

      setWithdrawSummary({
        usd: withdrawnUsd,
        sol: withdrawnSol,
        wallet: walletAddress,
        claimId: result.claimId,
        status: result.status,
        message: result.message,
        demo: Boolean(result.demo),
      });
      setPendingUsd(0);
      setHarvestCooldownEndsAt(Date.now() + HARVEST_COOLDOWN_MS);
      setJustHarvested(true);
      setShowWithdrawModal(false);
      setTimeout(() => {
        setJustHarvested(false);
        setWithdrawSummary(null);
      }, 5000);
    } catch (error) {
      setWithdrawSubmitError(error.message || 'Withdraw failed. Try again.');
      audio.playExplosion();
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  return (
    <div className="retro-panel retro-panel-blue bg-[#0a0a0c]/95 border-4 border-gray-700 rounded p-4 md:p-5 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-retro-blue shrink-0" />
          <span className="font-arcade text-[10px] text-gray-500 uppercase tracking-wider">
            Pending Hopium Rewards
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/60 border border-gray-800 px-2 py-1 rounded">
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${solPriceLive ? 'bg-retro-green' : 'bg-yellow-500'}`}></span>
          <span className="text-[8px] font-arcade text-retro-green">
            {solPriceLive ? 'JUP SOL FEED' : 'JUP FEED (CACHED)'}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
        <div>
          <div className="font-arcade text-xl md:text-2xl text-retro-green retro-glow-green">
            ${pendingUsd.toFixed(2)} USD
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-mono text-[10px] text-gray-400">
              ≈ {pendingSol.toFixed(5)} SOL · @ ${solPrice.toFixed(2)}/SOL
            </span>
            <button
              onClick={handleCopySol}
              className="text-gray-500 hover:text-retro-blue transition-colors"
              title="Copy SOL amount"
            >
              {copied ? <Check className="w-3 h-3 text-retro-green" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[8px] font-arcade text-retro-blue bg-retro-blue/10 border border-retro-blue/30 px-2 py-0.5 rounded">
              REWARDS VAULT
            </span>
            <span className="text-[8px] font-arcade text-gray-500 bg-black/40 border border-gray-800 px-2 py-0.5 rounded">
              {isRewardDemoMode() ? 'DEMO PAYOUT' : 'PAYOUT QUEUE'}
            </span>
            {burnerAddress && (
              <span className="text-[8px] font-mono text-gray-500" title={burnerAddress}>
                BURNER {formatWalletAddress(burnerAddress)}
              </span>
            )}
            {!isWithdrawUnlocked && (
              <span className="text-[8px] font-arcade text-retro-pink flex items-center gap-1">
                <Lock className="w-3 h-3" /> WITHDRAW LOCKED
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] font-arcade text-gray-500 uppercase">Accrual Rate</span>
          <div className="font-arcade text-xs text-retro-blue mt-1">
            +${usdPerSec.toFixed(4)}/sec
          </div>
          <div className="text-[8px] font-arcade text-retro-pink mt-1">
            {breakdown.rank} · {breakdown.stageMult}x
            {breakdown.capped && (
              <span className="text-yellow-500/80"> · RATE CAP</span>
            )}
          </div>
        </div>
      </div>

      {/* Rate breakdown — shows why early players earn more */}
      <div className={`grid gap-2 mb-4 border border-gray-800 bg-black/40 p-2 rounded ${breakdown.socialBonus > 0 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
        <div className="text-center">
          <div className="text-[7px] font-arcade text-gray-600 uppercase">Base</div>
          <div className="text-[9px] font-mono text-gray-400">${breakdown.base.toFixed(4)}</div>
        </div>
        <div className="text-center">
          <div className="text-[7px] font-arcade text-gray-600 uppercase">Stage ({breakdown.stageMult}x)</div>
          <div className="text-[9px] font-mono text-retro-pink">×{breakdown.stageMult}</div>
        </div>
        <div className="text-center">
          <div className="text-[7px] font-arcade text-gray-600 uppercase">CPS Boost</div>
          <div className="text-[9px] font-mono text-retro-blue">+${breakdown.cpsBonus.toFixed(4)}</div>
        </div>
        <div className="text-center">
          <div className="text-[7px] font-arcade text-gray-600 uppercase">Hold Bonus</div>
          <div className="text-[9px] font-mono text-retro-green">+${breakdown.holdingBonus.toFixed(4)}</div>
        </div>
        {breakdown.socialBonus > 0 && (
          <div className="text-center">
            <div className="text-[7px] font-arcade text-gray-600 uppercase">Shill Boost</div>
            <div className="text-[9px] font-mono text-retro-pink">+${breakdown.socialBonus.toFixed(5)}</div>
          </div>
        )}
      </div>

      {justHarvested && withdrawSummary && (
        <div className="mb-3 bg-retro-green/10 border-2 border-retro-green px-3 py-2 text-[9px] font-arcade text-retro-green animate-pulse">
          ★ WITHDRAW QUEUED — ${withdrawSummary.usd.toFixed(2)} ({withdrawSummary.sol.toFixed(5)} SOL)
          {withdrawSummary.claimId && (
            <span> · ID {withdrawSummary.claimId.slice(0, 8)}...</span>
          )}
          {' '}→ {withdrawSummary.wallet.slice(0, 4)}...{withdrawSummary.wallet.slice(-4)}
          {withdrawSummary.demo && <span className="text-yellow-400"> · DEMO</span>}
        </div>
      )}

      {spamWarning && (
        <div className="mb-3 bg-retro-red/10 border-2 border-retro-red px-3 py-2 text-[9px] font-arcade text-retro-red flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          SPAM DETECTED — DO NOT SPAM WITHDRAW OR YOU WILL BE BLACKLISTED!
        </div>
      )}

      <button
        onClick={handleOpenWithdraw}
        disabled={!isWithdrawUnlocked}
        className={`retro-btn w-full text-[10px] py-3 flex items-center justify-center gap-2 mb-4 ${
          isWithdrawUnlocked
            ? canHarvest
              ? 'btn-green'
              : 'btn-blue opacity-80 !translate-y-0'
            : 'opacity-50 cursor-not-allowed !translate-y-0'
        }`}
      >
        {!isWithdrawUnlocked ? (
          <>
            <Lock className="w-4 h-4" />
            <span>LOCKED — REACH STAGE 3 TO WITHDRAW</span>
          </>
        ) : (
          <>
            <SolanaIcon className="w-4 h-4" />
            <span>
              {canHarvest
                ? `WITHDRAW $${pendingUsd.toFixed(2)}`
                : `WITHDRAW $${pendingUsd.toFixed(2)} (VIEW STATUS)`}
            </span>
          </>
        )}
      </button>

      <WithdrawModal
        open={showWithdrawModal}
        onClose={() => {
          if (!isSubmittingWithdraw) setShowWithdrawModal(false);
        }}
        pendingUsd={pendingUsd}
        pendingSol={pendingSol}
        solPrice={solPrice}
        canWithdraw={canHarvest}
        isUnlocked={isWithdrawUnlocked}
        cooldownRemaining={cooldownRemaining}
        meetsMinimum={meetsMinimum}
        isSubmitting={isSubmittingWithdraw}
        submitError={withdrawSubmitError}
        onConfirm={handleConfirmWithdraw}
      />

      <div className="text-center mb-3">
        <div className="font-arcade text-2xl md:text-3xl text-retro-green tracking-widest">
          {isWithdrawUnlocked ? formatCountdown(cooldownRemaining) : '--:--:--'}
        </div>
        <div className="text-[8px] font-arcade text-gray-600 mt-1 uppercase">
          {isWithdrawUnlocked ? 'Next harvest window' : 'Timer starts at Pumpfun Graduation'}
        </div>
      </div>

      <p className="text-[9px] text-gray-500 text-center leading-relaxed mb-2">
        Diamond-hand degens are prioritised for harvests based on $BALLS held & hopium stage reached.
      </p>

      <p className="text-[9px] text-retro-red text-center font-arcade leading-relaxed mb-2">
        Please do not spam the withdraw button or you will be blacklisted.
      </p>

      <p className="text-[8px] text-gray-600 text-center font-mono">
        {isWithdrawUnlocked
          ? `Available in ${formatCountdown(cooldownRemaining)} · Min $${MIN_HARVEST_USD.toFixed(2)}`
          : `Vault accrual active · Withdraw unlocks at Stage 3 · Min $${MIN_HARVEST_USD.toFixed(2)}`}
      </p>

      {withdrawHistory.length > 0 && (
        <div className="mt-4 border border-gray-800 bg-black/40 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-3.5 h-3.5 text-retro-blue" />
            <span className="text-[9px] font-arcade text-gray-500 uppercase">Recent Claims</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {withdrawHistory.slice(0, 5).map((claim) => (
              <div
                key={claim.id || `${claim.createdAt}-${claim.wallet}`}
                className="flex items-center justify-between gap-2 text-[8px] font-mono border-b border-gray-800/80 pb-1 last:border-0 last:pb-0"
              >
                <span className="text-gray-400 truncate">
                  {claim.wallet?.slice(0, 4)}...{claim.wallet?.slice(-4)}
                </span>
                <span className="text-retro-green shrink-0">${Number(claim.usd).toFixed(2)}</span>
                <span className={`font-arcade shrink-0 uppercase ${
                  claim.status === 'paid' ? 'text-retro-green' :
                  claim.status === 'review' ? 'text-yellow-500' :
                  'text-retro-blue'
                }`}>
                  {claim.status || 'queued'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
