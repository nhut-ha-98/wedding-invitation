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
  selector: 'app-timeline',
  imports: [AnimatedSection],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timeline {
  config = input.required<WeddingConfig>();

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const root = this.el.nativeElement;
      const items = root.querySelectorAll('.timeline-item');
      const line = root.querySelector('.timeline-line');

      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });

      masterTl.fromTo(
        line,
        { scaleY: 0 },
        { scaleY: 1, duration: 1, ease: 'power2.inOut', transformOrigin: 'top center' },
      );

      items.forEach((item, i) => {
        const dot = item.querySelector('.timeline-dot');
        const content = item.querySelector('.timeline-content');

        masterTl
          .fromTo(
            dot,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' },
            i === 0 ? '-=0.8' : '-=0.3',
          )
          .fromTo(
            content,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            '-=0.2',
          );
      });

      this.destroyRef.onDestroy(() => {
        masterTl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      });
    });
  }
}
