import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audio } from './AudioEngine';
import { X, Wallet, Lock, AlertTriangle, Copy, Check, RefreshCw, ShieldCheck } from 'lucide-react';
import { MIN_HARVEST_USD } from '../../shared/gameBalance.js';
import {
  exportBurnerPrivateKey,
  generateNewBurnerWallet,
  getOrCreateBurnerWallet,
} from '../burnerWallet';

function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

export default function WithdrawModal({
  open,
  onClose,
  pendingUsd,
  pendingSol,
  solPrice,
  canWithdraw,
  isUnlocked,
  cooldownRemaining,
  meetsMinimum,
  isSubmitting = false,
  submitError = '',
  onConfirm,
}) {
  const [burnerWallet, setBurnerWallet] = useState(null);
  const [copiedField, setCopiedField] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  useEffect(() => {
    if (open) {
      setBurnerWallet(getOrCreateBurnerWallet());
      setCopiedField('');
      setShowPrivateKey(false);
    }
  }, [open]);

  const handleClose = () => {
    audio.playTap();
    onClose();
  };

  const handleCopy = async (value, field) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    audio.playCoin();
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleRegenerate = () => {
    const confirmed = window.confirm(
      'Generate a NEW burner wallet?\n\nYour old private key will be lost unless you already exported it. SOL sent to the old address cannot be moved without the old key.'
    );
    if (!confirmed) return;

    audio.playUpgrade();
    const next = generateNewBurnerWallet();
    setBurnerWallet(next);
    setShowPrivateKey(false);
    setCopiedField('');
  };

  const handleConfirm = () => {
    if (!burnerWallet?.publicKey) return;
    onConfirm(burnerWallet.publicKey);
  };

  const privateKey = exportBurnerPrivateKey(burnerWallet);
  const statusMessage = !isUnlocked
    ? 'Reach Stage 3 (Pumpfun Graduation) to unlock withdrawals.'
    : !meetsMinimum
      ? `Minimum withdraw is $${MIN_HARVEST_USD.toFixed(2)} — you have $${pendingUsd.toFixed(2)}.`
      : cooldownRemaining > 0
        ? `Cooldown active — available in ${formatCountdown(cooldownRemaining)}.`
        : null;

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
            className="retro-panel retro-panel-blue bg-[#0a0a0c]/98 border-4 border-retro-blue w-full max-w-md relative max-h-[90vh] overflow-y-auto"
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
                <Wallet className="w-5 h-5 text-retro-blue" />
                <h2 className="font-arcade text-sm text-retro-blue uppercase tracking-wider">
                  Withdraw Rewards
                </h2>
              </div>
              <p className="text-[10px] text-gray-500 mb-4 uppercase tracking-wider">
                BURNER WALLET — NO CONNECT REQUIRED
              </p>

              <div className="bg-black/50 border-2 border-gray-800 p-3 rounded mb-4 text-center">
                <div className="font-arcade text-lg text-retro-green retro-glow-green">
                  ${pendingUsd.toFixed(2)} USD
                </div>
                <div className="font-mono text-[10px] text-gray-400 mt-1">
                  ≈ {pendingSol.toFixed(5)} SOL · @ ${solPrice.toFixed(2)}/SOL
                </div>
              </div>

              <div className="mb-4 bg-retro-blue/10 border border-retro-blue/30 px-3 py-2 flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-retro-blue shrink-0 mt-0.5" />
                <p className="text-[9px] font-arcade text-retro-blue leading-relaxed">
                  Fresh Solana burner wallet generated locally. Your main wallet is never connected or touched.
                </p>
              </div>

              {burnerWallet && (
                <div className="mb-4 border border-gray-800 bg-black/40 rounded p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[9px] font-arcade text-gray-500 uppercase">Payout Address</span>
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      className="text-[8px] font-arcade text-retro-pink hover:text-white flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      NEW BURNER
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-[10px] text-retro-green break-all">
                      {burnerWallet.publicKey}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(burnerWallet.publicKey, 'address')}
                      className="text-gray-500 hover:text-retro-blue shrink-0"
                      title="Copy address"
                    >
                      {copiedField === 'address' ? (
                        <Check className="w-3.5 h-3.5 text-retro-green" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {burnerWallet.migratedLegacy && !privateKey && (
                    <p className="text-[8px] font-arcade text-yellow-500 mt-2 leading-relaxed">
                      Old pasted wallet detected. Generate a NEW BURNER to get an exportable private key.
                    </p>
                  )}

                  {privateKey && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <button
                        type="button"
                        onClick={() => setShowPrivateKey((prev) => !prev)}
                        className="text-[8px] font-arcade text-gray-500 hover:text-retro-pink uppercase"
                      >
                        {showPrivateKey ? '▲ Hide private key' : '▼ Export private key (save this!)'}
                      </button>
                      {showPrivateKey && (
                        <div className="mt-2">
                          <div className="flex items-start gap-2">
                            <code className="flex-1 font-mono text-[9px] text-retro-pink break-all leading-relaxed">
                              {privateKey}
                            </code>
                            <button
                              type="button"
                              onClick={() => handleCopy(privateKey, 'secret')}
                              className="text-gray-500 hover:text-retro-pink shrink-0"
                              title="Copy private key"
                            >
                              {copiedField === 'secret' ? (
                                <Check className="w-3.5 h-3.5 text-retro-green" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <p className="text-[8px] text-retro-red font-arcade mt-2 leading-relaxed">
                            SAVE THIS KEY! Import to Phantom later to claim your SOL. We cannot recover it if lost.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {submitError && (
                <div className="mb-4 bg-retro-red/10 border border-retro-red/40 px-3 py-2">
                  <p className="text-[9px] font-arcade text-retro-red leading-relaxed">{submitError}</p>
                </div>
              )}

              {statusMessage && (
                <div className="mb-4 bg-retro-pink/10 border border-retro-pink/40 px-3 py-2 flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-retro-pink shrink-0 mt-0.5" />
                  <p className="text-[9px] font-arcade text-retro-pink leading-relaxed">{statusMessage}</p>
                </div>
              )}

              {!statusMessage && !submitError && (
                <div className="mb-4 bg-retro-green/10 border border-retro-green/30 px-3 py-2 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-retro-green shrink-0 mt-0.5" />
                  <p className="text-[9px] font-arcade text-retro-green leading-relaxed">
                    SOL payout goes to your burner address above. Export the private key before withdrawing.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="retro-btn btn-pink flex-1 text-[10px] py-3 !translate-y-0 disabled:opacity-40"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!canWithdraw || isSubmitting || !burnerWallet?.publicKey}
                  className={`retro-btn flex-1 text-[10px] py-3 flex items-center justify-center gap-2 ${
                    canWithdraw && !isSubmitting ? 'btn-green' : 'opacity-40 cursor-not-allowed !translate-y-0'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  {isSubmitting ? 'SUBMITTING...' : 'WITHDRAW'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
