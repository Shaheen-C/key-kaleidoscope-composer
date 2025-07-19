import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { audioEngine } from './AudioEngine';

interface KeyboardProps {
  onKeyPress?: (note: string) => void;
}

interface KeyProps {
  note: string;
  isBlack?: boolean;
  isActive?: boolean;
  onClick: () => void;
  keyBinding?: string;
}

const Key: React.FC<KeyProps> = ({ note, isBlack = false, isActive = false, onClick, keyBinding }) => {
  return (
    <button
      className={cn(
        "relative transition-all duration-150 border-2 border-border/20 backdrop-blur-sm",
        "focus:outline-none focus:ring-2 focus:ring-primary",
        "select-none touch-manipulation",
        isBlack
          ? cn(
              "bg-gradient-to-b from-secondary to-secondary/80 text-secondary-foreground",
              "h-24 w-8 md:w-10 z-10 -mx-1 rounded-b-lg",
              isActive && "bg-gradient-primary shadow-active animate-key-press scale-95"
            )
          : cn(
              "bg-gradient-to-b from-card to-card/90 text-card-foreground",
              "h-40 w-12 md:w-16 rounded-b-xl",
              isActive && "bg-gradient-accent shadow-active animate-key-press scale-95"
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
          {note}
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
          "absolute inset-0 rounded-inherit",
          isBlack 
            ? "bg-gradient-primary opacity-80" 
            : "bg-gradient-secondary opacity-60"
        )} />
      )}
    </button>
  );
};

export const VisualKeyboard: React.FC<KeyboardProps> = ({ onKeyPress }) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  const keys = [
    { note: 'C', key: 'a' },
    { note: 'C#', key: 'w', isBlack: true },
    { note: 'D', key: 's' },
    { note: 'D#', key: 'e', isBlack: true },
    { note: 'E', key: 'd' },
    { note: 'F', key: 'f' },
    { note: 'F#', key: 't', isBlack: true },
    { note: 'G', key: 'g' },
    { note: 'G#', key: 'y', isBlack: true },
    { note: 'A', key: 'h' },
    { note: 'A#', key: 'u', isBlack: true },
    { note: 'B', key: 'j' },
  ];

  const playNote = useCallback(async (note: string) => {
    await audioEngine.initialize();
    audioEngine.playNote(note);
    
    setActiveKeys(prev => new Set(prev).add(note));
    onKeyPress?.(note);
    
    // Remove active state after animation
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }, 150);
  }, [onKeyPress]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = keys.find(k => k.key.toLowerCase() === event.key.toLowerCase());
      if (key && !activeKeys.has(key.note)) {
        event.preventDefault();
        playNote(key.note);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = keys.find(k => k.key.toLowerCase() === event.key.toLowerCase());
      if (key) {
        audioEngine.stopNote(key.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys, activeKeys, playNote]);

  return (
    <div className="relative">
      {/* Keyboard Container */}
      <div className="relative flex items-end justify-center gap-0 p-4 bg-gradient-to-b from-background/50 to-background/80 backdrop-blur-xl rounded-2xl border border-border/30 shadow-glow">
        {keys.map((keyData) => {
          const isBlack = keyData.isBlack || false;
          return (
            <Key
              key={keyData.note}
              note={keyData.note}
              isBlack={isBlack}
              isActive={activeKeys.has(keyData.note)}
              onClick={() => playNote(keyData.note)}
              keyBinding={keyData.key.toUpperCase()}
            />
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center">
        <p className="text-muted-foreground text-sm">
          Click keys or use your keyboard • {keys.map(k => k.key.toUpperCase()).join(' ')}
        </p>
      </div>
    </div>
  );
};