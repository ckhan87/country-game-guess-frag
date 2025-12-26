
class AudioService {
  private context: AudioContext | null = null;
  private ambientNodes: { gain: GainNode, interval: number } | null = null;
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
    this.playSfx(523.25, 'sine', 0.4, 0.05);
    setTimeout(() => this.playSfx(659.25, 'sine', 0.3, 0.05), 50);
  }

  public playWrong() {
    this.playSfx(150, 'triangle', 0.4, 0.15);
  }

  public playTick(isCritical: boolean = false) {
    this.playSfx(isCritical ? 1600 : 1200, 'sine', 0.03, isCritical ? 0.03 : 0.01);
  }

  public playCelebration() {
    this.init();
    if (!this.context) return;
    const now = this.context.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; 
    notes.forEach((freq, i) => {
      const o = this.context!.createOscillator();
      const g = this.context!.createGain();
      o.frequency.setValueAtTime(freq, now + i * 0.1);
      g.gain.setValueAtTime(0, now + i * 0.1);
      g.gain.linearRampToValueAtTime(0.08, now + i * 0.1 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
      o.connect(g);
      g.connect(this.context!.destination);
      o.start(now + i * 0.1);
      o.stop(now + i * 0.1 + 0.6);
    });
  }

  public startAmbient() {
    this.init();
    if (!this.context || this.ambientNodes) return;

    const mainGain = this.context.createGain();
    mainGain.gain.setValueAtTime(0, this.context.currentTime);
    mainGain.gain.linearRampToValueAtTime(0.07, this.context.currentTime + 1);
    mainGain.connect(this.context.destination);

    let step = 0;
    const melody = [261.63, 293.66, 329.63, 392.00];

    const interval = window.setInterval(() => {
      if (!this.context) return;
      const now = this.context.currentTime;

      if (step % 4 === 0) {
        this.playSfx(65.41, 'sine', 0.2, 0.1); // Bass kick
      }
      
      if (step % 8 === 4) {
        this.playSfx(200, 'square', 0.05, 0.02); // Snare snap
      }

      if (step % 2 === 0) {
        const o = this.context.createOscillator();
        const g = this.context.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(melody[Math.floor(step / 4) % melody.length], now);
        g.gain.setValueAtTime(0.03, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        o.connect(g);
        g.connect(mainGain);
        o.start();
        o.stop(now + 0.7);
      }

      step++;
    }, 200);

    this.ambientNodes = { gain: mainGain, interval };
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
    const freqs = [261.63, 329.63, 392.00, 523.25];

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
