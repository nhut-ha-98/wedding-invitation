import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ConstellationConfig } from '../../core/models/wedding-config';
import { BookStateService } from '../../core/services/book-state.service';

gsap.registerPlugin(ScrollTrigger);

interface ReferenceEdge {
  readonly element: SVGGElement;
  readonly paths: readonly SVGPathElement[];
  readonly start: number;
  readonly span: number;
  last: number;
}

interface ReferenceStar {
  readonly element: SVGGElement;
  readonly revealAt: number;
  last: number;
}

@Component({
  selector: 'app-constellation-background',
  imports: [],
  templateUrl: './constellation-background.html',
  styleUrl: './constellation-background.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstellationBackground {
  /** Configurable scroll thresholds from the wedding configuration. */
  readonly timing = input.required<ConstellationConfig>();

  private readonly bookState = inject(BookStateService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly dawnLayer = viewChild.required<ElementRef<HTMLElement>>('dawnLayer');
  private readonly afternoonLayer = viewChild.required<ElementRef<HTMLElement>>('afternoonLayer');
  private readonly nightLayer = viewChild.required<ElementRef<HTMLElement>>('nightLayer');
  private readonly starlightArtwork =
    viewChild.required<ElementRef<HTMLElement>>('starlightArtwork');

  private artworkSvg: SVGSVGElement | null = null;
  private edges: ReferenceEdge[] = [];
  private stars: ReferenceStar[] = [];
  private decorations: SVGElement[] = [];
  private totalEdgeTime = 1;
  private scrollTrigger: ScrollTrigger | null = null;
  private pendingRaf = 0;
  private queuedProgress = 0;
  private currentProgress = 0;
  private mediaQuery: MediaQueryList | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private pageVisibilityListener: (() => void) | null = null;
  private flareTimer = 0;
  private isVisible = true;
  private reducedMotion = false;
  private completionShown = false;
  private destroyed = false;

  constructor() {
    this.initClosingFade();
    afterNextRender(() => this.init());
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.mediaQuery.matches;
    this.mediaQuery.addEventListener('change', this.onMotionPreferenceChange);
    this.pageVisibilityListener = () => this.updatePausedState();
    document.addEventListener('visibilitychange', this.pageVisibilityListener);

    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          this.isVisible = entries.some((entry) => entry.isIntersecting);
          this.updatePausedState();
        },
        { threshold: 0 },
      );
      this.intersectionObserver.observe(this.host.nativeElement);
    }

    this.destroyRef.onDestroy(() => this.cleanup());
    void this.loadReferenceArtwork();
    this.configureMotion();
  }

  private readonly onMotionPreferenceChange = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    this.configureReferenceAppearance();
    this.configureMotion();
  };

  private async loadReferenceArtwork(): Promise<void> {
    try {
      const response = await fetch('/wedding-starlight.svg', { cache: 'force-cache' });
      if (!response.ok || this.destroyed) return;
      const source = await response.text();
      if (this.destroyed) return;
      const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
      if (parsed.querySelector('parsererror')) return;
      const sourceSvg = parsed.querySelector<SVGSVGElement>('svg.wedding-constellation');
      if (!sourceSvg) return;

      const svg = document.importNode(sourceSvg, true) as SVGSVGElement;
      this.starlightArtwork().nativeElement.replaceChildren(svg);
      this.mapReferenceArtwork(svg);
      this.configureReferenceAppearance();
      this.renderArtwork(this.reducedMotion ? 1 : this.starlightProgress(this.currentProgress));
      this.updatePausedState();
    } catch {
      // The app shell remains usable if the decorative asset cannot load.
    }
  }

  private mapReferenceArtwork(svg: SVGSVGElement): void {
    this.artworkSvg = svg;
    const edgeElements = [...svg.querySelectorAll<SVGGElement>('g[data-edge]')];
    this.edges = edgeElements.map((element, index) => {
      const paths = [...element.querySelectorAll<SVGPathElement>('path')];
      const drawingPath = paths.at(-1);
      const length = drawingPath?.getTotalLength() ?? 85;
      return {
        element,
        paths,
        start: index * 0.72,
        span: Math.max(1, Math.min(4, length / 85)),
        last: -1,
      };
    });
    this.totalEdgeTime = Math.max(1, ...this.edges.map((edge) => edge.start + edge.span));

    const edgeById = new Map(this.edges.map((edge) => [edge.element.dataset['edge'] ?? '', edge]));
    this.stars = [...svg.querySelectorAll<SVGGElement>('[data-star]')].map((element) => {
      const edge = edgeById.get(element.dataset['edgeId'] ?? '');
      const position = Number(element.dataset['at'] ?? 0);
      const revealAt = edge ? (edge.start + edge.span * position) / this.totalEdgeTime : 0.96;
      return { element, revealAt, last: -1 };
    });
    this.decorations = [...svg.querySelectorAll<SVGElement>('[data-decoration]')];
  }

  private configureReferenceAppearance(): void {
    if (!this.artworkSvg) return;
    this.artworkSvg.style.width = '100%';
    this.artworkSvg.style.height = '100%';
    this.artworkSvg.style.display = 'block';
    this.artworkSvg.style.setProperty('--sparkle', '0.65');
    this.artworkSvg.style.setProperty('--sparkle-speed', '3.2s');
    this.artworkSvg.style.setProperty('--glow', '0.8');
    this.artworkSvg.style.setProperty('--flare', '1');
    this.artworkSvg.style.setProperty('--galaxy', '0.9');
    this.artworkSvg.dataset['edgeMode'] = '2';
    this.artworkSvg.dataset['twinkle'] = this.reducedMotion ? 'off' : 'on';
  }

  private configureMotion(): void {
    this.scrollTrigger?.kill();
    this.scrollTrigger = null;
    if (this.pendingRaf) cancelAnimationFrame(this.pendingRaf);
    this.pendingRaf = 0;
    this.clearFlare();

    if (this.reducedMotion) {
      this.renderStatic();
      this.updatePausedState();
      return;
    }

    this.resetArtwork();
    this.scrollTrigger = ScrollTrigger.create({
      start: 0,
      end: () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
      onUpdate: (self) => this.scheduleUpdate(self.progress),
      onRefresh: (self) => this.scheduleUpdate(self.progress),
    });
    this.performUpdate(this.scrollTrigger.progress);
    this.updatePausedState();
  }

  private scheduleUpdate(progress: number): void {
    this.queuedProgress = progress;
    if (this.pendingRaf) return;
    this.pendingRaf = requestAnimationFrame(() => {
      this.pendingRaf = 0;
      this.performUpdate(this.queuedProgress);
    });
  }

  private performUpdate(progress: number): void {
    this.currentProgress = progress;
    const dawn = this.smoothstep((progress - 0.38) / 0.16);
    const afternoon = this.smoothstep((progress - 0.54) / 0.22);
    const night = this.smoothstep((progress - 0.72) / 0.24);
    const artworkProgress = this.starlightProgress(progress);
    const artworkOpacity = this.starlightOpacity(progress);

    this.dawnLayer().nativeElement.style.opacity = String(Number(dawn.toFixed(3)));
    this.afternoonLayer().nativeElement.style.opacity = String(Number(afternoon.toFixed(3)));
    this.nightLayer().nativeElement.style.opacity = String(Number(night.toFixed(3)));
    this.starlightArtwork().nativeElement.style.opacity = String(Number(artworkOpacity.toFixed(3)));
    this.renderArtwork(artworkProgress);
  }

  private renderArtwork(progress: number): void {
    if (!this.artworkSvg) return;

    const boundedProgress = Math.max(0, Math.min(1, progress));
    const time = boundedProgress * this.totalEdgeTime;
    for (const edge of this.edges) {
      const edgeProgress = Math.max(0, Math.min(1, (time - edge.start) / edge.span));
      if (edgeProgress === edge.last) continue;
      edge.last = edgeProgress;
      for (const path of edge.paths) {
        path.style.strokeDasharray = '1 1';
        path.style.strokeDashoffset = String(1 - edgeProgress);
        path.style.visibility = edgeProgress === 0 ? 'hidden' : 'visible';
      }
    }

    for (const star of this.stars) {
      const alpha = Math.max(0.1, Math.min(1, (boundedProgress - star.revealAt) * 28 + 0.1));
      const opacity = boundedProgress === 1 ? 1 : alpha;
      if (opacity === star.last) continue;
      star.last = opacity;
      star.element.style.opacity = String(opacity);
    }

    const decorationOpacity = Math.max(0, Math.min(1, (boundedProgress - 0.42) / 0.58));
    for (const decoration of this.decorations) {
      decoration.style.opacity = String(decorationOpacity);
    }

    // ScrollTrigger can report just under 1 at the physical scroll limit.
    // Treat the final fraction as complete so the finishing flare always plays.
    const complete = boundedProgress >= 0.995;
    if (complete !== this.completionShown) {
      this.completionShown = complete;
      if (complete && !this.reducedMotion) this.flare();
      else if (!complete) this.clearFlare();
    }
  }

  private flare(): void {
    if (!this.artworkSvg) return;
    this.clearFlare();
    this.artworkSvg.getBoundingClientRect();
    this.artworkSvg.classList.add('is-flaring');
    this.flareTimer = window.setTimeout(() => {
      this.artworkSvg?.classList.remove('is-flaring');
      this.flareTimer = 0;
    }, 1100);
  }

  private clearFlare(): void {
    if (this.flareTimer) window.clearTimeout(this.flareTimer);
    this.flareTimer = 0;
    this.artworkSvg?.classList.remove('is-flaring');
  }

  private renderStatic(): void {
    this.currentProgress = 1;
    this.dawnLayer().nativeElement.style.opacity = '0';
    this.afternoonLayer().nativeElement.style.opacity = '0';
    this.nightLayer().nativeElement.style.opacity = '1';
    this.starlightArtwork().nativeElement.style.opacity = '1';
    this.renderArtwork(1);
  }

  private resetArtwork(): void {
    this.currentProgress = 0;
    this.completionShown = false;
    this.starlightArtwork().nativeElement.style.opacity = '0';
    for (const edge of this.edges) edge.last = -1;
    for (const star of this.stars) star.last = -1;
    this.renderArtwork(0);
  }

  private updatePausedState(): void {
    const paused = this.reducedMotion || document.hidden || !this.isVisible;
    this.host.nativeElement.classList.toggle('is-paused', paused);
    this.artworkSvg?.classList.toggle('is-paused', paused);
  }

  private starlightProgress(pageProgress: number): number {
    const { drawStart, drawDuration } = this.timing();
    return this.smoothstep(
      (pageProgress - this.scrollValue(drawStart)) / this.scrollDuration(drawDuration),
    );
  }

  private starlightOpacity(pageProgress: number): number {
    const { opacityStart, opacityDuration } = this.timing();
    return this.smoothstep(
      (pageProgress - this.scrollValue(opacityStart)) / this.scrollDuration(opacityDuration),
    );
  }

  private scrollValue(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  private scrollDuration(value: number): number {
    return Math.max(0.01, Math.min(1, value));
  }

  private smoothstep(value: number): number {
    const bounded = Math.max(0, Math.min(1, value));
    return bounded * bounded * (3 - 2 * bounded);
  }

  private initClosingFade(): void {
    effect(() => {
      const state = this.bookState.state();
      const opacity = state === 'closing' ? 0.25 : state === 'open' ? 1 : 0;
      gsap.to(this.host.nativeElement, {
        opacity,
        duration: state === 'closing' ? 0.5 : state === 'open' ? 0.4 : 0.3,
        overwrite: true,
      });
    });
  }

  private cleanup(): void {
    this.destroyed = true;
    this.scrollTrigger?.kill();
    if (this.pendingRaf) cancelAnimationFrame(this.pendingRaf);
    this.clearFlare();
    this.mediaQuery?.removeEventListener('change', this.onMotionPreferenceChange);
    if (this.pageVisibilityListener) {
      document.removeEventListener('visibilitychange', this.pageVisibilityListener);
    }
    this.intersectionObserver?.disconnect();
    gsap.killTweensOf(this.host.nativeElement);
  }
}
