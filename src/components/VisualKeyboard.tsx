import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { audioEngine } from './AudioEngine';

interface KeyboardProps {
  onKeyPress?: (note: string, octave: number) => void;
}

interface KeyProps {
  note: string;
  octave: number;
  isBlack?: boolean;
  isActive?: boolean;
  onClick: () => void;
  keyBinding?: string;
}

const Key: React.FC<KeyProps> = ({ note, octave, isBlack = false, isActive = false, onClick, keyBinding }) => {
  const getKeyGradient = () => {
    if (isActive) {
      if (isBlack) return 'bg-gradient-primary';
      // Different gradients for different octaves
      switch (octave) {
        case 2: return 'bg-gradient-warm';
        case 3: return 'bg-gradient-accent';
        case 4: return 'bg-gradient-secondary';
        case 5: return 'bg-gradient-cool';
        case 6: return 'bg-gradient-primary';
        default: return 'bg-gradient-secondary';
      }
    }
    return isBlack ? 'bg-secondary' : 'bg-card';
  };

  return (
    <button
      className={cn(
        "relative transition-all duration-150 border-2 border-border/20 backdrop-blur-sm",
        "focus:outline-none focus:ring-2 focus:ring-primary",
        "select-none touch-manipulation",
        isBlack
          ? cn(
              "text-secondary-foreground h-20 md:h-24 w-6 md:w-8 z-10 -mx-1 rounded-b-lg",
              getKeyGradient(),
              isActive && "shadow-active animate-key-press scale-95"
            )
          : cn(
              "text-card-foreground h-32 md:h-40 w-8 md:w-12 rounded-b-xl",
              getKeyGradient(),
              isActive && "shadow-active animate-key-press scale-95"
            )
      )}
      onClick={onClick}
      onTouchStart={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div className={cn(
          "text-xs font-medium opacity-70",
          isBlack ? "text-secondary-foreground" : "text-card-foreground"
        )}>
          {note}{octave}
        </div>
        {keyBinding && (
          <div className={cn(
            "text-[10px] font-mono opacity-50 mt-1",
            isBlack ? "text-secondary-foreground" : "text-muted-foreground"
          )}>
            {keyBinding}
          </div>
        )}
      </div>
      
      {/* Gradient overlay on press */}
      {isActive && (
        <div className={cn(
          "absolute inset-0 rounded-inherit opacity-80",
          getKeyGradient()
        )} />
      )}
    </button>
  );
};

export const VisualKeyboard: React.FC<KeyboardProps> = ({ onKeyPress }) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [currentOctave, setCurrentOctave] = useState(4);

  // Extended keyboard mappings covering more keys
  const keyMappings = {
    // Row 1 (numbers) - Octave 6
    '1': { note: 'C', octave: 6 },
    '!': { note: 'C#', octave: 6 },
    '2': { note: 'D', octave: 6 },
    '@': { note: 'D#', octave: 6 },
    '3': { note: 'E', octave: 6 },
    '4': { note: 'F', octave: 6 },
    '$': { note: 'F#', octave: 6 },
    '5': { note: 'G', octave: 6 },
    '%': { note: 'G#', octave: 6 },
    '6': { note: 'A', octave: 6 },
    '^': { note: 'A#', octave: 6 },
    '7': { note: 'B', octave: 6 },
    '8': { note: 'C', octave: 7 },

    // Row 2 (QWERTY) - Octave 5
    'q': { note: 'C', octave: 5 },
    'Q': { note: 'C', octave: 5 },
    'w': { note: 'C#', octave: 5 },
    'W': { note: 'C#', octave: 5 },
    'e': { note: 'D', octave: 5 },
    'E': { note: 'D', octave: 5 },
    'r': { note: 'D#', octave: 5 },
    'R': { note: 'D#', octave: 5 },
    't': { note: 'E', octave: 5 },
    'T': { note: 'E', octave: 5 },
    'y': { note: 'F', octave: 5 },
    'Y': { note: 'F', octave: 5 },
    'u': { note: 'F#', octave: 5 },
    'U': { note: 'F#', octave: 5 },
    'i': { note: 'G', octave: 5 },
    'I': { note: 'G', octave: 5 },
    'o': { note: 'G#', octave: 5 },
    'O': { note: 'G#', octave: 5 },
    'p': { note: 'A', octave: 5 },
    'P': { note: 'A', octave: 5 },
    '[': { note: 'A#', octave: 5 },
    '{': { note: 'A#', octave: 5 },
    ']': { note: 'B', octave: 5 },
    '}': { note: 'B', octave: 5 },

    // Row 3 (ASDF) - Octave 4 (main)
    'a': { note: 'C', octave: 4 },
    'A': { note: 'C', octave: 4 },
    's': { note: 'C#', octave: 4 },
    'S': { note: 'C#', octave: 4 },
    'd': { note: 'D', octave: 4 },
    'D': { note: 'D', octave: 4 },
    'f': { note: 'D#', octave: 4 },
    'F': { note: 'D#', octave: 4 },
    'g': { note: 'E', octave: 4 },
    'G': { note: 'E', octave: 4 },
    'h': { note: 'F', octave: 4 },
    'H': { note: 'F', octave: 4 },
    'j': { note: 'F#', octave: 4 },
    'J': { note: 'F#', octave: 4 },
    'k': { note: 'G', octave: 4 },
    'K': { note: 'G', octave: 4 },
    'l': { note: 'G#', octave: 4 },
    'L': { note: 'G#', octave: 4 },
    ';': { note: 'A', octave: 4 },
    ':': { note: 'A', octave: 4 },
    "'": { note: 'A#', octave: 4 },
    '"': { note: 'A#', octave: 4 },
    'Enter': { note: 'B', octave: 4 },

    // Row 4 (ZXCV) - Octave 3
    'z': { note: 'C', octave: 3 },
    'Z': { note: 'C', octave: 3 },
    'x': { note: 'C#', octave: 3 },
    'X': { note: 'C#', octave: 3 },
    'c': { note: 'D', octave: 3 },
    'C': { note: 'D', octave: 3 },
    'v': { note: 'D#', octave: 3 },
    'V': { note: 'D#', octave: 3 },
    'b': { note: 'E', octave: 3 },
    'B': { note: 'E', octave: 3 },
    'n': { note: 'F', octave: 3 },
    'N': { note: 'F', octave: 3 },
    'm': { note: 'F#', octave: 3 },
    'M': { note: 'F#', octave: 3 },
    ',': { note: 'G', octave: 3 },
    '<': { note: 'G', octave: 3 },
    '.': { note: 'G#', octave: 3 },
    '>': { note: 'G#', octave: 3 },
    '/': { note: 'A', octave: 3 },
    '?': { note: 'A', octave: 3 },
    'Shift': { note: 'A#', octave: 3 },

    // Space bar for C2 (bass)
    ' ': { note: 'C', octave: 2 },
  };

  // Generate visual keyboard with multiple octaves
  const generateKeys = () => {
    const octaves = [2, 3, 4, 5, 6];
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    return octaves.flatMap(octave => 
      noteNames.map(note => {
        const keyMapping = Object.entries(keyMappings).find(
          ([_, mapping]) => mapping.note === note && mapping.octave === octave
        );
        
        return {
          note,
          octave,
          isBlack: note.includes('#'),
          keyBinding: keyMapping ? keyMapping[0] : undefined
        };
      })
    );
  };

  const keys = generateKeys();

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
    }, 150);
  }, [onKeyPress]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent repeating when key is held
      if (event.repeat) return;
      
      const mapping = keyMappings[event.key];
      if (mapping) {
        const noteKey = `${mapping.note}${mapping.octave}`;
        if (!activeKeys.has(noteKey)) {
          event.preventDefault();
          playNote(mapping.note, mapping.octave);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const mapping = keyMappings[event.key];
      if (mapping) {
        const noteKey = `${mapping.note}${mapping.octave}`;
        audioEngine.stopNote(noteKey);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeKeys, playNote]);

  // Group keys by octave for better visual organization
  const keysByOctave = keys.reduce((acc, key) => {
    if (!acc[key.octave]) acc[key.octave] = [];
    acc[key.octave].push(key);
    return acc;
  }, {} as Record<number, typeof keys>);

  return (
    <div className="relative">
      {/* Octave selector */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-card/30 backdrop-blur-sm rounded-xl p-1 border border-border/30">
          {[2, 3, 4, 5, 6].map(octave => (
            <button
              key={octave}
              onClick={() => setCurrentOctave(octave)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                currentOctave === octave
                  ? "bg-primary text-primary-foreground shadow-key"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              Oct {octave}
            </button>
          ))}
        </div>
      </div>

      {/* Full keyboard display */}
      <div className="relative overflow-x-auto">
        <div className="flex flex-col gap-2 p-4 bg-gradient-to-b from-background/50 to-background/80 backdrop-blur-xl rounded-2xl border border-border/30 shadow-glow min-w-max">
          {Object.entries(keysByOctave)
            .sort(([a], [b]) => Number(b) - Number(a)) // Highest octave first
            .map(([octave, octaveKeys]) => (
              <div key={octave} className="flex flex-col">
                <div className="text-xs text-muted-foreground mb-1 text-center">
                  Octave {octave}
                </div>
                <div className="relative flex items-end justify-center gap-0">
                  {octaveKeys
                    .filter(key => !key.isBlack)
                    .map((keyData) => (
                      <Key
                        key={`${keyData.note}${keyData.octave}`}
                        note={keyData.note}
                        octave={keyData.octave}
                        isBlack={false}
                        isActive={activeKeys.has(`${keyData.note}${keyData.octave}`)}
                        onClick={() => playNote(keyData.note, keyData.octave)}
                        keyBinding={keyData.keyBinding}
                      />
                    ))}
                  
                  {/* Black keys overlay */}
                  {octaveKeys
                    .filter(key => key.isBlack)
                    .map((keyData, index) => {
                      // Position black keys between white keys
                      const blackKeyPositions = [0.7, 1.7, 3.7, 4.7, 5.7]; // Relative positions
                      const position = blackKeyPositions[index % 5];
                      
                      return (
                        <Key
                          key={`${keyData.note}${keyData.octave}`}
                          note={keyData.note}
                          octave={keyData.octave}
                          isBlack={true}
                          isActive={activeKeys.has(`${keyData.note}${keyData.octave}`)}
                          onClick={() => playNote(keyData.note, keyData.octave)}
                          keyBinding={keyData.keyBinding}
                        />
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Enhanced instructions */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-muted-foreground text-sm">
          🎹 <strong>Full Keyboard Support:</strong> Use your entire computer keyboard to play
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-xs text-muted-foreground">
          <div className="bg-card/20 rounded-lg p-3">
            <div className="font-semibold text-accent mb-1">Numbers (1-8)</div>
            <div>Octave 6-7 (High)</div>
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
        </div>
        <p className="text-xs text-muted-foreground">
          💡 <strong>Pro Tips:</strong> Use Shift/Caps for sharps • Space bar for bass C • Click or tap any key
        </p>
      </div>
    </div>
  );
};