import { Injectable, inject, DestroyRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx: AudioContext | null = null;
  private musicPlaying = false;
  private windNode: GainNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  private windOsc: OscillatorNode | null = null;
  private musicTimeout: any = null;
  private currentNoteIndex = 0;

  // Vintage music box melody (Inspired by warm Ghibli piano themes)
  // Midi notes, beats
  private readonly melody: [number, number][] = [
    [64, 1.5], [67, 0.5], [71, 1], [72, 1], [76, 2], [74, 2],
    [69, 1.5], [72, 0.5], [74, 1], [76, 1], [79, 2], [77, 2],
    [76, 1.5], [72, 0.5], [67, 1], [64, 1], [69, 2], [67, 2],
    [62, 1.5], [66, 0.5], [69, 1], [71, 1], [74, 2], [71, 2],
    // Loop phrase 2
    [64, 1.5], [67, 0.5], [71, 1], [72, 1], [76, 2], [79, 1], [77, 1],
    [76, 1.5], [72, 0.5], [69, 1], [67, 1], [69, 2], [71, 2],
    [72, 2], [67, 2], [64, 2], [60, 2]
  ];

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      this.stopAll();
    });
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
      } catch {}
      this.windSource = null;
    }
    if (this.windOsc) {
      try {
        this.windOsc.stop();
        this.windOsc.disconnect();
      } catch {}
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
    this.initCtx();
    if (!this.ctx || this.musicPlaying) return;
    this.musicPlaying = true;
    this.currentNoteIndex = 0;
    this.playNextMusicNote();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  isMusicPlaying(): boolean {
    return this.musicPlaying;
  }

  private playNextMusicNote() {
    if (!this.musicPlaying || !this.ctx) return;

    try {
      const [midiNote, beats] = this.melody[this.currentNoteIndex];
      const freq = this.midiToFreq(midiNote);
      const now = this.ctx.currentTime;

      // Primary tone
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      // Warm octave lower oscillator
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 0.5, now);

      // Envelopes
      gain1.gain.setValueAtTime(0.0, now);
      gain1.gain.linearRampToValueAtTime(0.12, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + beats * 0.75);

      gain2.gain.setValueAtTime(0.0, now);
      gain2.gain.linearRampToValueAtTime(0.03, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + beats * 0.75);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + beats * 0.75 + 0.1);

      osc2.start(now);
      osc2.stop(now + beats * 0.75 + 0.1);

      const beatDurationMs = 380;
      this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
      this.musicTimeout = setTimeout(() => {
        this.playNextMusicNote();
      }, beats * beatDurationMs);
    } catch (e) {
      console.error('Music note play failed', e);
      this.musicPlaying = false;
    }
  }

  private midiToFreq(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  private stopAll() {
    this.stopMusic();
    this.stopWind();
  }
}
