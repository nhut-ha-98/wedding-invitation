/**
 * Constellation background data model.
 *
 * Full-width centered astronomical layout in `0..1000 x 0..1600`:
 *   - Aquarius (upper sky: y 160..570, center: 510, 390)
 *   - Open celestial clearing (center gap: y 570..1090, ~520px open space)
 *   - Cancer (lower sky: y 1090..1410, center: 510, 1270)
 *
 * Scaled with `preserveAspectRatio="xMidYMid meet"`, preventing any clipping
 * while opening a dedicated central clearing for the final Thank You scene.
 */

export type ConstellationSet = 'aquarius' | 'cancer';

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

// ── Aquarius (bride) — UPPER SKY (y: 160..570) ──
const aquariusSpecs: StarSpec[] = [
  { id: 'aq-01', x: 430, y: 280, r: 3.8, halo: true }, // Sadalmelik (α)
  { id: 'aq-02', x: 300, y: 220, r: 3.6, halo: true }, // Sadalsuud (β)
  { id: 'aq-03', x: 270, y: 160, r: 2.4, halo: true }, // Sadachbia (γ)
  { id: 'aq-04', x: 340, y: 370, r: 2.8 },
  { id: 'aq-05', x: 270, y: 440, r: 2.4 },
  { id: 'aq-06', x: 220, y: 510, r: 2.4 },
  { id: 'aq-07', x: 360, y: 520, r: 2.2 },
  { id: 'aq-08', x: 540, y: 300, r: 3.4, halo: true },
  { id: 'aq-09', x: 520, y: 390, r: 2.4 },
  { id: 'aq-10', x: 520, y: 470, r: 2.3 },
  { id: 'aq-11', x: 560, y: 540, r: 2.2 },
  { id: 'aq-12', x: 680, y: 300, r: 3.4, halo: true },
  { id: 'aq-13', x: 660, y: 390, r: 2.3 },
  { id: 'aq-14', x: 760, y: 410, r: 2.6 },
  { id: 'aq-15', x: 840, y: 350, r: 2.4 },
  { id: 'aq-16', x: 890, y: 290, r: 2.2 },
  { id: 'aq-17', x: 820, y: 520, r: 2.2 },
  { id: 'aq-18', x: 740, y: 570, r: 2.0 },
];

// ── Cancer (groom) — LOWER SKY (y: 1090..1410) ──
const cancerSpecs: StarSpec[] = [
  { id: 'cn-01', x: 470, y: 1370, r: 3.8, halo: true }, // Altarf (β)
  { id: 'cn-02', x: 430, y: 1200, r: 3.8, halo: true }, // Asellus Australis (δ)
  { id: 'cn-03', x: 540, y: 1240, r: 3.4, halo: true }, // Asellus Borealis (γ)
  { id: 'cn-04', x: 600, y: 1120, r: 2.4 },
  { id: 'cn-05', x: 700, y: 1200, r: 2.4 },
  { id: 'cn-06', x: 760, y: 1290, r: 2.3 },
  { id: 'cn-07', x: 330, y: 1130, r: 2.4 },
  { id: 'cn-08', x: 250, y: 1130, r: 2.2 },
  { id: 'cn-09', x: 370, y: 1090, r: 2.2 },
  { id: 'cn-10', x: 300, y: 1220, r: 2.2 },
  { id: 'cn-11', x: 360, y: 1340, r: 2.4 },
  { id: 'cn-12', x: 600, y: 1370, r: 2.4 },
  { id: 'cn-13', x: 680, y: 1410, r: 2.2 },
  { id: 'cn-14', x: 470, y: 1170, r: 1.9, halo: true }, // Beehive cluster (M44)
  { id: 'cn-15', x: 510, y: 1200, r: 1.8 },
  { id: 'cn-16', x: 450, y: 1220, r: 1.8 },
  { id: 'cn-17', x: 560, y: 1390, r: 2.0 },
  { id: 'cn-18', x: 800, y: 1150, r: 2.0 },
];

// ── Logo Silhouette (Groom, Bride & Calligraphy) ──
const logoSpecs: StarSpec[] = [
  // Outer Circle Frame
  { id: 'lg-c1', x: 500, y: 100, r: 2.2 },
  { id: 'lg-c2', x: 783, y: 217, r: 2.0 },
  { id: 'lg-c3', x: 900, y: 500, r: 2.2 },
  { id: 'lg-c4', x: 783, y: 783, r: 2.0 },
  { id: 'lg-c5', x: 500, y: 900, r: 2.2 },
  { id: 'lg-c6', x: 217, y: 783, r: 2.0 },
  { id: 'lg-c7', x: 100, y: 500, r: 2.2 },
  { id: 'lg-c8', x: 217, y: 217, r: 2.0 },

  // Groom Silhouette (Left)
  { id: 'lg-g1', x: 390, y: 200, r: 3.4, halo: true }, // Head top
  { id: 'lg-g2', x: 430, y: 230, r: 2.4 }, // Face profile
  { id: 'lg-g3', x: 410, y: 280, r: 2.2 }, // Chin/Neck
  { id: 'lg-g4', x: 330, y: 320, r: 2.8 }, // Back shoulder
  { id: 'lg-g5', x: 360, y: 450, r: 2.2 }, // Mid back
  { id: 'lg-g6', x: 400, y: 340, r: 2.4 }, // Chest
  { id: 'lg-g7', x: 410, y: 460, r: 2.2 }, // Mid front
  { id: 'lg-g8', x: 330, y: 750, r: 3.0, halo: true }, // Base left
  { id: 'lg-g9', x: 440, y: 750, r: 3.0, halo: true }, // Base right
  { id: 'lg-g10', x: 360, y: 600, r: 2.0 }, // Leg back
  { id: 'lg-g11', x: 410, y: 600, r: 2.0 }, // Leg front

  // Bride Silhouette (Right)
  { id: 'lg-b1', x: 480, y: 220, r: 3.4, halo: true }, // Head top
  { id: 'lg-b2', x: 450, y: 260, r: 2.4 }, // Face profile
  { id: 'lg-b3', x: 470, y: 300, r: 2.2 }, // Neck
  { id: 'lg-b4', x: 450, y: 390, r: 2.4 }, // Chest
  { id: 'lg-b5', x: 480, y: 480, r: 2.6 }, // Waist front
  { id: 'lg-b6', x: 520, y: 250, r: 2.8 }, // Veil top back
  { id: 'lg-b7', x: 590, y: 340, r: 2.4 }, // Veil flow mid
  { id: 'lg-b8', x: 610, y: 420, r: 2.6 }, // Veil flow right
  { id: 'lg-b9', x: 560, y: 470, r: 2.2 }, // Veil flow bottom
  { id: 'lg-b10', x: 520, y: 450, r: 2.2 }, // Waist back

  // Calligraphy Sweeps
  { id: 'lg-s1', x: 280, y: 620, r: 2.8, halo: true }, // Left swirl tail
  { id: 'lg-s2', x: 350, y: 490, r: 2.4 }, // Left arch peak
  { id: 'lg-s3', x: 510, y: 600, r: 2.6, halo: true }, // Center cross intersection
  { id: 'lg-s4', x: 650, y: 540, r: 2.8, halo: true }, // Right arch peak
  { id: 'lg-s5', x: 690, y: 700, r: 2.4 }, // Right sweep dip
  { id: 'lg-s6', x: 750, y: 680, r: 3.0, halo: true }, // Right swirl tail end
  { id: 'lg-s7', x: 570, y: 560, r: 2.0 }, // Inner loop top
  { id: 'lg-s8', x: 610, y: 720, r: 2.2 }, // Inner loop bottom
  { id: 'lg-s9', x: 550, y: 660, r: 2.0 }, // Inner loop left
];

const logoLinePairs: ReadonlyArray<readonly [string, string]> = [
  // Outer Circle
  ['lg-c1', 'lg-c2'],
  ['lg-c2', 'lg-c3'],
  ['lg-c3', 'lg-c4'],
  ['lg-c4', 'lg-c5'],
  ['lg-c5', 'lg-c6'],
  ['lg-c6', 'lg-c7'],
  ['lg-c7', 'lg-c8'],
  ['lg-c8', 'lg-c1'],

  // Groom Body
  ['lg-g1', 'lg-g2'],
  ['lg-g2', 'lg-g3'],
  ['lg-g3', 'lg-g6'],
  ['lg-g6', 'lg-g7'],
  ['lg-g7', 'lg-g11'],
  ['lg-g11', 'lg-g9'],
  ['lg-g9', 'lg-g8'],
  ['lg-g8', 'lg-g10'],
  ['lg-g10', 'lg-g5'],
  ['lg-g5', 'lg-g4'],
  ['lg-g4', 'lg-g1'],

  // Bride Body & Veil
  ['lg-b1', 'lg-b2'],
  ['lg-b2', 'lg-b3'],
  ['lg-b3', 'lg-b4'],
  ['lg-b4', 'lg-b5'],
  ['lg-b1', 'lg-b6'],
  ['lg-b6', 'lg-b7'],
  ['lg-b7', 'lg-b8'],
  ['lg-b8', 'lg-b9'],
  ['lg-b9', 'lg-b10'],
  ['lg-b10', 'lg-b5'],

  // Calligraphy Sweeps
  ['lg-s1', 'lg-s2'],
  ['lg-s2', 'lg-s3'],
  ['lg-s3', 'lg-s4'],
  ['lg-s4', 'lg-s6'],  // Outer connecting sweep
  ['lg-s3', 'lg-s9'],  // Inner 'a' loop setup
  ['lg-s9', 'lg-s8'],
  ['lg-s8', 'lg-s5'],
  ['lg-s5', 'lg-s6'],
  ['lg-s5', 'lg-s7'],
  ['lg-s7', 'lg-s4']
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

export const AQUARIUS_STARS: ConstellationStar[] = buildStars(
  aquariusSpecs,
  0.04,
  0.18,
  0.92,
  'aquarius',
);

export const CANCER_STARS: ConstellationStar[] = buildStars(
  cancerSpecs,
  0.42,
  0.58,
  0.92,
  'cancer',
);

export const CONSTELLATION_STARS: ConstellationStar[] = [...AQUARIUS_STARS, ...CANCER_STARS];

const aquariusLinePairs: ReadonlyArray<readonly [string, string]> = [
  ['aq-02', 'aq-01'],
  ['aq-01', 'aq-08'],
  ['aq-08', 'aq-12'],
  ['aq-12', 'aq-14'],
  ['aq-14', 'aq-15'],
  ['aq-15', 'aq-16'],
  ['aq-01', 'aq-04'],
  ['aq-04', 'aq-05'],
  ['aq-05', 'aq-06'],
  ['aq-04', 'aq-07'],
  ['aq-08', 'aq-09'],
  ['aq-09', 'aq-10'],
  ['aq-10', 'aq-11'],
  ['aq-13', 'aq-14'],
  ['aq-15', 'aq-17'],
  ['aq-17', 'aq-18'],
];

const cancerLinePairs: ReadonlyArray<readonly [string, string]> = [
  ['cn-02', 'cn-03'],
  ['cn-03', 'cn-01'],
  ['cn-01', 'cn-12'],
  ['cn-12', 'cn-13'],
  ['cn-02', 'cn-07'],
  ['cn-07', 'cn-10'],
  ['cn-07', 'cn-08'],
  ['cn-03', 'cn-04'],
  ['cn-04', 'cn-05'],
  ['cn-05', 'cn-06'],
  ['cn-06', 'cn-18'],
  ['cn-02', 'cn-14'],
  ['cn-14', 'cn-15'],
  ['cn-14', 'cn-16'],
  ['cn-16', 'cn-11'],
];

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

export const AQUARIUS_LINES: ConstellationLine[] = buildLines(
  aquariusLinePairs,
  0.08,
  0.38,
  'al',
  'aquarius',
);

export const CANCER_LINES: ConstellationLine[] = buildLines(
  cancerLinePairs,
  0.46,
  0.78,
  'cl',
  'cancer',
);

export const CONSTELLATION_LINES: ConstellationLine[] = [...AQUARIUS_LINES, ...CANCER_LINES];

/** Both constellations connect completely before dual awakening */
export const DUAL_AWAKENING_TRIGGER = 0.82;

export const AQUARIUS_CENTRE = { x: 510, y: 390 };
export const CANCER_CENTRE = { x: 510, y: 1270 };

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
