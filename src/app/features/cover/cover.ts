import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { FlipSetting } from 'page-flip';
import { PageFlip } from 'page-flip';
import { gsap } from 'gsap';
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
    ctx.fillStyle = `rgba(216, 180, 135, ${this.opacity})`;
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
    this.maxOpacity = Math.random() * 0.45 + 0.15;
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
    grad.addColorStop(0, `rgba(216, 180, 135, ${this.opacity})`);
    grad.addColorStop(1, `rgba(216, 180, 135, 0)`);
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
  private opening = false;

  formattedDate = computed(() => {
    try {
      return this.config().date.replaceAll('.', ' · ');
    } catch {
      return this.config().date;
    }
  });

  private bookContainer = viewChild.required<ElementRef<HTMLElement>>('bookContainer');
  private particleCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('particleCanvas');
  private destroyRef = inject(DestroyRef);
  private audioService = inject(AudioService);
  private pageFlip: PageFlip | null = null;
  private animationFrameId: number | null = null;
  private promptTimer: ReturnType<typeof setTimeout> | null = null;
  private promptFrame: number | null = null;
  private promptAnimation: gsap.core.Tween | null = null;
  private insideStoryTimeline: gsap.core.Timeline | null = null;
  private insideStoryTimer: ReturnType<typeof setTimeout> | null = null;
  private insideStoryStarted = false;
  private insideStoryCompleted = false;
  private insideStoryLines: HTMLElement[] = [];
  private insideStoryCharacters: HTMLElement[][] = [];
  private insideStoryPhoto: HTMLElement | null = null;
  private insideStoryWipe: HTMLElement | null = null;
  private pointerStartedAfterPrompt = false;

  constructor() {
    afterNextRender(() => {
      const container = this.bookContainer().nativeElement;
      const preventEarlyFlip = (event: Event) => {
        event.stopImmediatePropagation();
        if (!this.showTapPrompt() && event.cancelable) event.preventDefault();
      };

      container.addEventListener('mousedown', preventEarlyFlip, true);
      container.addEventListener('touchstart', preventEarlyFlip, { capture: true, passive: false });
      this.destroyRef.onDestroy(() => {
        container.removeEventListener('mousedown', preventEarlyFlip, true);
        container.removeEventListener('touchstart', preventEarlyFlip, true);
      });

      this.initPageFlip();
      this.prepareInsideStory();
      this.initParticles();
      this.startAmbientAudio();
      this.promptTimer = setTimeout(() => {
        this.showTapPrompt.set(true);
        this.promptTimer = null;
        this.promptFrame = requestAnimationFrame(() => {
          this.promptFrame = null;
          this.animateTapPrompt();
        });
      }, this.config().coverOpenPromptDelayMs);
      this.destroyRef.onDestroy(() => {
        if (this.promptTimer) clearTimeout(this.promptTimer);
        if (this.promptFrame !== null) cancelAnimationFrame(this.promptFrame);
        this.promptAnimation?.kill();
      });

      this.destroyRef.onDestroy(() => this.cancelInsideStory());
    });
  }

  private initPageFlip(): void {
    const container = this.bookContainer().nativeElement;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const bookWidth = Math.min(vw * 0.85, 440);
    const bookHeight = Math.min(bookWidth * (520 / 360), vh * 0.88);

    container.style.width = `${bookWidth}px`;
    container.style.height = `${bookHeight}px`;

    const pages = container.querySelectorAll<HTMLElement>('.page');

    this.pageFlip = new PageFlip(container, {
      width: bookWidth,
      height: bookHeight,
      size: 'fixed',
      autoSize: false,
      // Keep the physical page turn below one second, but leave enough time
      // for the cover to feel like it is settling open.
      flippingTime: 960,
      showCover: true,
      startZIndex: 10,
      drawShadow: true,
      swipeDistance: 20,
      disableFlipByClick: true,
      showPageCorners: false,
      mobileScrollSupport: false,
    } as Partial<FlipSetting>);

    this.pageFlip.loadFromHTML(pages);

    this.pageFlip.on('flip', (e) => {
      if (e.data === 1) {
        this.opening = true;
        this.audioService.stopWind();
      }
    });

    this.pageFlip.on('changeState', (e) => {
      if (e.data !== 'read') return;

      const pageIndex = this.pageFlip?.getCurrentPageIndex();
      if (pageIndex === 1) {
        this.playInsideStory();
      } else if (pageIndex === 0) {
        this.resetInsideStory();
        this.opening = false;
      }
    });

    this.destroyRef.onDestroy(() => {
      this.pageFlip?.destroy();
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    });
  }

  private prepareInsideStory(): void {
    const container = this.bookContainer().nativeElement;
    this.insideStoryLines = Array.from(
      container.querySelectorAll<HTMLElement>('[data-inside-story-line]'),
    );
    this.insideStoryCharacters = this.insideStoryLines.map((line) => {
      const markedSegments = Array.from(
        line.querySelectorAll<HTMLElement>('[data-inside-story-segment]'),
      );
      const segments =
        markedSegments.length > 0
          ? markedSegments.map((segment) => ({
              text: segment.textContent?.trim() ?? '',
              highlighted: segment.hasAttribute('data-inside-story-highlight'),
              element: segment,
            }))
          : [{ text: line.textContent?.trim() ?? '', highlighted: false, element: null }];

      line.textContent = '';
      line.setAttribute('aria-label', segments.map((segment) => segment.text).join(' '));

      return segments.flatMap((segment) => {
        const wrapper = segment.element ?? document.createElement('span');
        wrapper.textContent = '';
        wrapper.classList.add(segment.highlighted ? 'transition-highlight' : 'transition-segment');
        wrapper.setAttribute('aria-hidden', 'true');
        line.appendChild(wrapper);

        return Array.from(segment.text).map((value) => {
          const character = document.createElement('span');
          character.className = 'transition-character';
          character.style.display = 'inline-block';
          character.textContent = value === ' ' ? '\u00a0' : value;
          wrapper.appendChild(character);
          return character;
        });
      });
    });
    this.insideStoryPhoto = container.querySelector<HTMLElement>('.cover-photo-wrap');
    this.insideStoryWipe = container.querySelector<HTMLElement>('.photo-wipe');
    this.setInsideStoryInitialState();
  }

  private playInsideStory(): void {
    if (this.insideStoryStarted) return;
    this.insideStoryStarted = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(this.insideStoryCharacters.flat(), { autoAlpha: 1, y: 0 });
      if (this.insideStoryPhoto) {
        gsap.set(this.insideStoryPhoto, { autoAlpha: 1, y: 0, scale: 1 });
      }
      if (this.insideStoryWipe) {
        gsap.set(this.insideStoryWipe, { autoAlpha: 0, xPercent: 110 });
      }
      this.insideStoryTimer = setTimeout(() => this.completeInsideStory(), 3_000);
      return;
    }

    const timeline = gsap.timeline();
    this.insideStoryTimeline = timeline;
    this.addLineReveal(timeline, this.insideStoryCharacters[0] ?? [], 0, 0.65);
    this.addLineReveal(timeline, this.insideStoryCharacters[1] ?? [], 1.1, 0.9);
    this.addLineReveal(timeline, this.insideStoryCharacters[2] ?? [], 2.45, 0.9);

    if (this.insideStoryPhoto) {
      timeline.to(
        this.insideStoryPhoto,
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out' },
        3.8,
      );
    }
    if (this.insideStoryWipe) {
      timeline.to(
        this.insideStoryWipe,
        { autoAlpha: 0, xPercent: 110, duration: 0.9, ease: 'power2.inOut' },
        3.8,
      );
    }
    timeline.call(() => this.completeInsideStory(), [], 6);
  }

  private addLineReveal(
    timeline: gsap.core.Timeline,
    characters: HTMLElement[],
    startAt: number,
    totalDuration: number,
  ): void {
    if (characters.length === 0) return;
    const characterDuration = 0.1;
    const stagger =
      characters.length > 1 ? (totalDuration - characterDuration) / (characters.length - 1) : 0;

    timeline.to(
      characters,
      {
        autoAlpha: 1,
        y: 0,
        duration: characterDuration,
        stagger,
        ease: 'power2.out',
      },
      startAt,
    );
  }

  private completeInsideStory(): void {
    if (this.insideStoryCompleted) return;
    this.insideStoryCompleted = true;
    this.insideStoryTimer = null;
    this.opened.emit();
  }

  private setInsideStoryInitialState(): void {
    gsap.set(this.insideStoryCharacters.flat(), { autoAlpha: 0, y: 6 });
    if (this.insideStoryPhoto) {
      gsap.set(this.insideStoryPhoto, { autoAlpha: 0, y: 6, scale: 0.98 });
    }
    if (this.insideStoryWipe) {
      gsap.set(this.insideStoryWipe, { autoAlpha: 1, xPercent: 0 });
    }
  }

  private cancelInsideStory(): void {
    this.insideStoryTimeline?.kill();
    this.insideStoryTimeline = null;
    if (this.insideStoryTimer !== null) {
      clearTimeout(this.insideStoryTimer);
      this.insideStoryTimer = null;
    }
  }

  private resetInsideStory(): void {
    this.cancelInsideStory();
    this.insideStoryStarted = false;
    this.insideStoryCompleted = false;
    this.setInsideStoryInitialState();
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

  private startAmbientAudio(): void {
    // Start wind + music on first interaction, with a short gap after the
    // gesture so mobile browsers allow playback
    const triggerAudio = () => {
      window.removeEventListener('click', triggerAudio);
      window.removeEventListener('touchstart', triggerAudio);
      window.removeEventListener('keydown', triggerAudio);
      setTimeout(() => {
        this.audioService.playWind();
        this.audioService.playMusic();
      }, 150);
    };
    window.addEventListener('click', triggerAudio);
    window.addEventListener('touchstart', triggerAudio);
    window.addEventListener('keydown', triggerAudio);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('click', triggerAudio);
      window.removeEventListener('touchstart', triggerAudio);
      window.removeEventListener('keydown', triggerAudio);
    });
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

  private animateTapPrompt(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const prompt = this.bookContainer().nativeElement.querySelector<HTMLElement>('.tap-prompt');
    if (!prompt) return;

    this.promptAnimation = gsap.fromTo(
      prompt,
      { autoAlpha: 0, y: 8 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        ease: 'power1.inOut',
      },
    );
  }

  handleCoverPointerDown(): void {
    this.pointerStartedAfterPrompt = this.showTapPrompt() && !this.opening;
  }

  handleCoverPointerUp(event: PointerEvent): void {
    const canOpen = this.pointerStartedAfterPrompt;
    this.pointerStartedAfterPrompt = false;
    if (event.button !== 0 || !canOpen || !this.showTapPrompt() || this.opening) return;
    this.openBook();
  }

  handleCoverKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (!this.showTapPrompt() || this.opening) return;

    event.preventDefault();
    this.openBook();
  }

  openBook(): void {
    if (!this.showTapPrompt() || this.opening) return;
    this.opening = true;
    this.promptAnimation?.kill();
    this.audioService.playClick();
    this.audioService.playFlip();
    const container = this.bookContainer().nativeElement;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.pageFlip?.flipNext('top' as never);
      return;
    }

    gsap
      .timeline()
      .to(container, { scale: 0.992, duration: 0.14, ease: 'sine.out' })
      .call(() => this.pageFlip?.flipNext('top' as never))
      .to(container, { scale: 1, duration: 0.32, ease: 'sine.inOut' }, '<');
  }

  resetFlip(): void {
    this.cancelInsideStory();
    if (this.pageFlip) {
      this.pageFlip.flipPrev('top' as never);
    } else {
      this.resetInsideStory();
      this.opening = false;
    }
  }
}
