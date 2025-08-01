import React from 'react';
import { cn } from '@/lib/utils';
import { Music, Piano, Waves, Drum, Church, Zap, Bell } from 'lucide-react';

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
    description: 'Classic acoustic piano with rich harmonics'
  },
  {
    id: 'synth',
    name: 'Synthesizer',
    icon: Waves,
    gradient: 'bg-gradient-secondary',
    description: 'Electronic synth with filter sweeps'
  },
  {
    id: 'organ',
    name: 'Organ',
    icon: Church,
    gradient: 'bg-gradient-accent',
    description: 'Classic church organ sound'
  },
  {
    id: 'bass',
    name: 'Bass',
    icon: Zap,
    gradient: 'bg-gradient-warm',
    description: 'Deep bass tones for rhythm'
  },
  {
    id: 'bell',
    name: 'Bells',
    icon: Bell,
    gradient: 'bg-gradient-cool',
    description: 'Metallic bell sounds with long decay'
  },
  {
    id: 'drums',
    name: 'Drums',
    icon: Drum,
    gradient: 'bg-gradient-secondary',
    description: 'Percussive drum kit sounds'
  }
];

export const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  currentInstrument,
  onInstrumentChange
}) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center space-x-2 text-foreground">
        <Music className="w-6 h-6" />
        <h2 className="text-xl font-semibold">Choose Your Instrument</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl">
        {instruments.map((instrument) => {
          const Icon = instrument.icon;
          const isActive = currentInstrument === instrument.id;
          
          return (
            <button
              key={instrument.id}
              onClick={() => onInstrumentChange(instrument.id)}
              className={cn(
                "relative group flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300",
                "hover:scale-105 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary",
                "bg-card/50 backdrop-blur-sm min-h-[120px] w-full",
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
                "relative p-3 rounded-xl mb-2 transition-all duration-300",
                isActive 
                  ? cn(instrument.gradient, "text-white shadow-lg")
                  : "bg-secondary text-secondary-foreground group-hover:bg-secondary/80"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              
              {/* Text */}
              <div className="relative text-center flex-1 flex flex-col justify-center">
                <h3 className={cn(
                  "font-semibold text-sm mb-1",
                  isActive ? "text-primary" : "text-foreground"
                )}>
                  {instrument.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-tight">
                  {instrument.description}
                </p>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse-glow" />
              )}

              {/* Sound preview on hover */}
              <div className={cn(
                "absolute bottom-2 left-2 text-xs px-2 py-1 rounded-full transition-all duration-300",
                "bg-black/20 text-white opacity-0 group-hover:opacity-100",
                isActive && "opacity-100"
              )}>
                {isActive ? 'Active' : 'Preview'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Instrument info display */}
      <div className="text-center bg-card/30 backdrop-blur-sm rounded-xl p-4 border border-border/30 max-w-md">
        <div className="text-sm text-muted-foreground">
          <strong className="text-foreground">Current:</strong> {instruments.find(i => i.id === currentInstrument)?.name || 'Piano'}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {instruments.find(i => i.id === currentInstrument)?.description || 'Classic acoustic piano'}
        </div>
      </div>
    </div>
  );
};