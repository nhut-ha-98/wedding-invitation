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
  selector: 'app-introduction',
  imports: [AnimatedSection],
  templateUrl: './introduction.html',
  styleUrl: './introduction.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Introduction {
  config = input.required<WeddingConfig>();

  private quoteEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const el = this.quoteEl.nativeElement;
      const quote = el.querySelector('.quote-text');
      const author = el.querySelector('.quote-author');
      const body = el.querySelector('.intro-body');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      tl.fromTo(
        quote,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      )
        .fromTo(author, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.3')
        .fromTo(
          body,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          '-=0.2',
        );

      this.destroyRef.onDestroy(() => {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      });
    });
  }
}
