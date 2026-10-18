import { Directive, ElementRef, inject } from '@angular/core';
import { gsap } from 'gsap';

/** Appends the original timeline exposure without changing its capture timing. */
export function appendInstantPhotoCapture(
  timeline: gsap.core.Timeline,
  host: Element,
  start = 0,
): void {
  const photo = host.querySelector('img');
  const flash = host.querySelector('.snapshot-flash');
  const shutter = host.querySelector('.snapshot-shutter');

  // One exposure pulse, then the image develops as the print settles.
  if (photo && flash && shutter) {
    // Hold a blank print after the shutter, then develop it gradually.
    gsap.set(flash, { opacity: 1 });
    timeline
      .fromTo(
        shutter,
        { scaleY: 1 },
        { scaleY: 0, duration: 0.12, ease: 'power3.in' },
        start + 0.46,
      )
      .to(flash, { opacity: 0, duration: 0.95, ease: 'power1.inOut' }, start + 0.76);
  }
}

/** Lets an owning sequence schedule capture after its photo has landed. */
@Directive({ selector: '[appInstantPhoto]' })
export class InstantPhoto {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  appendTo(timeline: gsap.core.Timeline, start: number): void {
    appendInstantPhotoCapture(timeline, this.element.nativeElement, start);
  }
}
