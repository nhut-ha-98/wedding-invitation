# BOOK COVER SPECIFICATION & DOCUMENTATION

## 1. Overview & Artistic Vision

The cover serves as the opening gateway to the wedding storybook. Designed as an authentic **early 20th-century European Art Nouveau fairy-tale book cover**, it is handcrafted entirely as a **layered paper-cut artwork**.

Every element evokes the tactile warmth of antique bookmaking—multi-tiered textured cardstock, cut parchment borders, embossed gold-leaf lettering, and delicate filigree—crafted purely with modern web technologies (HTML5, SVG, CSS3, Angular 22).

- **Theme**: Romantic Fairytale, Vintage Art Nouveau, Handcrafted Layered Paper-Cut.
- **Tone**: Warm, intimate, nostalgic, and magical.
- **Assets**: 100% vector SVG and CSS gradients. **Zero raster images/photos** on the cover.
- **Color Rule**: **No pure white text (`#fff`)**. All text and highlights use warm ivory, champagne, and aged parchment tones.

---

## 2. Color Palette & Materiality

The color system reflects aged parchment, deep bookcloth, burnished leather, and gilded foil:

| Swatch Name | Hex Code | Usage |
|---|---|---|
| **Deep Chocolate Shadow** | `#150904`, `#220e06` | Cover background, base cutouts, deep shadow underlays |
| **Warm Sepia / Coffee** | `#3a1c0c`, `#4a2511` | Cardstock bevels, frame groove deboss, paper veins |
| **Antique Caramel / Tan** | `#915826`, `#ba8044` | Midtone gilded layers, secondary stems, ampersand accents |
| **Warm Luminous Gold** | `#dba463`, `#dfa868` | Title foil gradient, star sparkles, leaf highlights |
| **Aged Parchment / Ivory** | `#edd1a8`, `#faeedb` | Title highlight stops, dandelion fluff, inner mat layer |

---

## 3. Structural Layout & Composition

The cover is vertically centered within the book stage:

```
┌────────────────────────────────────────────────────────┐
│  [Audio Toggle]                                        │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │ [3D Butterfly 1]            [3D Butterfly 2]   │   │
│   │                                                │   │
│   │            ∼ A NEW CHAPTER ∼                   │   │
│   │                                                │   │
│   │        ───✦── [4-STAR LEAF DIVIDER] ──✦───      │   │
│   │                                                │   │
│   │               HOA HA                           │   │
│   │               ❧ & ❧                            │   │
│   │               NHUT HA                          │   │
│   │                                                │   │
│   │        ─────── [DANDELION DIVIDER] ───────     │   │
│   │                                                │   │
│   │            NOVEMBER 1, 2026                    │   │
│   │                                                │   │
│   │              [3D Butterfly 3]                  │   │
│   └────────────────────────────────────────────────┘   │
│                                                        │
│            [Tap To Open Storybook Badge]               │
└────────────────────────────────────────────────────────┘
```

---

## 4. Visual Components

### 4.1 Multi-Layer Paper Mat Borders
The cover features a three-tier recessed mat border simulating thick cut cardstock:
1. **Outer Mat (`.mat-outer`)**: Deep leather brown with `inset` deboss shadow.
2. **Middle Mat (`.mat-middle`)**: Warm caramel cardstock with 1px deckle edge highlight.
3. **Inner Mat (`.mat-inner`)**: Deep coffee background with SVG noise texture overlay.
4. **SVG Filter `#handcut-deckle`**: Generates organic rough deckle edges on paper layers.

### 4.2 Art Nouveau Botanical Frame
- A custom SVG vector frame (`.art-nouveau-frame-svg`) with four symmetrical corner acanthus vine flourishes.
- Dual concentric border rules with grooved deboss simulation.
- Organic botanical leaf vein lines scored into the paper.

### 4.3 3D Folding Papercut Butterflies
Three butterflies (`.butterfly-1`, `.butterfly-2`, `.butterfly-3`) arranged around the layout:
- **Safe Margins**: Inset well away from borders to avoid crowding.
- **3-Tier Solid Cardstock**: Base silhouette (`#2c150a`), middle wing (`#673c21`), forefront ivory wing (`#ebd6bd`) with embossed vein lines. **No hole-like cutouts**.
- **3D Flapping Animation**: Wings rotate along the Y-axis (`rotateY()`) in `preserve-3d` space with asynchronous floating (`translateY`) and breathing drop shadows.

### 4.4 Simplified Botanical Dividers
- **Top Divider (4-Star Leaf)**:
  - Centerpiece: Handcrafted **4-star leaf** (`✦`) with 4 organic teardrop-star cardstock blades, dark underlay shadow (`#271005`), gilded blades (`#ebd2ad` / `#d9a566`), and center pearl bead.
  - Flanked by delicate horizontal vine rules with small leaf pairs and terminal beads.
- **Bottom Divider (Dandelion)**:
  - Centerpiece: Minimal **dandelion** motif with slender curved stem, dark seed core (`#3d1d0b`), and radiating filaments with delicate cream fluff (`#faeedb`).
  - 2 drifting floating seeds drifting into the breeze to the right.
  - Flanked by clean horizontal lines with graduated dot accents.

### 4.5 Centerpiece Title: Couple Names
- **Hierarchy**: The dominant visual centerpiece of the cover.
- **Typography**: `Cinzel Decorative`, weight 700, uppercase with `0.08em` tracking.
- **Color**: Luminous antique gilded caramel gradient:
  ```css
  background: linear-gradient(180deg, #faeedb 0%, #edd1a8 22%, #dba463 52%, #be8044 80%, #925826 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  ```
- **3D Paper Cut Relief**: 5-tier drop-shadow bevel simulating thick mounted cardstock:
  ```css
  filter:
    drop-shadow(0 1px 0px #5e3317)
    drop-shadow(0 2px 0px #3d1d0a)
    drop-shadow(0 3px 1px #220e04)
    drop-shadow(0 5px 8px rgba(10, 4, 1, 0.88))
    drop-shadow(0 10px 18px rgba(5, 2, 1, 0.7));
  ```
- **Ampersand Row**: Separator row featuring a gilded Art Nouveau ampersand flanked by twin horizontal scroll flourish wings.

### 4.6 Sub-Typography & Date
- **Chapter Tagline**: "∼ A NEW CHAPTER ∼" in `Playfair Display`, uppercase, tracking `0.32em`.
- **Wedding Date**: Refined Roman serif (`Marcellus`), tracking `0.3em`, warm caramel tone (`#d1ab7f`).

---

## 5. Interaction & Animation Architecture

### 5.1 Entrance Timeline
1. **0–600ms**: Cover and frame fade in with subtle scale settling.
2. **550–750ms**: Chapter tagline and top divider reveal.
3. **750–1100ms**: Couple names hero reveal with upward 3D paper lift.
4. **1100–1400ms**: Bottom divider, wedding date, and tap badge slide up.
5. **Continuous**: Idle wing flapping, gentle butterfly hovering, and star twinkling.

### 5.2 Page Turning (StPageFlip)
- **Library**: `page-flip` (StPageFlip) configured for hard cover pages (`data-density="hard"`).
- **Trigger**: Tapping the cover or the "Chạm để mở sách" badge triggers `pageFlip.flipNext()`.
- **Audio Feedback**: `AudioService` plays ambient music and page-turn sound effects on interaction.
- **Inside Page**: Reveals Page 2 (hard inside transition page) with animated canvas dandelion fluff particles before entering the storytelling scroll chapter.

---

## 6. Accessibility & Technical Standards

- **WCAG AA Compliance**: High contrast ratios maintained against dark chocolate background using warm ivory and champagne highlights.
- **Reduced Motion**: Full `@media (prefers-reduced-motion: reduce)` rules disable 3D flaps, floating transforms, and entrance staggers.
- **Semantic HTML**: Accessible headings (`h1` with `aria-label`), SVG decorative elements flagged with `aria-hidden="true"`.
- **Performance**: Zero external image HTTP requests; instant vector rendering under 60 FPS.
