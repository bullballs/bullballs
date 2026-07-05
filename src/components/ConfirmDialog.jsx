import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { audio } from './AudioEngine';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  tone = 'pink',
  onConfirm,
  onCancel,
}) {
  const toneClass = {
    pink: 'retro-panel-pink border-retro-pink text-retro-pink',
    green: 'retro-panel-green border-retro-green text-retro-green',
    blue: 'retro-panel-blue border-retro-blue text-retro-blue',
  }[tone] || 'retro-panel-pink border-retro-pink text-retro-pink';

  const confirmBtnClass = {
    pink: 'btn-pink',
    green: 'btn-green',
    blue: 'btn-blue',
  }[tone] || 'btn-pink';

  const handleCancel = () => {
    audio.playTap();
    onCancel();
  };

  const handleConfirm = () => {
    audio.playTap();
    onConfirm();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className={`retro-panel ${toneClass} bg-[#0a0a0c]/98 border-4 w-full max-w-sm relative`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 md:p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-arcade text-xs uppercase tracking-wider leading-relaxed">
                    {title}
                  </h3>
                  <p className="text-[10px] font-mono text-gray-400 mt-3 leading-relaxed whitespace-pre-line">
                    {message}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="retro-btn btn-blue flex-1 text-[10px] py-3 !translate-y-0"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`retro-btn ${confirmBtnClass} flex-1 text-[10px] py-3 !translate-y-0`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
