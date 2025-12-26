
import { GoogleGenAI, Modality } from "@google/genai";

class AudioService {
  private context: AudioContext | null = null;
  private ambientNodes: { gain: GainNode, interval: number } | null = null;
  private gameOverNodes: { oscillators: OscillatorNode[], gain: GainNode } | null = null;

  private init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array): Promise<AudioBuffer> {
    this.init();
    const ctx = this.context!;
    const dataInt16 = new Int16Array(data.buffer);
    const numChannels = 1;
    const sampleRate = 24000;
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  public async fetchTTS(text: string): Promise<AudioBuffer | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return await this.decodeAudioData(this.decodeBase64(base64Audio));
      }
    } catch (error) {
      console.error("TTS Fetch Error:", error);
    }
    return null;
  }

  public playBuffer(buffer: AudioBuffer, volume: number = 0.6) {
    this.init();
    const source = this.context!.createBufferSource();
    const gain = this.context!.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, this.context!.currentTime);
    source.connect(gain);
    gain.connect(this.context!.destination);
    source.start();
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
      if (step % 4 === 0) this.playSfx(65.41, 'sine', 0.2, 0.1);
      if (step % 8 === 4) this.playSfx(200, 'square', 0.05, 0.02);
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
    setTimeout(() => { this.ambientNodes = null; }, 600);
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
