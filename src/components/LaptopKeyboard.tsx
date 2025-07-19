import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { audioEngine } from './AudioEngine';

interface LaptopKeyboardProps {
  onKeyPress?: (note: string, octave: number) => void;
}

interface KeyProps {
  keyCode: string;
  note: string;
  octave: number;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}

const LaptopKey: React.FC<KeyProps> = ({ 
  keyCode, 
  note, 
  octave, 
  isActive = false, 
  onClick, 
  className,
  children 
}) => {
  return (
    <button
      className={cn(
        "relative flex items-center justify-center rounded-lg border-2 transition-all duration-150",
        "bg-card/80 backdrop-blur-sm border-border/30 text-card-foreground",
        "hover:bg-card hover:border-border/50 hover:scale-105",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        "select-none touch-manipulation font-mono text-sm font-medium",
        "shadow-lg hover:shadow-xl",
        isActive && [
          "scale-95 bg-gradient-primary border-primary/50",
          "shadow-active text-white",
          "animate-pulse-glow"
        ],
        className
      )}
      onClick={onClick}
      onTouchStart={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <div className="flex flex-col items-center justify-center space-y-1">
        <div className="text-xs opacity-70">{keyCode}</div>
        <div className="text-xs font-bold">{note}{octave}</div>
      </div>
      {children}
      
      {/* Gradient glow effect when active */}
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-lg bg-gradient-primary opacity-80 animate-pulse" />
          <div className="absolute -inset-4 rounded-xl bg-gradient-primary opacity-30 blur-lg animate-pulse-glow" />
          <div className="absolute -inset-8 rounded-2xl bg-gradient-primary opacity-20 blur-2xl animate-pulse-glow" />
        </>
      )}
    </button>
  );
};

export const LaptopKeyboard: React.FC<LaptopKeyboardProps> = ({ onKeyPress }) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // Laptop keyboard layout with musical mappings
  const keyboardLayout = [
    // Number row (Octave 6)
    {
      row: 'numbers',
      keys: [
        { code: '1', note: 'C', octave: 6, width: 'w-12', height: 'h-12' },
        { code: '2', note: 'D', octave: 6, width: 'w-12', height: 'h-12' },
        { code: '3', note: 'E', octave: 6, width: 'w-12', height: 'h-12' },
        { code: '4', note: 'F', octave: 6, width: 'w-12', height: 'h-12' },
        { code: '5', note: 'G', octave: 6, width: 'w-12', height: 'h-12' },
        { code: '6', note: 'A', octave: 6, width: 'w-12', height: 'h-12' },
        { code: '7', note: 'B', octave: 6, width: 'w-12', height: 'h-12' },
        { code: '8', note: 'C', octave: 7, width: 'w-12', height: 'h-12' },
        { code: '9', note: 'D', octave: 7, width: 'w-12', height: 'h-12' },
        { code: '0', note: 'E', octave: 7, width: 'w-12', height: 'h-12' },
      ]
    },
    // QWERTY row (Octave 5)
    {
      row: 'qwerty',
      keys: [
        { code: 'Q', note: 'C', octave: 5, width: 'w-12', height: 'h-12' },
        { code: 'W', note: 'C#', octave: 5, width: 'w-12', height: 'h-12' },
        { code: 'E', note: 'D', octave: 5, width: 'w-12', height: 'h-12' },
        { code: 'R', note: 'D#', octave: 5, width: 'w-12', height: 'h-12' },
        { code: 'T', note: 'E', octave: 5, width: 'w-12', height: 'h-12' },
        { code: 'Y', note: 'F', octave: 5, width: 'w-12', height: 'h-12' },
        { code: 'U', note: 'F#', octave: 5, width: 'w-12', height: 'h-12' },
        { code: 'I', note: 'G', octave: 5, width: 'w-12', height: 'h-12' },
        { code: 'O', note: 'G#', octave: 5, width: 'w-12', height: 'h-12' },
        { code: 'P', note: 'A', octave: 5, width: 'w-12', height: 'h-12' },
      ]
    },
    // ASDF row (Octave 4 - Main)
    {
      row: 'asdf',
      keys: [
        { code: 'A', note: 'C', octave: 4, width: 'w-12', height: 'h-12' },
        { code: 'S', note: 'C#', octave: 4, width: 'w-12', height: 'h-12' },
        { code: 'D', note: 'D', octave: 4, width: 'w-12', height: 'h-12' },
        { code: 'F', note: 'D#', octave: 4, width: 'w-12', height: 'h-12' },
        { code: 'G', note: 'E', octave: 4, width: 'w-12', height: 'h-12' },
        { code: 'H', note: 'F', octave: 4, width: 'w-12', height: 'h-12' },
        { code: 'J', note: 'F#', octave: 4, width: 'w-12', height: 'h-12' },
        { code: 'K', note: 'G', octave: 4, width: 'w-12', height: 'h-12' },
        { code: 'L', note: 'G#', octave: 4, width: 'w-12', height: 'h-12' },
        { code: ';', note: 'A', octave: 4, width: 'w-12', height: 'h-12' },
      ]
    },
    // ZXCV row (Octave 3)
    {
      row: 'zxcv',
      keys: [
        { code: 'Z', note: 'C', octave: 3, width: 'w-12', height: 'h-12' },
        { code: 'X', note: 'C#', octave: 3, width: 'w-12', height: 'h-12' },
        { code: 'C', note: 'D', octave: 3, width: 'w-12', height: 'h-12' },
        { code: 'V', note: 'D#', octave: 3, width: 'w-12', height: 'h-12' },
        { code: 'B', note: 'E', octave: 3, width: 'w-12', height: 'h-12' },
        { code: 'N', note: 'F', octave: 3, width: 'w-12', height: 'h-12' },
        { code: 'M', note: 'F#', octave: 3, width: 'w-12', height: 'h-12' },
        { code: ',', note: 'G', octave: 3, width: 'w-12', height: 'h-12' },
        { code: '.', note: 'G#', octave: 3, width: 'w-12', height: 'h-12' },
        { code: '/', note: 'A', octave: 3, width: 'w-12', height: 'h-12' },
      ]
    },
    // Space bar (Bass)
    {
      row: 'space',
      keys: [
        { code: 'Space', note: 'C', octave: 2, width: 'w-96', height: 'h-12' },
      ]
    }
  ];

  // Create key mapping for event handling
  const keyMappings = React.useMemo(() => {
    const mappings: Record<string, { note: string; octave: number }> = {};
    keyboardLayout.forEach(row => {
      row.keys.forEach(key => {
        const keyCode = key.code === 'Space' ? ' ' : key.code.toLowerCase();
        mappings[keyCode] = { note: key.note, octave: key.octave };
        // Also map uppercase
        if (key.code !== 'Space') {
          mappings[key.code.toUpperCase()] = { note: key.note, octave: key.octave };
        }
      });
    });
    return mappings;
  }, []);

  const playNote = useCallback(async (note: string, octave: number) => {
    await audioEngine.initialize();
    audioEngine.playNote(note, octave);
    
    const noteKey = `${note}${octave}`;
    setActiveKeys(prev => new Set(prev).add(noteKey));
    onKeyPress?.(note, octave);
    
    // Remove active state after animation
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteKey);
        return newSet;
      });
    }, 200);
  }, [onKeyPress]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent repeating when key is held
      if (event.repeat) return;
      
      const key = event.key === ' ' ? ' ' : event.key.toLowerCase();
      
      // Prevent if already pressed
      if (pressedKeys.has(key)) return;
      
      const mapping = keyMappings[key];
      if (mapping) {
        event.preventDefault();
        setPressedKeys(prev => new Set(prev).add(key));
        playNote(mapping.note, mapping.octave);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key === ' ' ? ' ' : event.key.toLowerCase();
      const mapping = keyMappings[key];
      
      if (mapping) {
        setPressedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
        
        const noteKey = `${mapping.note}${mapping.octave}`;
        audioEngine.stopNote(noteKey);
      }
    };

    // Handle window blur to stop all notes
    const handleBlur = () => {
      audioEngine.stopAllNotes();
      setPressedKeys(new Set());
      setActiveKeys(new Set());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [keyMappings, playNote]);

  return (
    <div className="relative">
      {/* Gradient glow background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from(activeKeys).map((noteKey, index) => (
          <div
            key={noteKey}
            className="absolute inset-0 animate-pulse-glow"
            style={{
              background: `radial-gradient(circle at ${50 + (index * 20) % 100}% ${50 + (index * 30) % 100}%, 
                hsl(0 84% 60% / 0.4) 0%, 
                hsl(15 84% 65% / 0.3) 20%, 
                hsl(30 90% 60% / 0.2) 40%, 
                hsl(340 84% 60% / 0.1) 60%, 
                transparent 100%)`
            }}
          />
        ))}
      </div>

      {/* Keyboard layout */}
      <div className="relative z-10 bg-card/20 backdrop-blur-xl rounded-3xl p-8 border border-border/30 shadow-glow">
        <div className="space-y-4">
          {keyboardLayout.map((row) => (
            <div 
              key={row.row} 
              className={cn(
                "flex justify-center gap-2",
                row.row === 'space' && "mt-6"
              )}
            >
              {row.keys.map((key) => {
                const noteKey = `${key.note}${key.octave}`;
                const keyCode = key.code === 'Space' ? ' ' : key.code.toLowerCase();
                const isActive = activeKeys.has(noteKey) || pressedKeys.has(keyCode);
                
                return (
                  <LaptopKey
                    key={`${key.code}-${key.note}-${key.octave}`}
                    keyCode={key.code}
                    note={key.note}
                    octave={key.octave}
                    isActive={isActive}
                    onClick={() => playNote(key.note, key.octave)}
                    className={cn(key.width, key.height)}
                  >
                    {/* Additional glow effect for active keys */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-lg bg-gradient-primary opacity-60 animate-pulse" />
                    )}
                  </LaptopKey>
                );
              })}
            </div>
          ))}
        </div>

        {/* Keyboard info */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-muted-foreground text-sm">
            💻 <strong>Laptop Keyboard Layout:</strong> Play music with your computer keyboard
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-4xl mx-auto text-xs text-muted-foreground">
            <div className="bg-card/20 rounded-lg p-3">
              <div className="font-semibold text-accent mb-1">Numbers (1-0)</div>
              <div>Octaves 6-7 (High)</div>
            </div>
            <div className="bg-card/20 rounded-lg p-3">
              <div className="font-semibold text-primary mb-1">QWERTY Row</div>
              <div>Octave 5 (Upper)</div>
            </div>
            <div className="bg-card/20 rounded-lg p-3">
              <div className="font-semibold text-secondary-foreground mb-1">ASDF Row</div>
              <div>Octave 4 (Middle)</div>
            </div>
            <div className="bg-card/20 rounded-lg p-3">
              <div className="font-semibold text-muted-foreground mb-1">ZXCV Row</div>
              <div>Octave 3 (Low)</div>
            </div>
            <div className="bg-card/20 rounded-lg p-3">
              <div className="font-semibold text-warm mb-1">Space Bar</div>
              <div>Bass C (Octave 2)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};