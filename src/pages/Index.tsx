import React, { useState, useEffect } from 'react';
import { LaptopKeyboard } from '@/components/LaptopKeyboard';
import { InstrumentSelector } from '@/components/InstrumentSelector';

import { audioEngine } from '@/components/AudioEngine';
import { Keyboard } from 'lucide-react';

const Index = () => {
  const [currentInstrument, setCurrentInstrument] = useState('piano');
  const [notesPlayed, setNotesPlayed] = useState(0);

  useEffect(() => {
    audioEngine.setInstrument(currentInstrument);
  }, [currentInstrument]);

  const handleInstrumentChange = (instrument: string) => {
    setCurrentInstrument(instrument);
  };

  const handleKeyPress = async (note: string, octave: number) => {
    await audioEngine.initialize();
    setNotesPlayed(prev => prev + 1);
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
            <div className="relative p-2 bg-gradient-primary rounded-2xl shadow-glow">
              <img 
                src="https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_episode400/40619686/40619686-1733628163627-4e90e841ab4ea.jpg" 
                alt="Swalpam Music Kelkam Logo" 
                className="w-12 h-12 rounded-xl object-cover"
                style={{
                  filter: 'brightness(1.2) contrast(1.1)',
                  background: 'transparent'
                }}
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Swalpam Music Kelkam
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional musical playground with full keyboard support, multiple octaves, and high-quality synthesized instruments.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-center items-center mb-8">
          {notesPlayed > 0 && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-card/30 backdrop-blur-sm rounded-lg border border-border/30">
              <Keyboard className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{notesPlayed} notes played</span>
            </div>
          )}
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
      </div>
    </div>
  );
};

export default Index;