import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { gsap } from 'gsap';
import { CoupleProfile } from '../../core/models/wedding-config';

/**
 * A tilted photo card that reveals a written introduction on its back.
 *
 * Users flip the card by touch or keyboard. Fully static under
 * `prefers-reduced-motion`.
 */
@Component({
  selector: 'app-couple-card',
  imports: [],
  templateUrl: './couple-card.html',
  styleUrl: './couple-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoupleCard {
  profile = input.required<CoupleProfile>();
  /** Static tilt in degrees (He +3, She -3). */
  tilt = input(0);

  readonly flipped = signal(false);

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  private reducedMotion = false;
  private pointerStartY = 0;
  private lastToggleAt = 0;

  constructor() {
    afterNextRender(() => {
      const shell = this.el.nativeElement.querySelector('.card-shell') as HTMLElement | null;

      this.reducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (this.reducedMotion || !shell) return;

      gsap.set(shell, { rotationZ: this.tilt() });

      this.destroyRef.onDestroy(() => {
        gsap.killTweensOf(shell);
      });
    });
  }

  onPointerDown(event: PointerEvent): void {
    this.pointerStartY = event.clientY;
  }

  onPointerUp(event: PointerEvent): void {
    if (Math.abs(event.clientY - this.pointerStartY) > 10) return;
    this.toggleFlip();
  }

  toggleFlip(): void {
    if (this.reducedMotion) return;
    const now = performance.now();
    if (now - this.lastToggleAt < 120) return;
    this.lastToggleAt = now;
    this.animateTo(this.flipped() ? 0 : -180);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggleFlip();
    }
  }

  photoLabel(): string {
    return `Ảnh của ${this.profile().name} — chạm để xem giới thiệu`;
  }

  introLabel(): string {
    return `Giới thiệu về ${this.profile().name} — chạm để quay về ảnh`;
  }

  private animateTo(rotationY: number): void {
    const inner = this.el.nativeElement.querySelector('.flip-inner');
    if (!inner) return;
    gsap.to(inner, {
      rotationY,
      duration: 0.5,
      ease: 'power2.inOut',
      transformPerspective: 900,
      overwrite: 'auto',
      onComplete: () => {
        this.flipped.set(rotationY === -180);
      },
    });
  }
}
