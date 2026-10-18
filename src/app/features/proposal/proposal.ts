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
import { WeddingConfig } from '../../core/models/wedding-config';
import { SectionHeader } from '../../shared/components/section-header';
import { InstantPhoto } from '../../shared/directives/instant-photo.directive';
import { ProposalAlbumPlayer } from './proposal-album-player';

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
  private player: ProposalAlbumPlayer | null = null;
  readonly shownCounts = signal<readonly number[]>([]);
  readonly busy = signal(false);

  activateSlot(slot: number): void {
    this.player?.activate(slot);
  }

  onSlotKeydown(event: KeyboardEvent, slot: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.activateSlot(slot);
    }
  }

  readonly autoStackDelay = computed(() => {
    const delay = this.config().albumAutoStackDelay ?? 3;
    return Number.isFinite(delay) && delay >= 0 ? delay : 3;
  });

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
        // Distribute all paper layers within eight pixels, regardless of album size.
        offset:
          (8 * depth) /
          Math.max(1, Math.ceil((this.config().album.length - slot) / this.slotCount()) - 1),
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

      const prints = photos.map((element) => {
        const index = Number(element.dataset['index']);
        const photo = this.polaroids()[index];
        return {
          ...photo,
          element,
          image: element.querySelector<HTMLImageElement>('img')!,
          capture: captureByPhoto.get(element)!,
        };
      });
      this.player = new ProposalAlbumPlayer(prints, {
        slotCount: this.slotCount(),
        transitionDuration: this.transitionDuration(),
        autoDelay: this.autoStackDelay(),
        onStateChange: (counts, busy) => {
          this.shownCounts.set(counts);
          this.busy.set(busy);
        },
      });
      const showStatic = (): void => {
        this.reducedMotion.set(true);
        this.player?.showStatic();
      };
      const onMotionChange = (event: MediaQueryListEvent): void => {
        if (event.matches) showStatic();
      };
      // Observe the section throughout playback, including after its first entrance.
      const observer = new IntersectionObserver(([entry]) => {
        this.player?.setVisible(entry.isIntersecting);
      });
      observer.observe(root.querySelector('.proposal-section') ?? root);
      media.addEventListener('change', onMotionChange);
      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        media.removeEventListener('change', onMotionChange);
        this.player?.destroy();
      });
      if (media.matches) showStatic();
    });
  }
}
