/**
 * Constellation background data model.
 *
 * Stylised placement in a fixed logical space `0..1000 x 0..1600` (rendered
 * with `preserveAspectRatio="xMidYMid slice"`, so coordinates are stable
 * across viewport sizes — no re-measuring on resize).
 *
 * Two fully-populated constellations, deliberately separated:
 *   - `aquarius` (top half) — bride's sky, blue threads & stars
 *   - `cancer`   (bottom half) — groom's sky, yellow threads & stars
 *
 * They are never linked: each is its own complete story.
 * Each star/line carries a scroll-progress window: opacity (stars) and the
 * drawn length (lines) are interpolated with a smoothstep between start..end.
 * Aquarius connects during the first half of the scroll, Cancer during the
 * second — both only ever fully drawn at the very bottom of the page.
 * A star shines the moment one of its connecting threads begins.
 */

export type ConstellationSet = 'aquarius' | 'cancer';

export interface ConstellationStar {
  id: string;
  x: number;
  y: number;
  r: number;
  set: ConstellationSet;
  /** peak opacity */
  alpha: number;
  /** progress at which the star starts appearing */
  start: number;
  /** progress at which it is fully lit */
  end: number;
  /** soft radial halo (static glow) */
  halo?: boolean;
}

export interface ConstellationLine {
  id: string;
  from: string;
  to: string;
  /** line colour family: aquarius | cancer */
  set: ConstellationSet;
  start: number;
  end: number;
}

interface StarSpec {
  id: string;
  x: number;
  y: number;
  r: number;
  halo?: boolean;
}

/** Spread a group's appearance window across its stars for an organic stagger. */
function spreadStars(
  specs: StarSpec[],
  startLo: number,
  startHi: number,
  endLo: number,
  endHi: number,
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
      start: startLo + (startHi - startLo) * f,
      end: endLo + (endHi - endLo) * f,
    };
  });
}

/** Stagger lines across a draw window so they connect one by one over scroll. */
function spreadLines(
  pairs: ReadonlyArray<readonly [string, string]>,
  lo: number,
  hi: number,
  prefix: string,
  set: ConstellationSet,
): ConstellationLine[] {
  const span = hi - lo;
  return pairs.map(([from, to], i) => {
    const f = pairs.length <= 1 ? 0.5 : i / (pairs.length - 1);
    const start = lo + span * f;
    return { id: `${prefix}-${i}`, from, to, set, start, end: Math.min(hi, start + span * 0.42) };
  });
}

// ── Aquarius (bride) — TOP half, the water-bearer ──
// Bright dipper (β Sadalsuud → α Sadalmelik → γ Sadachbia → δ Skat → ε Albali),
// a pouring stream falling on the right.

const aquariusSpecs: StarSpec[] = [
  { id: 'aq-01', x: 430, y: 590, r: 3.8, halo: true },
  { id: 'aq-02', x: 300, y: 530, r: 3.4, halo: true },
  { id: 'aq-03', x: 270, y: 470, r: 2.2 },
  { id: 'aq-04', x: 340, y: 680, r: 2.8 },
  { id: 'aq-05', x: 270, y: 750, r: 2.3 },
  { id: 'aq-06', x: 220, y: 820, r: 2.2 },
  { id: 'aq-07', x: 360, y: 830, r: 2.1 },
  { id: 'aq-08', x: 540, y: 610, r: 3.2 },
  { id: 'aq-09', x: 520, y: 700, r: 2.2 },
  { id: 'aq-10', x: 520, y: 780, r: 2.1 },
  { id: 'aq-11', x: 560, y: 850, r: 2.0 },
  { id: 'aq-12', x: 680, y: 610, r: 3.2 },
  { id: 'aq-13', x: 660, y: 700, r: 2.1 },
  { id: 'aq-14', x: 760, y: 720, r: 2.4 },
  { id: 'aq-15', x: 840, y: 660, r: 2.1 },
  { id: 'aq-16', x: 890, y: 600, r: 2.0 },
  { id: 'aq-17', x: 820, y: 830, r: 2.0 },
  { id: 'aq-18', x: 740, y: 880, r: 1.9 },
];

// ── Cancer (groom) — BOTTOM half, the crab ──
// Central γ–δ–β sickle (Asellus Borealis, Asellus Australis, Altarf),
// antennae reaching up, legs falling right, and the M44 "Beehive" flake
// cluster tucked against the sickle.

const cancerSpecs: StarSpec[] = [
  { id: 'cn-01', x: 470, y: 1180, r: 3.8, halo: true },
  { id: 'cn-02', x: 430, y: 1010, r: 3.6, halo: true },
  { id: 'cn-03', x: 540, y: 1050, r: 3.2 },
  { id: 'cn-04', x: 600, y: 930, r: 2.2 },
  { id: 'cn-05', x: 700, y: 1010, r: 2.2 },
  { id: 'cn-06', x: 760, y: 1100, r: 2.1 },
  { id: 'cn-07', x: 330, y: 940, r: 2.2 },
  { id: 'cn-08', x: 250, y: 940, r: 2.0 },
  { id: 'cn-09', x: 370, y: 900, r: 2.0 },
  { id: 'cn-10', x: 300, y: 1030, r: 2.0 },
  { id: 'cn-11', x: 360, y: 1150, r: 2.2 },
  { id: 'cn-12', x: 600, y: 1180, r: 2.2 },
  { id: 'cn-13', x: 680, y: 1220, r: 2.0 },
  { id: 'cn-14', x: 470, y: 980, r: 1.8, halo: true },
  { id: 'cn-15', x: 510, y: 1010, r: 1.6 },
  { id: 'cn-16', x: 450, y: 1030, r: 1.6 },
  { id: 'cn-17', x: 560, y: 1200, r: 1.9 },
  { id: 'cn-18', x: 800, y: 960, r: 1.8 },
];

export const CONSTELLATION_STARS: ConstellationStar[] = [
  ...spreadStars(aquariusSpecs, 0.22, 0.4, 0.5, 0.78, 0.62, 'aquarius'),
  ...spreadStars(cancerSpecs, 0.5, 0.68, 0.74, 0.98, 0.62, 'cancer'),
];

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

export const CONSTELLATION_LINES: ConstellationLine[] = [
  ...spreadLines(aquariusLinePairs, 0.3, 0.68, 'al', 'aquarius'),
  ...spreadLines(cancerLinePairs, 0.62, 0.98, 'cl', 'cancer'),
];

function centroidOf(set: ConstellationSet): { x: number; y: number } {
  const pts = CONSTELLATION_STARS.filter((s) => s.set === set);
  const x = pts.reduce((acc, p) => acc + p.x, 0) / pts.length;
  const y = pts.reduce((acc, p) => acc + p.y, 0) / pts.length;
  return { x, y };
}

export const AQUARIUS_CENTRE = centroidOf('aquarius');
export const CANCER_CENTRE = centroidOf('cancer');

const BY_ID = new Map(CONSTELLATION_STARS.map((s) => [s.id, s]));

export function constellationStarById(id: string): ConstellationStar {
  const star = BY_ID.get(id);
  if (!star) {
    throw new Error(`Unknown constellation star "${id}"`);
  }
  return star;
}

/** Line `d` string from the two star coordinates. */
export function constellationLineD(line: ConstellationLine): string {
  const from = constellationStarById(line.from);
  const to = constellationStarById(line.to);
  return `M${from.x},${from.y} L${to.x},${to.y}`;
}
