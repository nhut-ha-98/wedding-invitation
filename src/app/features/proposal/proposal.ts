import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { gsap } from 'gsap';
import { WeddingConfig } from '../../core/models/wedding-config';
import { SectionHeader } from '../../shared/components/section-header';
import { InstantPhoto } from '../../shared/directives/instant-photo.directive';

/** Configurable fixed paper stacks; one sequence follows the original album order. */
@Component({
  selector: 'app-proposal',
  imports: [SectionHeader, InstantPhoto],
  templateUrl: './proposal.html',
  styleUrl: './proposal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Proposal {
  config = input.required<WeddingConfig>();
  readonly reducedMotion = signal(false);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly captures = viewChildren(InstantPhoto);
  private playback: gsap.core.Timeline | null = null;

  readonly slotCount = computed(() => {
    const threshold = this.config().albumStackThreshold ?? 3;
    return Number.isInteger(threshold) && threshold > 0 ? threshold : 3;
  });

  readonly transitionDuration = computed(() => {
    const duration = this.config().albumTransitionDuration ?? 0.7;
    return Number.isFinite(duration) && duration > 0 ? Math.min(duration, 1) : 0.7;
  });

  readonly polaroids = computed(() =>
    this.config().album.map((photo, index) => {
      const slot = index % this.slotCount();
      const depth = Math.floor(index / this.slotCount());
      return {
        ...photo,
        index,
        slot,
        rotate: [-3, 4, -2][slot % 3] + (depth % 3) * 2,
        offset: depth * 5,
      };
    }),
  );
  readonly slots = computed(() =>
    Array.from({ length: this.slotCount() }, (_, slot) =>
      this.polaroids().filter((photo) => photo.slot === slot),
    ),
  );

  constructor() {
    afterNextRender(() => {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      const root = this.el.nativeElement;
      const photos = Array.from(root.querySelectorAll<HTMLElement>('.polaroid')).sort(
        (a, b) => Number(a.dataset['index']) - Number(b.dataset['index']),
      );
      // Directive queries follow grouped DOM order, so pair each with its actual element.
      const captureByPhoto = new Map(
        Array.from(root.querySelectorAll<HTMLElement>('.polaroid')).map((photo, index) => [
          photo,
          this.captures()[index],
        ]),
      );

      let visible = false;
      let pendingPhoto: HTMLElement | null = photos[0] ?? null;
      const imageEvents = new AbortController();
      const images = photos.flatMap((photo) => {
        const image = photo.querySelector('img');
        return image ? [image] : [];
      });
      const requestImage = (image: HTMLImageElement): void => {
        const source = image.dataset['src'];
        if (source && !image.hasAttribute('src')) image.src = source;
      };
      const showStaticImages = (): void => {
        if (visible) images.forEach(requestImage);
      };
      const finishImage = (image: HTMLImageElement): void => {
        if (pendingPhoto?.querySelector('img') !== image) return;
        pendingPhoto = null;
        if (visible && !this.reducedMotion()) this.playback?.resume();
      };
      const requestPendingPhoto = (): void => {
        if (!visible || !pendingPhoto) return;
        const image = pendingPhoto.querySelector('img');
        if (!image) return;
        requestImage(image);
        if (image.complete) finishImage(image);
      };
      images.forEach((image) => {
        const ready = (): void => finishImage(image);
        image.addEventListener('load', ready, { signal: imageEvents.signal });
        image.addEventListener('error', ready, { signal: imageEvents.signal });
      });

      const showStatic = (): void => {
        this.reducedMotion.set(true);
        this.playback?.kill();
        gsap.set(photos, { clearProps: 'transform,opacity,visibility' });
        gsap.set(root.querySelectorAll('.snapshot-flash, .snapshot-shutter'), {
          clearProps: 'transform,opacity',
        });
        showStaticImages();
      };
      const onMotionChange = (event: MediaQueryListEvent): void => {
        if (event.matches) showStatic();
      };
      // Observe the section throughout playback, including after its first entrance.
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          this.playback?.pause();
        } else if (this.reducedMotion()) {
          showStaticImages();
        } else if (pendingPhoto) {
          requestPendingPhoto();
        } else {
          this.playback?.resume();
        }
      });
      observer.observe(root.querySelector('.proposal-section') ?? root);
      media.addEventListener('change', onMotionChange);
      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        imageEvents.abort();
        media.removeEventListener('change', onMotionChange);
        this.playback?.kill();
      });

      if (media.matches) {
        showStatic();
        return;
      }
      if (!photos.length) return;

      const timeline = gsap.timeline({ paused: true });
      this.playback = timeline;

      for (const [index, photo] of photos.entries()) {
        if (index > 0) {
          // Wait at the next drop until its image is ready, requesting only in view.
          timeline.addPause(timeline.duration(), () => {
            pendingPhoto = photo;
            requestPendingPhoto();
          });
        }
        timeline.fromTo(
          photo,
          { autoAlpha: 0, y: -45, x: 0, rotation: Number(photo.dataset['rotate']) - 5 },
          {
            autoAlpha: 1,
            y: -Number(photo.dataset['offset']),
            x: Number(photo.dataset['offset']),
            rotation: Number(photo.dataset['rotate']),
            duration: this.transitionDuration(),
            ease: 'power2.out',
          },
        );
        // Appending extends the sequence through full development before the next landing.
        captureByPhoto.get(photo)?.appendTo(timeline, timeline.duration());
      }
    });
  }
}
