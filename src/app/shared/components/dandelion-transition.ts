import {
  Component,
  ChangeDetectionStrategy,
  output,
  inject,
  DestroyRef,
  afterNextRender,
  ElementRef,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-dandelion-transition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.z-index]': "'15'",
  },
  styles: `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      overflow: hidden;
      pointer-events: none;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
  template: `
    <svg #svg xmlns="http://www.w3.org/2000/svg">
      <defs>
        <g id="dandelion">
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-18"
            stroke="#f5e6d3"
            stroke-width="0.8"
            stroke-linecap="round"
          />
          <line
            x1="0"
            y1="-18"
            x2="-5"
            y2="-24"
            stroke="#f5e6d3"
            stroke-width="0.5"
            stroke-linecap="round"
          />
          <line
            x1="0"
            y1="-18"
            x2="5"
            y2="-24"
            stroke="#f5e6d3"
            stroke-width="0.5"
            stroke-linecap="round"
          />
          <line
            x1="0"
            y1="-18"
            x2="-3"
            y2="-26"
            stroke="#f5e6d3"
            stroke-width="0.5"
            stroke-linecap="round"
          />
          <line
            x1="0"
            y1="-18"
            x2="3"
            y2="-26"
            stroke="#f5e6d3"
            stroke-width="0.5"
            stroke-linecap="round"
          />
          <line
            x1="0"
            y1="-18"
            x2="0"
            y2="-27"
            stroke="#f5e6d3"
            stroke-width="0.5"
            stroke-linecap="round"
          />
          <circle cx="0" cy="0" r="1.2" fill="#d4af37" opacity="0.7" />
        </g>
        <g id="star">
          <path
            d="M0,-8 L2,-2 L8,-2 L3,2 L5,8 L0,4 L-5,8 L-3,2 L-8,-2 L-2,-2 Z"
            fill="none"
            stroke="#d4af37"
            stroke-width="0.8"
            stroke-linejoin="round"
          />
        </g>
        <g id="tiny-star">
          <path
            d="M0,-5 L1.2,-1.2 L5,-1.2 L2,1 L3,5 L0,2.5 L-3,5 L-2,1 L-5,-1.2 L-1.2,-1.2 Z"
            fill="#d4af37"
            opacity="0.5"
          />
        </g>
      </defs>
      <g #container></g>
    </svg>
  `,
})
export class DandelionTransition {
  complete = output<void>();

  private svgRef = viewChild.required<ElementRef<SVGSVGElement>>('svg');
  private containerRef = viewChild.required<ElementRef<SVGGElement>>('container');
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.init());
  }

  private init(): void {
    const svg = this.svgRef().nativeElement;
    const container = this.containerRef().nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;

    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const tl = gsap.timeline({
      onComplete: () => {
        container.remove();
        this.complete.emit();
      },
    });

    const total = 16;

    for (let i = 0; i < total; i++) {
      const isDandelion = i < 9;
      const isStar = i >= 9 && i < 14;
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', isDandelion ? '#dandelion' : isStar ? '#star' : '#tiny-star');

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.appendChild(use);
      container.appendChild(g);

      const scale = 0.6 + Math.random() * 1.4;
      const startX = -40 - Math.random() * 100;
      const startY = Math.random() * h;
      const duration = 0.6 + Math.random() * 0.5;
      const delay = Math.random() * 0.3;
      const rotDir = Math.random() > 0.5 ? 1 : -1;
      const rotation = rotDir * (180 + Math.random() * 360);

      gsap.set(g, { x: startX, y: startY, scale, rotation: Math.random() * 360, opacity: 0 });

      tl.to(g, { opacity: 0.85, duration: 0.12, ease: 'power1.out' }, delay);
      tl.to(g, { x: w + 60, rotation: `+=${rotation}`, duration, ease: 'power1.in' }, delay);
      tl.to(g, { opacity: 0, duration: 0.2, ease: 'power1.in' }, delay + duration - 0.2);
    }
  }
}
