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
  selector: 'app-wedding-info',
  imports: [AnimatedSection],
  templateUrl: './wedding-info.html',
  styleUrl: './wedding-info.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeddingInfo {
  config = input.required<WeddingConfig>();

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const root = this.el.nativeElement;
      const card = root.querySelector('.info-card');
      const scheduleRows = root.querySelectorAll<HTMLElement>('.schedule-row');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });

      tl.fromTo(
        card,
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'power2.out' },
      );

      if (scheduleRows.length) {
        tl.fromTo(
          scheduleRows,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' },
          '-=0.4',
        );
      }

      this.destroyRef.onDestroy(() => {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      });
    });
  }
}
