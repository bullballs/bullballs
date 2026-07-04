import React from 'react';
import { audio } from './AudioEngine';
import { BarChart2, ShieldCheck } from 'lucide-react';
import { appConfig } from '../config';

const TwitterIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Footer() {
  const handleLinkHover = () => {
    audio.playDialogueClick();
  };

  return (
    <footer className="w-full bg-[#0a0a0c] border-t-8 border-gray-800 py-12 px-6 relative z-10 font-share text-left">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Terminal Info (6 Cols) */}
        <div className="md:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-retro-green animate-pulse" />
              <span className="font-arcade text-xs text-white">BULL_BALLS_OS Console</span>
            </div>
            <div className="bg-black border border-gray-800 p-4 rounded font-mono text-[10px] text-gray-400 leading-normal max-w-md shadow-inner">
              <div className="text-retro-green">$ cat disclamer.txt</div>
              <div className="mt-1 text-gray-500">
                DISCLAIMER: $BALLS is a memecoin with zero financial utility. It is designed entirely for retro gaming entertainment, tap-to-earn fun, and Solana community hopium. Pumping balls is highly addictive!
              </div>
              <div className="mt-2 text-retro-green">$ _</div>
            </div>
          </div>
          
          <div className="mt-6 text-[10px] font-arcade text-gray-600 tracking-wider">
            © 2026 BULL BALLS INC. ALL MEMES RESERVED.
          </div>
        </div>

        {/* Links Navigation (3 Cols) */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <span className="font-arcade text-[10px] text-retro-pink mb-2">✦ DIRECTORY ✦</span>
          <a
            href="#play-game"
            onMouseEnter={handleLinkHover}
            className="text-xs font-arcade text-gray-400 hover:text-retro-pink transition-colors w-fit"
          >
            &gt; PLAY DEMO
          </a>
          <a
            href="#lore"
            onMouseEnter={handleLinkHover}
            className="text-xs font-arcade text-gray-400 hover:text-retro-pink transition-colors w-fit"
          >
            &gt; ANSEM LORE
          </a>
          <a
            href="#tokenomics"
            onMouseEnter={handleLinkHover}
            className="text-xs font-arcade text-gray-400 hover:text-retro-pink transition-colors w-fit"
          >
            &gt; TOKENOMICS
          </a>
          <a
            href="#roadmap"
            onMouseEnter={handleLinkHover}
            className="text-xs font-arcade text-gray-400 hover:text-retro-pink transition-colors w-fit"
          >
            &gt; STAGE SELECT
          </a>
        </div>

        {/* Social / Trading Links (3 Cols) */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <span className="font-arcade text-[10px] text-retro-blue mb-2">✦ TELEPORT ✦</span>
          
          <a
            href={appConfig.social.twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={handleLinkHover}
            className="flex items-center gap-2 text-xs font-arcade text-gray-400 hover:text-retro-blue transition-colors w-fit"
          >
            <TwitterIcon className="w-4 h-4 shrink-0" />
            <span>TWITTER (X)</span>
          </a>

          <a
            href={appConfig.token.dexscreenerUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={handleLinkHover}
            className="flex items-center gap-2 text-xs font-arcade text-gray-400 hover:text-retro-blue transition-colors w-fit"
          >
            <BarChart2 className="w-4 h-4 shrink-0" />
            <span>DEXSCREENER</span>
          </a>

          {appConfig.social.telegramUrl && (
            <a
              href={appConfig.social.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={handleLinkHover}
              className="flex items-center gap-2 text-xs font-arcade text-gray-400 hover:text-retro-blue transition-colors w-fit"
            >
              <span>TELEGRAM</span>
            </a>
          )}
        </div>

      </div>
    </footer>
  );
}
