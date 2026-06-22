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
import { AnimatedSection } from '../../shared/components/animated-section';
import { HandwriteDirective } from '../../shared/directives/handwrite.directive';
import { WeddingConfig } from '../../core/models/wedding-config';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-ending',
  imports: [AnimatedSection, HandwriteDirective],
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
      const author = root.querySelector('.ending-author');
      const cta = root.querySelector('.close-cta');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });

      tl.fromTo(author, { opacity: 0 }, { opacity: 1, duration: 0.5 }).fromTo(
        cta,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.2',
      );

      this.destroyRef.onDestroy(() => {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      });
    });
  }

  onClose(): void {
    this.closeBook.emit();
  }
}
