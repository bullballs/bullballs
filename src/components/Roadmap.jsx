import React from 'react';
import { audio } from './AudioEngine';
import { Play, Check, ShieldCheck, Lock, Swords } from 'lucide-react';

const roadmapLevels = [
  {
    level: "LVL 1",
    title: "BEAT THE JEETS",
    target: "Launch & Shakeout",
    desc: "Deploy the smart contract and build the diamond-hand core team in X Purgatory.",
    status: "cleared",
    reward: "UNLOCKED: Degen Alpha Chat access"
  },
  {
    level: "LVL 2",
    title: "PUMPFUN GRADUATION",
    target: "33K MCAP Bonded",
    desc: "Summon Ansem to shill, migrate token liquidity to Raydium, and lock 100% of the LP tokens forever in the furnace.",
    status: "active",
    reward: "PROGRESSING: CoinGecko/CMC application"
  },
  {
    level: "LVL 3",
    title: "SUMMON THE BULL",
    target: "10M MCAP Threshold",
    desc: "Massive community raid, deploy custom web3 clicking games, and secure major Solana influencer marketing calls.",
    status: "locked",
    reward: "LOCKED: Custom NFT drops"
  },
  {
    level: "LVL 4",
    title: "MOON VALHALLA",
    target: "100M MCAP Dream",
    desc: "CEX listings, global billboards, play-to-earn desktop launcher, and the ultimate Ansem luxury yacht party.",
    status: "locked",
    reward: "LOCKED: $BALLS Treasury Staking"
  }
];

export default function Roadmap() {
  const handleLevelHover = () => {
    audio.playTap();
  };

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto w-full border-t border-gray-800">
      
      <div className="text-center mb-8">
        <h3 className="font-arcade text-lg md:text-xl text-retro-pink tracking-widest uppercase">
          ⚔️ DEGEN ROADMAP ⚔️
        </h3>
        <p className="text-gray-400 text-xs md:text-sm mt-1 uppercase tracking-wider">
          STAGE SELECT - BOSS FIGHT PROGRESSION
        </p>
      </div>

      {/* Grid Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch relative">
        
        {roadmapLevels.map((item, idx) => {
          const isCleared = item.status === 'cleared';
          const isActive = item.status === 'active';
          const isLocked = item.status === 'locked';

          return (
            <div
              key={idx}
              onMouseEnter={handleLevelHover}
              className={`retro-panel flex flex-col justify-between p-5 rounded relative overflow-hidden transition-all duration-250 ${
                isCleared 
                  ? 'border-retro-green bg-retro-green/5 shadow-[0_0_8px_rgba(57,255,20,0.2)]'
                  : isActive
                  ? 'border-retro-pink bg-retro-pink/5 animate-pulse shadow-[0_0_10px_rgba(255,0,127,0.3)]'
                  : 'border-gray-800 opacity-60 bg-[#0d0d11]'
              }`}
            >
              <div>
                {/* Status Header */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-800 mb-4">
                  <span className={`text-[10px] font-arcade font-bold ${
                    isCleared ? 'text-retro-green' : isActive ? 'text-retro-pink' : 'text-gray-500'
                  }`}>
                    {item.level}
                  </span>
                  
                  {isCleared && (
                    <span className="flex items-center gap-1 text-[8px] font-arcade text-retro-green">
                      <ShieldCheck className="w-3.5 h-3.5" /> CLEARED
                    </span>
                  )}
                  {isActive && (
                    <span className="flex items-center gap-1 text-[8px] font-arcade text-retro-pink">
                      <Play className="w-3 h-3 animate-spin" /> ACTIVE BOSS
                    </span>
                  )}
                  {isLocked && (
                    <span className="flex items-center gap-1 text-[8px] font-arcade text-gray-500">
                      <Lock className="w-3 h-3" /> LOCKED
                    </span>
                  )}
                </div>

                {/* Level Details */}
                <h4 className="font-arcade text-xs text-white text-left tracking-wide leading-tight">
                  {item.title}
                </h4>
                <div className="text-[10px] font-arcade text-retro-blue text-left mt-1.5 uppercase">
                  {item.target}
                </div>
                <p className="text-[11px] text-gray-400 text-left mt-3 leading-normal">
                  {item.desc}
                </p>
              </div>

              {/* Reward Box */}
              <div className="mt-6 pt-3 border-t border-dashed border-gray-800 text-left">
                <span className={`text-[9px] font-arcade ${
                  isCleared ? 'text-retro-green' : isActive ? 'text-retro-pink' : 'text-gray-600'
                }`}>
                  {item.reward}
                </span>
              </div>
              
              {/* Decorative Corner lines */}
              {isActive && (
                <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
                  <div className="bg-retro-pink text-black text-[7px] font-arcade font-bold py-1 px-4 rotate-45 translate-x-3 -translate-y-0.5 absolute">
                    LVL
                  </div>
                </div>
              )}
            </div>
          );
        })}

      </div>

      {/* Decorative center roadmap map indicator */}
      <div className="mt-10 bg-[#121216]/60 border border-gray-800 p-4 rounded max-w-lg mx-auto flex items-center justify-center gap-3">
        <Swords className="w-5 h-5 text-retro-pink animate-bounce" />
        <span className="text-[9px] font-arcade text-gray-400 uppercase tracking-widest text-center leading-normal">
          WARNING: DEFEATING LEVEL BOSSES INCREASES COMMUNITY PUMPING POWER BY +200%
        </span>
      </div>

    </div>
  );
}
