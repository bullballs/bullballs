import React, { useState } from 'react';
import { audio } from './AudioEngine';
import { Award, Lock, Flame, ShieldAlert, ArrowUpRight } from 'lucide-react';

export default function Tokenomics() {
  const [candles, setCandles] = useState([
    { height: 35, type: 'up' },
    { height: 45, type: 'up' },
    { height: 25, type: 'down' },
    { height: 55, type: 'up' },
    { height: 75, type: 'up' },
    { height: 60, type: 'down' },
    { height: 95, type: 'up' }
  ]);

  const handleInjectHopium = () => {
    audio.playPowerup();
    // Add a new super green candle to the chart
    setCandles(prev => {
      const next = [...prev];
      next.shift(); // remove first
      next.push({ height: Math.floor(Math.random() * 40) + 75, type: 'up' }); // add high green candle
      return next;
    });
  };

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto w-full border-t border-gray-800">
      
      <div className="text-center mb-8">
        <h3 className="font-arcade text-lg md:text-xl text-retro-blue tracking-widest uppercase">
          📊 BALL-ONOMICS 📊
        </h3>
        <p className="text-gray-400 text-xs md:text-sm mt-1 uppercase tracking-wider">
          THE MATH OF HOPIUM - 0% JEET FEES
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: THE INTERACTIVE CHART (6 COLS) */}
        <div className="lg:col-span-7 retro-panel retro-panel-blue bg-black/90 p-4 md:p-6 rounded flex flex-col justify-between select-none">
          <div>
            <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-gray-800 mb-4">
              <span className="font-arcade text-xs text-retro-blue">LIVE TRADING VIEW: $BALLS/SOL</span>
              <span className="text-[9px] font-mono text-retro-green animate-pulse">● LIVE UPDATES</span>
            </div>

            {/* Candle Chart Screen Area */}
            <div className="w-full h-64 bg-[#0a0a0c] border-2 border-gray-800 rounded relative p-4 flex items-end justify-between gap-2 overflow-hidden retro-grid">
              
              {/* Background Price Guidelines */}
              <div className="absolute inset-x-0 top-1/4 border-b border-gray-900/60 flex justify-between px-2 text-[8px] font-mono text-gray-700">
                <span>0.009 SOL</span>
              </div>
              <div className="absolute inset-x-0 top-2/4 border-b border-gray-900/60 flex justify-between px-2 text-[8px] font-mono text-gray-700">
                <span>0.005 SOL</span>
              </div>
              <div className="absolute inset-x-0 top-3/4 border-b border-gray-900/60 flex justify-between px-2 text-[8px] font-mono text-gray-700">
                <span>0.002 SOL</span>
              </div>

              {/* Grid vertical candles */}
              {candles.map((candle, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                  {/* Wick */}
                  <div className={`w-0.5 h-6 ${candle.type === 'up' ? 'bg-retro-green' : 'bg-retro-red'}`}></div>
                  {/* Candle Body */}
                  <div 
                    style={{ height: `${candle.height}%` }}
                    className={`w-full max-w-[28px] border-2 transition-all duration-300 ${
                      candle.type === 'up' 
                        ? 'bg-retro-green/80 border-retro-green shadow-[0_0_8px_rgba(57,255,20,0.4)]' 
                        : 'bg-retro-red/80 border-retro-red'
                    }`}
                  ></div>
                  <span className="text-[8px] font-mono text-gray-600 mt-2">C{idx+1}</span>
                </div>
              ))}

              {/* Floating banner on super high candles */}
              <div className="absolute top-4 right-4 bg-retro-green text-black text-[9px] font-arcade px-2 py-1 uppercase rounded animate-bounce flex items-center gap-1 font-bold">
                <ArrowUpRight className="w-3 h-3 text-black" /> PUMPING
              </div>
            </div>
          </div>

          <button
            onClick={handleInjectHopium}
            className="retro-btn btn-blue text-[11px] py-3.5 mt-6 w-full flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4 text-white animate-pulse" />
            <span>INJECT GREEN CANDLE HOPIUM</span>
          </button>
        </div>

        {/* RIGHT COLUMN: CORE TOKEN STATS (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
          
          <div className="retro-panel bg-[#121216]/95 border-4 border-gray-700 p-4 rounded flex items-center gap-4">
            <div className="w-12 h-12 bg-retro-green/10 border-2 border-retro-green rounded flex items-center justify-center text-retro-green shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-arcade text-gray-500 uppercase">NO TAX FEES</span>
              <h4 className="font-arcade text-sm text-white mt-0.5">0% BUY / 0% SELL</h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                100% dev tax-free. Standard transactions. Every single cent goes to backing the green wall.
              </p>
            </div>
          </div>

          <div className="retro-panel bg-[#121216]/95 border-4 border-gray-700 p-4 rounded flex items-center gap-4">
            <div className="w-12 h-12 bg-retro-pink/10 border-2 border-retro-pink rounded flex items-center justify-center text-retro-pink shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-arcade text-gray-500 uppercase">REWARD POOLS</span>
              <h4 className="font-arcade text-sm text-white mt-0.5">10% POOLS</h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                10% of supply allocated for community rewards. Hold, play, and shill to earn your share.
              </p>
            </div>
          </div>

          <div className="retro-panel bg-[#121216]/95 border-4 border-gray-700 p-4 rounded flex items-center gap-4">
            <div className="w-12 h-12 bg-retro-blue/10 border-2 border-retro-blue rounded flex items-center justify-center text-retro-blue shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-arcade text-gray-500 uppercase">SOLANA MEMES</span>
              <h4 className="font-arcade text-sm text-white mt-0.5">THE DEGEN SUPERCYCLE</h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                Born in Pumpfun, raised in Raydium, finalized in Solana Valhalla. Supported by community shillers.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
