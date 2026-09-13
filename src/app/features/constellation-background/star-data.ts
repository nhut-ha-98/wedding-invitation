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
