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
import { HandwriteDirective } from '../../shared/directives/handwrite.directive';
import { WeddingConfig } from '../../core/models/wedding-config';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-introduction',
  imports: [AnimatedSection, HandwriteDirective],
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
      const author = el.querySelector('.quote-author');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      tl.fromTo(author, { opacity: 0 }, { opacity: 1, duration: 0.5 });

      this.destroyRef.onDestroy(() => {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      });
    });
  }
}
