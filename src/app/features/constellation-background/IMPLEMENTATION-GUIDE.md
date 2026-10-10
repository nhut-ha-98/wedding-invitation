# Constellation Background: Implementation Guide

This guide explains how the background works and how to change it safely.

## Purpose

`ConstellationBackground` renders a fixed, decorative SVG sky behind the scrollable wedding story. The SVG contains a couple logo made from star points and connecting lines. As the reader scrolls, stars appear and lines draw in sequence. The background fades with the book's open and closing states.

The component is mounted once by `main-layout.html`. It is decorative (`pointer-events: none`) and should not contain interactive content.

## Files

- `constellation-background.ts`: Angular component, scroll progress handling, GSAP animations and book-state fade.
- `constellation-background.html`: sky layers and SVG groups for stars, lines and effects.
- `constellation-background.css`: fixed viewport framing, colors, SVG appearance and connected-logo styles.
- `star-data.ts`: star coordinates, line pairs and scroll trigger values.
- `README.md`: short feature overview.

## Rendering and scroll flow

1. Angular renders the sky layers and SVG from the arrays in `star-data.ts`.
2. After the first render, `init()` maps each star and line in the SVG to its data ID.
3. If reduced motion is enabled, `renderStatic()` shows a static night sky and completed logo, then returns without creating ScrollTrigger.
4. Otherwise, ScrollTrigger reports document scroll progress from `0` to `1`. Updates are coalesced with `requestAnimationFrame`.
5. Scroll progress cross-fades the afternoon and night layers, reveals stars at each star's `trigger`, and draws or retracts each line at its `trigger`.
6. At `LOGO_REVEAL_TRIGGER`, the connected logo receives its completion pulse and ongoing highlight effect.

Star and line visibility is threshold-based. Each transition uses a short GSAP tween; the line tween animates `strokeDashoffset` from `1` to `0` (or back to `1`). A tween may still be in progress briefly after the reader stops scrolling.

## Editing the constellation

Edit `star-data.ts` to change the illustration or its scroll sequence:

- Star `x` and `y` values use the SVG viewBox coordinate system (`1000 × 1600`).
- Each line pair references two star IDs. Both IDs must exist in the star data.
- Star and line `trigger` values are normalized scroll progress values from `0` to `1`.
- `buildLines()` distributes line triggers between the supplied start and end values.
- `LOGO_REVEAL_TRIGGER` controls when the complete-logo effect begins.

Keep the order of the data arrays aligned with the corresponding SVG `@for` output. The component maps rendered SVG children to the data arrays by index.

## Editing the artwork and appearance

The SVG in `constellation-background.html` uses `viewBox="0 0 1000 1600"` and `preserveAspectRatio="xMidYMid meet"`. Keep star and line coordinates in that viewBox. Its SVG groups have template references used by the component; preserve `#afternoonLayer`, `#nightLayer`, `#logoStarGroup`, `#logoLineGroup` and `#logoFxGroup` when editing the template.

Change layer colors and star/line appearance in `constellation-background.css`. The current implementation uses cool blue/cyan colors in its SVG and CSS. Some comments and the README describe a gold-foil look, so update those descriptions if the palette changes.

## Motion and lifecycle

- GSAP and ScrollTrigger are registered in the component file.
- `initClosingFade()` observes `BookStateService.state()` and fades the component host for closed, open and closing states.
- `DestroyRef` kills the ScrollTrigger and highlight timeline when the component is destroyed.
- `prefers-reduced-motion` is checked during initialization. Static mode does not run scroll-driven effects.
- Keep motion subtle and short. The current completion ring lasts `1.2s`, so it exceeds the project guideline of animations no longer than one second.

## Accessibility and performance

The SVG is decorative and should remain hidden from assistive technology with `aria-hidden="true"`. Keep the host non-interactive. Avoid adding large raster assets or layout-changing animation. The component creates one ScrollTrigger and updates SVG/CSS properties from scroll progress.

## Known implementation details to keep in mind

- `start` is `0` and `end` is the document's total scrollable distance, so progress represents the whole document.
- The sky gradient layers are CSS gradients, not images.
- The code and data use the name `CONSTELLATION_*` for compatibility, while the component currently renders only `LOGO_STARS` and `LOGO_LINES`.
- The reduced-motion static scene shows the night layer and a dimmed, completed constellation; it does not animate the logo reveal.
- The `initClosingFade()` GSAP effect is initialized in the constructor and is not explicitly killed in `onDestroy`.
