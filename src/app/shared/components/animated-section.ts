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

@Component({
  selector: 'app-animated-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.will-change]': "'transform, opacity'",
  },
  template: `<ng-content />`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class AnimatedSection {
  threshold = input(0.15);
  delay = input(0);
  visible = output<void>();

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const el = this.el.nativeElement;

      gsap.set(el, { opacity: 0, y: 40 });

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power2.out',
              delay: this.delay(),
            });
            this.visible.emit();
            observer.disconnect();
          }
        },
        { threshold: this.threshold() },
      );
      observer.observe(el);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
