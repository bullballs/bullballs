import React, { useState } from 'react';
import { audio } from './AudioEngine';
import { Volume2, VolumeX, Sparkles, Terminal, Maximize2, Minimize2 } from 'lucide-react';

export default function ArcadeCabinet({ children, soundMuted, toggleSound, coins, onInsertCoin }) {
  const [slotPulse, setSlotPulse] = useState(false);
  const [zoomMode, setZoomMode] = useState(false);

  const handleInsertCoin = () => {
    onInsertCoin();
    setSlotPulse(true);
    setTimeout(() => setSlotPulse(false), 200);
  };

  const handleJoystickClick = () => {
    audio.playTap();
  };

  return (
    <div className="h-screen w-screen bg-[#070709] flex flex-col items-center justify-center p-0 md:p-2 lg:p-3 font-share selection:bg-retro-green selection:text-black overflow-hidden">
      {/* Outer Cabinet Container */}
      <div className="w-full max-w-[1300px] h-full max-h-screen md:max-h-[98dvh] bg-[#1a1a22] border-4 md:border-8 border-gray-800 rounded-xl md:rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative transition-all duration-300">
        
        {/* Neon Cabinet Light Bars (Side Borders) - Hidden in zoom mode */}
        {!zoomMode && (
          <>
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-b from-retro-pink via-retro-purple to-retro-blue hidden lg:block animate-pulse"></div>
            <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-gradient-to-b from-retro-blue via-retro-purple to-retro-pink hidden lg:block animate-pulse"></div>
          </>
        )}

        {/* Cabinet Header / Marquee - Hidden in zoom mode */}
        {!zoomMode && (
          <div className="bg-[#121216] border-b-4 border-gray-800 py-3 px-5 flex flex-col md:flex-row items-center justify-between gap-3 relative z-10">
            {/* Speaker Vent Grilles */}
            <div className="hidden md:flex gap-1.5 opacity-30">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-2.5 h-8 bg-black rounded-full"></div>
              ))}
            </div>

            {/* Marquee Title — Gold/Red stacked retro style */}
            <div className="text-center relative select-none py-1">
              {/* Top gold border line */}
              <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-[#d4a017] to-transparent mb-1"></div>
              
              <div className="flex flex-col items-center leading-none">
                <h1
                  className="font-arcade uppercase tracking-widest leading-none"
                  style={{
                    fontSize: 'clamp(1.1rem, 2.8vw, 2.2rem)',
                    color: '#f5c518',
                    textShadow: '0 0 8px rgba(245,197,24,0.7), 2px 2px 0 #7a5c00, 4px 4px 0 #4a3800',
                  }}
                >
                  BULL
                </h1>
                <h1
                  className="font-arcade uppercase tracking-widest leading-none"
                  style={{
                    fontSize: 'clamp(1.1rem, 2.8vw, 2.2rem)',
                    color: '#cc2200',
                    textShadow: '0 0 8px rgba(204,34,0,0.6), 2px 2px 0 #6b0e00, 4px 4px 0 #3a0800',
                  }}
                >
                  BALLS
                </h1>
              </div>

              {/* Bottom gold border line */}
              <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-[#d4a017] to-transparent mt-1"></div>
            </div>

            {/* Control Panel Buttons (Sound, Zoom & Info) */}
            <div className="flex items-center gap-3">
              {/* Zoom Toggle */}
              <button
                onClick={() => {
                  audio.playTap();
                  setZoomMode(true);
                }}
                className="retro-btn btn-blue flex items-center gap-1.5 text-[9px] py-1.5 px-3"
                title="Zoom Screen Only"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>ZOOM SCREEN</span>
              </button>

              {/* Audio Toggle */}
              <button
                onClick={toggleSound}
                className={`retro-btn flex items-center gap-1.5 text-[9px] py-1.5 px-3 ${soundMuted ? 'btn-pink' : 'btn-green'}`}
                title="Toggle Audio"
              >
                {soundMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>SOUND OFF</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                    <span>SOUND ON</span>
                  </>
                )}
              </button>

              {/* Cabinet Status LED */}
              <div className="flex items-center gap-1.5 bg-[#222] border-2 border-gray-600 px-2 py-1 rounded">
                <span className="w-2 h-2 bg-retro-green rounded-full animate-ping"></span>
                <span className="text-[8px] font-arcade text-retro-green">LIVE</span>
              </div>
            </div>
          </div>
        )}

        {/* The CRT Monitor Screen Area */}
        <div className="relative bg-black crt-screen flex-1 min-h-0 border-b-4 md:border-b-8 border-gray-800 flex flex-col">
          {/* CRT Scanline Anim overlay */}
          <div className="scanline"></div>

          {/* Floating Exit Zoom overlay button */}
          {zoomMode && (
            <div className="absolute inset-x-0 top-0 z-50 flex justify-end p-3 md:p-4 pointer-events-none">
              <button
                onClick={() => {
                  audio.playTap();
                  setZoomMode(false);
                }}
                className="pointer-events-auto retro-btn retro-btn-overlay btn-pink text-[9px] flex items-center gap-2 whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity"
                title="Exit Zoom Mode"
              >
                <Minimize2 className="w-3.5 h-3.5 shrink-0" />
                <span>COMPACT MODE</span>
              </button>
            </div>
          )}

          {/* Inner Content Viewport */}
          <div className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative z-10">
            {children}
          </div>
        </div>

        {/* Physical Controls Panel (Arcade Deck) - Hidden in zoom mode */}
        {!zoomMode && (
          <div className="bg-[#1e1e26] border-t border-gray-700 py-3.5 px-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
            
            {/* Joystick and Buttons Decoration */}
            <div className="flex items-center gap-4 select-none">
              {/* Joystick Player 1 */}
              <div className="flex flex-col items-center gap-0.5">
                <div 
                  onClick={handleJoystickClick}
                  className="w-7 h-7 bg-retro-pink rounded-full border-2 border-black shadow-[0_2.5px_0_#000] cursor-pointer hover:scale-105 active:scale-95 transition-transform relative"
                >
                  <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-white opacity-40 rounded-full"></div>
                </div>
                <div className="w-2 h-5 bg-gray-600 border-x border-black"></div>
                <div className="w-10 h-2.5 bg-gray-800 border border-black rounded-full"></div>
                <span className="text-[8px] font-arcade text-gray-500">JOYSTICK P1</span>
              </div>

              {/* Action Buttons Player 1 */}
              <div className="flex gap-1.5">
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => audio.playTap()}
                    className="w-6 h-6 rounded-full bg-retro-green border-2 border-black text-[8px] font-bold text-black flex items-center justify-center hover:brightness-110 active:translate-y-0.5"
                  >A</button>
                  <span className="text-[7px] font-arcade text-gray-500 mt-0.5">PUMP</span>
                </div>
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => audio.playTap()}
                    className="w-6 h-6 rounded-full bg-retro-blue border-2 border-black text-[8px] font-bold text-black flex items-center justify-center hover:brightness-110 active:translate-y-0.5"
                  >B</button>
                  <span className="text-[7px] font-arcade text-gray-500 mt-0.5">BUY</span>
                </div>
              </div>
            </div>

            {/* Glowing Coin Slot Door */}
            <div className="flex items-center gap-3 bg-[#121216] border-2 border-gray-700 px-4 py-2 rounded-lg relative shadow-inner">
              <div className="flex flex-col items-center">
                <div className="text-[8px] font-arcade text-gray-400 mb-1">INSERT SOL MEMES</div>
                <div className="flex gap-3">
                  <button
                    onClick={handleInsertCoin}
                    className={`w-7 h-10 bg-black border flex flex-col justify-between items-center py-1 transition-all ${
                      slotPulse ? 'border-retro-green shadow-[0_0_8px_rgba(57,255,20,0.8)]' : 'border-retro-pink'
                    }`}
                  >
                    <div className="w-1 h-4 bg-yellow-400 border border-black animate-pulse"></div>
                    <span className="text-[7px] font-arcade text-retro-pink font-bold">$SOL</span>
                  </button>
                  <div className="flex flex-col justify-center">
                    <div className="text-[9px] font-arcade text-retro-green">CREDITS: {coins}</div>
                    <div className="text-[7px] text-gray-400 mt-0.5">TAP SLOT TO LOAD</div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Info / Terminal Details */}
            <div className="hidden lg:flex items-center gap-2 bg-black/60 border border-gray-800 p-2 rounded text-left">
              <Terminal className="w-5 h-5 text-retro-blue shrink-0 animate-pulse" />
              <div className="text-[8px] font-mono text-gray-400 leading-tight">
                <div>SYS.LOC: Solana Mainnet</div>
                <div>GAME.VER: v1.0.0-BETA</div>
                <div className="text-retro-pink">LORE: Ansem summoned</div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
