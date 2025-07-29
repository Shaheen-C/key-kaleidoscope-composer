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

    // Create realistic piano with multiple harmonics and noise component
    const fundamental = this.audioContext.createOscillator();
    const harmonic2 = this.audioContext.createOscillator();
    const harmonic3 = this.audioContext.createOscillator();
    const harmonic4 = this.audioContext.createOscillator();
    const noise = this.audioContext.createOscillator();
    
    const gain = this.audioContext.createGain();
    const gain2 = this.audioContext.createGain();
    const gain3 = this.audioContext.createGain();
    const gain4 = this.audioContext.createGain();
    const noiseGain = this.audioContext.createGain();
    
    const filter = this.audioContext.createBiquadFilter();
    
    // Realistic piano waveforms and frequencies
    fundamental.type = 'triangle';
    fundamental.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    harmonic2.type = 'sine';
    harmonic2.frequency.setValueAtTime(frequency * 2.1, this.audioContext.currentTime);
    
    harmonic3.type = 'sine';
    harmonic3.frequency.setValueAtTime(frequency * 3.2, this.audioContext.currentTime);
    
    harmonic4.type = 'sine';
    harmonic4.frequency.setValueAtTime(frequency * 4.7, this.audioContext.currentTime);
    
    // Add slight noise for hammer attack
    noise.type = 'square';
    noise.frequency.setValueAtTime(frequency * 8, this.audioContext.currentTime);
    
    // Piano harmonic levels
    gain2.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gain3.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    gain4.gain.setValueAtTime(0.04, this.audioContext.currentTime);
    noiseGain.gain.setValueAtTime(0.02, this.audioContext.currentTime);
    
    // Filter for warmth
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 6, this.audioContext.currentTime);
    filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);
    
    // Realistic piano ADSR envelope
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(1.0, this.audioContext.currentTime + 0.005); // Fast attack
    gain.gain.exponentialRampToValueAtTime(0.4, this.audioContext.currentTime + 0.1); // Decay
    gain.gain.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + 1.5); // Long release
    
    // Noise envelope for hammer attack
    noiseGain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
    
    // Connect oscillators
    fundamental.connect(gain);
    harmonic2.connect(gain2);
    harmonic3.connect(gain3);
    harmonic4.connect(gain4);
    noise.connect(noiseGain);
    
    gain2.connect(gain);
    gain3.connect(gain);
    gain4.connect(gain);
    noiseGain.connect(gain);
    gain.connect(filter);
    filter.connect(this.masterGain!);
    
    return { oscillator: fundamental, gain };
  }

  private createSynthSound(frequency: number): { oscillator: OscillatorNode; gain: GainNode } {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    // Authentic analog synthesizer with oscillator mix and modulation
    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const subOsc = this.audioContext.createOscillator();
    const lfo = this.audioContext.createOscillator();
    
    const gain = this.audioContext.createGain();
    const gain1 = this.audioContext.createGain();
    const gain2 = this.audioContext.createGain();
    const subGain = this.audioContext.createGain();
    const lfoGain = this.audioContext.createGain();
    
    const filter = this.audioContext.createBiquadFilter();
    const resonance = this.audioContext.createBiquadFilter();
    
    // Classic analog synth waveforms
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    subOsc.type = 'sine';
    lfo.type = 'sine';
    
    // Slightly detuned oscillators for analog character
    osc1.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    osc2.frequency.setValueAtTime(frequency * 1.005, this.audioContext.currentTime);
    subOsc.frequency.setValueAtTime(frequency * 0.5, this.audioContext.currentTime);
    lfo.frequency.setValueAtTime(6, this.audioContext.currentTime);
    
    // Oscillator mix levels
    gain1.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gain2.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    subGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    lfoGain.gain.setValueAtTime(20, this.audioContext.currentTime);
    
    // Classic Moog-style filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 3, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(frequency * 12, this.audioContext.currentTime + 0.8);
    filter.Q.setValueAtTime(8, this.audioContext.currentTime);
    
    resonance.type = 'bandpass';
    resonance.frequency.setValueAtTime(frequency * 4, this.audioContext.currentTime);
    resonance.Q.setValueAtTime(15, this.audioContext.currentTime);
    
    // LFO modulation
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    // Classic synth ADSR
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, this.audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.6, this.audioContext.currentTime + 0.3);
    gain.gain.linearRampToValueAtTime(0.0, this.audioContext.currentTime + 2.0);
    
    // Connect oscillators
    osc1.connect(gain1);
    osc2.connect(gain2);
    subOsc.connect(subGain);
    
    gain1.connect(gain);
    gain2.connect(gain);
    subGain.connect(gain);
    gain.connect(filter);
    filter.connect(resonance);
    resonance.connect(this.masterGain!);
    
    lfo.start();
    
    return { oscillator: osc1, gain };
  }

  private createOrganSound(frequency: number): { oscillator: OscillatorNode; gain: GainNode } {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    // Authentic Hammond organ with drawbar simulation
    const fundamental = this.audioContext.createOscillator();
    const octave = this.audioContext.createOscillator();
    const fifthOctave = this.audioContext.createOscillator();
    const doubleOctave = this.audioContext.createOscillator();
    const third = this.audioContext.createOscillator();
    const fifth = this.audioContext.createOscillator();
    
    const gain = this.audioContext.createGain();
    const gain1 = this.audioContext.createGain();
    const gain2 = this.audioContext.createGain();
    const gain3 = this.audioContext.createGain();
    const gain4 = this.audioContext.createGain();
    const gain5 = this.audioContext.createGain();
    
    const rotaryFilter = this.audioContext.createBiquadFilter();
    const chorus = this.audioContext.createDelay(0.02);
    const chorusGain = this.audioContext.createGain();
    
    // Hammond drawbar frequencies (typical church organ setting)
    fundamental.type = 'sine';
    octave.type = 'sine';
    fifthOctave.type = 'sine';
    doubleOctave.type = 'sine';
    third.type = 'sine';
    fifth.type = 'sine';
    
    fundamental.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    octave.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
    fifthOctave.frequency.setValueAtTime(frequency * 3, this.audioContext.currentTime);
    doubleOctave.frequency.setValueAtTime(frequency * 4, this.audioContext.currentTime);
    third.frequency.setValueAtTime(frequency * 5, this.audioContext.currentTime);
    fifth.frequency.setValueAtTime(frequency * 6, this.audioContext.currentTime);
    
    // Drawbar levels (Hammond style mix)
    gain1.gain.setValueAtTime(0.8, this.audioContext.currentTime);  // 16' fundamental
    gain2.gain.setValueAtTime(0.6, this.audioContext.currentTime);  // 8' octave
    gain3.gain.setValueAtTime(0.4, this.audioContext.currentTime);  // 5 1/3' fifth
    gain4.gain.setValueAtTime(0.3, this.audioContext.currentTime);  // 4' double octave
    gain5.gain.setValueAtTime(0.2, this.audioContext.currentTime);  // Upper harmonics
    
    // Rotary speaker simulation
    rotaryFilter.type = 'lowpass';
    rotaryFilter.frequency.setValueAtTime(3000, this.audioContext.currentTime);
    rotaryFilter.Q.setValueAtTime(1, this.audioContext.currentTime);
    
    // Leslie chorus effect
    chorus.delayTime.setValueAtTime(0.01, this.audioContext.currentTime);
    chorusGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    
    // Organ envelope - gradual swell
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.7, this.audioContext.currentTime + 0.2);
    gain.gain.setValueAtTime(0.7, this.audioContext.currentTime + 2.0);
    
    // Connect drawbar oscillators
    fundamental.connect(gain1);
    octave.connect(gain2);
    fifthOctave.connect(gain3);
    doubleOctave.connect(gain4);
    third.connect(gain5);
    fifth.connect(gain5);
    
    gain1.connect(gain);
    gain2.connect(gain);
    gain3.connect(gain);
    gain4.connect(gain);
    gain5.connect(gain);
    
    gain.connect(rotaryFilter);
    gain.connect(chorus);
    chorus.connect(chorusGain);
    rotaryFilter.connect(this.masterGain!);
    chorusGain.connect(this.masterGain!);
    
    return { oscillator: fundamental, gain };
  }

  private createBassSound(frequency: number): { oscillator: OscillatorNode; gain: GainNode } {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    // Authentic electric bass with string harmonics and pickup simulation
    const fundamental = this.audioContext.createOscillator();
    const harmonic2 = this.audioContext.createOscillator();
    const harmonic3 = this.audioContext.createOscillator();
    const stringNoise = this.audioContext.createOscillator();
    
    const gain = this.audioContext.createGain();
    const gain2 = this.audioContext.createGain();
    const gain3 = this.audioContext.createGain();
    const noiseGain = this.audioContext.createGain();
    
    const bassFilter = this.audioContext.createBiquadFilter();
    const pickup = this.audioContext.createBiquadFilter();
    const compression = this.audioContext.createDynamicsCompressor();
    
    // Bass waveforms with string character
    fundamental.type = 'triangle';
    harmonic2.type = 'sine';
    harmonic3.type = 'square';
    stringNoise.type = 'square';
    
    fundamental.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    harmonic2.frequency.setValueAtTime(frequency * 2.1, this.audioContext.currentTime);
    harmonic3.frequency.setValueAtTime(frequency * 3.2, this.audioContext.currentTime);
    stringNoise.frequency.setValueAtTime(frequency * 15, this.audioContext.currentTime);
    
    // Bass harmonic mix
    gain2.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain3.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    noiseGain.gain.setValueAtTime(0.02, this.audioContext.currentTime);
    
    // Bass amplifier EQ
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(600, this.audioContext.currentTime);
    bassFilter.Q.setValueAtTime(1.5, this.audioContext.currentTime);
    
    // Pickup response
    pickup.type = 'highpass';
    pickup.frequency.setValueAtTime(80, this.audioContext.currentTime);
    pickup.Q.setValueAtTime(0.7, this.audioContext.currentTime);
    
    // Compression for punch
    compression.threshold.setValueAtTime(-24, this.audioContext.currentTime);
    compression.knee.setValueAtTime(6, this.audioContext.currentTime);
    compression.ratio.setValueAtTime(4, this.audioContext.currentTime);
    compression.attack.setValueAtTime(0.003, this.audioContext.currentTime);
    compression.release.setValueAtTime(0.1, this.audioContext.currentTime);
    
    // Bass pluck envelope
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(1.0, this.audioContext.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.6, this.audioContext.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.2, this.audioContext.currentTime + 0.8);
    
    // String noise envelope
    noiseGain.gain.setValueAtTime(0.03, this.audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.02);
    
    // Connect bass signal chain
    fundamental.connect(gain);
    harmonic2.connect(gain2);
    harmonic3.connect(gain3);
    stringNoise.connect(noiseGain);
    
    gain2.connect(gain);
    gain3.connect(gain);
    noiseGain.connect(gain);
    gain.connect(pickup);
    pickup.connect(bassFilter);
    bassFilter.connect(compression);
    compression.connect(this.masterGain!);
    
    return { oscillator: fundamental, gain };
  }

  private createDrumSound(drumType: string = 'kick'): { oscillator: OscillatorNode; gain: GainNode } {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const gain = this.audioContext.createGain();
    
    switch (drumType) {
      case 'kick':
        return this.createKickDrum();
      case 'snare':
        return this.createSnareDrum();
      case 'hihat':
        return this.createHiHat();
      default:
        return this.createKickDrum();
    }
  }

  private createKickDrum(): { oscillator: OscillatorNode; gain: GainNode } {
    // Authentic 808-style kick drum
    const oscillator = this.audioContext!.createOscillator();
    const gain = this.audioContext!.createGain();
    const filter = this.audioContext!.createBiquadFilter();
    const distortion = this.audioContext!.createWaveShaper();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(80, this.audioContext!.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, this.audioContext!.currentTime + 0.05);
    oscillator.frequency.exponentialRampToValueAtTime(20, this.audioContext!.currentTime + 0.3);
    
    // Low-pass filter for thump
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, this.audioContext!.currentTime);
    filter.Q.setValueAtTime(2, this.audioContext!.currentTime);
    
    // Subtle distortion for punch
    const curve = new Float32Array(65536);
    for (let i = 0; i < 65536; i++) {
      const x = (i - 32768) / 32768;
      curve[i] = x * 0.95;
    }
    distortion.curve = curve;
    
    // Kick envelope
    gain.gain.setValueAtTime(0, this.audioContext!.currentTime);
    gain.gain.linearRampToValueAtTime(1.2, this.audioContext!.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.3, this.audioContext!.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.5);
    
    oscillator.connect(distortion);
    distortion.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    
    return { oscillator, gain };
  }

  private createSnareDrum(): { oscillator: OscillatorNode; gain: GainNode } {
    // Realistic snare with noise and tone components
    const toneOsc = this.audioContext!.createOscillator();
    const noiseOsc = this.audioContext!.createOscillator();
    const gain = this.audioContext!.createGain();
    const toneGain = this.audioContext!.createGain();
    const noiseGain = this.audioContext!.createGain();
    const snareFilter = this.audioContext!.createBiquadFilter();
    const noiseFilter = this.audioContext!.createBiquadFilter();
    
    // Snare drum tone
    toneOsc.type = 'triangle';
    toneOsc.frequency.setValueAtTime(200, this.audioContext!.currentTime);
    toneOsc.frequency.exponentialRampToValueAtTime(150, this.audioContext!.currentTime + 0.1);
    
    // Snare drum noise (snares rattling)
    noiseOsc.type = 'square';
    noiseOsc.frequency.setValueAtTime(1000, this.audioContext!.currentTime);
    
    // Filter settings
    snareFilter.type = 'bandpass';
    snareFilter.frequency.setValueAtTime(1200, this.audioContext!.currentTime);
    snareFilter.Q.setValueAtTime(8, this.audioContext!.currentTime);
    
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(3000, this.audioContext!.currentTime);
    noiseFilter.Q.setValueAtTime(1, this.audioContext!.currentTime);
    
    // Mix levels
    toneGain.gain.setValueAtTime(0.6, this.audioContext!.currentTime);
    noiseGain.gain.setValueAtTime(0.8, this.audioContext!.currentTime);
    
    // Snare envelope
    gain.gain.setValueAtTime(0, this.audioContext!.currentTime);
    gain.gain.linearRampToValueAtTime(1.0, this.audioContext!.currentTime + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.2, this.audioContext!.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.2);
    
    // Connect signal chain
    toneOsc.connect(toneGain);
    noiseOsc.connect(noiseGain);
    toneGain.connect(snareFilter);
    noiseGain.connect(noiseFilter);
    snareFilter.connect(gain);
    noiseFilter.connect(gain);
    gain.connect(this.masterGain!);
    
    return { oscillator: toneOsc, gain };
  }

  private createHiHat(): { oscillator: OscillatorNode; gain: GainNode } {
    // Realistic hi-hat with metallic character
    const oscillator1 = this.audioContext!.createOscillator();
    const oscillator2 = this.audioContext!.createOscillator();
    const oscillator3 = this.audioContext!.createOscillator();
    const gain = this.audioContext!.createGain();
    const gain1 = this.audioContext!.createGain();
    const gain2 = this.audioContext!.createGain();
    const gain3 = this.audioContext!.createGain();
    const filter = this.audioContext!.createBiquadFilter();
    
    // Multiple square waves for metallic hi-hat sound
    oscillator1.type = 'square';
    oscillator2.type = 'square';
    oscillator3.type = 'square';
    
    oscillator1.frequency.setValueAtTime(8000, this.audioContext!.currentTime);
    oscillator2.frequency.setValueAtTime(12000, this.audioContext!.currentTime);
    oscillator3.frequency.setValueAtTime(16000, this.audioContext!.currentTime);
    
    // Mix the oscillators
    gain1.gain.setValueAtTime(0.4, this.audioContext!.currentTime);
    gain2.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
    gain3.gain.setValueAtTime(0.2, this.audioContext!.currentTime);
    
    // High-pass filter for crisp hi-hat
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, this.audioContext!.currentTime);
    filter.Q.setValueAtTime(2, this.audioContext!.currentTime);
    
    // Sharp hi-hat envelope
    gain.gain.setValueAtTime(0, this.audioContext!.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, this.audioContext!.currentTime + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.1, this.audioContext!.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.1);
    
    oscillator1.connect(gain1);
    oscillator2.connect(gain2);
    oscillator3.connect(gain3);
    gain1.connect(gain);
    gain2.connect(gain);
    gain3.connect(gain);
    gain.connect(filter);
    filter.connect(this.masterGain!);
    
    return { oscillator: oscillator1, gain };
  }

  private createBellSound(frequency: number): { oscillator: OscillatorNode; gain: GainNode } {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    // Authentic church bell with complex harmonic structure
    const fundamental = this.audioContext.createOscillator();
    const hum = this.audioContext.createOscillator();
    const prime = this.audioContext.createOscillator();
    const tierce = this.audioContext.createOscillator();
    const quint = this.audioContext.createOscillator();
    const nominal = this.audioContext.createOscillator();
    const superquint = this.audioContext.createOscillator();
    
    const gain = this.audioContext.createGain();
    const humGain = this.audioContext.createGain();
    const primeGain = this.audioContext.createGain();
    const tierceGain = this.audioContext.createGain();
    const quintGain = this.audioContext.createGain();
    const nominalGain = this.audioContext.createGain();
    const superquintGain = this.audioContext.createGain();
    
    const bellFilter = this.audioContext.createBiquadFilter();
    const resonance = this.audioContext.createBiquadFilter();
    
    // Real bell harmonics ratios
    fundamental.type = 'sine';
    hum.type = 'sine';
    prime.type = 'sine';
    tierce.type = 'sine';
    quint.type = 'sine';
    nominal.type = 'sine';
    superquint.type = 'sine';
    
    // Authentic bell frequency ratios
    fundamental.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    hum.frequency.setValueAtTime(frequency * 0.5, this.audioContext.currentTime);
    prime.frequency.setValueAtTime(frequency * 1.0, this.audioContext.currentTime);
    tierce.frequency.setValueAtTime(frequency * 1.2, this.audioContext.currentTime);
    quint.frequency.setValueAtTime(frequency * 1.5, this.audioContext.currentTime);
    nominal.frequency.setValueAtTime(frequency * 2.0, this.audioContext.currentTime);
    superquint.frequency.setValueAtTime(frequency * 2.4, this.audioContext.currentTime);
    
    // Bell harmonic levels (based on real analysis)
    humGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    primeGain.gain.setValueAtTime(1.0, this.audioContext.currentTime);
    tierceGain.gain.setValueAtTime(0.6, this.audioContext.currentTime);
    quintGain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    nominalGain.gain.setValueAtTime(0.8, this.audioContext.currentTime);
    superquintGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    
    // Bell tone shaping
    bellFilter.type = 'bandpass';
    bellFilter.frequency.setValueAtTime(frequency * 2.5, this.audioContext.currentTime);
    bellFilter.Q.setValueAtTime(3, this.audioContext.currentTime);
    
    resonance.type = 'peaking';
    resonance.frequency.setValueAtTime(frequency * 1.2, this.audioContext.currentTime);
    resonance.Q.setValueAtTime(8, this.audioContext.currentTime);
    resonance.gain.setValueAtTime(6, this.audioContext.currentTime);
    
    // Bell strike envelope with long decay
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(1.0, this.audioContext.currentTime + 0.001); // Sharp attack
    gain.gain.exponentialRampToValueAtTime(0.7, this.audioContext.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.3, this.audioContext.currentTime + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.05, this.audioContext.currentTime + 5.0); // Very long decay
    
    // Different decay rates for different harmonics
    humGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 8.0);
    nominalGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 3.0);
    
    // Connect bell harmonics
    fundamental.connect(gain);
    hum.connect(humGain);
    prime.connect(primeGain);
    tierce.connect(tierceGain);
    quint.connect(quintGain);
    nominal.connect(nominalGain);
    superquint.connect(superquintGain);
    
    humGain.connect(gain);
    primeGain.connect(gain);
    tierceGain.connect(gain);
    quintGain.connect(gain);
    nominalGain.connect(gain);
    superquintGain.connect(gain);
    
    gain.connect(resonance);
    resonance.connect(bellFilter);
    bellFilter.connect(this.masterGain!);
    
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
      try {
        // Immediate stop to prevent stuck notes
        gain.gain.cancelScheduledValues(this.audioContext.currentTime);
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime);
        oscillator.disconnect();
        gain.disconnect();
      } catch (e) {
        // Oscillator might already be stopped
      }
      this.oscillators.delete(noteKey);
      this.gainNodes.delete(noteKey);
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