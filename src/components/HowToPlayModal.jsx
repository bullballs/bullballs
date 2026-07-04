import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audio } from './AudioEngine';
import { X, Gamepad2, Trophy, Coins, Star } from 'lucide-react';
import {
  HARVEST_COOLDOWN_MS,
  MIN_HARVEST_USD,
  MILESTONE_LIST,
  PERKS,
} from '../../shared/gameBalance.js';

const STAGES = MILESTONE_LIST.map((stage, index) => ({
  num: index + 1,
  target: stage.target.toLocaleString(),
  label: stage.label,
  badge: stage.badge,
}));

const COOLDOWN_HOURS = HARVEST_COOLDOWN_MS / (60 * 60 * 1000);

export default function HowToPlayModal({ open, onClose }) {
  const handleClose = () => {
    audio.playTap();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="retro-panel retro-panel-green bg-[#0a0a0c]/98 border-4 border-retro-green w-full max-w-2xl max-h-[85vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-retro-pink transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-5 md:p-6">
              <div className="flex items-center gap-2 mb-1">
                <Gamepad2 className="w-5 h-5 text-retro-green" />
                <h2 className="font-arcade text-sm md:text-base text-retro-green uppercase tracking-wider">
                  How To Play
                </h2>
              </div>
              <p className="text-[10px] text-gray-500 mb-5 uppercase tracking-wider">
                BULL BALLS Idle Game — Operator Manual v1.0
              </p>

              {/* How to play steps */}
              <section className="mb-6">
                <h3 className="font-arcade text-[10px] text-retro-blue uppercase mb-3 flex items-center gap-1.5">
                  <span className="text-retro-blue">▶</span> Gameplay
                </h3>
                <ol className="space-y-2.5 text-[11px] text-gray-300 leading-relaxed list-none">
                  <li className="flex gap-2">
                    <span className="font-arcade text-retro-green shrink-0">01.</span>
                    <span><strong className="text-white">TAP TO PUMP</strong> — Click the green ball to generate +1 $BALLS per tap. Max <strong className="text-retro-pink">12 clicks/sec</strong> (anti auto-clicker).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-arcade text-retro-green shrink-0">02.</span>
                    <span><strong className="text-white">SHILLER SHOP</strong> — Buy upgrades with $BALLS for <strong className="text-retro-blue">passive CPS</strong>. <strong className="text-retro-green">Call Ansem</strong> also boosts per click (+1/click, max 10).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-arcade text-retro-green shrink-0">03.</span>
                    <span><strong className="text-white">HOPIUM STAGES</strong> — Accumulate $BALLS until you hit each stage target. Completing a stage = level up + new badge.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-arcade text-retro-green shrink-0">04.</span>
                    <span><strong className="text-white">REWARDS VAULT</strong> — From Stage 1, USD/SOL rewards accrue automatically. Withdraw unlocks at <strong className="text-retro-pink">Stage 3</strong>.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-arcade text-retro-green shrink-0">05.</span>
                    <span><strong className="text-white">WITHDRAW</strong> — Min ${MIN_HARVEST_USD.toFixed(2)}, {COOLDOWN_HOURS}-hour cooldown. A <strong className="text-retro-green">burner wallet</strong> is auto-generated locally — no connect required. Export your private key to claim SOL later. Do not spam!</span>
                  </li>
                </ol>
              </section>

              {/* Stages */}
              <section className="mb-6">
                <h3 className="font-arcade text-[10px] text-retro-pink uppercase mb-3 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" /> Hopium Stages
                </h3>
                <div className="border border-gray-800 rounded overflow-hidden">
                  {STAGES.map((stage, i) => (
                    <div
                      key={stage.num}
                      className={`flex items-center justify-between gap-2 px-3 py-2 text-[10px] ${
                        i % 2 === 0 ? 'bg-black/40' : 'bg-black/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-arcade text-retro-green shrink-0">S{stage.num}</span>
                        <span className="text-gray-400 truncate">{stage.label}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-white">{stage.target}</div>
                        <div className="font-arcade text-[8px] text-retro-blue">{stage.badge}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Perks */}
              <section className="mb-5">
                <h3 className="font-arcade text-[10px] text-retro-green uppercase mb-3 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" /> Perks — Early Player Advantage
                </h3>
                <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
                  The further your stage, the higher your <strong className="text-retro-blue">Accrual Rate</strong> in the Rewards Vault. A new player at Stage 1 earns far less than an OG at Stage 6+.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {PERKS.map((perk) => (
                    <div
                      key={perk.rank}
                      className="border border-gray-800 bg-black/40 px-3 py-2 rounded flex justify-between items-center"
                    >
                      <div>
                        <div className="font-arcade text-[9px] text-white">{perk.rank}</div>
                        <div className="text-[8px] text-gray-600 font-mono">{perk.unlock}</div>
                      </div>
                      <span className="font-arcade text-xs text-retro-pink">{perk.mult}</span>
                    </div>
                  ))}
                </div>

                <div className="border border-gray-800 bg-black/40 p-3 rounded space-y-2">
                  <div className="flex items-start gap-2">
                    <Coins className="w-3.5 h-3.5 text-retro-blue shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      <strong className="text-retro-blue">CPS Boost</strong> — More passive shop upgrades = higher reward rate.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Coins className="w-3.5 h-3.5 text-retro-green shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      <strong className="text-retro-green">Hold Bonus</strong> — The more $BALLS you hold, the higher your accrual rate.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Coins className="w-3.5 h-3.5 text-retro-pink shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      <strong className="text-retro-pink">Diamond Hands</strong> — Holders at higher stages are prioritised during harvest windows.
                    </p>
                  </div>
                </div>
              </section>

              <button
                onClick={handleClose}
                className="retro-btn btn-green w-full text-[10px] py-3"
              >
                GOT IT — LET&apos;S PUMP
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
