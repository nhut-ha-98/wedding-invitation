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
  selector: 'app-proposal',
  imports: [AnimatedSection],
  templateUrl: './proposal.html',
  styleUrl: './proposal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Proposal {
  config = input.required<WeddingConfig>();

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  readonly polaroids = [
    { alt: 'Proposal at sunset', rotate: -3, top: 0, left: 0 },
    { alt: 'Celebration after', rotate: 4, top: 60, left: 40 },
    { alt: 'The ring close-up', rotate: -2, top: 20, left: 20 },
  ];

  constructor() {
    afterNextRender(() => {
      const root = this.el.nativeElement;
      const photos = root.querySelectorAll('.polaroid');
      const story = root.querySelector('.proposal-story');
      const label = root.querySelector('.proposal-label');

      ScrollTrigger.create({
        trigger: photos[0] ?? root,
        start: 'top 75%',
        onEnter: () => {
          const tl = gsap.timeline();
          tl.fromTo(
            label,
            { opacity: 0, y: -15 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          );

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

          tl.fromTo(
            story,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
            '-=0.3',
          );
        },
        once: true,
      });

      this.destroyRef.onDestroy(() => {
        ScrollTrigger.getAll().forEach((st) => st.kill());
      });
    });
  }
}
