# Starlight constellation background migration

## Goal

Replace the current upper-sky logo constellation with a full, scroll-revealed
couple-in-starlight illustration based on `wedding-starlight (5).svg` and
`wedding-starlight-demo.html`. Keep it a decorative, fixed background behind
the invitation story. Preserve the existing book lifecycle, GSAP integration,
and reduced-motion behavior.

## Context and decisions

### What exists now

- `ConstellationBackground` renders one fixed `1000 x 1600` SVG.
- `star-data.ts` defines a single `logo` set: 156-ish point stars and line
  pairs forming a compact ring-and-monogram silhouette.
- `constellation-background.ts` maps the rendered star and line DOM by array
  index, then uses one document-level `ScrollTrigger` and GSAP threshold
  tweens.
- The background changes from parchment to sunset to dark violet as the reader
  scrolls. It completes the logo at `LOGO_REVEAL_TRIGGER` and runs a perpetual
  highlight timeline.
- `main-layout.html` mounts the component once, inside the scroll stage.

### What the starlight reference contributes

- A detailed couple silhouette: orbit, sky branches, groom, bride, veil,
  dress, train, and ribbon.
- 67 logical edge groups and 206 star anchors/minors. Each edge consists of a
  narrow core and optional aura path; stars are attached to an edge and an
  `at` progress point.
- Optional galaxy dust and silk fills. The source SVG is 169 KB raw / about
  20 KB gzip, but contains 882 circles and 383 paths. It must be treated as a
  source asset, not inserted as a hidden full duplicate beside a data model.
- Its demo controller calculates reveal time from edge order and path length,
  and derives star reveal time from the owning edge.

### Chosen direction

Adopt the reference's semantic structure, not its demo page or its cool-blue,
night-sky visual language unchanged:

1. `star-data.ts` becomes the source of truth for logical parts, SVG paths,
   stars, and scroll sequencing.
2. The Angular template renders data with `@for`; no pasted 1,500-line SVG
   template and no runtime fetch of the source SVG.
3. Keep the full couple silhouette, orbit, and sparse sky stars. Omit the
   dense galaxy-dust field for the first migration. It competes with text,
   inflates DOM size, and is not necessary to recognize the starlight motif.
   Retain a small, data-defined dust/accent layer only if visual review shows
   the composition needs it.
4. Recolor to restrained warm starlight: ivory cores, antique-gold lines and
   halos, low-opacity plum/indigo night. Preserve contrast for foreground
   invitation pages; this is a watermark, not a hero illustration.
5. Use a finite completion accent. Do not restore the current infinite,
   multi-sequence highlight animation: it is visually busy, expensive across
   200+ stars, and violates the project rule that animations are at most one
   second.
6. Reveal by story chapter rather than every small scroll delta. The full
   illustration must complete by the ending section, then remain quietly
   visible until book close.

## Target data contract

Replace the single-purpose `ConstellationSet`, `ConstellationStar`, and
`ConstellationLine` model with immutable, typed starlight data.

```ts
type StarlightPart =
  | 'orbit'
  | 'sky'
  | 'groom'
  | 'bride'
  | 'veil'
  | 'dress'
  | 'train'
  | 'ribbon';

interface StarlightEdge {
  readonly id: string;
  readonly part: StarlightPart;
  readonly path: string;
  readonly detail?: boolean;
  readonly revealStart: number;
  readonly revealEnd: number;
}

interface StarlightStar {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly kind: 'anchor' | 'minor' | 'accent';
  readonly edgeId?: string;
  readonly edgeProgress?: number;
  readonly revealAt: number;
  readonly power: number;
  readonly twinkle: boolean;
}

interface StarlightDecoration {
  readonly id: string;
  readonly kind: 'silk' | 'dust';
  readonly part: StarlightPart;
  readonly path?: string;
  readonly x?: number;
  readonly y?: number;
  readonly r?: number;
  readonly revealAt: number;
}
```

Use `1280 x 1240`, the source artwork's native viewBox. Store source-derived
paths as `readonly` constants grouped by part. Generate stars from a compact
spec array. Export lookup helpers and validation helpers; do not expose
mutable arrays.

## Implementation plan

### 1. Establish an importable artwork dataset

Files: `src/app/features/constellation-background/star-data.ts`

- Replace `logoSpecs` and `logoLinePairs` with the starlight path and star
  records extracted from `wedding-starlight (5).svg`.
- Preserve source edge IDs where useful (`edge-groom-profile`,
  `edge-veil-lower`, etc.) so source comparison remains mechanical.
- Create part-level timing windows in narrative order:
  `orbit/sky` → `groom` → `bride/veil` → `dress/train` → `ribbon` → finish.
  Give every edge a normalized start/end; derive each attached star's
  `revealAt` from its edge window and `edgeProgress`.
- Mark only a small, deterministic subset of anchors for twinkling. Minor
  stars remain static after reveal.
- Retain limited silk paths only where they clarify the veil/dress silhouette.
  Do not import the dense galaxy circles in this version.
- Add a pure `validateStarlightData()` function used by tests. It must reject:
  duplicate IDs, unknown star edge references, progress outside `0..1`, and
  invalid/empty path data.
- Export `STARLIGHT_VIEWBOX`, `STARLIGHT_EDGES`, `STARLIGHT_STARS`,
  `STARLIGHT_DECORATIONS`, `STARLIGHT_PARTS`, and a single
  `STARLIGHT_COMPLETE_AT` constant. Remove misleading legacy aliases such as
  `CONSTELLATION_*` once all consumers are migrated.

### 2. Rebuild the SVG template around semantic data

Files: `src/app/features/constellation-background/constellation-background.html`

- Keep the three background layers and the decorative `aria-hidden="true"`
  SVG role.
- Change the SVG viewBox to `0 0 1280 1240`. Use an aspect-ratio-safe framing
  strategy that shows the entire artwork on mobile; tune a CSS custom property
  for scale/vertical placement rather than altering coordinate data.
- Add SVG defs for warm halo, parchment-gold silk, and restrained line aura.
- Render each edge as a keyed group containing an aura and core path, both
  sharing the same data path. Attach `data-edge-id` and template references or
  data attributes required by the component.
- Render data-derived decorations behind edges, then stars above edges.
- Render stars as reusable primitive markup: halo, rays, core, and a one-shot
  completion flare. Do not copy the demo's controls, `title`, `desc`, or
  interactive controller UI into the app background.
- Preserve a dedicated completion-effect group, but locate it at the artwork
  center/anchor declared in data rather than assuming `(500, 500)`.

### 3. Simplify and harden animation ownership

Files: `src/app/features/constellation-background/constellation-background.ts`

- Replace the logo-only imports, maps, and group references with starlight
  edges, stars, and decorations.
- Map DOM nodes by `data-*` ID, not render order. This removes the current
  index-coupling risk when a path or star is reordered.
- Retain exactly one scroll-progress producer. Prefer the existing GSAP
  `ScrollTrigger` because the project already uses it; coalesce updates with
  `requestAnimationFrame`.
- At each threshold, use short GSAP tweens: edge draw/retract ≤ 0.45 s,
  star/decor opacity ≤ 0.35 s, completion accent ≤ 0.8 s. Kill/overwrite a
  target's in-flight tween before reversing it.
- Keep line drawing CSS-safe with `pathLength="1"`, `stroke-dasharray="1"`,
  and `stroke-dashoffset` transitions. Both aura and core paths must receive
  the same draw state.
- Replace `startHighlightShine()` with one completion timeline. It may lightly
  pulse selected anchors and the orbit once, then settle. It must not repeat.
- Create a `matchMedia('(prefers-reduced-motion: reduce)')` listener. In
  reduced motion, cancel triggers/timelines and render the completed, dimmed
  illustration; if the preference changes, reinitialize correctly.
- Preserve `BookStateService` fades for closed/open/closing. Keep all created
  GSAP timelines, media listeners, pending RAFs, and `ScrollTrigger` instance
  in teardown.
- Pause optional twinkle animation when the page is hidden or the background
  is outside the viewport. Never use per-star JS animation loops.

### 4. Rework visual framing and theme

Files: `src/app/features/constellation-background/constellation-background.css`

- Keep the host fixed, non-interactive, contained, and below scroll content.
- Replace cyan/neon selectors with warm variables such as `--starlight-core`,
  `--starlight-line`, `--starlight-aura`, and `--starlight-silk`.
- Change the late-night layer to a low-contrast ink/plum tone compatible with
  parchment sections. Lower opacity behind text where required rather than
  forcing page content to compensate.
- Apply stroke widths by edge tier: primary silhouette edges readable;
  detail edges finer and lower opacity; sky/orbit calmer still.
- Use CSS keyframes only for the small twinkle subset, with long, staggered,
  low-amplitude opacity/scale changes. Disable them with reduced motion,
  document hidden state, and an offscreen/paused class.
- Add mobile-specific frame rules and test 320–430 px widths. The couple must
  stay recognizably centered without clipping dress/train or covering primary
  form fields.

### 5. Maintain integration and documentation

Files:

- `src/app/features/constellation-background/README.md`
- `src/app/features/constellation-background/IMPLEMENTATION-GUIDE.md`
- `src/app/features/constellation-background/constellation-background.spec.ts` (new)

- `main-layout.html` should require no structural change: it continues to mount
  `<app-constellation-background />` once. Only modify the layout if visual
  review proves its stacking context blocks the new SVG.
- Rewrite feature docs to match the starlight dataset, native `1280 x 1240`
  coordinates, parts, finite reveal, warm palette, and source references.
- Remove stale claims about a gold logo-only `1000 x 1600` artwork, infinite
  highlights, and no half-drawn behavior if implementation changes them.
- Add unit tests for data validation, star reveal derivation, valid viewBox
  bounds, and component reduced-motion/static state. Add tests for lifecycle
  cleanup where testable with mocked GSAP/ScrollTrigger.

## Reveal choreography

| Story region | Scroll range | Illustration result |
| --- | ---: | --- |
| Introduction / Couple | 0.05–0.18 | Faint orbit and sparse sky guides |
| Chapter One / Timeline | 0.18–0.42 | Groom silhouette and nearby anchors |
| Proposal | 0.42–0.62 | Bride, veil, joined pose |
| Wedding information | 0.62–0.80 | Dress, train, silk details |
| RSVP / Ending | 0.80–0.92 | Ribbon, final anchors, one completion glint |
| Close state | n/a | Fade with `BookStateService`; no extra animation |

Ranges are defaults. Final values should be tuned after reviewing actual section
heights on mobile and desktop.

## Acceptance criteria

- The former logo/ring data is gone from the rendered backdrop; the new scene
  visibly reads as a couple in starlight, including orbit, groom, bride, and
  dress/train.
- The artwork is entirely driven by typed data in `star-data.ts`; the template
  contains only reusable SVG structure and Angular loops.
- No reference demo UI or full source SVG duplication ships in the Angular
  template.
- Normal motion uses one scroll trigger, transform/opacity/stroke-dashoffset,
  no tween > 1 s, and no perpetual completion loop.
- Reduced motion shows a calm completed scene with no timeline, sparkle, or
  scroll-driven draw work.
- Keyboard and screen-reader behavior are unchanged because the backdrop stays
  `aria-hidden` and `pointer-events: none`.
- The artwork is fully visible and content remains readable at 320 px, 768 px,
  1024 px, and wide desktop widths.
- `npm run build`, `ng test`, and `npx prettier --check "src/**/*"` pass.
- Review production output and Lighthouse mobile after implementation; retain
  the project performance budget, and remove optional decoration before
  accepting a measurable regression.

## Deliberately out of scope

- Changing cover/page-flip mechanics, wedding content, routes, or RSVP.
- Adding a runtime editor/controls like the standalone demo.
- Recreating every galaxy dust point from the source reference in the first
  pass.
- Adding raster backgrounds or external image/network dependencies.
