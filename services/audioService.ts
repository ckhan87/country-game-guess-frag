
class AudioService {
  private context: AudioContext | null = null;
  private ambientNodes: { oscillators: OscillatorNode[], gain: GainNode, interval: number } | null = null;
  private gameOverNodes: { oscillators: OscillatorNode[], gain: GainNode } | null = null;

  private init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  public playSfx(freq: number, type: OscillatorType = 'sine', duration: number = 0.3, volume: number = 0.1) {
    this.init();
    if (!this.context) return;

    const o = this.context.createOscillator();
    const g = this.context.createGain();

    o.type = type;
    o.frequency.setValueAtTime(freq, this.context.currentTime);
    
    g.gain.setValueAtTime(volume, this.context.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

    o.connect(g);
    g.connect(this.context.destination);

    o.start();
    o.stop(this.context.currentTime + duration);
  }

  public playCorrect() {
    this.playSfx(523.25, 'sine', 0.4, 0.05); // C5
    setTimeout(() => this.playSfx(659.25, 'sine', 0.3, 0.05), 50); // E5
    setTimeout(() => this.playSfx(783.99, 'sine', 0.2, 0.05), 100); // G5
  }

  public playWrong() {
    this.playSfx(150, 'triangle', 0.4, 0.15);
    this.playSfx(110, 'sine', 0.4, 0.1);
  }

  public playTick(isCritical: boolean = false) {
    this.playSfx(isCritical ? 1600 : 1200, 'sine', 0.03, isCritical ? 0.03 : 0.01);
  }

  public playCelebration() {
    this.init();
    if (!this.context) return;
    const now = this.context.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; 
    notes.forEach((freq, i) => {
      const o = this.context!.createOscillator();
      const g = this.context!.createGain();
      o.frequency.setValueAtTime(freq, now + i * 0.08);
      g.gain.setValueAtTime(0, now + i * 0.08);
      g.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.8);
      o.connect(g);
      g.connect(this.context!.destination);
      o.start(now + i * 0.08);
      o.stop(now + i * 0.08 + 1);
    });
  }

  public startAmbient() {
    this.init();
    if (!this.context || this.ambientNodes) return;

    const mainGain = this.context.createGain();
    mainGain.gain.setValueAtTime(0, this.context.currentTime);
    mainGain.gain.linearRampToValueAtTime(0.08, this.context.currentTime + 1);
    mainGain.connect(this.context.destination);

    // Light-hearted "Fun" game music loop
    // C Major progression: C - G - Am - F
    const bassline = [130.81, 98.00, 110.00, 87.31]; // C2, G1, A1, F1
    const melody = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    let step = 0;

    const interval = window.setInterval(() => {
      if (!this.context) return;
      const now = this.context.currentTime;

      // Pulse Bass
      if (step % 2 === 0) {
        const b = this.context.createOscillator();
        const bg = this.context.createGain();
        b.type = 'triangle';
        b.frequency.setValueAtTime(bassline[Math.floor(step / 4) % 4], now);
        bg.gain.setValueAtTime(0.15, now);
        bg.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        b.connect(bg);
        bg.connect(mainGain);
        b.start(now);
        b.stop(now + 0.5);
      }

      // Random "Happy" Melodic Plucks
      if (Math.random() > 0.6) {
        const m = this.context.createOscillator();
        const mg = this.context.createGain();
        m.type = 'sine';
        m.frequency.setValueAtTime(melody[Math.floor(Math.random() * melody.length)], now);
        mg.gain.setValueAtTime(0.05, now);
        mg.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        m.connect(mg);
        mg.connect(mainGain);
        m.start(now);
        m.stop(now + 0.3);
      }

      step++;
    }, 250); // 120 BPM feel

    this.ambientNodes = { oscillators: [], gain: mainGain, interval };
  }

  public stopAmbient() {
    if (!this.ambientNodes || !this.context) return;
    const { gain, interval } = this.ambientNodes;
    clearInterval(interval);
    gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.5);
    setTimeout(() => {
      this.ambientNodes = null;
    }, 600);
  }

  public playGameOverMusic() {
    this.init();
    if (!this.context || this.gameOverNodes) return;

    const mainGain = this.context.createGain();
    mainGain.gain.setValueAtTime(0, this.context.currentTime);
    mainGain.gain.linearRampToValueAtTime(0.1, this.context.currentTime + 1.5);

    const oscs: OscillatorNode[] = [];
    // Cheerful resolution
    const freqs = [261.63, 329.63, 392.00, 523.25]; // C Major

    freqs.forEach((f) => {
      const osc = this.context!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.context!.currentTime);
      osc.connect(mainGain);
      osc.start();
      oscs.push(osc);
    });

    mainGain.connect(this.context.destination);
    this.gameOverNodes = { oscillators: oscs, gain: mainGain };
  }

  public stopGameOverMusic() {
    if (!this.gameOverNodes || !this.context) return;
    const { oscillators, gain } = this.gameOverNodes;
    gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.5);
    setTimeout(() => {
      oscillators.forEach(o => { try { o.stop(); } catch(e) {} });
      this.gameOverNodes = null;
    }, 600);
  }
}

export const audioService = new AudioService();
