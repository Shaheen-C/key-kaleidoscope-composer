import React, { useState, useEffect } from 'react';
import { VisualKeyboard } from '@/components/VisualKeyboard';
import { InstrumentSelector } from '@/components/InstrumentSelector';
import { audioEngine } from '@/components/AudioEngine';
import { Music2, Volume2 } from 'lucide-react';

const Index = () => {
  const [currentInstrument, setCurrentInstrument] = useState('piano');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    audioEngine.setInstrument(currentInstrument);
  }, [currentInstrument]);

  const handleInstrumentChange = (instrument: string) => {
    setCurrentInstrument(instrument);
  };

  const handleKeyPress = async (note: string) => {
    if (!isInitialized) {
      await audioEngine.initialize();
      setIsInitialized(true);
    }
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
              Musical Playground
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create beautiful music instantly with your keyboard or touch. No experience needed—just play and explore!
          </p>
        </div>

        {/* Audio initialization prompt */}
        {!isInitialized && (
          <div className="flex justify-center mb-8">
            <button
              onClick={initializeAudio}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-primary text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-key"
            >
              <Volume2 className="w-5 h-5" />
              <span>Enable Audio</span>
            </button>
          </div>
        )}

        {/* Instrument selector */}
        <div className="mb-12">
          <InstrumentSelector
            currentInstrument={currentInstrument}
            onInstrumentChange={handleInstrumentChange}
          />
        </div>

        {/* Visual keyboard */}
        <div className="flex justify-center mb-8">
          <VisualKeyboard onKeyPress={handleKeyPress} />
        </div>

        {/* Features info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/30">
            <div className="w-12 h-12 bg-gradient-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Instant Music</h3>
            <p className="text-sm text-muted-foreground">
              No setup required. Start making music immediately with beautiful sounds.
            </p>
          </div>

          <div className="text-center p-6 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/30">
            <div className="w-12 h-12 bg-gradient-accent rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Multiple Instruments</h3>
            <p className="text-sm text-muted-foreground">
              Switch between piano, synthesizer, and drums for different musical experiences.
            </p>
          </div>

          <div className="text-center p-6 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/30">
            <div className="w-12 h-12 bg-gradient-warm rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Touch & Keyboard</h3>
            <p className="text-sm text-muted-foreground">
              Play with your computer keyboard or tap the visual keys on any device.
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="text-center mt-12">
          <div className="inline-block p-4 bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Pro tip:</strong> Hold keys longer for sustained notes, or try playing multiple keys together for chords!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
