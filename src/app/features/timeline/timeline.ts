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
import { SectionHeader } from '../../shared/components/section-header';
import { WeddingConfig } from '../../core/models/wedding-config';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-timeline',
  imports: [AnimatedSection, PapercutArt, SectionHeader],
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

      const ctx = gsap.context(() => {
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
            const photo = polaroid.querySelector('img');
            const flash = polaroid.querySelector('.snapshot-flash');
            const shutter = polaroid.querySelector('.snapshot-shutter');
            itemTl.fromTo(
              polaroid,
              { opacity: 0, y: 15, scale: 0.94, rotation: i % 2 === 0 ? -8 : 8 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                rotation: i % 2 === 0 ? -3 : 3,
                duration: 0.3,
                ease: 'power2.out',
              },
              '-=0.4',
            );

            // One exposure pulse, then the image develops as the print settles.
            if (photo && flash && shutter) {
              // Hold a blank print after the shutter, then develop it gradually.
              gsap.set(flash, { opacity: 1 });
              itemTl
                .fromTo(
                  shutter,
                  { scaleY: 1 },
                  { scaleY: 0, duration: 0.12, ease: 'power3.in' },
                  0.46,
                )
                .to(flash, { opacity: 0, duration: 0.95, ease: 'power1.inOut' }, 0.76);
            }
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
      }, root);

      this.destroyRef.onDestroy(() => {
        ctx.revert();
      });
    });
  }
}
