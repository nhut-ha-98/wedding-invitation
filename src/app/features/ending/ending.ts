import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  ElementRef,
  afterNextRender,
  DestroyRef,
  inject,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WeddingConfig } from '../../core/models/wedding-config';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-ending',
  templateUrl: './ending.html',
  styleUrl: './ending.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ending {
  config = input.required<WeddingConfig>();
  closeBook = output<void>();

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const root = this.el.nativeElement;
      const title = root.querySelector('.thank-you-title');
      const subtitle = root.querySelector('.thank-you-subtitle');
      const monogram = root.querySelector('.couple-monogram');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 75%',
          toggleActions: 'play none none none',
          once: true,
        },
      });

      tl.fromTo(
        title,
        { opacity: 0, y: 20, force3D: true },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      )
        .fromTo(
          subtitle,
          { opacity: 0, y: 15, force3D: true },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.3',
        )
        .fromTo(
          monogram,
          { opacity: 0, force3D: true },
          { opacity: 1, duration: 0.5, ease: 'power2.out' },
          '-=0.2',
        );

      this.destroyRef.onDestroy(() => {
        tl.scrollTrigger?.kill();
        tl.kill();
      });
    });
  }

  onClose(): void {
    this.closeBook.emit();
  }
}

