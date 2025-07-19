import React from 'react';
import { cn } from '@/lib/utils';
import { Music, Piano, Waves, Drum } from 'lucide-react';

interface InstrumentSelectorProps {
  currentInstrument: string;
  onInstrumentChange: (instrument: string) => void;
}

const instruments = [
  {
    id: 'piano',
    name: 'Piano',
    icon: Piano,
    gradient: 'bg-gradient-primary',
    description: 'Classic piano sound'
  },
  {
    id: 'synth',
    name: 'Synth',
    icon: Waves,
    gradient: 'bg-gradient-secondary',
    description: 'Electronic synthesizer'
  },
  {
    id: 'drums',
    name: 'Drums',
    icon: Drum,
    gradient: 'bg-gradient-warm',
    description: 'Percussion sounds'
  }
];

export const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  currentInstrument,
  onInstrumentChange
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-2 text-foreground">
        <Music className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Choose Your Instrument</h2>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4">
        {instruments.map((instrument) => {
          const Icon = instrument.icon;
          const isActive = currentInstrument === instrument.id;
          
          return (
            <button
              key={instrument.id}
              onClick={() => onInstrumentChange(instrument.id)}
              className={cn(
                "relative group flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300",
                "hover:scale-105 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary",
                "bg-card/50 backdrop-blur-sm",
                isActive
                  ? "border-primary shadow-active scale-105"
                  : "border-border/30 hover:border-primary/50"
              )}
            >
              {/* Background gradient on active */}
              {isActive && (
                <div className={cn(
                  "absolute inset-0 rounded-2xl opacity-20",
                  instrument.gradient
                )} />
              )}
              
              {/* Icon */}
              <div className={cn(
                "relative p-3 rounded-xl mb-3 transition-all duration-300",
                isActive 
                  ? cn(instrument.gradient, "text-white shadow-lg")
                  : "bg-secondary text-secondary-foreground group-hover:bg-secondary/80"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              
              {/* Text */}
              <div className="relative text-center">
                <h3 className={cn(
                  "font-semibold text-sm mb-1",
                  isActive ? "text-primary" : "text-foreground"
                )}>
                  {instrument.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {instrument.description}
                </p>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse-glow" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};