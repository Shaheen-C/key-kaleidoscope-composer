import React, { useState, useEffect } from 'react';
import { LaptopKeyboard } from '@/components/LaptopKeyboard';
import { InstrumentSelector } from '@/components/InstrumentSelector';
import { VolumeControl } from '@/components/VolumeControl';
import { audioEngine } from '@/components/AudioEngine';
import { Music2, Volume2, Keyboard, Sparkles } from 'lucide-react';

const Index = () => {
  const [currentInstrument, setCurrentInstrument] = useState('piano');
  const [isInitialized, setIsInitialized] = useState(false);
  const [notesPlayed, setNotesPlayed] = useState(0);

  useEffect(() => {
    audioEngine.setInstrument(currentInstrument);
  }, [currentInstrument]);

  const handleInstrumentChange = (instrument: string) => {
    setCurrentInstrument(instrument);
  };

  const handleKeyPress = async (note: string, octave: number) => {
    if (!isInitialized) {
      await audioEngine.initialize();
      setIsInitialized(true);
    }
    setNotesPlayed(prev => prev + 1);
  };

  const initializeAudio = async () => {
    await audioEngine.initialize();
    setIsInitialized(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" />
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow">
              <Music2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Enhanced Musical Playground
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional-grade musical experience with full keyboard support, multiple octaves, and high-quality synthesized instruments.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            {!isInitialized && (
              <button
                onClick={initializeAudio}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-primary text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-key"
              >
                <Volume2 className="w-5 h-5" />
                <span>Enable Audio</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-6">
            {notesPlayed > 0 && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-card/30 backdrop-blur-sm rounded-lg border border-border/30">
                <Keyboard className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{notesPlayed} notes played</span>
              </div>
            )}
            {isInitialized && <VolumeControl />}
          </div>
        </div>

        {/* Instrument selector */}
        <div className="mb-12">
          <InstrumentSelector
            currentInstrument={currentInstrument}
            onInstrumentChange={handleInstrumentChange}
          />
        </div>

        {/* Visual keyboard */}
        <div className="flex justify-center mb-8">
          <LaptopKeyboard onKeyPress={handleKeyPress} />
        </div>

        {/* Features info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="text-center p-6 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/30">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Keyboard className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Full Keyboard</h3>
            <p className="text-sm text-muted-foreground">
              Laptop keyboard layout with visual feedback and gradient glow effects.
            </p>
          </div>

          <div className="text-center p-6 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/30">
            <div className="w-12 h-12 bg-gradient-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">6 Instruments</h3>
            <p className="text-sm text-muted-foreground">
              Piano, synth, organ, bass, bells, and drums with realistic sound characteristics.
            </p>
          </div>

          <div className="text-center p-6 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/30">
            <div className="w-12 h-12 bg-gradient-accent rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Audio Engine</h3>
            <p className="text-sm text-muted-foreground">
              Professional Web Audio API with reverb, filters, and precise ADSR envelopes.
            </p>
          </div>

          <div className="text-center p-6 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/30">
            <div className="w-12 h-12 bg-gradient-warm rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Responsive</h3>
            <p className="text-sm text-muted-foreground">
              Optimized for desktop and mobile with touch support and visual feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;