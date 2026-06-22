import {
  Component,
  ChangeDetectionStrategy,
  output,
  inject,
  DestroyRef,
  ElementRef,
  afterNextRender,
  viewChild,
} from '@angular/core';

class WindParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  angleSpeed: number;
  alpha: number;
  waveOffset: number;
  waveFreq: number;
  waveAmp: number;
  fluffCount: number;

  constructor(h: number) {
    this.x = -60 - Math.random() * 80;
    this.y = Math.random() * (h + 60) - 30;
    this.size = 5 + Math.random() * 9;
    this.speed = 1.2 + Math.random() * 1.8;
    this.angle = (Math.random() - 0.5) * 0.6;
    this.angleSpeed = (Math.random() - 0.5) * 0.02;
    this.alpha = 0.2 + Math.random() * 0.35;
    this.waveOffset = Math.random() * Math.PI * 2;
    this.waveFreq = 0.008 + Math.random() * 0.012;
    this.waveAmp = 0.3 + Math.random() * 0.7;
    this.fluffCount = 5 + Math.floor(Math.random() * 3);
  }

  update(dt: number): void {
    this.waveOffset += dt * this.waveFreq;
    this.x += this.speed * dt;
    this.y += Math.sin(this.waveOffset) * this.waveAmp * dt;
    this.angle += this.angleSpeed * dt;

    const fadeZone = 120;
    if (this.x < fadeZone) {
      this.alpha = Math.max(0, this.alpha * (this.x + 60) / (fadeZone + 60));
    }
    if (this.x > window.innerWidth - 100) {
      this.alpha = Math.max(0, this.alpha * (window.innerWidth - this.x) / 100);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.alpha < 0.01) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const clr = `rgba(245, 230, 211, ${this.alpha})`;
    const gold = `rgba(212, 175, 55, ${this.alpha})`;

    ctx.strokeStyle = clr;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -this.size);
    ctx.stroke();

    const fluff = this.size * 0.4;
    for (let i = 0; i < this.fluffCount; i++) {
      const a = (i / this.fluffCount) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.lineTo(Math.cos(a) * fluff, -this.size + Math.sin(a) * fluff * 0.3);
      ctx.stroke();
    }

    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.arc(0, 0, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Glow {
  x: number;
  y: number;
  size: number;
  alpha: number;
  fadeDir: number;
  maxAlpha: number;

  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.size = 1 + Math.random() * 2;
    this.alpha = 0;
    this.maxAlpha = 0.1 + Math.random() * 0.25;
    this.fadeDir = 1;
  }

  update(): void {
    this.alpha += this.fadeDir * 0.004;
    if (this.alpha > this.maxAlpha) {
      this.alpha = this.maxAlpha;
      this.fadeDir = -1;
    } else if (this.alpha < 0) {
      this.alpha = 0;
      this.fadeDir = 1;
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.alpha < 0.01) return;
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.5);
    grad.addColorStop(0, `rgba(212, 175, 55, ${this.alpha})`);
    grad.addColorStop(1, `rgba(212, 175, 55, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

@Component({
  selector: 'app-dandelion-transition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.z-index]': "'15'",
  },
  styles: `
    :host {
      position: fixed;
      inset: 0;
      background: transparent;
      display: block;
      overflow: hidden;
      pointer-events: none;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
  `,
  template: '<canvas #canvas></canvas>',
})
export class DandelionTransition {
  complete = output<void>();

  private canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private destroyRef = inject(DestroyRef);
  private animFrameId: number | null = null;

  constructor() {
    afterNextRender(() => this.init());
  }

  private init(): void {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener('resize', resize);
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', resize));

    const particles: WindParticle[] = [];
    for (let i = 0; i < 45; i++) {
      particles.push(new WindParticle(h));
    }

    const glows: Glow[] = [];
    for (let i = 0; i < 25; i++) {
      glows.push(new Glow(w, h));
    }

    const startTime = performance.now();
    const animDuration = 1400;
    let lastTime = startTime;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const dt = Math.min(now - lastTime, 32);
      lastTime = now;

      ctx.clearRect(0, 0, w, h);

      for (const g of glows) {
        g.update();
        g.draw(ctx);
      }

      for (const p of particles) {
        p.update(dt);
        p.draw(ctx);
      }

      if (elapsed < animDuration) {
        this.animFrameId = requestAnimationFrame(animate);
      } else {
        this.complete.emit();
      }
    };

    this.animFrameId = requestAnimationFrame(animate);
    this.destroyRef.onDestroy(() => {
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    });
  }
}
