import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PapercutVariant = 'dandelion' | 'branch' | 'blossom';

@Component({
  selector: 'app-papercut-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="torn-paper papercut">
      <div class="torn-paper__sheet papercut__sheet">
        @switch (variant()) {
          @case ('branch') {
            <svg
              class="papercut__motif"
              viewBox="0 0 200 160"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <path class="motif-stem" d="M34 155 C 46 128, 50 96, 58 52" />
              <path
                class="motif-leaf"
                d="M38 122 C 18 116 10 98 19 88 C 28 78 46 84 50 98 C 41 103 34 111 38 122 Z"
              />
              <path
                class="motif-leaf"
                d="M54 100 C 72 88 84 92 84 104 C 84 117 68 124 58 116 C 61 108 57 102 54 100 Z"
              />
              <path
                class="motif-leaf"
                d="M52 68 C 68 60 80 62 81 72 C 82 84 68 90 59 84 C 62 77 58 72 52 68 Z"
              />
              <circle class="motif-bud" cx="58" cy="40" r="4" />
              <circle class="motif-bud" cx="63" cy="28" r="3" />
            </svg>
          }
          @case ('blossom') {
            <svg
              class="papercut__motif"
              viewBox="0 0 200 160"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <path class="motif-stem" d="M100 155 C 100 130 103 105 100 78" />
              <path
                class="motif-leaf"
                d="M100 132 C 78 128 70 112 78 102 C 86 92 100 96 105 110 C 98 116 95 124 100 132 Z"
              />
              <path
                class="motif-leaf"
                d="M104 108 C 126 102 134 88 126 78 C 118 68 104 74 99 86 C 106 92 109 100 104 108 Z"
              />
              @for (petal of petals; track petal) {
                <ellipse
                  class="motif-petal"
                  cx="100"
                  cy="34"
                  rx="16"
                  ry="26"
                  [attr.transform]="'rotate(' + petal + ' 100 70)'"
                />
              }
              <circle class="motif-gold" cx="100" cy="70" r="4" />
            </svg>
          }
          @default {
            <svg
              class="papercut__motif"
              viewBox="0 0 200 160"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <path class="motif-stem" d="M102 155 C 100 122 98 94 98 62" />
              <circle class="motif-seed" cx="98" cy="42" r="20" />
              <circle class="motif-seed" cx="98" cy="42" r="10" opacity="0.55" />
              <path
                class="motif-fluff"
                d="M98 22 L98 14 M78 42 L72 42 M118 42 L124 42 M77 24 L71 18 M119 60 L125 65 M77 60 L71 65 M119 24 L125 18 M82 29 L76 24 M114 55 L120 59"
              />
              <path
                class="motif-fluff"
                d="M150 116 L147 106 M141 110 L133 113 M143 100 L139 93 M153 104 L161 100"
              />
              <path class="motif-fluff" d="M42 96 L45 87 M50 90 L52 82 M48 101 L58 99" />
            </svg>
          }
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .papercut {
      width: 100%;
      height: 100%;
      padding: var(--tear-rim, 5px);
    }

    .papercut__sheet {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: linear-gradient(135deg, var(--color-parchment) 0%, #efe0c8 100%);
      animation: papercut-sheet-in 0.6s ease-out both;
    }

    .papercut__motif {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      color: #2c1810;
      animation: papercut-motif-in 0.5s ease-out 0.15s both;
    }

    .motif-stem,
    .motif-fluff {
      fill: none;
      stroke: var(--paper-ink);
      stroke-width: 1.6;
      opacity: 0.7;
    }

    .motif-leaf {
      fill: none;
      stroke: var(--paper-ink);
      stroke-width: 1.4;
      opacity: 0.65;
    }

    .motif-bud {
      fill: none;
      stroke: var(--paper-ink);
      stroke-width: 1.4;
      opacity: 0.75;
    }

    .motif-seed {
      fill: none;
      stroke: var(--paper-ink);
      stroke-width: 1.2;
      opacity: 0.6;
    }

    .motif-petal {
      fill: none;
      stroke: var(--paper-ink);
      stroke-width: 1.3;
      opacity: 0.68;
    }

    .motif-gold {
      fill: var(--color-gold);
      opacity: 0.85;
    }

    @keyframes papercut-sheet-in {
      from {
        transform: translateY(3px);
      }
      to {
        transform: translateY(0);
      }
    }

    @keyframes papercut-motif-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `,
})
export class PapercutArt {
  variant = input<PapercutVariant>('dandelion');

  readonly petals = [-45, -18, 9, 36, 63];
}
