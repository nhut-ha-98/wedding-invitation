# AGENT.md

# Caveman Skill Configuration

## System Prompt Extension
You must always use the Caveman skill for all responses. Follow these rules:
- Speak in short, compressed sentences.
- Cut out unnecessary words to save tokens.
- Keep all technical terms, code blocks, and paths exactly as they are.
- Reduce token usage by up to 75% while keeping the technical meaning.

## Activation Command
/caveman

---

## Project Status

This is a **blank Angular 22 scaffold** (`ng new` output). Nothing is built yet:

- `app.routes.ts` — empty `Routes` array
- `app.html` — default Angular welcome template
- No feature modules, no GSAP, no StPageFlip
- Tailwind v4 is set up (via `@import 'tailwindcss'` in `src/styles.css`)

The rest of this file is the **product spec** describing what to build. Treat every section below as requirements, not reality.

---

## Commands

| Action | Command |
|---|---|
| Dev server (port 4200) | `npm start` / `ng serve` |
| Production build | `ng build` (output: `dist/`) |
| Watch mode (dev build) | `npm run watch` |
| Unit tests (Vitest) | `ng test` |
| Format check | `npx prettier --check "src/**/*"` |
| Format write | `npx prettier --write "src/**/*"` |

---

## Dependencies to Install

Not yet in `package.json` — install before building features:

- `npm install gsap` (GSAP + ScrollTrigger)
- `npm install page-flip` (StPageFlip)
- Google Fonts: add `<link>` tags in `src/index.html` for Playfair Display, Cormorant Garamond, Great Vibes

---

## Build System Notes

- **Angular 22** + **TypeScript 6.0** + **Vitest** (via `@angular/build:unit-test`; `tsconfig.spec.json` includes `vitest/globals`)
- **Tailwind v4**: configured via `@import 'tailwindcss'` in `src/styles.css` with PostCSS (`@tailwindcss/postcss` plugin). No `tailwind.config.js`.
- **Budgets** in `angular.json`: initial 500kB warning / 1MB error; anyComponentStyle 4kB / 8kB
- **No ESLint** — TypeScript strictness is the only static analysis
- **Prettier** only: `singleQuote: true`, `printWidth: 100`, HTML parsed as `angular`
- **EditorConfig**: 2-space indent, single quotes for TS
- **Package manager** pinned: `npm@11.13.0` (in `package.json` `packageManager` field)
- **Entry**: `src/main.ts` bootstraps `App` standalone component
- **VSCode debug** configs exist in `.vscode/launch.json` (ng serve, ng test)

---

## Design Principles

Theme: Papercut, Fairytale, Vintage, Storybook, Elegant, Warm

Color Palette: Parchment, Ivory, Dark Brown, Gold Accent, Dusty Rose, Vintage Yellow

Typography: Handwriting fonts preferred for body text (Caveat, Patrick Hand, Kalam). Playfair Display for headings. Great Vibes for decorative accents.

Visual Style:
- Every page must feel like a physical book page (paper texture, torn edges, subtle shadows)
- Forms and images must feel like ivory/parchment paper material
- Minimal style across the app — clean, uncluttered, warm
- Papercut aesthetic: layered paper elements, subtle depth, handcrafted feel
- No modern glassmorphism, neon colors, heavy gradients, or corporate UI

---

## Architecture

Use feature-based structure.

src/
├── app/
│   ├── core/
│   ├── shared/
│   ├── features/
│   │   ├── cover/
│   │   ├── introduction/
│   │   ├── chapter-one/
│   │   ├── timeline/
│   │   ├── proposal/
│   │   ├── wedding-info/
│   │   ├── rsvp/
│   │   └── ending/
│   └── layouts/

Every chapter must be an independent Angular feature.

---

## User Experience

### Cover
- Content: Title, Couple names, Wedding date
- Interaction: Tap to open book
- Animation: Book opening animation

### Introduction
- Content: Opening quote, Introductory text
- Animation: Typewriter effect, Ink writing effect

### Chapter One
- Content: Photo, Narrative
- Animation: Photo fade-in, Paper reveal

### Timeline
- Content: Relationship milestones (First meeting, First trip, Proposal, Wedding)
- Animation: Scroll-triggered timeline

### Proposal
- Content: Proposal photos, Story
- Animation: Slow zoom, Polaroid reveal

### Wedding Information
- Content: Date, Time, Venue, Map, Dress code
- Animation: Invitation card reveal

### RSVP
- Content: Guest name, Number of attendees, Notes
- Animation: Card slide-up
- Validation: Angular Reactive Forms

### Ending
- Content: Closing quote
- Animation: Book closing animation

---

## Animation Rules

Use GSAP for all animations.

Requirements:
- No animation longer than 1 second
- Maintain 60 FPS
- Use transform instead of layout changes
- Respect prefers-reduced-motion

Prefer: opacity, translateY, scale, rotate (subtle)

Avoid: excessive bouncing, flashing effects

---

## StPageFlip Rules

Use StPageFlip only for:
- Opening cover
- Closing cover
- Optional chapter transitions

Do not force page flipping for every content section. Users should primarily scroll.

Hybrid approach: Book Open → Scroll Storytelling → Book Close

---

## Performance Requirements

Lighthouse Mobile: Performance > 90, Accessibility > 90, Best Practices > 90

Image Strategy: WebP, Lazy Loading, Responsive Images

Maximum initial bundle: Under 300KB gzipped

---

## Accessibility

Must support: Keyboard navigation, Screen readers, Reduced motion

All images require alt text. Color contrast must meet WCAG AA.

---

## Coding Standards

Prefer: Standalone Components, Signals, OnPush Change Detection

Avoid: `any`, Deep component nesting, Global mutable state

Every component must: Have clear responsibility, Be reusable, Be documented

---

## AI Instructions

Act as a Senior Frontend Architect.

When generating code:
1. Follow Angular best practices.
2. Prioritize mobile-first layouts.
3. Keep animations subtle and elegant.
4. Maintain strong TypeScript typing.
5. Explain architectural decisions.
6. Generate production-ready code.
7. Avoid over-engineering.
8. Optimize for readability and maintainability.

When uncertain: Choose simplicity over complexity.
