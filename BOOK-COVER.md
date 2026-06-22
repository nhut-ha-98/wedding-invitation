# COVER PAGE SPECIFICATION

## Purpose

The cover page is the most important visual element of the entire wedding website.

Users should immediately feel that they are holding an old fairytale book rather than opening a modern website.

The cover must create curiosity and emotional anticipation before revealing the story.

The cover occupies 100% of the viewport height and width.

Mobile-first design is mandatory.

---

# Visual Concept

Imagine:

* An old leather-bound storybook
* Slightly worn by time
* Gold foil embossing
* Handmade craftsmanship
* Warm candlelight atmosphere
* Vintage fairytale aesthetic

Visual inspiration:

* Antique storybooks
* Fairytale collections
* Old family photo albums
* Vintage journals
* Leather-bound novels

The cover should feel luxurious and timeless.

Not rustic.

Not boho.

Not cartoonish.

Not fantasy game UI.

---

# Layout Structure

The cover is vertically centered.

Overall composition:

TOP
↓
Book Title
↓
Decorative Ornament
↓
Couple Names
↓
Wedding Date
↓
Decorative Ornament
↓
Tap To Open
↓
BOTTOM

Everything is aligned center.

---

# Cover Background

The entire cover represents a single physical book.

The book should not fill the entire screen width.

Recommended:

Mobile Width:
80% - 90%

Mobile Height:
85% - 95%

The remaining area around the book acts as stage/background.

---

# Outer Environment

Background behind the book:

Very dark brown

Not black.

Example feeling:

* dim library
* candlelit room
* old wooden desk

Use subtle vignette.

Corners should be darker.

Center slightly brighter.

No visible furniture.

No realistic desk textures.

The focus must remain on the book.

---

# Book Material

The cover uses aged leather.

Characteristics:

* deep brown
* subtle texture
* visible grain
* slightly worn edges

Not cracked leather.

Not damaged.

Not dirty.

Premium vintage.

The leather should have depth and richness.

---

# Book Border

Around the edges is a gold embossed frame.

Frame thickness:

4px–8px visual weight.

Distance from edge:

16px–24px.

Style:

Victorian
Elegant
Symmetrical

No excessive ornamentation.

The frame should communicate luxury.

---

# Corner Decorations

All four corners contain gold flourishes.

Purpose:

To reinforce the fairytale book appearance.

Characteristics:

* delicate
* symmetrical
* thin line art

Not floral overload.

Not baroque.

Not gothic.

---

# Spine

The left side of the cover contains a visible book spine.

Width:

8%–12% of book width.

The spine should include:

* vertical decorative lines
* slight shadows
* subtle raised leather sections

The spine must create depth.

Users should immediately recognize this as a real book.

---

# Book Title

Primary headline:

A NEW CHAPTER

Uppercase.

Two lines preferred:

A NEW
CHAPTER

Typography:

Playfair Display
or
Cormorant Garamond

Weight:

SemiBold

Color:

Gold

---

# Title Effects

The title is embossed.

Visual characteristics:

* subtle highlights
* subtle shadows
* metallic appearance

Avoid:

* shiny chrome
* animated sparkle
* excessive glow

Luxury is achieved through restraint.

---

# Decorative Divider

Below title:

Small elegant ornament.

Width:

80px–120px

Gold.

Symmetrical.

Thin.

Purpose:

Separate title and names.

---

# Couple Names

Largest emotional element.

Example:

Minh
&
Lan

Typography:

Great Vibes

or

Allura

Gold color.

Names are larger than date.

Smaller than title.

---

# Wedding Date

Position:

Below names.

Example:

15 • 11 • 2026

Typography:

Elegant serif.

Gold.

Letter spacing slightly increased.

---

# Bottom Instruction

Near bottom center.

Text:

Tap to Open

or

Chạm để mở

Typography:

Small.

Subtle.

Semi-transparent gold.

Purpose:

Guide user interaction.

Never compete with the title.

---

# Lighting

Primary light source:

Top center.

Creates:

* gentle highlights
* embossed depth
* premium look

No dramatic reflections.

No lens flares.

No artificial glow.

---

# Motion Design

When page loads:

0ms–300ms
Book fades in.

300ms–800ms
Gold details become visible.

800ms–1200ms
Title gently appears.

1200ms–1500ms
Names fade in.

1500ms–1800ms
Tap to Open appears.

---

# Idle Animation

Extremely subtle.

Every 8–12 seconds:

* slight light shift
* tiny shadow movement

Maximum movement:
2px

User should barely notice.

---

# Opening Interaction

When user taps cover:

Step 1

Book slightly scales down:

scale(0.98)

Duration:
150ms

---

Step 2

Front cover rotates around spine.

Transform Origin:

left center

Rotation:

-165deg

Duration:

900ms

Ease:

power3.inOut

---

Step 3

Reveal first story page underneath.

Page already exists behind cover.

No white flash.

No route transition.

No reload.

Must feel like a physical book opening.

---

# Emotional Goal

User reaction should be:

"This feels like opening an old storybook."

Not:

"This is a website with a book animation."

The illusion of a real book is more important than visual complexity.
