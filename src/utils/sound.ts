// Lightweight Web Audio API synthesizer for sound effects and melodic birthday chimes
// Zero external files, respects user interaction and browser policies

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMelodyPlaying: boolean = false;
  private melodyTimeout: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.melodyTimeout) {
      window.clearTimeout(this.melodyTimeout);
      this.isMelodyPlaying = false;
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playCelebrationChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Arpeggiated cheerful chime in C major (C5, E5, G5, C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.65);
      }, idx * 90);
    });
  }

  public playBlowSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Soft airy whoosh sound for blowing candles
    const bufferSize = this.ctx.sampleRate * 0.45;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.4);
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  public playCardFlip() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  public playPop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  public playSparkle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
    freqs.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.28);
      }, i * 65);
    });
  }

  public playHappyBirthdayMelody(onEnd?: () => void) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    if (this.isMelodyPlaying) {
      if (this.melodyTimeout) window.clearTimeout(this.melodyTimeout);
      this.isMelodyPlaying = false;
      return;
    }

    this.isMelodyPlaying = true;

    // Happy birthday tune notes: [note frequency in Hz, duration in seconds]
    // C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, B4=493.88, C5=523.25
    const notes: [number, number][] = [
      [261.63, 0.35], [261.63, 0.2], [293.66, 0.55], [261.63, 0.55], [349.23, 0.55], [329.63, 0.9],
      [261.63, 0.35], [261.63, 0.2], [293.66, 0.55], [261.63, 0.55], [392.00, 0.55], [349.23, 0.9],
      [261.63, 0.35], [261.63, 0.2], [523.25, 0.55], [440.00, 0.55], [349.23, 0.55], [329.63, 0.55], [293.66, 0.8],
      [466.16, 0.35], [466.16, 0.2], [440.00, 0.55], [349.23, 0.55], [392.00, 0.55], [349.23, 1.1]
    ];

    let currentDelay = 0;
    notes.forEach(([freq, duration]) => {
      this.melodyTimeout = window.setTimeout(() => {
        if (!this.ctx || this.isMuted || !this.isMelodyPlaying) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration + 0.05);
      }, currentDelay * 1000);
      currentDelay += duration + 0.08;
    });

    this.melodyTimeout = window.setTimeout(() => {
      this.isMelodyPlaying = false;
      if (onEnd) onEnd();
    }, currentDelay * 1000);
  }

  public stopMelody() {
    this.isMelodyPlaying = false;
    if (this.melodyTimeout) {
      window.clearTimeout(this.melodyTimeout);
      this.melodyTimeout = null;
    }
  }

  public isPlayingMelody(): boolean {
    return this.isMelodyPlaying;
  }
}

export const sound = new SoundManager();
