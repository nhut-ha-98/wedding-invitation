import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  inject,
  ElementRef,
  DestroyRef,
  afterNextRender,
} from '@angular/core';

export interface ChapterSection {
  id: string;
  number: number;
  label: string;
}

@Component({
  selector: 'app-chapter-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.z-index]': "'50'",
  },
  styles: [
    `
      :host {
        position: fixed;
        bottom: 24px;
        right: 24px;
        overflow: visible;
      }

      .breadcrumb-btn {
        position: relative;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #2c1810;
        border: 1.5px solid rgba(212, 175, 55, 0.75);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:
          0 4px 16px rgba(0, 0, 0, 0.35),
          0 0 0 1px rgba(212, 175, 55, 0.1);
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;
        padding: 0;
        outline: none;
      }

      .breadcrumb-btn:hover {
        transform: scale(1.06);
        box-shadow:
          0 4px 20px rgba(212, 175, 55, 0.2),
          0 0 0 1px rgba(212, 175, 55, 0.35);
      }

      .breadcrumb-btn:focus-visible {
        box-shadow:
          0 0 0 2px #d4af37,
          0 4px 16px rgba(0, 0, 0, 0.35);
      }

      .progress-ring {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }

      .progress-ring-track {
        fill: none;
        stroke: rgba(212, 175, 55, 0.12);
        stroke-width: 3;
      }

      .progress-ring-fill {
        fill: none;
        stroke: #d4af37;
        stroke-width: 3;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.3s ease;
      }

      .chapter-number {
        font-family: 'MedievalSharp', serif;
        font-size: 1.125rem;
        font-weight: 700;
        color: #f5e6d3;
        line-height: 1;
        position: relative;
        z-index: 1;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      }

      .menu-items {
        position: absolute;
        inset: 0;
        overflow: visible;
        pointer-events: none;
      }

      .menu-item {
        position: absolute;
        left: 50%;
        bottom: 50%;
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
        pointer-events: none;
        transition:
          transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
          opacity 0.3s ease;
        cursor: pointer;
      }

      .menu-item.open {
        pointer-events: auto;
      }

      .item-badge {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'MedievalSharp', serif;
        font-size: 0.8125rem;
        font-weight: 600;
        flex-shrink: 0;
        border: 1.5px solid rgba(212, 175, 55, 0.6);
        transition:
          background 0.3s,
          border-color 0.3s,
          color 0.3s;
      }

      .item-badge.current {
        background: #d4af37;
        border-color: #d4af37;
        color: #2c1810;
      }

      .item-badge.default {
        background: #2c1810;
        color: #d4af37;
      }

      .item-badge.visited {
        border-color: rgba(212, 175, 55, 0.3);
        color: rgba(212, 175, 55, 0.5);
      }

      .item-label {
        font-family: 'Cormorant Garamond', serif;
        font-size: 0.875rem;
        color: #f5e6d3;
        font-weight: 500;
        letter-spacing: 0.3px;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
        opacity: 0.95;
      }

      .item-label.current {
        color: #d4af37;
        font-weight: 600;
      }

      @media (prefers-reduced-motion: reduce) {
        .menu-item {
          transition: none;
        }
        .progress-ring-fill {
          transition: none;
        }
        .breadcrumb-btn {
          transition: none;
        }
      }
    `,
  ],
  template: `
    <button
      class="breadcrumb-btn"
      (click)="toggle($event)"
      [attr.aria-expanded]="isOpen()"
      aria-label="Navigate to chapter"
    >
      <svg class="progress-ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          class="progress-ring-track"
          cx="50"
          cy="50"
          r="44"
        />
        <circle
          class="progress-ring-fill"
          cx="50"
          cy="50"
          r="44"
          [attr.stroke-dasharray]="ringCircumference"
          [attr.stroke-dashoffset]="ringCircumference * (1 - scrollProgress())"
        />
      </svg>
      <span class="chapter-number">{{ (sections()[currentIndex()]?.number ?? 1) }}</span>
    </button>

    <div class="menu-items">
      @for (item of sections(); track item.id; let i = $index) {
        <div
          class="menu-item"
          [class.open]="isOpen()"
          [style.transform]="itemStyles()[i].transform"
          [style.opacity]="itemStyles()[i].opacity"
          [style.transition-delay]="itemStyles()[i].transitionDelay"
          [style.pointer-events]="itemStyles()[i].pointerEvents"
          (click)="onItemClick(i)"
          (keydown.enter)="onItemClick(i)"
          tabindex="0"
          role="button"
          [attr.aria-label]="'Go to ' + item.label"
        >
          <span
            class="item-badge"
            [class.current]="i === currentIndex()"
            [class.visited]="i < currentIndex()"
            [class.default]="i > currentIndex()"
          >
            {{ item.number }}
          </span>
          <span
            class="item-label"
            [class.current]="i === currentIndex()"
          >
            {{ item.label }}
          </span>
        </div>
      }
    </div>
  `,
})
export class ChapterBreadcrumb {
  sections = input.required<ChapterSection[]>();
  currentIndex = input(0);
  scrollProgress = input(0);
  navigate = output<number>();

  isOpen = signal(false);
  override = inject(ElementRef);
  private destroyRef = inject(DestroyRef);

  readonly ringCircumference = 2 * Math.PI * 44; // ~276.46

  private readonly startAngle = 180;
  private readonly endAngle = 85;
  private readonly radius = 130;

  readonly itemPositions = computed(() => {
    const count = this.sections().length;
    const step = count > 1 ? (this.startAngle - this.endAngle) / (count - 1) : 0;

    return this.sections().map((_, i) => {
      const angleDeg = this.startAngle - i * step;
      const angleRad = (angleDeg * Math.PI) / 180;
      return {
        x: Math.cos(angleRad) * this.radius,
        y: -Math.sin(angleRad) * this.radius,
      };
    });
  });

  readonly itemStyles = computed(() => {
    const positions = this.itemPositions();
    const open = this.isOpen();
    const count = this.sections().length;

    return positions.map((pos, i) => {
      const openDelay = `${i * 35}ms`;
      const closeDelay = `${(count - 1 - i) * 20}ms`;
      return {
        transform: open
          ? `translate(calc(-50% + ${pos.x}px), calc(50% + ${pos.y}px))`
          : 'translate(-50%, 50%)',
        opacity: open ? 1 : 0,
        transitionDelay: open ? openDelay : closeDelay,
        pointerEvents: (open ? 'auto' : 'none') as 'auto' | 'none',
      };
    });
  });

  constructor() {
    afterNextRender(() => {
      this.destroyRef.onDestroy(() => {
        document.removeEventListener('click', this.closeOnOutsideClick);
      });
      document.addEventListener('click', this.closeOnOutsideClick);
    });
  }

  private closeOnOutsideClick = (e: MouseEvent): void => {
    if (this.isOpen()) {
      const host = this.override.nativeElement;
      if (!host.contains(e.target as Node)) {
        this.isOpen.set(false);
      }
    }
  };

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen.update((v) => !v);
  }

  onItemClick(index: number): void {
    this.navigate.emit(index);
    this.isOpen.set(false);
  }
}
