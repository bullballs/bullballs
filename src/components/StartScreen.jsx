import React, { useEffect, useState } from 'react';
import { audio } from './AudioEngine';
import heroBg from '../assets/landingbgdone.jpg';
import { Play, Coins, ShieldAlert } from 'lucide-react';

export default function StartScreen({ onStart, coins, onInsertCoin, soundMuted, toggleSound }) {
  const [blink, setBlink] = useState(true);

  // Blinking "PRESS START" text interval
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(prev => !prev);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const handleStartClick = () => {
    if (coins === 0) {
      // Auto-insert a coin for the user to be nice and let them play immediately,
      // but play the coin sound first!
      onInsertCoin();
      setTimeout(() => {
        audio.playPowerup();
        onStart();
      }, 500);
    } else {
      audio.playPowerup();
      onStart();
    }
  };

  return (
    <div 
      className="relative w-full h-full min-h-[500px] flex flex-col items-center justify-between text-center bg-cover bg-center bg-no-repeat p-6 md:p-10 select-none overflow-hidden"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Dark tint overlay - lighter to make background visible */}
      <div className="absolute inset-0 bg-black/35 z-0"></div>

      {/* Retro Arcade Grid Overlay */}
      <div className="absolute inset-0 opacity-15 retro-grid pointer-events-none z-0"></div>



      {/* Middle Screen Logo Section */}
      <div className="relative z-10 my-auto flex flex-col items-center gap-6">
        


        {/* Start Game Action Triggers */}
        <div className="mt-8 flex flex-col items-center gap-4">
          
          {coins === 0 ? (
            <button
              onClick={onInsertCoin}
              className="retro-btn btn-pink text-xs py-3.5 px-6 animate-pulse shadow-[0_4px_0_#800640]"
            >
              🪙 INSERT COIN TO PLAY
            </button>
          ) : (
            <button
              onClick={handleStartClick}
              className="retro-btn btn-green text-xs py-4 px-10 shadow-[0_4px_0_#1e6d0a]"
            >
              ⚡ PRESS START BUTTON ⚡
            </button>
          )}

          {/* Glowing Status Message */}
          <div className="min-h-[20px] mt-2">
            <span 
              className={`text-sm md:text-base font-arcade tracking-widest ${
                coins === 0 ? 'text-retro-red animate-pulse' : 'text-retro-green'
              }`}
              style={{ visibility: blink ? 'visible' : 'hidden' }}
            >
              {coins === 0 ? "INSERT SOL / MEMES IN SLOT" : "INSERTED COIN ACCEPTED! PRESS START"}
            </span>
          </div>

        </div>

      </div>

      {/* Bottom Dashboard Ticker */}
      <div className="relative z-10 w-full flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t border-gray-800/80 bg-black/60 p-3 rounded">
        <div className="flex gap-4">
          <div className="text-[9px] font-arcade text-gray-500 uppercase">
            Credits: <span className="text-retro-green font-bold">{coins}</span>
          </div>
          <div className="text-[9px] font-arcade text-gray-500 uppercase">
            Mode: <span className="text-retro-blue font-bold">{coins === 0 ? "INSERT COIN" : "FREE TO PLAY"}</span>
          </div>
        </div>

        <div className="text-[9px] font-arcade text-gray-500 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-retro-pink shrink-0" />
          <span>RUG RESISTANT MEMETIC SYSTEM</span>
        </div>
      </div>

    </div>
  );
}
