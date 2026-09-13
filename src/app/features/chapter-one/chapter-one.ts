import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WeddingConfig } from '../../core/models/wedding-config';
import { AnimatedSection } from '../../shared/components/animated-section';
import { PapercutArt } from '../../shared/components/papercut-art';
import { HandwriteDirective } from '../../shared/directives/handwrite.directive';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-chapter-one',
  imports: [AnimatedSection, PapercutArt, HandwriteDirective],
  templateUrl: './chapter-one.html',
  styleUrl: './chapter-one.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChapterOne {
  config = input.required<WeddingConfig>();

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const root = this.el.nativeElement;
      const photo = root.querySelector('.photo-placeholder');
      const overlay = root.querySelector('.photo-overlay');
      const label = root.querySelector('.chapter-label');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });

      tl.fromTo(
        label,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
      );

      if (photo) {
        tl.fromTo(
          photo,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' },
          '-=0.2',
        );
      }

      tl.fromTo(
        overlay,
        { opacity: 1 },
        { opacity: 0, duration: 0.8, ease: 'power2.inOut' },
        '-=0.6',
      );

      this.destroyRef.onDestroy(() => {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      });
    });
  }
}
