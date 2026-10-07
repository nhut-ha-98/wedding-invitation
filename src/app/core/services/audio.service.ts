import { DestroyRef, Injectable, inject } from '@angular/core';

const MUSIC_TRACKS = [
  'music/River Flows In You - compressed.m4a',
  'music/Photograph-compressed.m4a',
  "music/Can't Help Falling In Love - compressed.m4a",
  'music/Butter-Fly - compressed.m4a',
];

const TARGET_VOLUME = 0.6;
const FADE_TIME = 500;

@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx: AudioContext | null = null;
  private musicPlaying = false;
  private musicAudio: HTMLAudioElement | null = null;
  private musicIndex = -1;
  private musicTriedCount = 0;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;
  private musicStartTimer: ReturnType<typeof setTimeout> | null = null;
  private windNode: GainNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  private windOsc: OscillatorNode | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      this.stopAll();
    });
    this.selectAndPreloadMusic();
  }

  private selectAndPreloadMusic(): void {
    if (typeof Audio === 'undefined') return;
    this.musicIndex = Math.floor(Math.random() * MUSIC_TRACKS.length);
    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audio.addEventListener('error', () => this.handleMusicLoadError());
    this.musicAudio = audio;
    this.setMusicSource(this.musicIndex);
    this.musicTriedCount = 0;
  }

  private setMusicSource(index: number): void {
    if (!this.musicAudio) return;
    this.musicIndex = index;
    this.musicAudio.src = MUSIC_TRACKS[index];
    this.musicAudio.load();
  }

  private handleMusicLoadError(): void {
    this.musicTriedCount++;
    if (this.musicTriedCount >= MUSIC_TRACKS.length) {
      this.musicAudio = null;
      console.warn('Audio: all music tracks failed to load');
      return;
    }
    this.setMusicSource((this.musicIndex + 1) % MUSIC_TRACKS.length);
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playWind() {
    this.initCtx();
    if (!this.ctx || this.windNode) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.windSource = this.ctx.createBufferSource();
      this.windSource.buffer = noiseBuffer;
      this.windSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(4.0, this.ctx.currentTime);
      filter.frequency.setValueAtTime(350, this.ctx.currentTime);

      this.windOsc = this.ctx.createOscillator();
      this.windOsc.frequency.setValueAtTime(0.06, this.ctx.currentTime);

      const modulatorGain = this.ctx.createGain();
      modulatorGain.gain.setValueAtTime(120, this.ctx.currentTime);

      this.windOsc.connect(modulatorGain);
      modulatorGain.connect(filter.frequency);

      this.windNode = this.ctx.createGain();
      this.windNode.gain.setValueAtTime(0.04, this.ctx.currentTime);

      this.windSource.connect(filter);
      filter.connect(this.windNode);
      this.windNode.connect(this.ctx.destination);

      this.windOsc.start();
      this.windSource.start();
    } catch (e) {
      console.error('Audio wind synthesis failed', e);
    }
  }

  stopWind() {
    if (this.windSource) {
      try {
        this.windSource.stop();
        this.windSource.disconnect();
      } catch { }
      this.windSource = null;
    }
    if (this.windOsc) {
      try {
        this.windOsc.stop();
        this.windOsc.disconnect();
      } catch { }
      this.windOsc = null;
    }
    if (this.windNode) {
      this.windNode.disconnect();
      this.windNode = null;
    }
  }

  playFlip() {
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.4;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(2.0, now);
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.005, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseNode.start(now);
      noiseNode.stop(now + 0.45);
    } catch (e) {
      console.error('Flip sound synthesis failed', e);
    }
  }

  playClick() {
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.07);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      console.error('Click sound synthesis failed', e);
    }
  }

  playMusic() {
    if (!this.musicAudio || this.musicPlaying) return;
    this.musicPlaying = true;
    if (this.musicStartTimer) {
      clearTimeout(this.musicStartTimer);
      this.musicStartTimer = null;
    }
    // Start shortly after the gesture that triggered it; some mobile browsers
    // reject play() fired synchronously within the same event handler
    this.musicStartTimer = setTimeout(() => {
      this.musicStartTimer = null;
      this.startMusicPlayback();
    }, 150);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicStartTimer) {
      clearTimeout(this.musicStartTimer);
      this.musicStartTimer = null;
    }
    const audio = this.musicAudio;
    if (!audio || audio.paused) return;
    this.fadeTo(0);
  }

  isMusicPlaying(): boolean {
    return this.musicPlaying;
  }

  private startMusicPlayback(): void {
    const audio = this.musicAudio;
    if (!audio || !this.musicPlaying) return;
    const playPromise = audio.play();
    if (!playPromise) {
      this.fadeTo(TARGET_VOLUME);
      return;
    }
    playPromise
      .then(() => {
        if (!this.musicPlaying) return;
        this.fadeTo(TARGET_VOLUME);
      })
      .catch(() => {
        // Playback blocked; user can retry via the toggle
      });
  }

  private fadeTo(target: number): void {
    const audio = this.musicAudio;
    if (!audio) return;
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
    const from = audio.volume;
    const start = performance.now();
    const step = () => {
      const t = Math.min((performance.now() - start) / FADE_TIME, 1);
      audio.volume = from + (target - from) * t;
      if (t < 1) {
        this.fadeTimer = setTimeout(step, 16);
      } else {
        this.fadeTimer = null;
        if (target === 0) audio.pause();
      }
    };
    step();
  }

  private stopAll() {
    this.stopMusic();
    this.stopWind();
  }
}