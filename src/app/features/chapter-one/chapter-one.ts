import {
  Component,
  ChangeDetectionStrategy,
  input,
  ElementRef,
  afterNextRender,
  DestroyRef,
  inject,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatedSection } from '../../shared/components/animated-section';
import { WeddingConfig } from '../../core/models/wedding-config';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-chapter-one',
  imports: [AnimatedSection],
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
      const photo = root.querySelector('.chapter-photo');
      const overlay = root.querySelector('.photo-overlay');
      const body = root.querySelector('.chapter-body');
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
      )
        .fromTo(
          photo,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' },
          '-=0.2',
        )
        .fromTo(
          overlay,
          { opacity: 1 },
          { opacity: 0, duration: 0.8, ease: 'power2.inOut' },
          '-=0.6',
        )
        .fromTo(
          body,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          '-=0.3',
        );

      this.destroyRef.onDestroy(() => {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      });
    });
  }
}
