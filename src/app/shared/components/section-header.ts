import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Shared big section heading.
 *
 * Renders gold divider lines around an ornament image, a title, and an
 * optional italic subtitle. Used by timeline, chapter-one, proposal and
 * he-and-she sections so all big headings share one source of truth.
 *
 * Gap between header and section content can be overridden from outside
 * with `--section-header-gap` (default 4rem, 2.5rem on mobile).
 */
@Component({
  selector: 'app-section-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="section-divider">
      <img
        class="section-ornament"
        src="/ornament.svg"
        width="22"
        height="22"
        alt=""
        aria-hidden="true"
      />
    </div>
    <h2 class="section-title">{{ title() }}</h2>
    @if (subtitle()) {
      <p class="section-subtitle">{{ subtitle() }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
      text-align: center;
      margin-bottom: var(--section-header-gap, 4rem);
    }

    .section-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .section-divider::before,
    .section-divider::after {
      content: '';
      width: 40px;
      height: 1px;
      background: linear-gradient(to right, transparent, #d4af37);
    }

    .section-divider::after {
      background: linear-gradient(to left, transparent, #d4af37);
    }

    .section-ornament {
      margin: 0 0.75rem;
      display: block;
    }

    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      color: #2c1810;
      margin: 0 0 0.35rem;
      letter-spacing: 1px;
    }

    .section-subtitle {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.05rem;
      color: #8b7355;
      font-style: italic;
      margin: 0;
    }

    @media (max-width: 640px) {
      :host {
        margin-bottom: var(--section-header-gap-mobile, 2.5rem);
      }
    }
  `,
})
export class SectionHeader {
  title = input.required<string>();
  subtitle = input('');
}
