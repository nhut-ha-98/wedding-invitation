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
import { SectionHeader } from '../../shared/components/section-header';
import { HandwriteDirective } from '../../shared/directives/handwrite.directive';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-chapter-one',
  imports: [AnimatedSection, PapercutArt, SectionHeader, HandwriteDirective],
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
      const label = root.querySelector('.section-header');

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

      this.destroyRef.onDestroy(() => {
        tl.scrollTrigger?.kill();
        tl.kill();
      });
    });
  }
}
