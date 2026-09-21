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
      const card = root.querySelector<HTMLElement>('.info-card');
      const notes = root.querySelectorAll<HTMLElement>('.detail-note');
      const programStubs = root.querySelectorAll<HTMLElement>('.program-stub');
      const mapAction = root.querySelector<HTMLElement>('.note-map-action');
      const btn = root.querySelector<HTMLElement>('.map-btn');

      if (!card) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set([card, ...notes, ...programStubs, mapAction, btn].filter(Boolean), {
          opacity: 1,
          scale: 1,
          y: 0,
        });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });

      tl.fromTo(
        card,
        { opacity: 0, scale: 0.95, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'power2.out' },
      );

      if (notes.length) {
        tl.fromTo(
          notes,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' },
          '-=0.35',
        );
      }

      if (programStubs.length) {
        tl.fromTo(
          programStubs,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
          '-=0.35',
        );
      }

      if (mapAction || btn) {
        tl.fromTo(
          [mapAction, btn].filter(Boolean),
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
          '-=0.3',
        );
      }

      this.destroyRef.onDestroy(() => {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      });
    });
  }
}
