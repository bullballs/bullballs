import React, { useState, useEffect, useRef } from 'react';
import { audio } from './AudioEngine';
import { ShoppingBag, Zap, HelpCircle, RotateCcw } from 'lucide-react';
import BullBallsIcon from './BullBallsIcon';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  MAX_CLICK_MULTIPLIER,
  MAX_CLICKS_PER_SECOND,
  MILESTONE_LIST,
  UPGRADE_COST_MULTIPLIER,
  getCpsGain,
} from '../../shared/gameBalance.js';
import PendingRewards from './PendingRewards';
import HowToPlayModal from './HowToPlayModal';
import ConfirmDialog from './ConfirmDialog';
import { loadGameSave, saveGameSave, clearGameSave } from '../gameSave';

const ENABLE_CLICK_RATE_LIMIT = true;

const milestoneList = MILESTONE_LIST;

export default function IdleGameDemo() {
  const [initialSave] = useState(() => loadGameSave());
  const [score, setScore] = useState(initialSave.score);
  const [cps, setCps] = useState(initialSave.cps);
  const [clickMultiplier, setClickMultiplier] = useState(initialSave.clickMultiplier);
  const [milestoneIdx, setMilestoneIdx] = useState(initialSave.milestoneIdx);
  const [vault, setVault] = useState(initialSave.vault);
  const [particles, setParticles] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(
    initialSave.offlineMs >= 60_000
  );

  const [upgrades, setUpgrades] = useState(initialSave.upgrades);

  const gameLoopRef = useRef(null);
  const clickTimestampsRef = useRef([]);

  useEffect(() => {
    const saveState = {
      score,
      cps,
      clickMultiplier,
      milestoneIdx,
      upgrades,
      vault,
    };

    const timer = setTimeout(() => saveGameSave(saveState), 400);

    const flush = () => saveGameSave(saveState);
    window.addEventListener('beforeunload', flush);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', flush);
    };
  }, [score, cps, clickMultiplier, milestoneIdx, upgrades, vault]);

  useEffect(() => {
    if (!showOfflineBanner) return undefined;
    const timer = setTimeout(() => setShowOfflineBanner(false), 8000);
    return () => clearTimeout(timer);
  }, [showOfflineBanner]);

  // Smooth Game loop: runs every 100ms
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      if (cps > 0) {
        setScore(prev => prev + (cps / 10));
      }
    }, 100);

    return () => clearInterval(gameLoopRef.current);
  }, [cps]);

  // Handle milestone level-ups
  const currentMilestone = milestoneList[milestoneIdx] || { target: Infinity, label: "VALHALLA CHAT", badge: "God Degen" };
  
  useEffect(() => {
    if (score >= currentMilestone.target && milestoneIdx < milestoneList.length) {
      audio.playExplosion();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#39ff14', '#00f0ff', '#ff007f', '#ffffff']
      });
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
      setMilestoneIdx(prev => prev + 1);
    }
  }, [score, currentMilestone.target, milestoneIdx]);

  const handleBallClick = (e) => {
    if (ENABLE_CLICK_RATE_LIMIT) {
      const now = Date.now();
      clickTimestampsRef.current = clickTimestampsRef.current.filter(t => now - t < 1000);
      if (clickTimestampsRef.current.length >= MAX_CLICKS_PER_SECOND) return;
      clickTimestampsRef.current.push(now);
    }

    audio.playTap();
    setScore(prev => prev + clickMultiplier);
    
    // Spawn floating particle text
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newParticle = {
      id: Date.now() + Math.random(),
      x,
      y,
      text: `▲ +${clickMultiplier} $BALLS`
    };
    
    setParticles(prev => [...prev, newParticle]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);
  };

  // Buy upgrade items
  const handleBuyUpgrade = (id) => {
    const upgrade = upgrades.find(u => u.id === id);
    if (!upgrade || score < upgrade.cost) return;

    audio.playUpgrade();
    setScore(prev => prev - upgrade.cost);
    
    const cpsGain = getCpsGain(upgrade);

    setUpgrades(prev => prev.map(u => {
      if (u.id === id) {
        return {
          ...u,
          multiplier: u.multiplier + 1,
          cost: Math.floor(u.cost * UPGRADE_COST_MULTIPLIER)
        };
      }
      return u;
    }));

    setCps(prev => prev + cpsGain);

    if (upgrade.clickBonus) {
      setClickMultiplier(prev => Math.min(prev + upgrade.clickBonus, MAX_CLICK_MULTIPLIER));
    }
  };

  const progressPercent = Math.min((score / currentMilestone.target) * 100, 100);

  const handleResetProgress = () => {
    audio.playTap();
    setShowResetConfirm(true);
  };

  const handleResetConfirm = () => {
    audio.playExplosion();
    clearGameSave();
    window.location.reload();
  };

  return (
    <div id="play-game" className="py-12 px-4 max-w-6xl mx-auto w-full border-t border-gray-800">
      
      <div className="text-center mb-8 relative">
        <h3 className="font-arcade text-lg md:text-xl text-retro-green tracking-widest uppercase">
          ⚡ IDLE GAME ⚡
        </h3>
        <p className="text-gray-400 text-xs md:text-sm mt-1 uppercase tracking-wider">
          TAP THE BALLS TO ESCAPE PUMPFUN PURGATORY
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <button
            onClick={() => {
              audio.playTap();
              setShowHowToPlay(true);
            }}
            className="retro-btn btn-blue text-[9px] py-2 px-4 inline-flex items-center gap-2"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            HOW TO PLAY
          </button>
          <button
            onClick={handleResetProgress}
            className="retro-btn btn-pink text-[9px] py-2 px-4 inline-flex items-center gap-2 opacity-80 hover:opacity-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET PROGRESS
          </button>
        </div>
      </div>

      <HowToPlayModal open={showHowToPlay} onClose={() => setShowHowToPlay(false)} />

      <ConfirmDialog
        open={showResetConfirm}
        title="Reset All Progress?"
        message={'This wipes $BALLS, upgrades, stages, vault balance, and cooldowns.\n\nYour burner wallet stays saved.'}
        confirmLabel="RESET"
        cancelLabel="CANCEL"
        tone="pink"
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
      />

      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 bg-retro-blue/10 border-2 border-retro-blue px-4 py-2 text-center"
          >
            <p className="text-[10px] font-arcade text-retro-blue uppercase">
              Welcome back, degen — earned while away:
            </p>
            <p className="text-[10px] font-mono text-gray-300 mt-1">
              +{Math.floor(initialSave.offlineBallGain).toLocaleString()} $BALLS
              {initialSave.offlineUsdGain > 0 && (
                <span> · +${initialSave.offlineUsdGain.toFixed(2)} vault</span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Rewards Vault — accrual from Stage 1, harvest from Stage 3 */}
      <PendingRewards
        milestoneIdx={milestoneIdx}
        cps={cps}
        score={score}
        vault={vault}
        onVaultChange={setVault}
      />

      {/* Main Game Interface Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: THE CLICKER PANEL (7 COLS) */}
        <div className="lg:col-span-7 retro-panel retro-panel-green rounded flex flex-col justify-between items-center py-8 relative overflow-hidden bg-black/90">
          
          {/* Floating animated level up badge */}
          <AnimatePresence>
            {showLevelUp && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.3, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, y: -50 }}
                className="absolute z-20 top-4 bg-retro-green text-black font-arcade text-xs px-4 py-2 border-4 border-black font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(57,255,20,0.8)]"
              >
                🎉 LEVEL UP: {milestoneList[milestoneIdx - 1]?.badge || "SUPREME DEGEN"}!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Bar */}
          <div className="w-full px-6 flex justify-between items-center pb-4 border-b-2 border-dashed border-gray-800">
            <div className="text-left">
              <div className="text-[10px] font-arcade text-gray-500 uppercase">Tokens Generated</div>
              <div className="text-2xl md:text-3xl font-arcade text-retro-green mt-1 retro-glow-green">
                {Math.floor(score).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-arcade text-gray-500 uppercase">Power Rate</div>
              <div className="text-xs md:text-sm font-arcade text-retro-blue mt-1.5">
                +{cps.toFixed(1)} CPS / +{clickMultiplier} PER CLICK
                {clickMultiplier >= MAX_CLICK_MULTIPLIER && (
                  <span className="text-retro-pink"> (MAX)</span>
                )}
              </div>
            </div>
          </div>

          {/* The Clicker Body */}
          <div className="relative py-12 flex justify-center items-center select-none w-full min-h-[300px]">
            {/* Background pulsating concentric rings */}
            <div className="absolute w-64 h-64 border-4 border-retro-green/10 rounded-full animate-ping pointer-events-none"></div>
            <div className="absolute w-48 h-48 border-4 border-retro-green/20 rounded-full animate-pulse pointer-events-none"></div>

            {/* Float particles */}
            {particles.map(p => (
              <span
                key={p.id}
                style={{ left: p.x, top: p.y }}
                className="absolute floating-candle font-arcade text-xs md:text-sm retro-glow-green select-none pointer-events-none animate-bounce"
              >
                {p.text}
              </span>
            ))}

            {/* The clickable Bull Balls element */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBallClick}
              className="relative w-48 h-48 rounded-full bg-[#0a0a0c] border-8 border-retro-green shadow-[0_15px_0_#154b07,0_15px_30px_rgba(57,255,20,0.5)] flex flex-col items-center justify-center cursor-pointer overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.12)_0%,transparent_70%)] pointer-events-none" />

              <div className="flex flex-col items-center justify-center z-10 text-white font-arcade w-full px-3">
                <BullBallsIcon className="w-[5.5rem] h-auto drop-shadow-[0_0_14px_rgba(245,197,24,0.9)] animate-pulse" />
                <span className="text-sm font-bold tracking-widest text-retro-green retro-glow-green mt-1">TAP</span>
              </div>
            </motion.button>
          </div>

          {/* Milestones / Hopium Level Progress Bar */}
          <div className="w-full px-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-arcade text-retro-pink">HOPIUM STAGE: {currentMilestone.label}</span>
              <span className="text-[10px] font-arcade text-gray-400">
                {Math.floor(score)} / {currentMilestone.target} $BALLS
              </span>
            </div>
            {/* Retro progress bar frame */}
            <div className="w-full bg-[#222] border-4 border-white p-1 rounded-sm relative shadow-inner">
              <div 
                className="h-4 bg-retro-green transition-all duration-100 ease-out flex items-center justify-end px-2"
                style={{ width: `${progressPercent}%` }}
              >
                {progressPercent > 10 && (
                  <span className="text-[9px] font-arcade text-black font-bold animate-pulse">
                    {Math.floor(progressPercent)}%
                  </span>
                )}
              </div>
            </div>
            <div className="text-[8px] font-arcade text-gray-500 mt-2 text-center">
              NEXT UPGRADE BADGE: <span className="text-retro-blue">{currentMilestone.badge}</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: THE UPGRADE SHOP PANEL (5 COLS) */}
        <div className="lg:col-span-5 retro-panel retro-panel-pink bg-black/90 p-4 md:p-6 rounded flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b-2 border-dashed border-gray-800 mb-4 select-none">
              <ShoppingBag className="w-5 h-5 text-retro-pink" />
              <h4 className="font-arcade text-sm text-retro-pink uppercase">SHILLER SHOP</h4>
            </div>

            {/* Upgrades Listing */}
            <div className="flex flex-col gap-4">
              {upgrades.map(item => {
                const isAffordable = score >= item.cost;
                return (
                  <div 
                    key={item.id}
                    className={`border-2 p-3 rounded flex justify-between items-center transition-all ${
                      item.multiplier > 0 
                        ? 'border-retro-pink/80 bg-retro-pink/5' 
                        : 'border-gray-800 bg-[#121216]'
                    }`}
                  >
                    <div className="text-left pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-arcade text-xs text-white">{item.name}</span>
                        {item.multiplier > 0 && (
                          <span className="bg-retro-pink text-black font-arcade text-[8px] font-bold px-1.5 py-0.5 rounded">
                            x{item.multiplier}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                        {item.desc}
                      </p>
                      <div className="text-[9px] font-arcade text-retro-blue mt-1.5">
                        +{getCpsGain(item).toFixed(2)} CPS next
                        {item.clickBonus > 0 && (
                          <span> · +{item.clickBonus}/click</span>
                        )}
                        {item.multiplier > 0 && (
                          <span className="text-gray-500"> · lv{item.multiplier}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyUpgrade(item.id)}
                      disabled={!isAffordable}
                      className={`retro-btn text-[9px] py-2 px-3 whitespace-nowrap shrink-0 ${
                        isAffordable ? 'btn-pink' : 'opacity-40 pointer-events-none'
                      }`}
                    >
                      💰 {item.cost}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fun game trivia tip box */}
          <div className="bg-[#121216]/80 border border-gray-800 p-3 rounded mt-6 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-retro-pink animate-pulse" />
              <span className="text-[10px] font-arcade text-retro-pink">Trench Wisdom:</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-normal">
              Accumulate tokens to graduation milestones. Rewards vault fills from Stage 1 — harvest unlocks at Pumpfun Graduation (Stage 3).
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
