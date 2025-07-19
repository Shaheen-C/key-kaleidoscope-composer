// Web Audio API engine for sound generation
export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private oscillators: Map<string, OscillatorNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private currentInstrument: string = 'piano';

  async initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private getFrequency(note: string): number {
    const noteFrequencies: { [key: string]: number } = {
      'C': 261.63,
      'C#': 277.18,
      'D': 293.66,
      'D#': 311.13,
      'E': 329.63,
      'F': 349.23,
      'F#': 369.99,
      'G': 392.00,
      'G#': 415.30,
      'A': 440.00,
      'A#': 466.16,
      'B': 493.88,
    };
    return noteFrequencies[note] || 440;
  }

  private createPianoSound(frequency: number): { oscillator: OscillatorNode; gain: GainNode } {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    // Piano-like envelope
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + 0.3);
    
    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);
    
    return { oscillator, gain };
  }

  private createSynthSound(frequency: number): { oscillator: OscillatorNode; gain: GainNode } {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    // Synth-like envelope
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.2);
    
    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);
    
    return { oscillator, gain };
  }

  private createDrumSound(): { oscillator: OscillatorNode; gain: GainNode } {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
    
    // Drum-like envelope
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, this.audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);
    
    return { oscillator, gain };
  }

  playNote(note: string): void {
    if (!this.audioContext) return;

    this.stopNote(note); // Stop any existing note

    let soundData;
    const frequency = this.getFrequency(note);

    switch (this.currentInstrument) {
      case 'piano':
        soundData = this.createPianoSound(frequency);
        break;
      case 'synth':
        soundData = this.createSynthSound(frequency);
        break;
      case 'drums':
        soundData = this.createDrumSound();
        break;
      default:
        soundData = this.createPianoSound(frequency);
    }

    const { oscillator, gain } = soundData;
    
    this.oscillators.set(note, oscillator);
    this.gainNodes.set(note, gain);

    oscillator.start();
    
    // Auto-stop after a duration
    setTimeout(() => {
      this.stopNote(note);
    }, this.currentInstrument === 'drums' ? 300 : 1000);
  }

  stopNote(note: string): void {
    const oscillator = this.oscillators.get(note);
    const gain = this.gainNodes.get(note);

    if (oscillator && gain && this.audioContext) {
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
      setTimeout(() => {
        try {
          oscillator.stop();
        } catch (e) {
          // Oscillator might already be stopped
        }
        this.oscillators.delete(note);
        this.gainNodes.delete(note);
      }, 60);
    }
  }

  setInstrument(instrument: string): void {
    this.currentInstrument = instrument;
  }

  getInstrument(): string {
    return this.currentInstrument;
  }
}

export const audioEngine = new AudioEngine();