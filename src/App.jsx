import React, { useEffect, useState } from 'react';
import { audio } from './components/AudioEngine';
import ArcadeCabinet from './components/ArcadeCabinet';
import StartScreen from './components/StartScreen';
import HeroSection from './components/HeroSection';
import LoreIntro from './components/LoreIntro';
import IdleGameDemo from './components/IdleGameDemo';
import Tokenomics from './components/Tokenomics';
import Roadmap from './components/Roadmap';
import Footer from './components/Footer';
import { loadSoundMutedPreference, saveSoundMutedPreference } from './preferences';

function App() {
  const [soundMuted, setSoundMuted] = useState(() => loadSoundMutedPreference());
  const [gameStarted, setGameStarted] = useState(false);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    audio.setMuted(soundMuted);
    if (!soundMuted) {
      audio.tryStartBgm();
    } else {
      audio.enableAutoplayUnlock();
    }
  }, []);

  const toggleSound = () => {
    audio.init();
    const nextMuted = !soundMuted;
    audio.setMuted(nextMuted);
    if (nextMuted) {
      audio.stopBgm();
    } else {
      audio.startBgm();
    }
    setSoundMuted(nextMuted);
    saveSoundMutedPreference(nextMuted);
  };

  const handleInsertCoin = () => {
    audio.init();
    if (!soundMuted) {
      audio.startBgm();
    }
    audio.playCoin();
    setCoins(prev => prev + 1);
  };

  return (
    <ArcadeCabinet 
      soundMuted={soundMuted} 
      toggleSound={toggleSound}
      coins={coins}
      onInsertCoin={handleInsertCoin}
    >
      {!gameStarted ? (
        <StartScreen 
          onStart={() => setGameStarted(true)}
          coins={coins}
          onInsertCoin={handleInsertCoin}
          soundMuted={soundMuted}
          toggleSound={toggleSound}
        />
      ) : (
        <>
          {/* Hero section */}
          <HeroSection />

          {/* Narrative lore dialog */}
          <div id="lore">
            <LoreIntro />
          </div>

          {/* Main interactive demo */}
          <IdleGameDemo />

          {/* Token charts & lock stats */}
          <div id="tokenomics">
            <Tokenomics />
          </div>

          {/* Progression Boss Levels */}
          <div id="roadmap">
            <Roadmap />
          </div>

          {/* Footer console */}
          <Footer />
        </>
      )}
    </ArcadeCabinet>
  );
}

export default App;
