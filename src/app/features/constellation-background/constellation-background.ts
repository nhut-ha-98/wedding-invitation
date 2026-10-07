import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookStateService } from '../../core/services/book-state.service';
import {
  ConstellationLine,
  ConstellationStar,
  LOGO_LINES,
  LOGO_REVEAL_TRIGGER,
  LOGO_STARS,
  constellationLineD,
  constellationStarById,
} from './star-data';

gsap.registerPlugin(ScrollTrigger);

const STAR_SCALE = 3;
const HALO_R = STAR_SCALE * 2.6;
const FLASH_R = STAR_SCALE * 1.9;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

@Component({
  selector: 'app-constellation-background',
  imports: [],
  templateUrl: './constellation-background.html',
  styleUrl: './constellation-background.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstellationBackground {
  readonly stars = LOGO_STARS;
  readonly lines = LOGO_LINES;
  readonly lineD = constellationLineD;

  readonly starScale = STAR_SCALE;
  readonly haloR = HALO_R;
  readonly flashR = FLASH_R;

  readonly starGlyphD =
    'M0 -1 L0.265 -0.364 L0.951 -0.309 L0.428 0.139 L0.588 0.809 L0 0.45 L-0.588 0.809 L-0.428 0.139 L-0.951 -0.309 L-0.265 -0.364 Z';
  readonly sparkStarD = 'M0 -4.5 L0.9 -0.9 L4.5 0 L0.9 0.9 L0 4.5 L-0.9 0.9 L-4.5 0 L-0.9 -0.9 Z';
  readonly neonSpikeD =
    'M0 -15 L1.5 -2.5 L15 0 L1.5 2.5 L0 15 L-1.5 2.5 L-15 0 L-1.5 -2.5 Z M-6 -6 L-1 -1.5 L0 0 L-1.5 -1 L-6 -6 Z M6 -6 L1.5 -1 L0 0 L1 -1.5 L6 -6 Z M6 6 L1 -1.5 L0 0 L1.5 1 L6 6 Z M-6 6 L-1.5 1 L0 0 L-1 1.5 L-6 6 Z';
  readonly glintD = 'M0 -1 L0.25 -0.25 L1 0 L0.25 0.25 L0 1 L-0.25 0.25 L-1 0 L-0.25 -0.25 Z';

  private bookState = inject(BookStateService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  private afternoonLayer = viewChild.required<ElementRef<HTMLElement>>('afternoonLayer');
  private nightLayer = viewChild.required<ElementRef<HTMLElement>>('nightLayer');
  private logoStarGroup = viewChild.required<ElementRef<SVGGElement>>('logoStarGroup');
  private logoLineGroup = viewChild.required<ElementRef<SVGGElement>>('logoLineGroup');
  private logoFxGroup = viewChild.required<ElementRef<SVGGElement>>('logoFxGroup');

  private starElMap = new Map<string, SVGGElement>();
  private lineElMap = new Map<string, { path: SVGPathElement; spark: SVGGElement }>();

  private starVisibleMap = new Map<string, boolean>();
  private lineDrawnMap = new Map<string, boolean>();
  private bothConnected = false;
  private highlightTimeline: gsap.core.Timeline | null = null;

  private scrollTrigger: ScrollTrigger | null = null;

  constructor() {
    this.initClosingFade();
    afterNextRender(() => this.init());
  }

  private init(): void {
    // Map Logo stars & lines
    const lgStarNodes = Array.from(this.logoStarGroup().nativeElement.children) as SVGGElement[];
    this.stars.forEach((s, i) => {
      this.starElMap.set(s.id, lgStarNodes[i]);
      this.starVisibleMap.set(s.id, false);
    });

    const lgLineNodes = Array.from(this.logoLineGroup().nativeElement.children) as SVGGElement[];
    this.lines.forEach((l, i) => {
      const path = lgLineNodes[i].querySelector('.cl-line') as SVGPathElement;
      const spark = lgLineNodes[i].querySelector('.comet-spark') as SVGGElement;
      this.lineElMap.set(l.id, { path, spark });
      this.lineDrawnMap.set(l.id, false);
    });

    if (prefersReducedMotion()) {
      this.renderStatic();
      return;
    }

    this.initScroll();

    this.destroyRef.onDestroy(() => {
      this.scrollTrigger?.kill();
      this.highlightTimeline?.kill();
    });
  }

  private lastAfternoonOpacity = -1;
  private lastNightOpacity = -1;
  private pendingRaf = 0;

  private initScroll(): void {
    let lastProgress = -1;

    const performUpdate = (p: number): void => {
      // 1. Sky cycle: Morning -> Afternoon Golden Hour -> Dark Violet Night
      const rawAfternoon = Math.max(0, Math.min(1, (p - 0.16) / 0.32));
      const smoothAfternoon = Number(
        (rawAfternoon * rawAfternoon * (3 - 2 * rawAfternoon)).toFixed(3),
      );
      if (smoothAfternoon !== this.lastAfternoonOpacity) {
        this.lastAfternoonOpacity = smoothAfternoon;
        this.afternoonLayer().nativeElement.style.opacity = String(smoothAfternoon);
      }

      const rawNight = Math.max(0, Math.min(1, (p - 0.48) / 0.34));
      const smoothNight = Number((rawNight * rawNight * (3 - 2 * rawNight)).toFixed(3));
      if (smoothNight !== this.lastNightOpacity) {
        this.lastNightOpacity = smoothNight;
        this.nightLayer().nativeElement.style.opacity = String(smoothNight);
      }

      // 2. Check all stars
      for (const star of this.stars) {
        const isVisible = this.starVisibleMap.get(star.id) ?? false;
        const shouldBeVisible = p >= star.trigger;
        if (shouldBeVisible !== isVisible) {
          this.starVisibleMap.set(star.id, shouldBeVisible);
          const el = this.starElMap.get(star.id);
          if (el) {
            this.animateStarVisibility(star, el, shouldBeVisible);
          }
        }
      }

      // 3. Check all lines
      for (const line of this.lines) {
        const isDrawn = this.lineDrawnMap.get(line.id) ?? false;
        const shouldBeDrawn = p >= line.trigger;
        if (shouldBeDrawn !== isDrawn) {
          this.lineDrawnMap.set(line.id, shouldBeDrawn);
          const entry = this.lineElMap.get(line.id);
          if (entry) {
            this.animateLineDraw(line, entry.path, entry.spark, shouldBeDrawn);
          }
        }
      }

      // 4. Synchronized Golden Awakening: Only shine when the logo is fully connected
      const shouldBothConnect = p >= LOGO_REVEAL_TRIGGER;
      if (shouldBothConnect !== this.bothConnected) {
        this.bothConnected = shouldBothConnect;
        this.setLogoAwakening(shouldBothConnect);
      }
    };

    const scheduleUpdate = (p: number): void => {
      if (Math.abs(p - lastProgress) < 0.001) return;
      lastProgress = p;
      if (this.pendingRaf) cancelAnimationFrame(this.pendingRaf);
      this.pendingRaf = requestAnimationFrame(() => {
        performUpdate(p);
        this.pendingRaf = 0;
      });
    };

    this.scrollTrigger = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      scrub: false,
      onUpdate: (self) => scheduleUpdate(self.progress),
    });

    performUpdate(0);
  }

  private animateStarVisibility(star: ConstellationStar, el: SVGGElement, visible: boolean): void {
    if (visible) {
      gsap.to(el, {
        opacity: star.alpha,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
      this.shine(star.id, 0.45);
    } else {
      gsap.to(el, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        overwrite: 'auto',
      });
    }
  }

  private animateLineDraw(
    line: ConstellationLine,
    lineEl: SVGPathElement,
    sparkEl: SVGGElement,
    drawn: boolean,
  ): void {
    const fromStar = constellationStarById(line.from);
    const toStar = constellationStarById(line.to);

    if (drawn) {
      gsap.to(lineEl, {
        strokeDashoffset: 0,
        duration: 0.38,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      gsap.killTweensOf(sparkEl);
      gsap.set(sparkEl, {
        opacity: 1,
        scale: 1,
        x: fromStar.x,
        y: fromStar.y,
      });

      gsap.to(sparkEl, {
        x: toStar.x,
        y: toStar.y,
        duration: 0.38,
        ease: 'power2.out',
        onComplete: () => {
          this.shine(toStar.id, 0.7);
          gsap.to(sparkEl, {
            opacity: 0,
            scale: 0.2,
            duration: 0.22,
            ease: 'power2.in',
          });
        },
      });
    } else {
      gsap.killTweensOf(sparkEl);
      gsap.set(sparkEl, { opacity: 0 });
      gsap.to(lineEl, {
        strokeDashoffset: 1,
        duration: 0.25,
        ease: 'power2.in',
        overwrite: 'auto',
      });
    }
  }

  /** Triggers the neon brightening effect across the full logo silhouette */
  private setLogoAwakening(connected: boolean): void {
    const starEl = this.logoStarGroup().nativeElement;
    const lineEl = this.logoLineGroup().nativeElement;

    if (connected) {
      starEl.classList.add('is-connected');
      lineEl.classList.add('is-connected');

      this.pulseCompletion();
      this.startHighlightShine();
    } else {
      this.highlightTimeline?.kill();
      this.highlightTimeline = null;
      for (const star of this.stars) {
        const starId = star.id;
        const host = this.starElMap.get(starId);
        const halo = host?.querySelector('.halo');
        const spikes = host?.querySelector('.neon-spikes');
        if (halo) gsap.set(halo, { opacity: 0.35, scale: 1 });
        if (spikes) gsap.set(spikes, { opacity: 0, scale: 0.2, rotation: 0 });
      }
      starEl.classList.remove('is-connected');
      lineEl.classList.remove('is-connected');
    }
  }

  private startHighlightShine(): void {
    this.highlightTimeline?.kill();

    const timeline = gsap.timeline();
    const sequenceCount = 10;
    for (let sequenceIndex = 0; sequenceIndex < sequenceCount; sequenceIndex++) {
      const sequence = gsap.timeline({ repeat: -1, repeatDelay: 0.3 });
      const sequenceStars = this.stars
        .filter((_, index) => index % sequenceCount === sequenceIndex)
        .map((star, index) => ({ star, index }))
        .concat()
        .sort((left, right) =>
          sequenceIndex === 0 ? left.index - right.index : right.index - left.index,
        );

      for (const [sequencePosition, { star, index }] of sequenceStars.entries()) {
        const host = this.starElMap.get(star.id);
        const halo = host?.querySelector<SVGCircleElement>('.halo');
        const spike = host?.querySelector<SVGPathElement>('.neon-spikes');
        const flash = host?.querySelector<SVGCircleElement>('.flash');
        if (!halo || !spike || !flash) continue;

        const pace = 0.82 + ((index * 7 + sequenceIndex * 3) % 5) * 0.09;

        const connectedPaths = new Set<SVGPathElement>();
        for (const line of this.lines) {
          if (line.from !== star.id && line.to !== star.id) continue;
          const path = this.lineElMap.get(line.id)?.path;
          if (path) connectedPaths.add(path);
        }

        sequence
          .to(halo, { opacity: 0.58, scale: 1.7, duration: 0.42 * pace, ease: 'sine.inOut' })
          .to(spike, { opacity: 0.22, scale: 0.55, duration: 0.4 * pace, ease: 'sine.inOut' }, '<')
          .fromTo(
            flash,
            { opacity: 0, scale: 0.72 },
            { opacity: 0.62, scale: 1.4, duration: 0.3 * pace, ease: 'sine.out' },
            '<',
          )
          .to(
            [...connectedPaths],
            { stroke: '#b9efff', strokeWidth: 1.82, duration: 0.42 * pace, ease: 'sine.inOut' },
            '<',
          )
          .to(halo, { opacity: 0.38, scale: 1.35, duration: 0.58 * pace, ease: 'sine.inOut' })
          .to(spike, { opacity: 0, scale: 0.2, duration: 0.54 * pace, ease: 'sine.inOut' }, '<')
          .to(flash, { opacity: 0, scale: 1, duration: 0.48 * pace, ease: 'sine.inOut' }, '<')
          .to(
            [...connectedPaths],
            { stroke: '#d9f8ff', strokeWidth: 1.65, duration: 0.58 * pace, ease: 'sine.inOut' },
            '<',
          )
          .to({}, { duration: 0.08 + ((sequencePosition + sequenceIndex) % 4) * 0.035 });
      }

      timeline.add(sequence, sequenceIndex * 0.38);
    }

    const circlePaths = this.lines
      .filter((line) => line.from.startsWith('lg-c') && line.to.startsWith('lg-c'))
      .map((line) => this.lineElMap.get(line.id)?.path)
      .filter((path): path is SVGPathElement => path !== undefined);
    const innerPaths = this.lines
      .filter((line) => !(line.from.startsWith('lg-c') && line.to.startsWith('lg-c')))
      .map((line) => this.lineElMap.get(line.id)?.path)
      .filter((path): path is SVGPathElement => path !== undefined);

    const frameSequence = gsap.timeline({ repeat: -1, repeatDelay: 4.5 });
    frameSequence
      .to({}, { duration: 1.2 })
      .to(circlePaths, { stroke: '#b9efff', strokeWidth: 1.82, duration: 0.65, ease: 'sine.inOut' })
      .to(circlePaths, { stroke: '#d9f8ff', strokeWidth: 1.65, duration: 0.72, ease: 'sine.inOut' })
      .to(innerPaths, { stroke: '#b9efff', strokeWidth: 1.82, duration: 0.65, ease: 'sine.inOut' })
      .to(innerPaths, { stroke: '#d9f8ff', strokeWidth: 1.65, duration: 0.72, ease: 'sine.inOut' });
    timeline.add(frameSequence, 0.9);

    this.highlightTimeline = timeline;
  }

  private pulseCompletion(): void {
    const fxGroup = this.logoFxGroup().nativeElement;

    const ring = fxGroup.querySelector('.completion-ring') as SVGCircleElement | null;
    const glint = fxGroup.querySelector('.completion-glint') as SVGGElement | null;

    if (ring) {
      gsap.fromTo(
        ring,
        { scale: 0.1, opacity: 0.95 },
        { scale: 1.4, opacity: 0, duration: 1.2, ease: 'power3.out', overwrite: true },
      );
    }

    if (glint) {
      gsap.fromTo(
        glint,
        { scale: 0.2, opacity: 0, rotation: 0 },
        {
          scale: 2.8,
          opacity: 1,
          rotation: 140,
          duration: 0.65,
          ease: 'sine.out',
          yoyo: true,
          repeat: 1,
          overwrite: true,
        },
      );
    }
  }

  private shine(starId: string, intensity: number): void {
    const host = this.starElMap.get(starId);
    if (!host) return;
    const flash = host.querySelector('.flash') as SVGCircleElement | null;
    if (!flash) return;
    gsap.fromTo(
      flash,
      { opacity: 0 },
      { opacity: intensity, duration: 0.25, ease: 'power2.in', overwrite: true },
    );
    gsap.to(flash, {
      opacity: 0,
      duration: 0.45,
      delay: 0.25,
      ease: 'power2.out',
      overwrite: true,
    });
  }

  private initClosingFade(): void {
    effect(() => {
      const state = this.bookState.state();
      const hostEl = this.host.nativeElement;
      if (state === 'closing') {
        gsap.to(hostEl, { opacity: 0.25, duration: 0.5, overwrite: true });
      } else if (state === 'open') {
        gsap.to(hostEl, { opacity: 1, duration: 0.4, overwrite: true });
      } else {
        gsap.to(hostEl, { opacity: 0, duration: 0.3, overwrite: true });
      }
    });
  }

  private renderStatic(): void {
    this.afternoonLayer().nativeElement.style.opacity = '0';
    this.nightLayer().nativeElement.style.opacity = '1';
    for (const star of this.stars) {
      const el = this.starElMap.get(star.id);
      if (el) el.style.opacity = String(star.alpha * 0.7);
    }
    for (const entry of this.lineElMap.values()) {
      entry.path.style.strokeDashoffset = '0';
    }
  }
}
