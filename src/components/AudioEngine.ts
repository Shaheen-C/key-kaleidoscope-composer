// Enhanced Web Audio API engine for high-quality sound generation
export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private oscillators: Map<string, OscillatorNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private currentInstrument: string = 'piano';
  private masterGain: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private delay: DelayNode | null = null;
  private filter: BiquadFilterNode | null = null;

  async initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Create master gain and effects
    this.setupMasterChain();
  }

  private setupMasterChain() {
    if (!this.audioContext) return;

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.audioContext.currentTime);

    // Create reverb
    this.reverb = this.audioContext.createConvolver();
    this.createReverbImpulse();

    // Create delay
    this.delay = this.audioContext.createDelay(1.0);
    this.delay.delayTime.setValueAtTime(0.1, this.audioContext.currentTime);

    // Create filter
    this.filter = this.audioContext.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(8000, this.audioContext.currentTime);

    // Connect effects chain
    this.masterGain.connect(this.filter!);
    this.filter!.connect(this.audioContext.destination);
  }

  private createReverbImpulse() {
    if (!this.audioContext || !this.reverb) return;

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 2; // 2 seconds of reverb
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }

    this.reverb.buffer = impulse;
  }

  private getFrequency(note: string, octave: number = 4): number {
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
    
    const baseFreq = noteFrequencies[note] || 440;
    // Adjust for octave (C4 = 261.63Hz is our base)
    return baseFreq * Math.pow(2, octave - 4);
  }

  private createPianoSound(frequency: number): { oscillator: OscillatorNode; gain: GainNode } {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    // Create multiple oscillators for richer piano sound
    const fundamental = this.audioContext.createOscillator();
    const harmonic1 = this.audioContext.createOscillator();
    const harmonic2 = this.audioContext.createOscillator();
    
    const gain = this.audioContext.createGain();
    const gain1 = this.audioContext.createGain();
    const gain2 = this.audioContext.createGain();
    
    // Set up fundamental frequency
    fundamental.type = 'triangle';
    fundamental.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    // Add harmonics for richer sound
    harmonic1.type = 'sine';
    harmonic1.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
    harmonic2.type = 'sine';
    harmonic2.frequency.setValueAtTime(frequency * 3, this.audioContext.currentTime);
    
    // Set harmonic levels
    gain1.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain2.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    
    // Piano-like ADSR envelope
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, this.audioContext.currentTime + 0.01); // Attack
    gain.gain.exponentialRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1); // Decay
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime + 0.2); // Sustain
    
    // Connect oscillators
    fundamental.connect(gain);
    harmonic1.connect(gain1);
    harmonic2.connect(gain2);
    
    gain1.connect(gain);
    gain2.connect(gain);
    gain.connect(this.masterGain!);
    
    return { oscillator: fundamental, gain };
  }

  private createSynthSound(frequency: number): { oscillator: OscillatorNode; gain: GainNode } {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    // Synth filter sweep
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(frequency * 8, this.audioContext.currentTime + 0.1);
    filter.Q.setValueAtTime(5, this.audioContext.currentTime);
    
    // Synth envelope
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.6, this.audioContext.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.2);
    
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    
    return { oscillator, gain };
  }

  private createOrganSound(frequency: number): { oscillator: OscillatorNode; gain: GainNode } {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const gain1 = this.audioContext.createGain();
    const gain2 = this.audioContext.createGain();
    
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    oscillator1.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator2.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
    
    gain1.gain.setValueAtTime(0.7, this.audioContext.currentTime);
    gain2.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    
    // Organ envelope - slower attack
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.6, this.audioContext.currentTime + 0.1);
    
    oscillator1.connect(gain1);
    oscillator2.connect(gain2);
    gain1.connect(gain);
    gain2.connect(gain);
    gain.connect(this.masterGain!);
    
    return { oscillator: oscillator1, gain };
  }

  private createBassSound(frequency: number): { oscillator: OscillatorNode; gain: GainNode } {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
    filter.Q.setValueAtTime(2, this.audioContext.currentTime);
    
    // Bass envelope
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, this.audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.4, this.audioContext.currentTime + 0.3);
    
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    
    return { oscillator, gain };
  }

  private createDrumSound(drumType: string = 'kick'): { oscillator: OscillatorNode; gain: GainNode } {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    switch (drumType) {
      case 'kick':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
        break;
      case 'snare':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        break;
      case 'hihat':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(8000, this.audioContext.currentTime);
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, this.audioContext.currentTime);
        break;
      default:
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
    }
    
    // Drum envelope - quick decay
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(1.0, this.audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    
    return { oscillator, gain };
  }

  private createBellSound(frequency: number): { oscillator: OscillatorNode; gain: GainNode } {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const fundamental = this.audioContext.createOscillator();
    const harmonic1 = this.audioContext.createOscillator();
    const harmonic2 = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const gain1 = this.audioContext.createGain();
    const gain2 = this.audioContext.createGain();
    
    fundamental.type = 'sine';
    harmonic1.type = 'sine';
    harmonic2.type = 'sine';
    
    fundamental.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    harmonic1.frequency.setValueAtTime(frequency * 2.76, this.audioContext.currentTime);
    harmonic2.frequency.setValueAtTime(frequency * 5.4, this.audioContext.currentTime);
    
    gain1.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gain2.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    
    // Bell envelope - slow decay
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, this.audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + 2.0);
    
    fundamental.connect(gain);
    harmonic1.connect(gain1);
    harmonic2.connect(gain2);
    gain1.connect(gain);
    gain2.connect(gain);
    gain.connect(this.masterGain!);
    
    return { oscillator: fundamental, gain };
  }

  playNote(note: string, octave: number = 4): void {
    if (!this.audioContext) return;

    const noteKey = `${note}${octave}`;
    this.stopNote(noteKey);

    let soundData;
    const frequency = this.getFrequency(note, octave);

    switch (this.currentInstrument) {
      case 'piano':
        soundData = this.createPianoSound(frequency);
        break;
      case 'synth':
        soundData = this.createSynthSound(frequency);
        break;
      case 'organ':
        soundData = this.createOrganSound(frequency);
        break;
      case 'bass':
        soundData = this.createBassSound(frequency);
        break;
      case 'bell':
        soundData = this.createBellSound(frequency);
        break;
      case 'drums':
        soundData = this.createDrumSound(note);
        break;
      default:
        soundData = this.createPianoSound(frequency);
    }

    const { oscillator, gain } = soundData;
    
    this.oscillators.set(noteKey, oscillator);
    this.gainNodes.set(noteKey, gain);

    oscillator.start();
    
    // Auto-stop after duration based on instrument
    const duration = this.currentInstrument === 'drums' ? 500 : 
                    this.currentInstrument === 'bell' ? 3000 : 2000;
    
    setTimeout(() => {
      this.stopNote(noteKey);
    }, duration);
  }

  stopNote(noteKey: string): void {
    const oscillator = this.oscillators.get(noteKey);
    const gain = this.gainNodes.get(noteKey);

    if (oscillator && gain && this.audioContext) {
      // Immediate stop to prevent stuck notes
      gain.gain.setValueAtTime(gain.gain.value, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
      setTimeout(() => {
        try {
          oscillator.stop();
          oscillator.disconnect();
          gain.disconnect();
        } catch (e) {
          // Oscillator might already be stopped
        }
        this.oscillators.delete(noteKey);
        this.gainNodes.delete(noteKey);
      }, 60);
    }
  }

  stopAllNotes(): void {
    this.oscillators.forEach((_, noteKey) => {
      this.stopNote(noteKey);
    });
  }

  setInstrument(instrument: string): void {
    this.currentInstrument = instrument;
    // Stop all notes when changing instruments to prevent stuck sounds
    this.stopAllNotes();
  }

  getInstrument(): string {
    return this.currentInstrument;
  }

  setMasterVolume(volume: number): void {
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    }
  }
}

export const audioEngine = new AudioEngine();