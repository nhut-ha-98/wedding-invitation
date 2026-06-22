import { Directive, ElementRef, input, inject, afterNextRender, DestroyRef } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Directive({
  selector: '[appHandwrite]',
  standalone: true,
})
export class HandwriteDirective {
  appHandwriteSpeed = input(40);
  appHandwriteStagger = input(0.035);

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      gsap.registerPlugin(ScrollTrigger);
      const element = this.el.nativeElement;
      const text = element.textContent ?? '';
      if (!text.trim()) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      element.textContent = '';
      element.style.overflowWrap = 'break-word';
      element.style.wordBreak = 'break-word';

      const chars = text.split('').map((char) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.opacity = '0';
        return span;
      });

      chars.forEach((span) => element.appendChild(span));

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      tl.to(chars, {
        opacity: 1,
        duration: this.appHandwriteSpeed() / 1000,
        stagger: this.appHandwriteStagger(),
        ease: 'power1.in',
      });

      this.destroyRef.onDestroy(() => {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      });
    });
  }
}
