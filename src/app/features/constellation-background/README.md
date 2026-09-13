# Constellation Background

A scroll-driven, papercut-style star sky that sits behind the book's inner
sections (`z-index: 0`, fixed, `pointer-events: none`). Two constellations
populate the page — **Aquarius** in the top half, **Cancer** in the bottom
half — as a quiet metaphor for the two people getting married (bride /
groom). They are deliberately **never connected**: each is its own complete
story.

## Files

| File | Purpose |
|---|---|
| `star-data.ts` | Data model: star/line positions & scroll windows |
| `constellation-background.ts` | Component: ScrollTrigger wiring, shine, completion pulses |
| `constellation-background.html` | SVG template (stars, threads, glow effects) |
| `constellation-background.css` | Host positioning (fixed, full-viewport) |

Rendered by `main-layout.html` as `<app-constellation-background />`.

## Concept

- **Aquarius (top)** — water-bearer dipper (β Sadalsuud → α Sadalmelik → γ
  Sadachbia → δ Skat → ε Albali) with a pouring water stream on the right.
- **Cancer (bottom)** — crab sickle (γ Asellus Borealis → δ Asellus
  Australis → β Altarf), antennae, legs, and the M44 "Beehive" flake cluster.
- Colors follow the bride/groom split: **blue** stars & threads for Aquarius,
  **yellow/gold** for Cancer. No line ever crosses between the two groups.

## Coordinate space

Everything lives in a fixed logical space `0..1000 × 0..1600` rendered with
`preserveAspectRatio="xMidYMid slice"` — coordinates stay stable across
viewport sizes with no resize re-measuring.

## Scroll behaviour (single source of truth)

One `ScrollTrigger` (scrub 0.6) tracks page scroll → `progress` 0..1.

- **Stars** fade in via `smoothstep` between their `start`/`end` window in
  `star-data.ts`: Aquarius appears ~0.22→0.78, Cancer ~0.50→0.98. Nothing is
  lit at page top.
- **Threads** draw progressively through `stroke-dasharray: 1` +
  `stroke-dashoffset` on paths with `pathLength="1"` — the dash truly clips
  the stroke, so lines are hidden at the top and fully connected only at the
  very bottom of the page.
- Windows are staged so Aquarius connects during the first half of the scroll
  and Cancer during the second.

## Effects

- **Shine on connect** — each star flashes when one of its threads begins to
  draw, and again when it reaches full brightness. The flash "dimmed → shined"
  fades in then out (width scales with `STAR_SCALE`).
- **Completion pulse** — when a group's last thread finishes, a matching
  coloured ring expands and a glint sparkles at the group centroid
  (`AQUARIUS_CENTRE` / `CANCER_CENTRE`).

## Tuning knobs

All in `star-data.ts` / `constellation-background.ts`:

- `STAR_SCALE = 3` — uniform star size (every star is the same "papercut
  punch"); `HALO_R`/`FLASH_R` derive from it.
- Line & star colours in `constellation-background.html` `<style>`.
- Scroll windows: the `spreadStars(...)` / `spreadLines(...)` arguments.
- Stars are **static** by design — no drift, no breathing halo (only the
  static `halo` glow).

## Accessibility & performance

- `prefers-reduced-motion` → `renderStatic()`: one quiet, already-drawn, dimmed
  sky (no shine, no pulses, no scroll animation).
- `aria-hidden` on the SVG; purely decorative.
- Transform/opacity only (GSAP-scrubbed opacity + stroke offset), no layout
  work; single scroll listener. All animations ≤ ~1s.