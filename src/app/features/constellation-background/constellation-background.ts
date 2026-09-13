import {
  Component,
  ChangeDetectionStrategy,
  inject,
  ElementRef,
  afterNextRender,
  DestroyRef,
  viewChild,
  effect,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookStateService } from '../../core/services/book-state.service';
import {
  CONSTELLATION_STARS,
  CONSTELLATION_LINES,
  constellationLineD,
  AQUARIUS_CENTRE,
  CANCER_CENTRE,
  ConstellationLine,
  ConstellationSet,
  ConstellationStar,
} from './star-data';

gsap.registerPlugin(ScrollTrigger);

const VIEW_W = 1000;
const VIEW_H = 1600;
/** Every star renders at the same size (papercut punches of one sheet). */
const STAR_SCALE = 3;
const HALO_R = STAR_SCALE * 2.6;
const FLASH_R = STAR_SCALE * 1.9;

const EFFECT_SETS: ConstellationSet[] = ['aquarius', 'cancer'];

function smoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

interface EffectSpec {
  id: string;
  set: ConstellationSet;
  x: number;
  y: number;
  r: number;
}

@Component({
  selector: 'app-constellation-background',
  imports: [],
  templateUrl: './constellation-background.html',
  styleUrl: './constellation-background.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstellationBackground {
  readonly stars = CONSTELLATION_STARS;
  readonly lines = CONSTELLATION_LINES;
  readonly lineD = constellationLineD;
  readonly starScale = STAR_SCALE;
  readonly haloR = HALO_R;
  readonly flashR = FLASH_R;
  readonly starGlyphD =
    'M0 -1 L0.265 -0.364 L0.951 -0.309 L0.428 0.139 L0.588 0.809 L0 0.45 L-0.588 0.809 L-0.428 0.139 L-0.951 -0.309 L-0.265 -0.364 Z';
  readonly glintD = 'M0 -1 L0.25 -0.25 L1 0 L0.25 0.25 L0 1 L-0.25 0.25 L-1 0 L-0.25 -0.25 Z';
  readonly viewBox = `0 0 ${VIEW_W} ${VIEW_H}`;
  readonly effects: EffectSpec[] = [
    { id: 'fx-aquarius', set: 'aquarius', x: AQUARIUS_CENTRE.x, y: AQUARIUS_CENTRE.y, r: 120 },
    { id: 'fx-cancer', set: 'cancer', x: CANCER_CENTRE.x, y: CANCER_CENTRE.y, r: 120 },
  ];

  /** Last line of each colour family to finish → the moment it is "fully connected". */
  private readonly completionBySet = new Map<ConstellationSet, ConstellationLine>();

  private bookState = inject(BookStateService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);
  private starGroup = viewChild.required<ElementRef<SVGGElement>>('starGroup');
  private lineGroup = viewChild.required<ElementRef<SVGGElement>>('lineGroup');
  private effectsGroup = viewChild.required<ElementRef<SVGGElement>>('effectsGroup');

  private starEls: SVGGElement[] = [];
  private lineEls: SVGPathElement[] = [];
  private ringEls: SVGCircleElement[] = [];
  private glintEls: SVGGElement[] = [];
  private starElMap = new Map<string, SVGGElement>();

  private scrollTrigger: ScrollTrigger | null = null;
  private lastAlphas = new Float32Array(CONSTELLATION_STARS.length).fill(-1);
  private lastDash = new Float32Array(CONSTELLATION_LINES.length).fill(-1);

  constructor() {
    for (const set of EFFECT_SETS) {
      const last = CONSTELLATION_LINES.filter((l) => l.set === set).reduce(
        (a, b) => (b.end >= a.end ? b : a),
        CONSTELLATION_LINES[0],
      );
      this.completionBySet.set(set, last);
    }
    this.initClosingFade();
    afterNextRender(() => this.init());
  }

  private init(): void {
    this.starEls = Array.from(this.starGroup().nativeElement.children) as SVGGElement[];
    this.lineEls = Array.from(this.lineGroup().nativeElement.children) as SVGPathElement[];

    this.stars.forEach((s, i) => this.starElMap.set(s.id, this.starEls[i]));

    const effectEls = Array.from(this.effectsGroup().nativeElement.children) as SVGGElement[];
    this.ringEls = effectEls.map((el) => el.querySelector('.ring') as SVGCircleElement);
    this.glintEls = effectEls.map((el) => el.querySelector('.glint') as SVGGElement);

    if (prefersReducedMotion()) {
      this.renderStatic(effectEls);
      return;
    }

    this.initScroll();

    this.destroyRef.onDestroy(() => {
      this.scrollTrigger?.kill();
    });
  }

  private initScroll(): void {
    const update = (p: number): void => {
      for (let i = 0; i < this.starEls.length; i++) {
        const s = this.stars[i];
        const alpha = smoothstep((p - s.start) / (s.end - s.start)) * s.alpha;
        const prev = this.lastAlphas[i];
        if (alpha !== prev) {
          this.lastAlphas[i] = alpha;
          this.starEls[i].style.opacity = String(alpha);
        }
        if (prev < s.alpha && alpha >= s.alpha) {
          this.shine(s.id, 0.4);
        }
      }

      for (let i = 0; i < this.lineEls.length; i++) {
        const l = this.lines[i];
        const t = smoothstep((p - l.start) / (l.end - l.start));
        const prev = this.lastDash[i];

        if (prev <= 0 && t > 0) {
          this.shine(l.from, 0.6);
          this.shine(l.to, 0.6);
        }

        if (prev < 1 && t >= 1 && this.completionBySet.get(l.set) === l) {
          this.pulseForSet(l.set);
        }

        if (t !== prev) {
          this.lastDash[i] = t;
          this.lineEls[i].style.strokeDashoffset = String(1 - t);
        }
      }
    };

    this.scrollTrigger = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      scrub: 0.6,
      onUpdate: (self) => update(self.progress),
    });
    update(0);
  }

  /** A star lights up as it connects: dimmed → shined. */
  private shine(starId: string, intensity: number): void {
    const host = this.starElMap.get(starId);
    if (!host) return;
    const flash = host.querySelector('.flash') as SVGCircleElement | null;
    if (!flash) return;
    gsap.fromTo(
      flash,
      { opacity: 0 },
      { opacity: intensity, duration: 0.32, ease: 'power2.in', overwrite: true },
    );
    gsap.to(flash, {
      opacity: 0,
      duration: 0.55,
      delay: 0.34,
      ease: 'power2.out',
      overwrite: true,
    });
  }

  /** A soft ring + sparkle when a colour family finishes connecting. */
  private pulseForSet(set: ConstellationSet): void {
    const idx = EFFECT_SETS.indexOf(set);
    if (idx < 0) return;
    const ring = this.ringEls[idx];
    const glint = this.glintEls[idx];
    if (!ring || !glint) return;
    gsap.fromTo(
      ring,
      { scale: 0, opacity: 0.5 },
      { scale: 1, opacity: 0, duration: 1.1, ease: 'power3.out', overwrite: true },
    );
    gsap.fromTo(
      glint,
      { scale: 0.5, opacity: 0 },
      {
        scale: 2,
        opacity: 0.7,
        rotation: 100,
        duration: 0.5,
        ease: 'sine.out',
        yoyo: true,
        repeat: 1,
        overwrite: true,
      },
    );
  }

  private initClosingFade(): void {
    effect(() => {
      const state = this.bookState.state();
      const svg = this.host.nativeElement.querySelector('svg');
      if (!svg) return;
      if (state === 'closing') {
        gsap.to(svg, { opacity: 0.25, duration: 0.5, overwrite: true });
      } else if (state === 'open') {
        gsap.to(svg, { opacity: 1, duration: 0.4, overwrite: true });
      } else {
        gsap.to(svg, { opacity: 0, duration: 0.3, overwrite: true });
      }
    });
  }

  /** Reduced-motion: one quiet, already-drawn, dimmed sky. */
  private renderStatic(effectEls: SVGGElement[]): void {
    this.starEls.forEach((el, i) => {
      el.style.opacity = String(this.stars[i].alpha * 0.6);
    });
    this.lineEls.forEach((el) => {
      el.style.strokeDashoffset = '0';
    });
    effectEls.forEach((el) => {
      el.style.opacity = '0';
    });
  }
}
