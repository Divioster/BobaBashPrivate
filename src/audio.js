// Web Audio API Synthesizer for Cinematic Underwater & Krusty Krab Soundscapes
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.ambientNodes = null;
    this.sizzleNodes = null;
    this.droneGain = null;
    this.sizzleGain = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.isInitialized = true;
      this.setupAmbientDrone();
      this.setupSizzleSynth();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  toggleMute() {
    if (!this.isInitialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (this.droneGain) {
      const now = this.ctx.currentTime;
      this.droneGain.gain.cancelScheduledValues(now);
      this.droneGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.08, now + 0.5);
    }
    return !this.isMuted;
  }

  setupAmbientDrone() {
    if (!this.ctx) return;
    // Deep underwater sub-bass drone
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    this.droneGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(82.4, this.ctx.currentTime); // E2

    // Filter to simulate murky water depth
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, this.ctx.currentTime);

    this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.droneGain);
    this.droneGain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
  }

  setupSizzleSynth() {
    if (!this.ctx) return;
    // Pink / White noise buffer for grill sizzle
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    this.sizzleGain = this.ctx.createGain();
    this.sizzleGain.gain.setValueAtTime(0, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.sizzleGain);
    this.sizzleGain.connect(this.ctx.destination);

    whiteNoise.start();
  }

  setSizzleVolume(level) { // level: 0 to 1
    if (!this.ctx || this.isMuted || !this.sizzleGain) return;
    const now = this.ctx.currentTime;
    this.sizzleGain.gain.cancelScheduledValues(now);
    this.sizzleGain.gain.linearRampToValueAtTime(Math.min(0.2, level * 0.2), now + 0.3);
  }

  playBell() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Realistic order window service bell: metallic transient + harmonic rings
    const freqs = [1860, 3720, 5580];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(idx === 0 ? 0.3 : 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (idx === 0 ? 1.8 : 0.9));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.8);
    });
  }

  playSpatulaClink() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playHeartbeat() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playCelestialAscent() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Golden divine chord progression: F -> G -> A -> C major chime
    const notes = [349.23, 440.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 3.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 3.1);
    });
  }

  playIceCrack() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2200 + Math.random() * 800, now + i * 0.04);
      osc.frequency.exponentialRampToValueAtTime(400, now + i * 0.04 + 0.08);

      gain.gain.setValueAtTime(0.15, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.12);
    }
  }

  playRadarPing() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.setValueAtTime(1400, now + 0.05);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.65);
  }
}

export const sound = new SoundEngine();
