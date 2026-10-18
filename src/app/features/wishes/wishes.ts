import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { gsap } from 'gsap';
import { map } from 'rxjs';
import { PublishedWish, WishesService } from '../../core/services/wishes.service';

function shuffleWishes(wishes: readonly PublishedWish[]): PublishedWish[] {
  const shuffled = [...wishes];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

/** Rotates approved wishes with short fades, accessible controls, and reduced-motion support. */
@Component({
  selector: 'app-wishes',
  templateUrl: './wishes.html',
  styleUrl: './wishes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Wishes {
  readonly wishes = toSignal(inject(WishesService).wishes$.pipe(map(shuffleWishes)), {
    initialValue: [],
  });
  private readonly visibleNamePrefixes = new Set(
    [
      'Bạn',
      'Anh',
      'Chị',
      'Cô',
      'Chú',
      'Bác',
      'Ông',
      'Bà',
      'Em',
      'Mẹ',
      'Bố',
      'Cha',
      'Ba',
      'Dì',
      'Cậu',
      'Tía',
      'Thím',
      'Bím',
    ].map((value) => value.toLocaleLowerCase()),
  );
  readonly activeIndex = signal(0);
  readonly paused = signal(false);
  readonly hovered = signal(false);
  readonly focused = signal(false);
  readonly reducedMotion = signal(false);
  readonly revealed = signal(false);
  private readonly visible = signal(false);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private rotationTimeline: gsap.core.Timeline | undefined;

  constructor() {
    afterNextRender(() => {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      const updateMotion = () => this.reducedMotion.set(media.matches);
      updateMotion();
      media.addEventListener('change', updateMotion);
      let revealDelay: gsap.core.Tween | undefined;
      const observer = new IntersectionObserver(
        ([entry]) => {
          this.visible.set(entry.isIntersecting);
          if (!entry.isIntersecting) {
            revealDelay?.kill();
            revealDelay = undefined;
          } else if (!this.revealed() && !revealDelay) {
            revealDelay = gsap.delayedCall(1.2, () => this.revealed.set(true));
          }
        },
        { threshold: 0.25 },
      );
      observer.observe(this.element.nativeElement);
      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        revealDelay?.kill();
        media.removeEventListener('change', updateMotion);
      });
    });

    afterRenderEffect((onCleanup) => {
      this.wishes();
      const revealed = this.revealed();
      const reduced = this.reducedMotion();
      const section = this.element.nativeElement.querySelector('.wishes');
      if (!section) return;
      if (!revealed || reduced) {
        gsap.set(section, { autoAlpha: revealed ? 1 : 0 });
        return;
      }
      const reveal = gsap.fromTo(
        section,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.6,
          ease: 'power2.out',
        },
      );
      onCleanup(() => reveal.kill());
    });

    afterRenderEffect((onCleanup) => {
      const wishes = this.wishes();
      const index = this.activeIndex();
      const reduced = this.reducedMotion();
      const revealed = this.revealed();
      const cards = this.element.nativeElement.querySelectorAll<HTMLElement>('.wish-card');
      if (!cards.length) return;

      gsap.set(cards, { autoAlpha: 0, y: 0 });
      const fills = this.element.nativeElement.querySelectorAll('.wish-progress-fill');
      gsap.set(fills, { scaleX: 0 });
      if (!revealed) return;
      const card = cards[index];
      if (reduced) {
        gsap.set(card, { autoAlpha: 1, y: 0 });
        return;
      }

      // Manual navigation must reveal the selected wish even while autoplay is paused.
      const entrance = gsap.fromTo(
        card,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      );
      const timeline = gsap.timeline({ paused: true });
      this.rotationTimeline = timeline;
      if (wishes.length > 1) {
        // Longer wishes get more reading time before the next fade.
        const readingTime = Math.max(5, wishes[index].notes.split(/\s+/).length / 3);
        timeline.to(
          card.querySelector('.wish-progress-fill'),
          {
            scaleX: 1,
            duration: readingTime,
            ease: 'none',
          },
          0.6,
        );
        timeline.to(card, {
          autoAlpha: 0,
          y: -8,
          duration: 0.45,
          ease: 'power2.in',
          onComplete: () => this.move(1),
        });
      }
      onCleanup(() => {
        entrance.kill();
        timeline.kill();
        this.rotationTimeline = undefined;
      });
    });

    afterRenderEffect(() => {
      // Reapply playback state when a new wish creates its timeline.
      this.wishes();
      this.activeIndex();
      this.revealed();
      const shouldPause =
        this.paused() ||
        this.hovered() ||
        this.focused() ||
        !this.visible() ||
        this.reducedMotion();
      this.rotationTimeline?.paused(shouldPause);
    });
  }

  move(direction: number): void {
    const count = this.wishes().length;
    if (count < 2) return;

    this.activeIndex.update((index) => (index + direction + count) % count);
  }

  maskName(name: string): string {
    const trimmed = name?.trim();
    if (!trimmed) return '';

    const parts = trimmed.split(/\s+/).filter(Boolean);
    const firstVisibleIndex = this.visibleNamePrefixes.has(parts[0].toLocaleLowerCase()) ? 1 : 0;

    return parts
      .map((part, index) => {
        if (index < firstVisibleIndex) return part;
        if (part.length <= 1) return part;
        return `${part[0]}${'*'.repeat(part.length - 1)}`;
      })
      .join(' ');
  }

  onFocusOut(event: FocusEvent): void {
    if (!this.element.nativeElement.contains(event.relatedTarget as Node | null)) {
      this.focused.set(false);
    }
  }
}
