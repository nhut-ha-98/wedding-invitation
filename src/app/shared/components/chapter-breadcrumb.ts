import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

export interface ChapterSection {
  id: string;
  number: number;
  label: string;
}

export interface TimelineMilestone {
  id: string;
  time: string;
  label: string;
  targetIndex: number;
  pageMin: number;
  pageMax: number;
}

@Component({
  selector: 'app-chapter-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.z-index]': "'60'",
  },
  styles: [
    `
      :host {
        position: fixed;
        top: 20px;
        left: 20px;
        overflow: visible;
      }

      @media (max-width: 640px) {
        :host {
          top: 14px;
          left: 14px;
        }
      }

      .astrolabe-wrapper {
        position: relative;
        overflow: visible;
      }

      /* Central Celestial Button */
      .breadcrumb-btn {
        position: relative;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #1e100a;
        border: 2px solid rgba(212, 175, 55, 0.85);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:
          0 6px 20px rgba(0, 0, 0, 0.45),
          0 0 12px rgba(212, 175, 55, 0.25);
        transition:
          transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
          border-color 0.4s ease,
          box-shadow 0.4s ease;
        padding: 0;
        outline: none;
        overflow: visible;
        z-index: 5;
      }

      @media (max-width: 640px) {
        .breadcrumb-btn {
          width: 48px;
          height: 48px;
        }
      }

      .breadcrumb-btn:hover {
        transform: scale(1.08);
      }

      .breadcrumb-btn[aria-expanded='true'] {
        transform: scale(1.04);
        border-color: #ffe08a;
      }

      .breadcrumb-btn:focus-visible {
        outline: 2px solid #d4af37;
        outline-offset: 3px;
      }

      .stage--noon .breadcrumb-btn {
        border-color: #f59e0b;
        box-shadow:
          0 6px 20px rgba(0, 0, 0, 0.45),
          0 0 14px rgba(245, 158, 11, 0.35);
      }

      .stage--afternoon .breadcrumb-btn {
        border-color: #f97316;
        box-shadow:
          0 6px 20px rgba(0, 0, 0, 0.45),
          0 0 14px rgba(249, 115, 22, 0.35);
      }

      .stage--moon .breadcrumb-btn {
        border-color: #c084fc;
        background: #130724;
        box-shadow:
          0 6px 20px rgba(0, 0, 0, 0.5),
          0 0 14px rgba(192, 132, 252, 0.35);
      }

      /* Simple celestial vector art inside button */
      .celestial-art {
        position: absolute;
        inset: 2px;
        width: calc(100% - 4px);
        height: calc(100% - 4px);
        border-radius: 50%;
        pointer-events: none;
        overflow: hidden;
        object-fit: contain;
      }

      /* Progress Ring */
      .progress-ring {
        --ring-color: #d4af37;
        position: absolute;
        inset: -4px;
        width: calc(100% + 8px);
        height: calc(100% + 8px);
        border-radius: 50%;
        background: conic-gradient(
          var(--ring-color) calc(var(--progress) * 1turn),
          rgba(212, 175, 55, 0.18) 0
        );
        -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0);
        mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0);
        transform: rotate(-90deg);
        pointer-events: none;
        transition: background 0.25s ease;
      }

      .stage--noon .progress-ring {
        --ring-color: #f59e0b;
      }

      .stage--afternoon .progress-ring {
        --ring-color: #f97316;
      }

      .stage--moon .progress-ring {
        --ring-color: #c084fc;
      }

      /* Corner jewel page-number badge */
      .page-corner-badge {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #2a140b;
        border: 1.5px solid #d4af37;
        color: #fdf3d0;
        font-family: var(--font-serif);
        font-size: 0.6875rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
        z-index: 6;
        pointer-events: none;
      }

      .stage--moon .page-corner-badge {
        background: #18082e;
        border-color: #c084fc;
        color: #f5f3ff;
      }

      /* Astrolabe navigation: stable panel, decorative orbit paths. */
      .astrolabe-orbits {
        position: absolute;
        top: 68px;
        left: 0;
        display: grid;
        grid-template-columns: minmax(0, 0.82fr) minmax(0, 1fr);
        gap: 10px;
        width: min(22.5rem, calc(100vw - 40px));
        padding: 12px;
        overflow: hidden;
        border: 0;
        border-radius: 18px;
        background: rgba(27, 13, 8, 0.94);
        box-shadow:
          0 16px 34px rgba(13, 5, 2, 0.5),
          inset 0 1px rgba(255, 239, 194, 0.08);
        opacity: 0;
        pointer-events: none;
        transform: translateY(-8px) scale(0.98);
        transform-origin: top left;
        transition:
          opacity 0.22s ease,
          transform 0.28s ease,
          visibility 0s linear 0.28s;
        visibility: hidden;
      }

      .astrolabe-orbits.open {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0) scale(1);
        transition-delay: 0s;
        visibility: visible;
      }

      .orbital-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0.5;
      }

      .orbit-group {
        position: relative;
        z-index: 1;
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 8px;
      }

      .orbit-item {
        position: relative;
        display: flex;
        width: 100%;
        min-width: 0;
        align-items: center;
        gap: 6px;
        appearance: none;
        border: 0;
        background: transparent;
        cursor: pointer;
        outline: none;
        pointer-events: auto;
        padding: 0;
        text-align: left;
        transition: filter 0.2s ease;
        white-space: nowrap;
        user-select: none;
        -webkit-user-select: none;
      }

      .orbit-item:focus-visible .timeline-pill,
      .orbit-item:focus-visible .section-pill {
        outline: 2px solid #fff8e7;
        outline-offset: 3px;
      }

      .timeline-pill {
        display: flex;
        flex: 1;
        min-width: 0;
        align-items: center;
        gap: 9px;
        padding: 5px 6px;
        background: transparent;
        border: 0;
        border-radius: 6px;
        box-shadow: none;
        transition:
          transform 0.2s ease,
          background 0.3s ease,
          box-shadow 0.3s ease;
      }

      .timeline-item::before,
      .section-item::before {
        width: 5px;
        height: 5px;
        margin-right: 4px;
        border: 0;
        border-radius: 50%;
        background: rgba(255, 234, 154, 0.48);
        box-shadow: none;
        content: '';
        flex: 0 0 auto;
      }

      .timeline-item::before {
        display: none;
      }

      .orbit-item.active::before {
        background: #ffd54f;
        box-shadow: 0 0 8px rgba(255, 213, 79, 0.65);
      }

      .stage--moon .orbit-item.active::before {
        background: #e9d5ff;
        box-shadow: 0 0 8px rgba(192, 132, 252, 0.65);
      }

      .orbit-item:hover .timeline-pill {
        transform: translateX(2px);
        background: rgba(255, 248, 231, 0.07);
        box-shadow: none;
      }

      .orbit-item.active .timeline-pill {
        background: rgba(255, 213, 79, 0.1);
        box-shadow: inset 2px 0 #ffd54f;
      }

      .stage--moon .orbit-item.active .timeline-pill {
        background: rgba(192, 132, 252, 0.16);
        box-shadow: inset 2px 0 #c084fc;
      }

      .time-badge {
        font-family: var(--font-serif);
        min-width: 2rem;
        padding: 0;
        font-size: 0.6875rem;
        font-weight: 700;
        color: #d6b96d;
        background: transparent;
        box-shadow: none;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.04em;
      }

      .stage--moon .time-badge {
        color: #d8b4fe;
      }

      .time-label {
        font-family: var(--font-body);
        font-size: 0.9375rem;
        font-weight: 500;
        color: #fff8e7;
        letter-spacing: 0.01em;
        text-shadow: none;
      }

      .orbit-item.active .time-label {
        color: #ffd54f;
        font-weight: 600;
      }

      .stage--moon .orbit-item.active .time-label {
        color: #f5f3ff;
      }

      .section-pill {
        display: flex;
        flex: 1;
        min-width: 0;
        align-items: center;
        gap: 6px;
        padding: 4px 10px 4px 5px;
        background: rgba(255, 248, 231, 0.04);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 0;
        border-radius: 9px;
        box-shadow: none;
        transition:
          transform 0.2s ease,
          background 0.3s ease,
          box-shadow 0.3s ease;
      }

      .orbit-item:hover .section-pill {
        transform: translateX(2px);
        background: rgba(255, 248, 231, 0.1);
        box-shadow: none;
      }

      .orbit-item.active .section-pill {
        background: rgba(212, 175, 55, 0.14);
        box-shadow: inset 2px 0 #d4af37;
      }

      .stage--moon .orbit-item.active .section-pill {
        background: rgba(192, 132, 252, 0.16);
        box-shadow: inset 2px 0 #c084fc;
      }

      .section-label {
        font-family: var(--font-body);
        font-size: 0.875rem;
        font-weight: 600;
        color: #f5e6d3;
        letter-spacing: 0.02em;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
      }

      .timeline-item .timeline-pill,
      .section-item .section-pill {
        max-width: none;
      }

      .time-label,
      .section-label {
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .orbit-item.active .section-label {
        color: #ffd54f;
        font-weight: 700;
      }

      .stage--moon .orbit-item.active .section-label {
        color: #f5f3ff;
      }

      @media (max-width: 640px) {
        .astrolabe-orbits {
          top: 58px;
          width: calc(100vw - 28px);
          gap: 8px;
          padding: 10px;
          border-radius: 15px;
        }

        .orbit-group {
          gap: 7px;
        }

        .timeline-pill,
        .section-pill {
          padding: 3px 8px 3px 5px;
          gap: 5px;
        }

        .timeline-pill {
          padding: 4px 5px;
          gap: 7px;
        }

        .time-badge {
          min-width: 1.8rem;
          padding: 0;
          font-size: 0.625rem;
        }

        .time-label,
        .section-label {
          font-size: 0.8125rem;
        }

        .timeline-item::before,
        .section-item::before {
          width: 5px;
          height: 5px;
          margin-right: 3px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .orbit-item {
          transition: none;
        }
        .progress-ring {
          transition: none;
        }
        .breadcrumb-btn {
          transition: none;
        }

        .astrolabe-orbits {
          transition: none;
        }
      }
    `,
  ],
  template: `
    <div class="astrolabe-wrapper" [class]="'stage--' + skyStage()">
      <!-- Main Celestial Circle Button -->
      <button
        #triggerButton
        class="breadcrumb-btn"
        (click)="toggle($event)"
        [attr.aria-expanded]="isOpen()"
        aria-controls="astrolabe-navigation"
        aria-label="Xem lịch trình và các chương"
        type="button"
      >
        <!-- Simple Vector Artwork inside Circle -->
        @switch (skyStage()) {
          @case ('morning') {
            <img class="celestial-art" src="/astrolabe/morning.svg" alt="" />
          }
          @case ('noon') {
            <img class="celestial-art" src="/astrolabe/noon.svg" alt="" />
          }
          @case ('afternoon') {
            <img class="celestial-art" src="/astrolabe/afternoon.svg" alt="" />
          }
          @case ('moon') {
            <img class="celestial-art" src="/astrolabe/moon.svg" alt="" />
          }
        }

        <span class="progress-ring" [style.--progress]="scrollProgress()" aria-hidden="true"></span>

        <!-- Corner jewel page-number badge -->
        <span class="page-corner-badge">{{ activePageNumber() }}</span>
      </button>

      <!-- ============================================================
           ASTROLABE RADIAL ORBITS
           Revealed ONLY on click for detail:
           1) Inner circular layout: Timeline (4 milestones)
           2) Outer bigger circular layout: Sections (7 chapters)
           ============================================================ -->
      <nav
        id="astrolabe-navigation"
        class="astrolabe-orbits"
        [class.open]="isOpen()"
        aria-label="Story navigation"
      >
        <img class="orbital-svg" src="/astrolabe/orbit-grid.svg" alt="" />

        <!-- INNER CIRCLE: TIMELINE MILESTONES -->
        <div class="orbit-group orbit-group--timeline" role="group" aria-label="Timeline">
          @for (milestone of timelineMilestones; track milestone.id) {
            <button
              class="orbit-item timeline-item"
              type="button"
              [class.active]="milestone.id === activeMilestoneId()"
              (click)="onTimelineClick(milestone.targetIndex)"
              [tabindex]="isOpen() ? 0 : -1"
              [attr.aria-current]="milestone.id === activeMilestoneId() ? 'step' : null"
              [attr.aria-label]="'Lịch trình: ' + milestone.label + ' ' + milestone.time"
            >
              <span class="timeline-pill">
                <span class="time-badge">{{ milestone.time }}</span>
                <span class="time-label">{{ milestone.label }}</span>
              </span>
            </button>
          }
        </div>

        <!-- BIGGER OUTER CIRCLE: SECTIONS -->
        <div class="orbit-group orbit-group--sections" role="group" aria-label="Chapters">
          @for (sec of sections(); track sec.id; let i = $index) {
            <button
              class="orbit-item section-item"
              type="button"
              [class.active]="i === currentIndex()"
              (click)="onSectionClick(i)"
              [tabindex]="isOpen() ? 0 : -1"
              [attr.aria-current]="i === currentIndex() ? 'page' : null"
              [attr.aria-label]="'Chương ' + sec.number + ': ' + sec.label"
            >
              <span class="section-pill">
                <span class="section-label">{{ sec.label }}</span>
              </span>
            </button>
          }
        </div>
      </nav>
    </div>
  `,
})
export class ChapterBreadcrumb {
  sections = input.required<ChapterSection[]>();
  currentIndex = input(0);
  scrollProgress = input(0);
  navigate = output<number>();

  isOpen = signal(false);
  private readonly triggerButton =
    viewChild.required<ElementRef<HTMLButtonElement>>('triggerButton');
  private elementRef = inject(ElementRef);
  private destroyRef = inject(DestroyRef);

  /** 4 Timeline milestones */
  readonly timelineMilestones: TimelineMilestone[] = [
    { id: 'ruoc-dau', time: '7g', label: 'Rước dâu', targetIndex: 0, pageMin: 1, pageMax: 2 },
    { id: 'gia-tien', time: '10g', label: 'Lễ gia tiên', targetIndex: 2, pageMin: 3, pageMax: 4 },
    { id: 'le-vow', time: '4g', label: 'Lễ Vow', targetIndex: 4, pageMin: 5, pageMax: 5 },
    { id: 'le-cuoi', time: '6g', label: 'Lễ cưới', targetIndex: 5, pageMin: 6, pageMax: 7 },
  ];

  readonly currentSection = computed(() => {
    const list = this.sections();
    const idx = this.currentIndex();
    return list[idx] ?? list[0];
  });

  readonly activePageNumber = computed(() => {
    return this.currentSection()?.number ?? this.currentIndex() + 1;
  });

  /** Active milestone based on current section */
  readonly activeMilestoneId = computed(() => {
    const page = this.activePageNumber();
    const found = this.timelineMilestones.find((m) => page >= m.pageMin && page <= m.pageMax);
    return found?.id ?? 'ruoc-dau';
  });

  /** Sky stage derived from current page */
  readonly skyStage = computed<'morning' | 'noon' | 'afternoon' | 'moon'>(() => {
    const num = this.activePageNumber();
    if (num <= 2) return 'morning';
    if (num <= 4) return 'noon';
    if (num === 5) return 'afternoon';
    return 'moon';
  });

  constructor() {
    afterNextRender(() => {
      this.destroyRef.onDestroy(() => {
        document.removeEventListener('click', this.closeOnOutsideClick);
        document.removeEventListener('keydown', this.handleKeyDown);
      });
      document.addEventListener('click', this.closeOnOutsideClick);
      document.addEventListener('keydown', this.handleKeyDown);
    });
  }

  private closeOnOutsideClick = (e: MouseEvent): void => {
    if (this.isOpen()) {
      const host = this.elementRef.nativeElement;
      if (!host.contains(e.target as Node)) {
        this.isOpen.set(false);
      }
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isOpen()) {
      this.isOpen.set(false);
      requestAnimationFrame(() => this.triggerButton().nativeElement.focus());
    }
  };

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen.update((v) => !v);
  }

  onTimelineClick(targetIndex: number): void {
    this.navigate.emit(targetIndex);
    this.isOpen.set(false);
  }

  onSectionClick(index: number): void {
    this.navigate.emit(index);
    this.isOpen.set(false);
  }
}
