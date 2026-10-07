import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { gsap } from 'gsap';

@Directive({
  selector: '[appCoverHandwrite]',
  standalone: true,
})
export class CoverHandwriteDirective {
  speed = input(60);
  stagger = input(0.04);

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const element = this.el.nativeElement;
      const rawText = element.textContent ?? '';
      if (!rawText.trim()) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        element.dispatchEvent(new CustomEvent('cover-handwrite-complete', { bubbles: true }));
        return;
      }

      // Preserve whitespace and line breaks for the cover text
      element.textContent = '';
      element.style.whiteSpace = 'pre-wrap';
      element.style.overflowWrap = 'break-word';

      const chars = Array.from(rawText).map((ch) => {
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.opacity = '0';
        span.style.display = 'inline-block';
        span.style.transform = 'translateY(6px)';
        return span;
      });

      chars.forEach((s) => element.appendChild(s));

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) return;
            const tl = gsap.timeline({
              onComplete: () => {
                // dispatch a custom event so the cover can react (e.g., show image)
                element.dispatchEvent(
                  new CustomEvent('cover-handwrite-complete', { bubbles: true }),
                );
              },
            });
            tl.to(chars, {
              opacity: 1,
              y: 0,
              duration: this.speed() / 1000,
              stagger: this.stagger(),
              ease: 'power2.out',
            });
            observer.disconnect();
            this.destroyRef.onDestroy(() => tl.kill());
          }
        },
        { threshold: 0.15 },
      );

      observer.observe(element);
    });
  }
}
