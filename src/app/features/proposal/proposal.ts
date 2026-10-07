import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  ElementRef,
  afterNextRender,
  DestroyRef,
  inject,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatedSection } from '../../shared/components/animated-section';
import { SectionHeader } from '../../shared/components/section-header';
import { HandwriteDirective } from '../../shared/directives/handwrite.directive';
import { WeddingConfig } from '../../core/models/wedding-config';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-proposal',
  imports: [AnimatedSection, SectionHeader, HandwriteDirective],
  templateUrl: './proposal.html',
  styleUrl: './proposal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Proposal {
  config = input.required<WeddingConfig>();

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  private readonly layout: { rotate: number; top: number; left: number }[] = [
    { rotate: -3, top: 0, left: 0 },
    { rotate: 4, top: 60, left: 40 },
    { rotate: -2, top: 20, left: 20 },
  ];

  readonly polaroids = computed(() =>
    this.config().album.map((photo, i) => ({
      ...photo,
      rotate: this.layout[i]?.rotate ?? 0,
      top: this.layout[i]?.top ?? 0,
      left: this.layout[i]?.left ?? 0,
    })),
  );

  constructor() {
    afterNextRender(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const root = this.el.nativeElement;
      const photos = root.querySelectorAll<HTMLElement>('.polaroid');
      const label = root.querySelector<HTMLElement>('.section-header');

      if (prefersReducedMotion) {
        if (label) gsap.set(label, { opacity: 1, y: 0 });
        photos.forEach((photo) => {
          gsap.set(photo, {
            opacity: 1,
            y: 0,
            rotate: Number(photo.getAttribute('data-rotate')) || 0,
            scale: 1,
          });
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

      if (label) {
        tl.fromTo(
          label,
          { opacity: 0, y: -15 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        );
      }

      photos.forEach((photo, i) => {
        tl.fromTo(
          photo,
          { opacity: 0, y: 30, rotate: 0, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            rotate: Number(photo.getAttribute('data-rotate')) || 0,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
          },
          i === 0 ? '-=0.3' : '-=0.4',
        );
      });

      this.destroyRef.onDestroy(() => {
        tl.kill();
        tl.scrollTrigger?.kill();
      });
    });
  }
}
