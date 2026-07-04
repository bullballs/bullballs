import React, { useState } from 'react';
import { audio } from './AudioEngine';
import heroBg from '../assets/landingbgdone.jpg';
import { Copy, Check, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { appConfig } from '../config';

export default function HeroSection() {
  const [copied, setCopied] = useState(false);
  const { contractAddress, buyUrl } = appConfig.token;

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    audio.playCoin();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCtaClick = () => {
    audio.playPowerup();
  };

  return (
    <div 
      className="relative min-h-[90vh] flex flex-col items-center justify-between text-center bg-cover bg-center bg-no-repeat px-4 py-12 md:py-16"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Dark overlay for text readability - lighter to make background visible */}
      <div className="absolute inset-0 bg-black/35 z-0"></div>

      {/* Retro Arcade Grid Overlay */}
      <div className="absolute inset-0 opacity-10 retro-grid pointer-events-none z-0"></div>

      {/* Top Banner Alert (Degen Warning) */}
      <div className="relative z-10 w-full max-w-2xl bg-black/90 border-4 border-retro-pink p-3 flex items-center justify-center gap-3 animate-pulse">
        <ShieldAlert className="w-5 h-5 text-retro-pink animate-bounce shrink-0" />
        <span className="text-[10px] md:text-xs font-arcade text-retro-pink tracking-wider">
          WARNING: 100% PURE HOPIUM INGESTION AHEAD. NO COWARDLY JEETS ALLOWED!
        </span>
      </div>

      {/* Main Title Content */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl mt-6 md:mt-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative px-4"
        >
          <div className="bg-black/80 border-2 border-dashed border-retro-green px-4 py-2 inline-block">
            <p className="text-xs md:text-sm font-arcade text-retro-green tracking-wide">
              ★ THE ULTIMATE 16-BIT CRYTPO IDLE GAME ★
            </p>
          </div>
        </motion.div>

        {/* Narrative Hook */}
        <p className="text-base md:text-xl lg:text-2xl text-gray-200 mt-6 max-w-2xl font-share leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Pumpfun Purgatory is overflowing. Degens are rugged, down bad, and stranded. Only <span className="text-retro-blue font-bold">ANSEM</span> can rescue them by summoning <span className="text-retro-green font-bold">THE BALLS</span>! Grab your bags, tap the balls, and pump green candles to Valhalla!
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-6 mt-8 w-full justify-center px-4">
          <a
            href="#play-game"
            onClick={handleCtaClick}
            className="retro-btn btn-green text-sm py-4 px-8 shadow-[0_6px_0_#1e6d0a] hover:shadow-none hover:translate-y-1.5 transition-all w-full sm:w-auto"
          >
            🕹️ LAUNCH GAME
          </a>
          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCtaClick}
            className="retro-btn btn-pink text-sm py-4 px-8 shadow-[0_6px_0_#800640] hover:shadow-none hover:translate-y-1.5 transition-all w-full sm:w-auto"
          >
            💸 BUY {appConfig.token.symbol}
          </a>
        </div>
      </div>

      {/* Floating Statistics Board & CA Box */}
      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-6 mt-10">
        
        {/* Solana Contract Copy Widget */}
        <div className="w-full bg-[#121216]/95 border-4 border-gray-700 p-4 rounded shadow-[0_4px_0_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-arcade text-gray-500">SOLANA CA:</span>
            <span className="font-mono text-xs md:text-sm text-retro-blue tracking-wide select-all bg-black/60 px-3 py-1.5 border border-gray-800 rounded">
              {contractAddress}
            </span>
          </div>
          
          <button
            onClick={handleCopy}
            className={`retro-btn flex items-center gap-2 text-[10px] py-2 px-4 whitespace-nowrap ${copied ? 'btn-green' : 'btn-blue'}`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY CA</span>
              </>
            )}
          </button>
        </div>

        {/* Mini Stats Board */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="bg-[#121216]/90 border-2 border-gray-800 p-3 flex flex-col items-center justify-center">
            <span className="text-[9px] font-arcade text-gray-500 uppercase">Token Price</span>
            <span className="text-sm font-arcade text-retro-green mt-1 flex items-center gap-1">
              $0.00694 <TrendingUp className="w-3.5 h-3.5 text-retro-green animate-bounce" />
            </span>
          </div>
          
          <div className="bg-[#121216]/90 border-2 border-gray-800 p-3 flex flex-col items-center justify-center">
            <span className="text-[9px] font-arcade text-gray-500 uppercase">Hopium Reserves</span>
            <span className="text-sm font-arcade text-retro-pink mt-1 animate-pulse">99,999%</span>
          </div>

          <div className="bg-[#121216]/90 border-2 border-gray-800 p-3 flex flex-col items-center justify-center">
            <span className="text-[9px] font-arcade text-gray-500 uppercase">Degen Level</span>
            <span className="text-sm font-arcade text-retro-blue mt-1">LVL. 69</span>
          </div>

          <div className="bg-[#121216]/90 border-2 border-gray-800 p-3 flex flex-col items-center justify-center">
            <span className="text-[9px] font-arcade text-gray-500 uppercase">Total Supply</span>
            <span className="text-sm font-arcade text-white mt-1">1.0 BILLION</span>
          </div>
        </div>

      </div>

    </div>
  );
}
