# Constellation Background

A scroll-driven, papercut-style star sky that sits behind the book's inner
sections (`z-index: 0`, fixed, `pointer-events: none`). Two constellations
populate the page:

- **Aquarius** in the top-right framing zone — bride's sky, celestial blue threads & stars.
- **Cancer** in the bottom-left framing zone — groom's sky, gold threads & stars.

They are deliberately **never connected**: each is its own complete story.

## Files

| File | Purpose |
|---|---|
| `star-data.ts` | Data model: local coordinates (500x500), triggers & connection pairs |
| `constellation-background.ts` | Component: ScrollTrigger wiring, threshold tweens, comet sparks, zodiac reveals |
| `constellation-background.html` | SVG templates with papercut gold-foil zodiac art, stars, lines & comet sparks |
| `constellation-background.css` | Host positioning & responsive framing zones |

Rendered by `main-layout.html` as `<app-constellation-background />`.

## Responsive Framing & Coordinate Space

Instead of a single monolithic SVG with `preserveAspectRatio="slice"` (which clobbered content on narrow mobile or wide desktop screens), two independent 500x500 viewports with `preserveAspectRatio="xMidYMid meet"` are positioned in designated framing zones:

- `.frame--aquarius`: pinned to the upper-right viewport zone (`width: min(88vw, 500px)`).
- `.frame--cancer`: pinned to the lower-left viewport zone (`width: min(88vw, 500px)`).

No stars, threads, or artwork are ever clipped on mobile or desktop.

## Line Connection & No Half-Drawn Lines

Lines connect via discrete GSAP threshold tweens:

- When scroll reaches a line's `trigger` point, a GSAP tween draws the line completely (`strokeDashoffset` 1 → 0 over 0.38s).
- If scrolling stops at any point, active tweens complete cleanly. Lines are **never left half-drawn**.
- Scrolling backwards past the trigger threshold cleanly retracts the line (0 → 1).

## Fancy Effects

1. **Golden Comet Spark Trail**: A brilliant golden spark leads each connecting thread from star A to star B as it draws. When reaching star B, star B pulses with a bright flash.
2. **Completion Pulse**: When all threads in a constellation connect, a radial golden expansion ring and rotating glint flash from the constellation center.
3. **Gold-Foil Papercut Zodiac Reveal**:
   - **Aquarius**: Water bearer urn silhouette pouring graceful cascades of celestial starlight waves, astrological glyph `♒`, and serif inscription.
   - **Cancer**: Celestial crab silhouette with Art Nouveau carapace, engraved crescent moon, claws, walking legs, astrological glyph `♋`, and serif inscription.
   - Both figures smoothly fade & scale in (`opacity: 0.85`, `scale: 1`) upon completion, resting as warm gold-foil watermarks in the sky.

## Accessibility & Performance

- `prefers-reduced-motion` → `renderStatic()`: static sky with stars and lines drawn, zodiac art gently visible, no animations.
- `aria-hidden="true"` on all background containers.
- Purely CSS/SVG transform and opacity manipulations driven by single ScrollTrigger listener. All animations ≤ ~1s.