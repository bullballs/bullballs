import React, { useState, useEffect } from 'react';
import { audio } from './AudioEngine';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const dialogueSlides = [
  {
    speaker: "ANSEM",
    avatarColor: "border-retro-pink",
    text: "Yo degen... look at you. Stuck here in Pumpfun Purgatory. All your bags rugged. The Dev sold for a 5k mcap and is already on a beach in Bali."
  },
  {
    speaker: "ANSEM",
    avatarColor: "border-retro-pink",
    text: "You bought the top, didn't you? It's okay. We've all been there. But we can't let the jeets win. There is still hope in the Solana trenches."
  },
  {
    speaker: "ANSEM",
    avatarColor: "border-retro-pink",
    text: "To escape this purgatory, we must invoke the ultimate runes of Hopium. We must call upon the absolute unit: THE BULL."
  },
  {
    speaker: "ANSEM",
    avatarColor: "border-retro-green",
    text: "By tapping the giant BULL BALLS, we will launch green candles so massive they will shatter the charts and blast us straight into Valhalla!"
  },
  {
    speaker: "ANSEM",
    avatarColor: "border-retro-blue",
    text: "Are you ready, kid? Grab your mouse, charge your wallet, and let's pump this token to a 100M market cap. THE SUPERCYCLE IS NOW!"
  }
];

export default function LoreIntro() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const slide = dialogueSlides[currentSlide];

  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    setIsTyping(true);
    let intervalId = setInterval(() => {
      if (index < slide.text.length) {
        setDisplayedText(prev => prev + slide.text.charAt(index));
        // Play typing chiptune blip
        if (index % 2 === 0) {
          audio.playDialogueClick();
        }
        index++;
      } else {
        setIsTyping(false);
        clearInterval(intervalId);
      }
    }, 30); // Speed of typewriter

    return () => clearInterval(intervalId);
  }, [currentSlide]);

  const handleNext = () => {
    if (isTyping) {
      // Skip to the end of the text
      setDisplayedText(slide.text);
      setIsTyping(false);
      audio.playTap();
    } else {
      if (currentSlide < dialogueSlides.length - 1) {
        setCurrentSlide(prev => prev + 1);
        audio.playTap();
      } else {
        // Reset or trigger completion
        setCurrentSlide(0);
        audio.playCoin();
      }
    }
  };

  const handleReset = () => {
    setCurrentSlide(0);
    audio.playCoin();
  };

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto w-full">
      <div className="text-center mb-8">
        <h3 className="font-arcade text-lg md:text-xl text-retro-pink tracking-widest uppercase">
          ✦ STORY SCREEN ✦
        </h3>
        <p className="text-gray-400 text-xs md:text-sm mt-1 uppercase tracking-wider">
          Ansem speaks to the Trench Survivors
        </p>
      </div>

      {/* Retro Dialogue Box Panel */}
      <div className="retro-panel retro-panel-pink bg-black/90 p-4 md:p-6 rounded flex flex-col md:flex-row gap-6 items-start relative min-h-[220px]">
        {/* Animated Grid Lines behind dialogue box */}
        <div className="absolute inset-0 opacity-10 bg-grid-pattern pointer-events-none rounded"></div>

        {/* Real Avatar image asset /public/ansem.png */}
        <div className={`w-24 h-24 shrink-0 bg-gray-900 border-4 ${slide.avatarColor} rounded flex flex-col items-center justify-center p-1 shadow-[0_4px_0_rgba(0,0,0,0.5)] overflow-hidden select-none`}>
          <img 
            src="/ansem.png" 
            alt="Ansem Avatar" 
            className="w-14 h-14 object-contain image-rendering-pixelated mt-1 animate-pulse"
          />
          <div className="text-[8px] font-arcade text-white tracking-widest mt-auto bg-black/80 w-full text-center py-0.5 rounded uppercase">
            {slide.speaker}
          </div>
        </div>

        {/* Dialogue Text Content Area */}
        <div className="flex-1 flex flex-col justify-between h-full w-full min-h-[120px]">
          <div>
            <div className="flex items-center justify-between border-b-2 border-dashed border-gray-800 pb-2 mb-3">
              <span className="font-arcade text-xs text-retro-pink tracking-wider">MESSAGE RECEIVED:</span>
              <span className="text-[9px] font-mono text-gray-500">TRANSMISSION 0{currentSlide + 1}</span>
            </div>
            <p className="text-lg md:text-xl font-retro text-gray-100 leading-normal tracking-wide text-left min-h-[80px]">
              {displayedText}
              {isTyping && <span className="inline-block w-2.5 h-4 bg-retro-pink animate-ping ml-1"></span>}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
            {/* Dialogue index indicators */}
            <div className="flex gap-1.5">
              {dialogueSlides.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-3 h-3 border border-gray-600 transition-colors ${
                    idx === currentSlide ? 'bg-retro-pink border-retro-pink' : 'bg-transparent'
                  }`}
                ></div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {currentSlide === dialogueSlides.length - 1 && !isTyping && (
                <button
                  onClick={handleReset}
                  className="retro-btn btn-blue py-1.5 px-3 flex items-center gap-1.5 text-[10px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> REPLAY
                </button>
              )}
              <button
                onClick={handleNext}
                className="retro-btn btn-pink py-1.5 px-4 flex items-center gap-1.5 text-[10px] animate-pulse"
              >
                <span>{isTyping ? "SKIP" : currentSlide === dialogueSlides.length - 1 ? "FINISH" : "NEXT"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
