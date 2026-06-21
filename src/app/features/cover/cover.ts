import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  viewChild,
  ElementRef,
  afterNextRender,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { PageFlip } from 'page-flip';
import type { FlipSetting } from 'page-flip';
import { WeddingConfig } from '../../core/models/wedding-config';
import { AudioService } from '../../core/services/audio.service';

class DandelionParticle {
  x = 0;
  y = 0;
  size = 0;
  speedX = 0;
  speedY = 0;
  angle = 0;
  angleSpeed = 0;
  opacity = 0;
  wiggle = 0;
  wiggleSpeed = 0;

  constructor(width: number, height: number) {
    this.reset(width, height, true);
  }

  reset(width: number, height: number, init = false) {
    this.x = init ? Math.random() * width : -30;
    this.y = Math.random() * (height + 60) - 30;
    this.size = Math.random() * 8 + 6;
    this.speedX = Math.random() * 0.7 + 0.3;
    this.speedY = Math.random() * 0.25 - 0.05;
    this.angle = Math.random() * Math.PI * 2;
    this.angleSpeed = Math.random() * 0.008 - 0.004;
    this.wiggle = Math.random() * Math.PI * 2;
    this.wiggleSpeed = Math.random() * 0.015 + 0.005;
    this.opacity = Math.random() * 0.4 + 0.25;
  }

  update(width: number, height: number) {
    this.x += this.speedX + Math.sin(this.wiggle) * 0.15;
    this.y += this.speedY + Math.cos(this.wiggle) * 0.08;
    this.wiggle += this.wiggleSpeed;
    this.angle += this.angleSpeed;

    if (this.x > width + 30 || this.y < -30 || this.y > height + 30) {
      this.reset(width, height);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.sin(this.wiggle) * 0.1);
    ctx.strokeStyle = `rgba(245, 230, 211, ${this.opacity})`;
    ctx.lineWidth = 0.75;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, this.size);
    ctx.stroke();

    ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(0, this.size, 1.0, 0, Math.PI * 2);
    ctx.fill();

    const spokes = 6;
    const fluffSize = this.size * 0.5;
    for (let i = 0; i < spokes; i++) {
      const spAngle = (i / spokes) * Math.PI - Math.PI / 2;
      const sx = Math.cos(spAngle) * fluffSize;
      const sy = Math.sin(spAngle) * fluffSize;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(sx, sy);
      ctx.stroke();
    }

    ctx.restore();
  }
}

class GlowingDust {
  x = 0;
  y = 0;
  size = 0;
  speedX = 0;
  speedY = 0;
  opacity = 0;
  fadeSpeed = 0;
  maxOpacity = 0;

  constructor(width: number, height: number) {
    this.reset(width, height, true);
  }

  reset(width: number, height: number, init = false) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 2 + 1;
    this.speedX = Math.random() * 0.3 - 0.15;
    this.speedY = Math.random() * 0.25 - 0.2;
    this.opacity = init ? Math.random() * 0.4 : 0;
    this.maxOpacity = Math.random() * 0.5 + 0.15;
    this.fadeSpeed = Math.random() * 0.004 + 0.001;
  }

  update(width: number, height: number) {
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity += this.fadeSpeed;

    if (this.opacity > this.maxOpacity) {
      this.opacity = this.maxOpacity;
      this.fadeSpeed = -this.fadeSpeed;
    } else if (this.opacity < 0) {
      this.reset(width, height);
    }

    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      this.reset(width, height);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.2);
    grad.addColorStop(0, `rgba(212, 175, 55, ${this.opacity})`);
    grad.addColorStop(1, `rgba(212, 175, 55, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

@Component({
  selector: 'app-cover',
  templateUrl: './cover.html',
  styleUrl: './cover.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cover {
  config = input.required<WeddingConfig>();
  opened = output<void>();
  showTapPrompt = signal(false);

  private bookContainer = viewChild.required<ElementRef<HTMLElement>>('bookContainer');
  private particleCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('particleCanvas');
  private destroyRef = inject(DestroyRef);
  private audioService = inject(AudioService);
  private pageFlip: PageFlip | null = null;
  private animationFrameId: number | null = null;

  constructor() {
    afterNextRender(() => {
      this.initPageFlip();
      this.initParticles();
      this.startAmbientWind();
      setTimeout(() => {
        this.showTapPrompt.set(true);
      }, 1500);
    });
  }

  private initPageFlip(): void {
    const container = this.bookContainer().nativeElement;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const bookWidth = Math.min(vw * 0.85, 440);
    const bookHeight = Math.min(bookWidth * (520 / 360), vh * 0.75);

    container.style.width = `${bookWidth}px`;
    container.style.height = `${bookHeight}px`;

    const pages = container.querySelectorAll<HTMLElement>('.page');

    this.pageFlip = new PageFlip(container, {
      width: bookWidth,
      height: bookHeight,
      size: 'fixed',
      autoSize: false,
      flippingTime: 800,
      showCover: true,
      startZIndex: 10,
      drawShadow: true,
      swipeDistance: 20,
      disableFlipByClick: false,
      mobileScrollSupport: false,
    } as Partial<FlipSetting>);

    this.pageFlip.loadFromHTML(pages);

    this.pageFlip.on('flip', (e) => {
      if (e.data === 1) {
        this.audioService.stopWind();
        setTimeout(() => this.opened.emit(), 200);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.pageFlip?.destroy();
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    });
  }

  private initParticles(): void {
    const canvas = this.particleCanvas().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth || 440;
        canvas.height = parent.offsetHeight || 520;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', resizeCanvas));

    const particles: DandelionParticle[] = [];
    const dusts: GlowingDust[] = [];
    const particleCount = 15;
    const dustCount = 20;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new DandelionParticle(canvas.width, canvas.height));
    }
    for (let i = 0; i < dustCount; i++) {
      dusts.push(new GlowingDust(canvas.width, canvas.height));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const dust of dusts) {
        dust.update(canvas.width, canvas.height);
        dust.draw(ctx);
      }

      for (const p of particles) {
        p.update(canvas.width, canvas.height);
        p.draw(ctx);
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  private startAmbientWind(): void {
    // Play sound on first click/hover event to satisfy browser autoplay
    const triggerAudio = () => {
      this.audioService.playWind();
      window.removeEventListener('click', triggerAudio);
      window.removeEventListener('touchstart', triggerAudio);
    };
    window.addEventListener('click', triggerAudio);
    window.addEventListener('touchstart', triggerAudio);
  }

  toggleMusic(): void {
    this.audioService.playClick();
    if (this.audioService.isMusicPlaying()) {
      this.audioService.stopMusic();
    } else {
      this.audioService.playMusic();
      this.audioService.playWind(); // Start wind too if not already playing
    }
  }

  isMusicPlaying(): boolean {
    return this.audioService.isMusicPlaying();
  }

  openBook(): void {
    this.audioService.playClick();
    this.audioService.playFlip();
    this.pageFlip?.flipNext('top' as never);
  }
}
