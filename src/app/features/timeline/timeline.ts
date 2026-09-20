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
import { PapercutArt, PapercutVariant } from '../../shared/components/papercut-art';
import { WeddingConfig } from '../../core/models/wedding-config';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-timeline',
  imports: [AnimatedSection, PapercutArt],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timeline {
  config = input.required<WeddingConfig>();

  private readonly arts: PapercutVariant[] = ['branch', 'dandelion', 'blossom'];

  timelineArt(idx: number): PapercutVariant {
    return this.arts[idx % this.arts.length];
  }

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const root = this.el.nativeElement;
      const line = root.querySelector<HTMLElement>('.timeline-line');
      const items = root.querySelectorAll<HTMLElement>('.timeline-item');

      if (!line || !items.length) return;

      if (prefersReducedMotion) {
        gsap.set(line, { scaleY: 1 });
        items.forEach((item) => {
          const dot = item.querySelector('.timeline-dot');
          const card = item.querySelector('.timeline-card');
          const polaroid = item.querySelector('.timeline-polaroid');
          if (dot) gsap.set(dot, { scale: 1, opacity: 1 });
          if (card) gsap.set(card, { opacity: 1, y: 0 });
          if (polaroid) gsap.set(polaroid, { opacity: 1, y: 0 });
        });
        return;
      }

      gsap.to(line, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: 0.5,
        },
      });

      items.forEach((item, i) => {
        const dot = item.querySelector('.timeline-dot');
        const card = item.querySelector('.timeline-card');
        const polaroid = item.querySelector('.timeline-polaroid');

        const itemTl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });

        if (dot) {
          itemTl.fromTo(
            dot,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' },
          );
        }

        if (card) {
          const isLeft = i % 2 === 0;
          itemTl.fromTo(
            card,
            { opacity: 0, y: 20, x: isLeft ? -15 : 15 },
            { opacity: 1, y: 0, x: 0, duration: 0.6, ease: 'power2.out' },
            '-=0.2',
          );
        }

        if (polaroid) {
          itemTl.fromTo(
            polaroid,
            { opacity: 0, y: 15, rotation: i % 2 === 0 ? -8 : 8 },
            { opacity: 1, y: 0, rotation: i % 2 === 0 ? -3 : 3, duration: 0.5, ease: 'power2.out' },
            '-=0.4',
          );
        }

        if (card) {
          gsap.to(card, {
            y: -8,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        }
      });

      this.destroyRef.onDestroy(() => {
        ScrollTrigger.getAll().forEach((st) => st.kill());
      });
    });
  }
}
