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
      }

      /* Progress Ring */
      .progress-ring {
        position: absolute;
        inset: -4px;
        width: calc(100% + 8px);
        height: calc(100% + 8px);
        transform: rotate(-90deg);
        pointer-events: none;
      }

      .progress-ring-track {
        fill: none;
        stroke: rgba(212, 175, 55, 0.18);
        stroke-width: 2.5;
      }

      .progress-ring-fill {
        fill: none;
        stroke: #d4af37;
        stroke-width: 2.5;
        stroke-linecap: round;
        transition:
          stroke-dashoffset 0.25s ease,
          stroke 0.4s ease;
      }

      .stage--noon .progress-ring-fill {
        stroke: #f59e0b;
      }

      .stage--afternoon .progress-ring-fill {
        stroke: #f97316;
      }

      .stage--moon .progress-ring-fill {
        stroke: #c084fc;
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
        font-family: 'Playfair Display', serif;
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

      /* ============================================================
         ASTROLABE ORBITS (CONCENTRIC CIRCULAR LAYOUT)
         Inner circle = Timeline (4 milestones)
         Outer bigger circle = Sections (7 chapters)
         ============================================================ */
      .astrolabe-orbits {
        position: absolute;
        top: 28px;
        left: 28px;
        width: 0;
        height: 0;
        overflow: visible;
        pointer-events: none;
      }

      @media (max-width: 640px) {
        .astrolabe-orbits {
          top: 24px;
          left: 24px;
        }
      }

      /* Orbital Guide Arcs */
      .orbital-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 380px;
        height: 380px;
        overflow: visible;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.35s ease;
      }

      .astrolabe-orbits.open .orbital-svg {
        opacity: 1;
      }

      .orbit-path-inner {
        fill: none;
        stroke: rgba(255, 213, 79, 0.3);
        stroke-width: 1.5;
        stroke-dasharray: 4, 4;
      }

      .orbit-path-outer {
        fill: none;
        stroke: rgba(212, 175, 55, 0.25);
        stroke-width: 1.5;
        stroke-dasharray: 4, 4;
      }

      /* ============================================================
         CIRCULAR TIMELINE ITEMS (INNER ORBIT)
         ============================================================ */
      .orbit-item {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        outline: none;
        pointer-events: none;
        transition:
          transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
          opacity 0.25s ease,
          filter 0.25s ease;
        white-space: nowrap;
        user-select: none;
        -webkit-user-select: none;
      }

      .astrolabe-orbits.open .orbit-item {
        pointer-events: auto;
      }

      .timeline-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px 4px 6px;
        background: rgba(26, 12, 7, 0.92);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1.5px solid rgba(255, 213, 79, 0.45);
        border-radius: 20px;
        box-shadow:
          0 4px 14px rgba(0, 0, 0, 0.5),
          0 0 8px rgba(255, 213, 79, 0.15);
        transition:
          transform 0.2s ease,
          border-color 0.3s ease,
          background 0.3s ease,
          box-shadow 0.3s ease;
      }

      .orbit-item:hover .timeline-pill {
        transform: scale(1.08);
        border-color: #ffd54f;
        box-shadow:
          0 6px 18px rgba(0, 0, 0, 0.6),
          0 0 14px rgba(255, 213, 79, 0.35);
      }

      .orbit-item.active .timeline-pill {
        background: rgba(46, 22, 10, 0.95);
        border-color: #ffd54f;
        box-shadow:
          0 6px 18px rgba(0, 0, 0, 0.6),
          0 0 16px rgba(255, 213, 79, 0.45);
      }

      .stage--moon .orbit-item.active .timeline-pill {
        background: rgba(24, 8, 42, 0.95);
        border-color: #c084fc;
        box-shadow:
          0 6px 18px rgba(0, 0, 0, 0.6),
          0 0 16px rgba(192, 132, 252, 0.45);
      }

      .time-badge {
        font-family: 'Playfair Display', serif;
        font-size: 0.75rem;
        font-weight: 700;
        color: #1e100a;
        background: #ffd54f;
        border-radius: 12px;
        padding: 2px 7px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      }

      .stage--moon .time-badge {
        background: #c084fc;
        color: #110520;
      }

      .time-label {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 0.875rem;
        font-weight: 600;
        color: #fff8e7;
        letter-spacing: 0.02em;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
      }

      .orbit-item.active .time-label {
        color: #ffd54f;
        font-weight: 700;
      }

      .stage--moon .orbit-item.active .time-label {
        color: #f5f3ff;
      }

      /* ============================================================
         CIRCULAR SECTION ITEMS (BIGGER OUTER ORBIT)
         ============================================================ */
      .section-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px 4px 5px;
        background: rgba(20, 10, 6, 0.9);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(212, 175, 55, 0.4);
        border-radius: 18px;
        box-shadow:
          0 4px 14px rgba(0, 0, 0, 0.5),
          0 0 8px rgba(212, 175, 55, 0.12);
        transition:
          transform 0.2s ease,
          border-color 0.3s ease,
          background 0.3s ease,
          box-shadow 0.3s ease;
      }

      .orbit-item:hover .section-pill {
        transform: scale(1.08);
        border-color: #d4af37;
        box-shadow:
          0 6px 18px rgba(0, 0, 0, 0.6),
          0 0 14px rgba(212, 175, 55, 0.3);
      }

      .orbit-item.active .section-pill {
        background: rgba(40, 18, 8, 0.95);
        border-color: #d4af37;
        box-shadow:
          0 6px 18px rgba(0, 0, 0, 0.6),
          0 0 16px rgba(212, 175, 55, 0.35);
      }

      .stage--moon .orbit-item.active .section-pill {
        background: rgba(22, 7, 38, 0.95);
        border-color: #c084fc;
        box-shadow:
          0 6px 18px rgba(0, 0, 0, 0.6),
          0 0 16px rgba(192, 132, 252, 0.35);
      }

      .section-num {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Playfair Display', serif;
        font-size: 0.6875rem;
        font-weight: 700;
        background: rgba(212, 175, 55, 0.2);
        border: 1px solid rgba(212, 175, 55, 0.5);
        color: #f7e8a4;
        flex-shrink: 0;
      }

      .orbit-item.active .section-num {
        background: #d4af37;
        border-color: #d4af37;
        color: #1e100a;
      }

      .section-label {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 0.875rem;
        font-weight: 600;
        color: #f5e6d3;
        letter-spacing: 0.02em;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
      }

      .orbit-item.active .section-label {
        color: #ffd54f;
        font-weight: 700;
      }

      .stage--moon .orbit-item.active .section-label {
        color: #f5f3ff;
      }

      @media (max-width: 640px) {
        .timeline-pill,
        .section-pill {
          padding: 3px 8px 3px 5px;
          gap: 5px;
        }

        .time-badge {
          font-size: 0.6875rem;
          padding: 1px 5px;
        }

        .time-label,
        .section-label {
          font-size: 0.8125rem;
        }

        .section-num {
          width: 18px;
          height: 18px;
          font-size: 0.625rem;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .orbit-item {
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
    <div class="astrolabe-wrapper" [class]="'stage--' + skyStage()">
      <!-- Main Celestial Circle Button -->
      <button
        class="breadcrumb-btn"
        (click)="toggle($event)"
        [attr.aria-expanded]="isOpen()"
        aria-label="Xem lịch trình và các chương"
        type="button"
      >
        <!-- Simple Vector Artwork inside Circle -->
        @switch (skyStage()) {
          @case ('morning') {
            <svg viewBox="0 0 100 100" class="celestial-art" aria-hidden="true">
              <defs>
                <radialGradient id="morningSunGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#fffbeb" />
                  <stop offset="60%" stop-color="#f59e0b" />
                  <stop offset="100%" stop-color="#b45309" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="44" fill="#231309" />
              <!-- Morning Sun Core -->
              <circle cx="50" cy="50" r="16" fill="url(#morningSunGlow)" />
              <circle
                cx="50"
                cy="50"
                r="17"
                fill="none"
                stroke="#fef3c7"
                stroke-width="1.2"
                opacity="0.75"
              />
              <!-- 8 Clean Rays -->
              <line
                x1="50"
                y1="18"
                x2="50"
                y2="28"
                stroke="#fde68a"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <line
                x1="50"
                y1="72"
                x2="50"
                y2="82"
                stroke="#fde68a"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <line
                x1="18"
                y1="50"
                x2="28"
                y2="50"
                stroke="#fde68a"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <line
                x1="72"
                y1="50"
                x2="82"
                y2="50"
                stroke="#fde68a"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <line
                x1="28"
                y1="28"
                x2="35"
                y2="35"
                stroke="#f59e0b"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="72"
                y1="28"
                x2="65"
                y2="35"
                stroke="#f59e0b"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="28"
                y1="72"
                x2="35"
                y2="65"
                stroke="#f59e0b"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="72"
                y1="72"
                x2="65"
                y2="65"
                stroke="#f59e0b"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          }
          @case ('noon') {
            <svg viewBox="0 0 100 100" class="celestial-art" aria-hidden="true">
              <defs>
                <radialGradient id="noonSunGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#ffffff" />
                  <stop offset="45%" stop-color="#fef08a" />
                  <stop offset="85%" stop-color="#eab308" />
                  <stop offset="100%" stop-color="#ca8a04" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="44" fill="#2d1704" />
              <!-- Geometric Coronal Points -->
              <g fill="#facc15">
                <polygon points="50,14 47,26 53,26" />
                <polygon points="68,19 62,29 67,32" />
                <polygon points="81,32 71,38 74,43" />
                <polygon points="86,50 74,47 74,53" />
                <polygon points="81,68 74,57 71,62" />
                <polygon points="68,81 67,68 62,71" />
                <polygon points="50,86 53,74 47,74" />
                <polygon points="32,81 38,71 33,68" />
                <polygon points="19,68 29,62 26,57" />
                <polygon points="14,50 26,53 26,47" />
                <polygon points="19,32 26,43 29,38" />
                <polygon points="32,19 33,32 38,29" />
              </g>
              <circle cx="50" cy="50" r="18" fill="url(#noonSunGlow)" />
              <circle cx="50" cy="50" r="13" fill="#ffffff" opacity="0.6" />
            </svg>
          }
          @case ('afternoon') {
            <svg viewBox="0 0 100 100" class="celestial-art" aria-hidden="true">
              <defs>
                <linearGradient id="afternoonSkyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b112c" />
                  <stop offset="100%" stop-color="#190615" />
                </linearGradient>
                <radialGradient id="sunsetDisc" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#fed7aa" />
                  <stop offset="60%" stop-color="#f97316" />
                  <stop offset="100%" stop-color="#c2410c" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="44" fill="url(#afternoonSkyGrad)" />
              <!-- Upward twilight rays -->
              <line
                x1="50"
                y1="20"
                x2="50"
                y2="34"
                stroke="#fdba74"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <line
                x1="32"
                y1="26"
                x2="39"
                y2="38"
                stroke="#fb923c"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="68"
                y1="26"
                x2="61"
                y2="38"
                stroke="#fb923c"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="20"
                y1="42"
                x2="32"
                y2="47"
                stroke="#f97316"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="80"
                y1="42"
                x2="68"
                y2="47"
                stroke="#f97316"
                stroke-width="2"
                stroke-linecap="round"
              />
              <!-- Dipping sun -->
              <circle cx="50" cy="50" r="17" fill="url(#sunsetDisc)" />
              <!-- Horizon contours -->
              <path
                d="M18,54 Q34,50 50,54 T82,54"
                fill="none"
                stroke="#ea580c"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <path
                d="M24,62 Q37,59 50,62 T76,62"
                fill="none"
                stroke="#c2410c"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M32,70 Q41,68 50,70 T68,70"
                fill="none"
                stroke="#9a3412"
                stroke-width="1.5"
                stroke-linecap="round"
                opacity="0.8"
              />
            </svg>
          }
          @case ('moon') {
            <svg viewBox="0 0 100 100" class="celestial-art" aria-hidden="true">
              <defs>
                <radialGradient id="nightSkyCircle" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stop-color="#241040" />
                  <stop offset="100%" stop-color="#0c0418" />
                </radialGradient>
                <linearGradient id="crescentGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#ffffff" />
                  <stop offset="50%" stop-color="#fef08a" />
                  <stop offset="100%" stop-color="#eab308" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="44" fill="url(#nightSkyCircle)" />
              <!-- Crisp Crescent Moon -->
              <path
                d="M52,22 C34,22 22,35 22,50 C22,65 34,78 52,78 C42,70 37,59 37,50 C37,41 42,30 52,22 Z"
                fill="url(#crescentGold)"
              />
              <!-- Diamond Star -->
              <path
                d="M68,36 Q68,43 64,45 Q68,47 68,54 Q68,47 72,45 Q68,43 68,36 Z"
                fill="#e9d5ff"
              />
              <circle cx="68" cy="45" r="1.5" fill="#ffffff" />
              <!-- Subtle sparkles -->
              <circle cx="60" cy="28" r="1.2" fill="#c084fc" opacity="0.9" />
              <circle cx="74" cy="62" r="1.2" fill="#fde047" opacity="0.8" />
              <circle cx="48" cy="68" r="1" fill="#e9d5ff" opacity="0.7" />
            </svg>
          }
        }

        <!-- Progress Ring around perimeter -->
        <svg class="progress-ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle class="progress-ring-track" cx="50" cy="50" r="46" />
          <circle
            class="progress-ring-fill"
            cx="50"
            cy="50"
            r="46"
            [attr.stroke-dasharray]="ringCircumference"
            [attr.stroke-dashoffset]="ringCircumference * (1 - scrollProgress())"
          />
        </svg>

        <!-- Corner jewel page-number badge -->
        <span class="page-corner-badge">{{ activePageNumber() }}</span>
      </button>

      <!-- ============================================================
           ASTROLABE RADIAL ORBITS
           Revealed ONLY on click for detail:
           1) Inner circular layout: Timeline (4 milestones)
           2) Outer bigger circular layout: Sections (7 chapters)
           ============================================================ -->
      <div class="astrolabe-orbits" [class.open]="isOpen()">
        <!-- Background Orbital Track Lines -->
        <svg class="orbital-svg" viewBox="0 0 380 380" aria-hidden="true">
          <!-- Inner Orbit Arc (Timeline) -->
          <path class="orbit-path-inner" d="M 115 0 A 115 115 0 0 1 0 115" />
          <!-- Outer Orbit Arc (Sections) -->
          <path class="orbit-path-outer" d="M 205 0 A 205 205 0 0 1 0 205" />
        </svg>

        <!-- INNER CIRCLE: TIMELINE MILESTONES -->
        @for (milestone of timelineMilestones; track milestone.id; let i = $index) {
          <div
            class="orbit-item timeline-item"
            [class.active]="milestone.id === activeMilestoneId()"
            [style.transform]="timelineStyles()[i].transform"
            [style.opacity]="timelineStyles()[i].opacity"
            [style.transition-delay]="timelineStyles()[i].transitionDelay"
            (click)="onTimelineClick(milestone.targetIndex)"
            (keydown.enter)="onTimelineClick(milestone.targetIndex)"
            tabindex="0"
            role="button"
            [attr.aria-label]="'Lịch trình: ' + milestone.label + ' ' + milestone.time"
          >
            <div class="timeline-pill">
              <span class="time-badge">{{ milestone.time }}</span>
              <span class="time-label">{{ milestone.label }}</span>
            </div>
          </div>
        }

        <!-- BIGGER OUTER CIRCLE: SECTIONS -->
        @for (sec of sections(); track sec.id; let i = $index) {
          <div
            class="orbit-item section-item"
            [class.active]="i === currentIndex()"
            [style.transform]="sectionStyles()[i].transform"
            [style.opacity]="sectionStyles()[i].opacity"
            [style.transition-delay]="sectionStyles()[i].transitionDelay"
            (click)="onSectionClick(i)"
            (keydown.enter)="onSectionClick(i)"
            tabindex="0"
            role="button"
            [attr.aria-label]="'Chương ' + sec.number + ': ' + sec.label"
          >
            <div class="section-pill">
              <span class="section-num">{{ sec.number }}</span>
              <span class="section-label">{{ sec.label }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ChapterBreadcrumb {
  sections = input.required<ChapterSection[]>();
  currentIndex = input(0);
  scrollProgress = input(0);
  navigate = output<number>();

  isOpen = signal(false);
  private elementRef = inject(ElementRef);
  private destroyRef = inject(DestroyRef);

  readonly ringCircumference = 2 * Math.PI * 46; // ~289.02

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

  /* -------------------------------------------------------------
     ORBIT 1: TIMELINE (INNER CIRCLE, RADIUS ~115px, 4 items)
     Spread: 12° to 78°
     ------------------------------------------------------------- */
  private readonly innerRadius = 115;
  private readonly innerAngles = [14, 34, 54, 76];

  readonly timelinePositions = computed(() => {
    return this.innerAngles.map((deg) => {
      const rad = (deg * Math.PI) / 180;
      return {
        x: Math.cos(rad) * this.innerRadius,
        y: Math.sin(rad) * this.innerRadius,
      };
    });
  });

  readonly timelineStyles = computed(() => {
    const positions = this.timelinePositions();
    const open = this.isOpen();

    return positions.map((pos, i) => {
      const delay = open ? `${i * 30}ms` : `${(positions.length - 1 - i) * 20}ms`;
      return {
        transform: open ? `translate(${pos.x}px, ${pos.y}px)` : 'translate(0px, 0px)',
        opacity: open ? 1 : 0,
        transitionDelay: delay,
      };
    });
  });

  /* -------------------------------------------------------------
     ORBIT 2: SECTIONS (BIGGER OUTER CIRCLE, RADIUS ~205px, 7 items)
     Spread: 8° to 82°
     ------------------------------------------------------------- */
  private readonly outerRadius = 205;
  private readonly outerAngles = [8, 20.3, 32.7, 45, 57.3, 69.7, 82, 90];

  readonly sectionPositions = computed(() => {
    return this.outerAngles.map((deg) => {
      const rad = (deg * Math.PI) / 180;
      return {
        x: Math.cos(rad) * this.outerRadius,
        y: Math.sin(rad) * this.outerRadius,
      };
    });
  });

  readonly sectionStyles = computed(() => {
    const positions = this.sectionPositions();
    const open = this.isOpen();

    return positions.map((pos, i) => {
      const delay = open ? `${(i + 2) * 25}ms` : `${(positions.length - 1 - i) * 15}ms`;
      return {
        transform: open ? `translate(${pos.x}px, ${pos.y}px)` : 'translate(0px, 0px)',
        opacity: open ? 1 : 0,
        transitionDelay: delay,
      };
    });
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
