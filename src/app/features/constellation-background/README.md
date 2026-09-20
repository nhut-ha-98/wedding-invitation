# Constellation Background

A scroll-driven, papercut-style star sky that sits behind the book's inner
sections (`z-index: 0`, fixed, `pointer-events: none`). A single couple logo
silhouette populates the page:

- **Couple Logo** in the upper sky — groom & bride silhouettes with a calligraphy
  monogram, wrapped in a circular frame. Unified warm gold threads & stars.

The silhouette draws itself fully, then awakens into a radiant golden glow.

## Files

| File                            | Purpose                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `star-data.ts`                  | Data model: logo coordinates (0..1000 x 0..900), triggers & connection pairs |
| `constellation-background.ts`   | Component: ScrollTrigger wiring, threshold tweens, comet sparks, logo reveal |
| `constellation-background.html` | SVG templates with papercut gold-foil logo art, stars, lines & comet sparks  |
| `constellation-background.css`  | Host positioning & responsive framing zones                                  |

Rendered by `main-layout.html` as `<app-constellation-background />`.

## Responsive Framing & Coordinate Space

A single SVG (`viewBox="0 0 1000 1600"`) with `preserveAspectRatio="xMidYMid meet"`
is centered in the viewport. The logo lives in the upper region (center `500, 500`),
leaving an open celestial clearing below for the final Thank You scene. No stars,
threads, or artwork are ever clipped on mobile or desktop.

## Line Connection & No Half-Drawn Lines

Lines connect via discrete GSAP threshold tweens:

- When scroll reaches a line's `trigger` point, a GSAP tween draws the line completely (`strokeDashoffset` 1 → 0 over 0.38s).
- If scrolling stops at any point, active tweens complete cleanly. Lines are **never left half-drawn**.
- Scrolling backwards past the trigger threshold cleanly retracts the line (0 → 1).

## Fancy Effects

1. **Golden Comet Spark Trail**: A brilliant golden spark leads each connecting thread from star A to star B as it draws. When reaching star B, star B pulses with a bright flash.
2. **Completion Pulse**: When all threads in the logo connect, a radial golden expansion ring and rotating glint flash from the logo center.
3. **Golden Logo Reveal**:
   - The couple silhouette — groom, bride & calligraphy sweeps — draws in as a honey-gold star constellation inside a circular frame.
   - Upon completion the whole logo ignites in warm gold neon, resting as a foil watermark in the sky.

## Accessibility & Performance

- `prefers-reduced-motion` → `renderStatic()`: static sky with stars and lines drawn, logo gently visible, no animations.
- `aria-hidden="true"` on all background containers.
- Purely CSS/SVG transform and opacity manipulations driven by single ScrollTrigger listener. All animations ≤ ~1s.
