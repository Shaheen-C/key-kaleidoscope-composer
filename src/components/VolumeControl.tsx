import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { audioEngine } from './AudioEngine';

interface VolumeControlProps {
  className?: string;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({ className }) => {
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const actualVolume = isMuted ? 0 : volume / 100;
    audioEngine.setMasterVolume(actualVolume);
  }, [volume, isMuted]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 50) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <button
        onClick={toggleMute}
        className={cn(
          "p-2 rounded-lg transition-all duration-200",
          "hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary",
          isMuted ? "text-muted-foreground" : "text-foreground"
        )}
      >
        <VolumeIcon className="w-5 h-5" />
      </button>
      
      <div className="flex items-center space-x-2">
        <div className="relative w-24 h-2">
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className={cn(
              "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-primary",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
              "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
              "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-key",
              "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full",
              "[&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
            )}
          />
          <div
            className="absolute top-0 left-0 h-2 bg-gradient-primary rounded-lg pointer-events-none"
            style={{ width: `${isMuted ? 0 : volume}%` }}
          />
        </div>
        
        <span className="text-xs text-muted-foreground w-8 text-right">
          {isMuted ? '0' : volume}%
        </span>
      </div>
    </div>
  );
};