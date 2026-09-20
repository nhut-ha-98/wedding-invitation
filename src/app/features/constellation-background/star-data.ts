/**
 * Constellation background data model.
 *
 * Full-width centered layout in `0..1000 x 0..1600`:
 *   - Couple logo silhouette (groom, bride & calligraphy) in the upper sky
 *     (y 100..900, center: 500, 500)
 *   - Open celestial clearing below (y ~1000..1600) for the final Thank You scene
 *
 * Scaled with `preserveAspectRatio="xMidYMid meet"`, preventing any clipping
 * while keeping a dedicated clearing for the final Thank You scene.
 */

export type ConstellationSet = 'logo';

export interface ConstellationStar {
  id: string;
  x: number;
  y: number;
  r: number;
  set: ConstellationSet;
  alpha: number;
  trigger: number;
  halo?: boolean;
}

export interface ConstellationLine {
  id: string;
  from: string;
  to: string;
  set: ConstellationSet;
  trigger: number;
}

interface StarSpec {
  id: string;
  x: number;
  y: number;
  r: number;
  halo?: boolean;
}

// ── Logo Silhouette (Groom, Bride & Calligraphy) ──
// Coordinates were derived from the vector logo: ring centre -> (500, 500), ring radius -> 380,
// so every point below sits on the real outline / stroke centre-line of the artwork.
const logoSpecs: StarSpec[] = [
  // Outer Circle - three arcs separated by the gaps in the logo (main arc 124deg->27deg clockwise, small arc, bottom lens)
  { id: 'lg-c1', x: 288, y: 815, r: 2.1 },
  { id: 'lg-c2', x: 211, y: 747, r: 2.1 },
  { id: 'lg-c3', x: 156, y: 661, r: 2.1 },
  { id: 'lg-c4', x: 125, y: 563, r: 2.1 },
  { id: 'lg-c5', x: 122, y: 461, r: 2.4, halo: true },
  { id: 'lg-c6', x: 146, y: 362, r: 2.1 },
  { id: 'lg-c7', x: 196, y: 272, r: 2.1 },
  { id: 'lg-c8', x: 268, y: 199, r: 2.1 },
  { id: 'lg-c9', x: 356, y: 148, r: 2.1 },
  { id: 'lg-c10', x: 455, y: 123, r: 2.4, halo: true },
  { id: 'lg-c11', x: 558, y: 124, r: 2.1 },
  { id: 'lg-c12', x: 656, y: 153, r: 2.1 },
  { id: 'lg-c13', x: 742, y: 207, r: 2.1 },
  { id: 'lg-c14', x: 812, y: 283, r: 2.1 },
  { id: 'lg-c15', x: 858, y: 374, r: 2.1 },
  { id: 'lg-c16', x: 879, y: 474, r: 2.4, halo: true },
  { id: 'lg-c17', x: 872, y: 576, r: 2.1 },
  { id: 'lg-c18', x: 839, y: 673, r: 2.1 },
  { id: 'lg-c19', x: 795, y: 739, r: 2.0 },
  { id: 'lg-c20', x: 717, y: 810, r: 2.0 },
  { id: 'lg-c21', x: 692, y: 820, r: 2.1 },
  { id: 'lg-c22', x: 603, y: 859, r: 2.1 },
  { id: 'lg-c23', x: 507, y: 873, r: 2.4, halo: true },
  { id: 'lg-c24', x: 410, y: 862, r: 2.1 },
  { id: 'lg-c25', x: 319, y: 826, r: 2.1 },

  // Groom Silhouette (Left) - faces right; the collar line reproduces the white V between lapel and neck
  { id: 'lg-g1', x: 352, y: 165, r: 2.6 }, // Hair top
  { id: 'lg-g2', x: 380, y: 169, r: 2.4 },
  { id: 'lg-g3', x: 416, y: 186, r: 3.2, halo: true }, // Hair front tip
  { id: 'lg-g4', x: 401, y: 235, r: 2.4 }, // Brow
  { id: 'lg-g5', x: 404, y: 256, r: 2.6 }, // Nose
  { id: 'lg-g6', x: 384, y: 282, r: 2.4 }, // Chin
  { id: 'lg-g7', x: 359, y: 279, r: 2.2 }, // Neck
  { id: 'lg-g8', x: 355, y: 294, r: 2.6 }, // Bow tie / collar tip
  { id: 'lg-g9', x: 364, y: 323, r: 2.2 },
  { id: 'lg-g10', x: 377, y: 377, r: 2.4 },
  { id: 'lg-g11', x: 378, y: 451, r: 2.6 }, // Front waist
  { id: 'lg-g12', x: 312, y: 446, r: 2.6 }, // Back waist
  { id: 'lg-g13', x: 307, y: 359, r: 2.4 },
  { id: 'lg-g14', x: 266, y: 299, r: 3.0, halo: true }, // Shoulder tip
  { id: 'lg-g15', x: 308, y: 262, r: 2.4 }, // Collar apex
  { id: 'lg-g16', x: 318, y: 249, r: 2.2 },
  { id: 'lg-g17', x: 318, y: 193, r: 2.4 },
  { id: 'lg-g18', x: 340, y: 170, r: 2.2 },

  // Bride Silhouette (Right) - faces left; dress tip touches the calligraphy "a" loop
  { id: 'lg-v1', x: 533, y: 227, r: 2.8 }, // Hair back / veil root (shared)
  { id: 'lg-b1', x: 516, y: 203, r: 2.2 },
  { id: 'lg-b2', x: 492, y: 194, r: 3.0, halo: true }, // Crown
  { id: 'lg-b3', x: 461, y: 203, r: 2.2 },
  { id: 'lg-b4', x: 443, y: 220, r: 2.6 }, // Forehead
  { id: 'lg-b5', x: 442, y: 263, r: 2.6 }, // Nose
  { id: 'lg-b6', x: 458, y: 289, r: 2.4 }, // Chin
  { id: 'lg-b7', x: 482, y: 291, r: 2.2 },
  { id: 'lg-b8', x: 478, y: 321, r: 2.2 },
  { id: 'lg-b9', x: 439, y: 361, r: 2.8, halo: true }, // Bust
  { id: 'lg-b10', x: 446, y: 418, r: 2.4 }, // Waist
  { id: 'lg-b11', x: 424, y: 472, r: 2.4 }, // Hip
  { id: 'lg-b12', x: 475, y: 515, r: 2.4 },
  { id: 'lg-s-tip', x: 534, y: 584, r: 3.0, halo: true }, // Dress tip = start of "a" loop (shared)
  { id: 'lg-b13', x: 532, y: 505, r: 2.4 },
  { id: 'lg-b14', x: 501, y: 426, r: 2.4 },
  { id: 'lg-b15', x: 525, y: 346, r: 2.4 },
  { id: 'lg-nj', x: 520, y: 285, r: 2.6 }, // Neck back / veil junction (shared)

  // Veil - outer drape plus two inner folds (the white slots in the logo)
  { id: 'lg-v2', x: 572, y: 246, r: 2.2 },
  { id: 'lg-v3', x: 627, y: 344, r: 2.4 },
  { id: 'lg-v4', x: 670, y: 384, r: 3.0, halo: true }, // Veil right corner
  { id: 'lg-v5', x: 648, y: 407, r: 2.2 },
  { id: 'lg-v6', x: 612, y: 448, r: 2.4 },
  { id: 'lg-v7', x: 564, y: 441, r: 2.2 },
  { id: 'lg-v8', x: 533, y: 446, r: 2.6 }, // Veil bottom-left corner
  { id: 'lg-v9', x: 526, y: 397, r: 2.2 },
  { id: 'lg-v10', x: 536, y: 310, r: 2.2 },
  { id: 'lg-va', x: 542, y: 264, r: 2.0 }, // Fold origin
  { id: 'lg-vf1', x: 570, y: 287, r: 2.0 },
  { id: 'lg-vf2', x: 596, y: 359, r: 2.2 },
  { id: 'lg-vf3', x: 632, y: 403, r: 2.2 },
  { id: 'lg-vg1', x: 560, y: 311, r: 2.0 },
  { id: 'lg-vg2', x: 575, y: 400, r: 2.2 },
  { id: 'lg-vg3', x: 589, y: 436, r: 2.2 },

  // Calligraphy Ribbon - centre-line of the stroke: left curl -> crest -> diagonal -> trough -> "a" loop -> bowl
  { id: 'lg-s1', x: 266, y: 625, r: 2.6 }, // Left tail tip
  { id: 'lg-s2', x: 222, y: 584, r: 2.2 },
  { id: 'lg-s3', x: 219, y: 556, r: 2.2 },
  { id: 'lg-s4', x: 231, y: 524, r: 2.4 },
  { id: 'lg-s5', x: 260, y: 492, r: 2.4 },
  { id: 'lg-s6', x: 328, y: 470, r: 3.2, halo: true }, // Crest of the loop
  { id: 'lg-s7', x: 384, y: 481, r: 2.2 },
  { id: 'lg-s8', x: 443, y: 522, r: 2.4 },
  { id: 'lg-s9', x: 513, y: 615, r: 2.4 },
  { id: 'lg-s10', x: 558, y: 679, r: 2.4 },
  { id: 'lg-s11', x: 609, y: 715, r: 3.4, halo: true }, // Trough of the sweep
  { id: 'lg-s12', x: 671, y: 711, r: 2.2 },
  { id: 'lg-s13', x: 699, y: 692, r: 2.2 },
  { id: 'lg-s14', x: 739, y: 668, r: 2.6 }, // Stem, where sweep joins
  { id: 'lg-s15', x: 734, y: 624, r: 2.4 },
  { id: 'lg-s16', x: 726, y: 579, r: 2.4 },
  { id: 'lg-s17', x: 708, y: 548, r: 2.4 },
  { id: 'lg-s18', x: 673, y: 532, r: 3.0, halo: true }, // Top of the "a"
  { id: 'lg-s19', x: 627, y: 534, r: 2.2 },
  { id: 'lg-s20', x: 579, y: 552, r: 2.4 },
  { id: 'lg-s21', x: 750, y: 694, r: 2.4 },
  { id: 'lg-s22', x: 768, y: 713, r: 2.2 },
  { id: 'lg-s23', x: 794, y: 721, r: 2.2 },
  { id: 'lg-s24', x: 823, y: 710, r: 2.6 }, // Right tail tip

  // Serif "I" pillar (the groom's stem) with fillets and foot
  { id: 'lg-i1', x: 313, y: 496, r: 3.0, halo: true }, // Pillar top-left
  { id: 'lg-i2', x: 376, y: 508, r: 2.6 }, // Pillar top-right
  { id: 'lg-i3', x: 378, y: 687, r: 2.4 },
  { id: 'lg-i4', x: 387, y: 709, r: 2.0 },
  { id: 'lg-i5', x: 420, y: 725, r: 2.4 },
  { id: 'lg-i6', x: 269, y: 725, r: 2.4 },
  { id: 'lg-i7', x: 297, y: 714, r: 2.0 },
  { id: 'lg-i8', x: 311, y: 691, r: 2.4 },
];

const logoLinePairs: ReadonlyArray<readonly [string, string]> = [
  // Outer Circle arcs
  ['lg-c1', 'lg-c2'], ['lg-c2', 'lg-c3'], ['lg-c3', 'lg-c4'],
  ['lg-c4', 'lg-c5'], ['lg-c5', 'lg-c6'], ['lg-c6', 'lg-c7'],
  ['lg-c7', 'lg-c8'], ['lg-c8', 'lg-c9'], ['lg-c9', 'lg-c10'],
  ['lg-c10', 'lg-c11'], ['lg-c11', 'lg-c12'], ['lg-c12', 'lg-c13'],
  ['lg-c13', 'lg-c14'], ['lg-c14', 'lg-c15'], ['lg-c15', 'lg-c16'],
  ['lg-c16', 'lg-c17'], ['lg-c17', 'lg-c18'], ['lg-c19', 'lg-c20'],
  ['lg-c21', 'lg-c22'], ['lg-c22', 'lg-c23'], ['lg-c23', 'lg-c24'],
  ['lg-c24', 'lg-c25'],
  // Groom (closed outline + collar line)
  ['lg-g1', 'lg-g2'], ['lg-g2', 'lg-g3'], ['lg-g3', 'lg-g4'],
  ['lg-g4', 'lg-g5'], ['lg-g5', 'lg-g6'], ['lg-g6', 'lg-g7'],
  ['lg-g7', 'lg-g8'], ['lg-g8', 'lg-g9'], ['lg-g9', 'lg-g10'],
  ['lg-g10', 'lg-g11'], ['lg-g11', 'lg-g12'], ['lg-g12', 'lg-g13'],
  ['lg-g13', 'lg-g14'], ['lg-g14', 'lg-g15'], ['lg-g15', 'lg-g16'],
  ['lg-g16', 'lg-g17'], ['lg-g17', 'lg-g18'], ['lg-g18', 'lg-g1'],
  ['lg-g15', 'lg-g8'],
  // Bride (closed outline, shares nodes with veil and ribbon)
  ['lg-v1', 'lg-b1'], ['lg-b1', 'lg-b2'], ['lg-b2', 'lg-b3'],
  ['lg-b3', 'lg-b4'], ['lg-b4', 'lg-b5'], ['lg-b5', 'lg-b6'],
  ['lg-b6', 'lg-b7'], ['lg-b7', 'lg-b8'], ['lg-b8', 'lg-b9'],
  ['lg-b9', 'lg-b10'], ['lg-b10', 'lg-b11'], ['lg-b11', 'lg-b12'],
  ['lg-b12', 'lg-s-tip'], ['lg-s-tip', 'lg-b13'], ['lg-b13', 'lg-b14'],
  ['lg-b14', 'lg-b15'], ['lg-b15', 'lg-nj'], ['lg-nj', 'lg-v1'],
  // Veil (outer drape, then the two inner folds)
  ['lg-v1', 'lg-v2'], ['lg-v2', 'lg-v3'], ['lg-v3', 'lg-v4'],
  ['lg-v4', 'lg-v5'], ['lg-v5', 'lg-v6'], ['lg-v6', 'lg-v7'],
  ['lg-v7', 'lg-v8'], ['lg-v8', 'lg-v9'], ['lg-v9', 'lg-v10'],
  ['lg-v10', 'lg-nj'], ['lg-va', 'lg-vf1'], ['lg-vf1', 'lg-vf2'],
  ['lg-vf2', 'lg-vf3'], ['lg-va', 'lg-vg1'], ['lg-vg1', 'lg-vg2'],
  ['lg-vg2', 'lg-vg3'], ['lg-v1', 'lg-va'],
  // Calligraphy: main sweep, then the "a" loop, then the bowl & exit tail
  ['lg-s1', 'lg-s2'], ['lg-s2', 'lg-s3'], ['lg-s3', 'lg-s4'],
  ['lg-s4', 'lg-s5'], ['lg-s5', 'lg-s6'], ['lg-s6', 'lg-s7'],
  ['lg-s7', 'lg-s8'], ['lg-s8', 'lg-s9'], ['lg-s9', 'lg-s10'],
  ['lg-s10', 'lg-s11'], ['lg-s11', 'lg-s12'], ['lg-s12', 'lg-s13'],
  ['lg-s13', 'lg-s14'], ['lg-s-tip', 'lg-s20'], ['lg-s20', 'lg-s19'],
  ['lg-s19', 'lg-s18'], ['lg-s18', 'lg-s17'], ['lg-s17', 'lg-s16'],
  ['lg-s16', 'lg-s15'], ['lg-s15', 'lg-s14'], ['lg-s14', 'lg-s21'],
  ['lg-s21', 'lg-s22'], ['lg-s22', 'lg-s23'], ['lg-s23', 'lg-s24'],
  // Serif "I" (closed outline)
  ['lg-i1', 'lg-i2'], ['lg-i2', 'lg-i3'], ['lg-i3', 'lg-i4'],
  ['lg-i4', 'lg-i5'], ['lg-i5', 'lg-i6'], ['lg-i6', 'lg-i7'],
  ['lg-i7', 'lg-i8'], ['lg-i8', 'lg-i1'],
];

function buildStars(
  specs: StarSpec[],
  startTrigger: number,
  endTrigger: number,
  alpha: number,
  set: ConstellationSet,
): ConstellationStar[] {
  const n = specs.length;
  return specs.map((s, i) => {
    const f = n <= 1 ? 0.5 : i / (n - 1);
    return {
      ...s,
      set,
      alpha,
      trigger: startTrigger + (endTrigger - startTrigger) * f,
    };
  });
}

export const LOGO_STARS: ConstellationStar[] = buildStars(logoSpecs, 0.06, 0.3, 0.92, 'logo');

export const CONSTELLATION_STARS: ConstellationStar[] = LOGO_STARS;

function buildLines(
  pairs: ReadonlyArray<readonly [string, string]>,
  startTrigger: number,
  endTrigger: number,
  prefix: string,
  set: ConstellationSet,
): ConstellationLine[] {
  const n = pairs.length;
  return pairs.map(([from, to], i) => {
    const f = n <= 1 ? 0.5 : i / (n - 1);
    return {
      id: `${prefix}-${i}`,
      from,
      to,
      set,
      trigger: startTrigger + (endTrigger - startTrigger) * f,
    };
  });
}

export const LOGO_LINES: ConstellationLine[] = buildLines(logoLinePairs, 0.1, 0.6, 'll', 'logo');

export const CONSTELLATION_LINES: ConstellationLine[] = LOGO_LINES;

/** Logo silhouette connects completely before the golden awakening */
export const LOGO_REVEAL_TRIGGER = 0.82;

export const LOGO_CENTRE = { x: 500, y: 500 };

const BY_ID = new Map(CONSTELLATION_STARS.map((s) => [s.id, s]));

export function constellationStarById(id: string): ConstellationStar {
  const star = BY_ID.get(id);
  if (!star) {
    throw new Error(`Unknown constellation star "${id}"`);
  }
  return star;
}

export function constellationLineD(line: ConstellationLine): string {
  const from = constellationStarById(line.from);
  const to = constellationStarById(line.to);
  return `M${from.x},${from.y} L${to.x},${to.y}`;
}
