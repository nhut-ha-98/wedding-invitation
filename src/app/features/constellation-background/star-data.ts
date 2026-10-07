/**
 * Constellation background data model.
 *
 * Re-traced from the reference artwork (constellation figures + circle only;
 * galaxy / background ignored). Reference ring centre -> (500, 500), ring radius -> 380.
 *
 * Layout in `0..1000 x 0..1600`:
 *   - Couple logo (groom, bride, "I" pillar, calligraphy "a" loop, circular ring + bottom lens)
 *     in the upper sky (centre: 500, 500)
 *   - Open celestial clearing below (y ~1000..1600) for the final Thank You scene
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

const logoSpecs: StarSpec[] = [
  { id: 'lg-c1', x: 189, y: 718, r: 2.1 },
  { id: 'lg-c2', x: 161, y: 673, r: 2.1 },
  { id: 'lg-c3', x: 139, y: 617, r: 2.1 },
  { id: 'lg-c4', x: 125, y: 559, r: 2.1 },
  { id: 'lg-c5', x: 120, y: 500, r: 3.6, halo: true },
  { id: 'lg-c6', x: 125, y: 441, r: 2.1 },
  { id: 'lg-c7', x: 139, y: 383, r: 2.1 },
  { id: 'lg-c8', x: 161, y: 327, r: 2.1 },
  { id: 'lg-c9', x: 193, y: 277, r: 2.1 },
  { id: 'lg-c10', x: 251, y: 213, r: 3.0, halo: true },
  { id: 'lg-c11', x: 310, y: 171, r: 2.1 },
  { id: 'lg-c12', x: 370, y: 143, r: 2.1 },
  { id: 'lg-c13', x: 434, y: 126, r: 2.1 },
  { id: 'lg-c14', x: 500, y: 120, r: 4.0, halo: true },
  { id: 'lg-c15', x: 566, y: 126, r: 2.1 },
  { id: 'lg-c16', x: 630, y: 143, r: 2.1 },
  { id: 'lg-c17', x: 690, y: 171, r: 2.1 },
  { id: 'lg-c18', x: 759, y: 222, r: 3.4, halo: true },
  { id: 'lg-c19', x: 811, y: 282, r: 2.1 },
  { id: 'lg-c20', x: 844, y: 339, r: 2.1 },
  { id: 'lg-c21', x: 869, y: 408, r: 2.1 },
  { id: 'lg-c22', x: 880, y: 500, r: 3.6, halo: true },
  { id: 'lg-c23', x: 876, y: 553, r: 2.1 },
  { id: 'lg-c24', x: 864, y: 609, r: 2.1 },
  { id: 'lg-c25', x: 811, y: 718, r: 2.1 },
  { id: 'lg-c26', x: 718, y: 812, r: 2.1 },
  { id: 'lg-c27', x: 598, y: 867, r: 2.4 },
  { id: 'lg-c28', x: 500, y: 880, r: 4.0, halo: true },
  { id: 'lg-c29', x: 402, y: 867, r: 2.4 },
  { id: 'lg-c30', x: 282, y: 812, r: 2.1 },
  { id: 'lg-l1', x: 300, y: 795, r: 2.0 },
  { id: 'lg-l2', x: 358, y: 799, r: 2.0 },
  { id: 'lg-l3', x: 424, y: 801, r: 2.0 },
  { id: 'lg-l4', x: 500, y: 803, r: 4.2, halo: true },
  { id: 'lg-l5', x: 574, y: 801, r: 2.0 },
  { id: 'lg-l6', x: 641, y: 799, r: 2.0 },
  { id: 'lg-l7', x: 703, y: 794, r: 2.0 },
  { id: 'lg-g1', x: 341, y: 206, r: 2.4 },
  { id: 'lg-g2', x: 364, y: 200, r: 2.4 },
  { id: 'lg-g3', x: 386, y: 213, r: 3.2, halo: true },
  { id: 'lg-g4', x: 379, y: 236, r: 2.4 },
  { id: 'lg-g5', x: 373, y: 265, r: 2.6 },
  { id: 'lg-g6', x: 376, y: 275, r: 2.2 },
  { id: 'lg-g7', x: 364, y: 285, r: 2.4 },
  { id: 'lg-g8', x: 356, y: 296, r: 2.2 },
  { id: 'lg-g9', x: 343, y: 310, r: 2.6 },
  { id: 'lg-g10', x: 355, y: 339, r: 2.2 },
  { id: 'lg-g11', x: 364, y: 384, r: 2.4 },
  { id: 'lg-g12', x: 366, y: 430, r: 2.6 },
  { id: 'lg-g13', x: 301, y: 432, r: 2.6 },
  { id: 'lg-g14', x: 293, y: 368, r: 2.4 },
  { id: 'lg-g15', x: 275, y: 326, r: 2.2 },
  { id: 'lg-g16', x: 265, y: 303, r: 3.4, halo: true },
  { id: 'lg-g17', x: 298, y: 278, r: 2.4 },
  { id: 'lg-g18', x: 310, y: 251, r: 2.2 },
  { id: 'lg-g19', x: 312, y: 226, r: 2.4 },
  { id: 'lg-g20', x: 323, y: 210, r: 2.2 },
  { id: 'lg-i1', x: 300, y: 447, r: 3.0, halo: true },
  { id: 'lg-i2', x: 364, y: 451, r: 2.6 },
  { id: 'lg-i3', x: 364, y: 526, r: 2.2 },
  { id: 'lg-i4', x: 364, y: 605, r: 3.4, halo: true },
  { id: 'lg-i5', x: 366, y: 675, r: 2.4 },
  { id: 'lg-i6', x: 362, y: 709, r: 2.2 },
  { id: 'lg-i7', x: 408, y: 736, r: 2.4 },
  { id: 'lg-i8', x: 250, y: 738, r: 3.4, halo: true },
  { id: 'lg-i9', x: 287, y: 717, r: 2.2 },
  { id: 'lg-i10', x: 298, y: 667, r: 3.2, halo: true },
  { id: 'lg-i11', x: 300, y: 559, r: 2.2 },
  { id: 'lg-s1', x: 258, y: 627, r: 2.6 },
  { id: 'lg-s2', x: 221, y: 613, r: 2.2 },
  { id: 'lg-s3', x: 192, y: 584, r: 2.4 },
  { id: 'lg-s4', x: 179, y: 555, r: 3.4, halo: true },
  { id: 'lg-s5', x: 185, y: 522, r: 2.2 },
  { id: 'lg-s6', x: 204, y: 497, r: 2.4 },
  { id: 'lg-s7', x: 237, y: 473, r: 2.4 },
  { id: 'lg-s8', x: 283, y: 453, r: 2.4 },
  { id: 'lg-s9', x: 395, y: 463, r: 2.2 },
  { id: 'lg-b1', x: 466, y: 231, r: 3.0, halo: true },
  { id: 'lg-b2', x: 448, y: 239, r: 2.2 },
  { id: 'lg-b3', x: 434, y: 253, r: 2.4 },
  { id: 'lg-b4', x: 429, y: 268, r: 2.6 },
  { id: 'lg-b5', x: 433, y: 283, r: 2.4 },
  { id: 'lg-b6', x: 445, y: 291, r: 2.2 },
  { id: 'lg-b7', x: 451, y: 308, r: 2.2 },
  { id: 'lg-b8', x: 433, y: 335, r: 2.4 },
  { id: 'lg-b9', x: 423, y: 353, r: 3.4, halo: true },
  { id: 'lg-b10', x: 437, y: 393, r: 2.4 },
  { id: 'lg-b11', x: 441, y: 422, r: 2.4 },
  { id: 'lg-b12', x: 423, y: 451, r: 2.4 },
  { id: 'lg-b13', x: 408, y: 469, r: 3.6, halo: true },
  { id: 'lg-v1', x: 491, y: 239, r: 2.8 },
  { id: 'lg-k1', x: 395, y: 526, r: 2.2 },
  { id: 'lg-k2', x: 389, y: 592, r: 2.2 },
  { id: 'lg-k3', x: 387, y: 659, r: 2.2 },
  { id: 'lg-k4', x: 391, y: 717, r: 2.4 },
  { id: 'lg-h1', x: 449, y: 742, r: 2.2 },
  { id: 'lg-h2', x: 507, y: 744, r: 2.2 },
  { id: 'lg-h3', x: 572, y: 746, r: 3.4, halo: true },
  { id: 'lg-h4', x: 624, y: 735, r: 2.2 },
  { id: 'lg-h5', x: 674, y: 721, r: 2.4 },
  { id: 'lg-h6', x: 711, y: 700, r: 2.4 },
  { id: 'lg-h7', x: 728, y: 671, r: 3.4, halo: true },
  { id: 'lg-nj', x: 493, y: 301, r: 2.6 },
  { id: 'lg-bk1', x: 489, y: 359, r: 2.2 },
  { id: 'lg-bk2', x: 495, y: 418, r: 2.4 },
  { id: 'lg-bk3', x: 512, y: 476, r: 2.4 },
  { id: 'lg-bk4', x: 528, y: 534, r: 2.4 },
  { id: 'lg-tip', x: 549, y: 582, r: 3.4, halo: true },
  { id: 'lg-f1', x: 574, y: 642, r: 2.2 },
  { id: 'lg-f2', x: 616, y: 696, r: 2.2 },
  { id: 'lg-v2', x: 514, y: 260, r: 2.2 },
  { id: 'lg-v3', x: 541, y: 310, r: 2.4 },
  { id: 'lg-v4', x: 574, y: 368, r: 2.4 },
  { id: 'lg-v5', x: 599, y: 409, r: 2.4 },
  { id: 'lg-v6', x: 617, y: 428, r: 3.6, halo: true },
  { id: 'lg-v7', x: 595, y: 438, r: 2.2 },
  { id: 'lg-v8', x: 557, y: 433, r: 2.2 },
  { id: 'lg-v9', x: 524, y: 428, r: 2.4 },
  { id: 'lg-va', x: 503, y: 260, r: 2.0 },
  { id: 'lg-vf1', x: 528, y: 335, r: 2.0 },
  { id: 'lg-vf2', x: 557, y: 393, r: 2.2 },
  { id: 'lg-vf3', x: 582, y: 426, r: 2.2 },
  { id: 'lg-vg1', x: 516, y: 278, r: 2.0 },
  { id: 'lg-vg2', x: 541, y: 351, r: 2.2 },
  { id: 'lg-vg3', x: 557, y: 426, r: 2.2 },
  { id: 'lg-a1', x: 582, y: 547, r: 2.2 },
  { id: 'lg-a2', x: 624, y: 530, r: 2.4 },
  { id: 'lg-a3', x: 674, y: 526, r: 3.6, halo: true },
  { id: 'lg-a4', x: 711, y: 536, r: 2.4 },
  { id: 'lg-a5', x: 740, y: 557, r: 2.4 },
  { id: 'lg-a6', x: 757, y: 576, r: 3.2, halo: true },
  { id: 'lg-a7', x: 764, y: 617, r: 2.4 },
  { id: 'lg-a8', x: 778, y: 671, r: 3.4, halo: true },
  { id: 'lg-a9', x: 772, y: 709, r: 2.4 },
  { id: 'lg-a10', x: 790, y: 729, r: 2.4 },
  { id: 'lg-a11', x: 821, y: 732, r: 3.0, halo: true },
  { id: 'lg-a12', x: 844, y: 725, r: 2.2 },
  { id: 'lg-a13', x: 861, y: 710, r: 2.6 },
  { id: 'lg-a14', x: 705, y: 569, r: 2.8, halo: true },
  { id: 'lg-a15', x: 715, y: 634, r: 2.2 },
];

const logoLinePairs: ReadonlyArray<readonly [string, string]> = [
  ['lg-c1', 'lg-c2'],
  ['lg-c2', 'lg-c3'],
  ['lg-c3', 'lg-c4'],
  ['lg-c4', 'lg-c5'],
  ['lg-c5', 'lg-c6'],
  ['lg-c6', 'lg-c7'],
  ['lg-c7', 'lg-c8'],
  ['lg-c8', 'lg-c9'],
  ['lg-c9', 'lg-c10'],
  ['lg-c10', 'lg-c11'],
  ['lg-c11', 'lg-c12'],
  ['lg-c12', 'lg-c13'],
  ['lg-c13', 'lg-c14'],
  ['lg-c14', 'lg-c15'],
  ['lg-c15', 'lg-c16'],
  ['lg-c16', 'lg-c17'],
  ['lg-c17', 'lg-c18'],
  ['lg-c18', 'lg-c19'],
  ['lg-c19', 'lg-c20'],
  ['lg-c20', 'lg-c21'],
  ['lg-c21', 'lg-c22'],
  ['lg-c22', 'lg-c23'],
  ['lg-c23', 'lg-c24'],
  ['lg-c24', 'lg-c25'],
  ['lg-c25', 'lg-c26'],
  ['lg-c26', 'lg-c27'],
  ['lg-c27', 'lg-c28'],
  ['lg-c28', 'lg-c29'],
  ['lg-c29', 'lg-c30'],
  ['lg-c30', 'lg-c1'],
  ['lg-l1', 'lg-l2'],
  ['lg-l2', 'lg-l3'],
  ['lg-l3', 'lg-l4'],
  ['lg-l4', 'lg-l5'],
  ['lg-l5', 'lg-l6'],
  ['lg-l6', 'lg-l7'],
  ['lg-g1', 'lg-g2'],
  ['lg-g2', 'lg-g3'],
  ['lg-g3', 'lg-g4'],
  ['lg-g4', 'lg-g5'],
  ['lg-g5', 'lg-g6'],
  ['lg-g6', 'lg-g7'],
  ['lg-g7', 'lg-g8'],
  ['lg-g8', 'lg-g9'],
  ['lg-g9', 'lg-g10'],
  ['lg-g10', 'lg-g11'],
  ['lg-g11', 'lg-g12'],
  ['lg-g12', 'lg-g13'],
  ['lg-g13', 'lg-g14'],
  ['lg-g14', 'lg-g15'],
  ['lg-g15', 'lg-g16'],
  ['lg-g16', 'lg-g17'],
  ['lg-g17', 'lg-g18'],
  ['lg-g18', 'lg-g19'],
  ['lg-g19', 'lg-g20'],
  ['lg-g20', 'lg-g1'],
  ['lg-g17', 'lg-g9'],
  ['lg-i1', 'lg-i2'],
  ['lg-i2', 'lg-i3'],
  ['lg-i3', 'lg-i4'],
  ['lg-i4', 'lg-i5'],
  ['lg-i5', 'lg-i6'],
  ['lg-i6', 'lg-i7'],
  ['lg-i7', 'lg-i8'],
  ['lg-i8', 'lg-i9'],
  ['lg-i9', 'lg-i10'],
  ['lg-i10', 'lg-i11'],
  ['lg-i11', 'lg-i1'],
  ['lg-s1', 'lg-s2'],
  ['lg-s2', 'lg-s3'],
  ['lg-s3', 'lg-s4'],
  ['lg-s4', 'lg-s5'],
  ['lg-s5', 'lg-s6'],
  ['lg-s6', 'lg-s7'],
  ['lg-s7', 'lg-s8'],
  ['lg-s8', 'lg-i1'],
  ['lg-i2', 'lg-s9'],
  ['lg-v1', 'lg-b1'],
  ['lg-b1', 'lg-b2'],
  ['lg-b2', 'lg-b3'],
  ['lg-b3', 'lg-b4'],
  ['lg-b4', 'lg-b5'],
  ['lg-b5', 'lg-b6'],
  ['lg-b6', 'lg-b7'],
  ['lg-b7', 'lg-b8'],
  ['lg-b8', 'lg-b9'],
  ['lg-b9', 'lg-b10'],
  ['lg-b10', 'lg-b11'],
  ['lg-b11', 'lg-b12'],
  ['lg-b12', 'lg-b13'],
  ['lg-s9', 'lg-b13'],
  ['lg-b13', 'lg-k1'],
  ['lg-k1', 'lg-k2'],
  ['lg-k2', 'lg-k3'],
  ['lg-k3', 'lg-k4'],
  ['lg-k4', 'lg-i7'],
  ['lg-i7', 'lg-h1'],
  ['lg-h1', 'lg-h2'],
  ['lg-h2', 'lg-h3'],
  ['lg-h3', 'lg-h4'],
  ['lg-h4', 'lg-h5'],
  ['lg-h5', 'lg-h6'],
  ['lg-h6', 'lg-h7'],
  ['lg-v1', 'lg-nj'],
  ['lg-nj', 'lg-bk1'],
  ['lg-bk1', 'lg-bk2'],
  ['lg-bk2', 'lg-bk3'],
  ['lg-bk3', 'lg-bk4'],
  ['lg-bk4', 'lg-tip'],
  ['lg-tip', 'lg-f1'],
  ['lg-f1', 'lg-f2'],
  ['lg-f2', 'lg-h5'],
  ['lg-v1', 'lg-v2'],
  ['lg-v2', 'lg-v3'],
  ['lg-v3', 'lg-v4'],
  ['lg-v4', 'lg-v5'],
  ['lg-v5', 'lg-v6'],
  ['lg-v6', 'lg-v7'],
  ['lg-v7', 'lg-v8'],
  ['lg-v8', 'lg-v9'],
  ['lg-v9', 'lg-bk2'],
  ['lg-va', 'lg-vf1'],
  ['lg-vf1', 'lg-vf2'],
  ['lg-vf2', 'lg-vf3'],
  ['lg-v1', 'lg-va'],
  ['lg-vg1', 'lg-vg2'],
  ['lg-vg2', 'lg-vg3'],
  ['lg-va', 'lg-vg1'],
  ['lg-tip', 'lg-a1'],
  ['lg-a1', 'lg-a2'],
  ['lg-a2', 'lg-a3'],
  ['lg-a3', 'lg-a4'],
  ['lg-a4', 'lg-a5'],
  ['lg-a5', 'lg-a6'],
  ['lg-a6', 'lg-a7'],
  ['lg-a7', 'lg-a8'],
  ['lg-a8', 'lg-a9'],
  ['lg-a9', 'lg-a10'],
  ['lg-a10', 'lg-a11'],
  ['lg-a11', 'lg-a12'],
  ['lg-a12', 'lg-a13'],
  ['lg-a3', 'lg-a14'],
  ['lg-a14', 'lg-a15'],
  ['lg-a15', 'lg-h7'],
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
