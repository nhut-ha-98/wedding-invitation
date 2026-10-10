/** Reference-derived starlight data for the constellation background. */

export const STARLIGHT_VIEWBOX = '0 0 1280 1240' as const;
export const STARLIGHT_PARTS = [
  'orbit',
  'sky',
  'groom',
  'bride',
  'veil',
  'dress',
  'train',
  'ribbon',
] as const;
export type StarlightPart = (typeof STARLIGHT_PARTS)[number];
export type StarlightStarKind = 'anchor' | 'minor' | 'accent';

export interface StarlightEdge {
  readonly id: string;
  readonly part: StarlightPart;
  readonly path: string;
  readonly detail?: boolean;
  readonly revealStart: number;
  readonly revealEnd: number;
}

export interface StarlightStar {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly kind: StarlightStarKind;
  readonly edgeId?: string;
  readonly edgeProgress?: number;
  readonly revealAt: number;
  readonly power: number;
  readonly twinkle: boolean;
}

export interface StarlightDecoration {
  readonly id: string;
  readonly kind: 'silk' | 'dust';
  readonly part: StarlightPart;
  readonly path?: string;
  readonly x?: number;
  readonly y?: number;
  readonly r?: number;
  readonly opacity?: number;
  readonly revealAt: number;
}

interface EdgePathSpec {
  readonly id: string;
  readonly detail: boolean;
  readonly path: string;
}
const EDGE_PATHS_BY_PART: Readonly<Record<StarlightPart, readonly EdgePathSpec[]>> = {
  orbit: [
    { id: 'orbit-left-bottom', detail: false, path: 'M 175,982 C 104,879 68,769 69,650' },
    { id: 'orbit-left-middle', detail: false, path: 'M 69,650 C 68,490 132,341 263,225' },
    { id: 'orbit-left-top', detail: false, path: 'M 263,225 C 366,133 490,86 634,88' },
    { id: 'orbit-right-top', detail: false, path: 'M 634,88 C 788,84 924,139 1018,241' },
    { id: 'orbit-right-middle', detail: false, path: 'M 1018,241 C 1130,357 1199,501 1200,650' },
    { id: 'orbit-right-bottom', detail: false, path: 'M 1200,650 C 1204,764 1172,874 1109,968' },
    { id: 'orbit-bottom', detail: false, path: 'M 362,1081 C 531,1117 762,1119 913,1080' },
    {
      id: 'orbit-inner-left',
      detail: true,
      path: 'M 163,935 C 37,702 95,427 278,237 C 372,140 503,105 634,104',
    },
    {
      id: 'orbit-inner-right',
      detail: true,
      path: 'M 634,104 C 930,107 1175,351 1180,646 C 1182,761 1150,866 1090,945',
    },
  ],
  sky: [
    {
      id: 'sky-north-east',
      detail: false,
      path: 'M 685,220 L 733,186 L 808,270 L 902,300 L 1018,241',
    },
    {
      id: 'sky-east',
      detail: false,
      path: 'M 1018,241 L 982,423 L 1085,489 L 983,529 L 954,589 L 1069,635 L 1085,489',
    },
    { id: 'sky-west', detail: false, path: 'M 141,415 L 193,497 L 106,500 L 141,415' },
    { id: 'sky-west-branch', detail: false, path: 'M 193,497 L 268,431 L 283,365 L 328,413' },
    {
      id: 'sky-south-west',
      detail: false,
      path: 'M 202,902 L 175,982 L 116,975 L 75,1026 L 66,1070',
    },
    { id: 'sky-south-west-branch', detail: false, path: 'M 75,1026 L 31,1047' },
    { id: 'sky-south-east', detail: false, path: 'M 941,758 L 884,837 L 974,909 L 1014,767' },
  ],
  groom: [
    {
      id: 'groom-hair-outline',
      detail: false,
      path: 'M 347,304 C 360,282 348,258 357,236 C 370,218 374,209 388,209 C 413,208 449,211 466,226 C 466,239 458,248 450,255',
    },
    {
      id: 'groom-profile',
      detail: false,
      path: 'M 450,255 C 443,267 448,279 450,285 C 451,291 454,297 453,301 C 451,303 446,303 444,305 C 442,307 447,309 442,312 C 437,315 437,329 428,331 C 420,332 410,326 403,323',
    },
    { id: 'groom-neck', detail: false, path: 'M 403,323 C 398,332 394,339 391,345 L 409,394' },
    { id: 'groom-hair-sweep', detail: true, path: 'M 357,236 C 390,232 423,253 466,226' },
    { id: 'groom-hair-lock', detail: true, path: 'M 388,209 C 398,228 391,252 385,268 L 357,291' },
    { id: 'groom-temple', detail: true, path: 'M 385,268 C 405,258 428,253 450,255' },
    {
      id: 'groom-shoulder',
      detail: false,
      path: 'M 347,304 C 329,321 300,340 283,365 C 300,393 317,407 328,413',
    },
    { id: 'groom-back', detail: false, path: 'M 328,413 C 342,456 341,507 342,554' },
    { id: 'groom-jacket-hem', detail: false, path: 'M 342,554 C 366,549 406,552 432,563' },
    { id: 'groom-front', detail: false, path: 'M 409,394 C 423,435 434,496 432,563' },
    {
      id: 'groom-lapel-outer',
      detail: false,
      path: 'M 347,304 C 362,324 377,336 391,345 L 380,359 C 395,390 411,439 417,484',
    },
    {
      id: 'groom-sleeve',
      detail: true,
      path: 'M 313,385 C 323,428 346,471 373,501 C 384,511 395,517 405,520',
    },
    {
      id: 'groom-leg-left',
      detail: false,
      path: 'M 334,615 C 332,731 331,824 335,906 L 309,970 L 261,1011',
    },
    {
      id: 'groom-leg-inside',
      detail: false,
      path: 'M 366,634 C 364,715 379,782 378,847 L 349,939 L 337,980',
    },
    {
      id: 'groom-leg-right',
      detail: false,
      path: 'M 430,623 C 432,681 419,743 433,809 L 429,940 L 464,981 L 493,1007',
    },
    {
      id: 'groom-shoes',
      detail: false,
      path: 'M 261,1011 C 281,998 312,996 337,980 L 358,987 L 349,1009 M 349,1009 L 493,1007',
    },
  ],
  bride: [
    {
      id: 'bride-hair-crown',
      detail: false,
      path: 'M 535,308 C 514,279 537,261 551,266 C 575,247 600,250 614,270 L 625,297',
    },
    {
      id: 'bride-profile',
      detail: false,
      path: 'M 535,308 C 536,316 532,321 529,324 C 525,327 530,330 534,331 C 537,332 533,337 537,339 C 541,341 538,347 544,350 C 550,354 560,349 565,346',
    },
    {
      id: 'bride-neck',
      detail: false,
      path: 'M 565,346 C 569,361 572,376 563,390 C 555,402 539,408 532,420 C 528,426 527,432 528,437',
    },
    { id: 'bride-hairline', detail: false, path: 'M 551,266 C 553,291 566,314 584,327 L 600,338' },
    {
      id: 'bride-bun',
      detail: false,
      path: 'M 625,297 C 648,305 644,336 622,345 C 606,352 599,346 600,338 C 614,334 631,320 625,297',
    },
    {
      id: 'bride-hair-sweep',
      detail: true,
      path: 'M 551,266 C 561,294 593,301 625,297 M 541,278 C 558,311 595,322 625,297',
    },
    { id: 'bride-hair-strand', detail: true, path: 'M 570,264 C 592,268 608,279 615,292' },
    {
      id: 'bride-neckline',
      detail: false,
      path: 'M 600,338 C 598,360 609,382 610,400 C 618,445 584,478 572,535',
    },
    {
      id: 'bride-shoulder',
      detail: false,
      path: 'M 528,437 C 540,444 552,436 560,423 C 568,408 577,398 587,393',
    },
    {
      id: 'bride-arm',
      detail: false,
      path: 'M 528,437 C 524,451 525,466 530,479 C 534,516 518,560 493,604',
    },
    {
      id: 'bride-arm-inner',
      detail: true,
      path: 'M 560,423 C 561,452 551,489 544,519 C 535,552 519,577 505,592',
    },
    {
      id: 'bride-fingers',
      detail: true,
      path: 'M 493,604 L 483,611 M 498,608 L 490,618 M 504,611 L 498,621',
    },
  ],
  veil: [
    { id: 'veil-upper', detail: false, path: 'M 625,297 C 679,306 686,489 811,551' },
    {
      id: 'veil-lower',
      detail: false,
      path: 'M 811,551 C 790,571 780,599 752,606 C 711,630 671,559 623,588',
    },
    { id: 'veil-inner-one', detail: true, path: 'M 638,310 C 681,399 684,541 761,587' },
    { id: 'veil-inner-two', detail: true, path: 'M 649,319 C 681,335 727,514 779,556 L 811,551' },
    { id: 'veil-fold-left', detail: true, path: 'M 622,345 C 643,418 609,505 623,588' },
    {
      id: 'veil-fold-middle',
      detail: true,
      path: 'M 637,349 C 672,435 630,499 655,574 C 672,580 688,595 711,601',
    },
    { id: 'veil-stitch', detail: true, path: 'M 631,349 C 656,440 620,503 632,576' },
  ],
  dress: [
    {
      id: 'dress-outer-left',
      detail: false,
      path: 'M 572,535 C 570,600 580,654 585,736 C 588,868 532,955 464,981',
    },
    {
      id: 'dress-outer-right',
      detail: false,
      path: 'M 572,535 C 621,612 658,689 699,779 C 739,866 770,919 821,950',
    },
    {
      id: 'dress-fold-one',
      detail: true,
      path: 'M 578,557 C 594,645 624,704 636,779 C 648,862 678,939 745,1023',
    },
    {
      id: 'dress-fold-two',
      detail: true,
      path: 'M 592,586 C 591,669 618,738 647,823 C 684,930 756,1000 818,998',
    },
    {
      id: 'dress-fold-three',
      detail: true,
      path: 'M 617,625 C 665,708 674,808 737,885 C 782,941 840,982 921,949',
    },
    { id: 'dress-fold-left', detail: true, path: 'M 568,647 C 579,796 554,918 493,950' },
    {
      id: 'dress-scallop',
      detail: false,
      path: 'M 464,981 C 490,1006 519,1002 550,1007 C 583,1024 614,1025 665,1004 C 690,1024 715,1031 745,1023',
    },
  ],
  train: [
    {
      id: 'dress-train-edge',
      detail: false,
      path: 'M 745,1023 C 846,1039 909,994 974,909 C 1001,943 1005,975 1025,1002 C 1073,1035 1134,1015 1168,969',
    },
    {
      id: 'train-upper',
      detail: false,
      path: 'M 699,779 C 754,735 811,693 893,695 C 958,694 1001,719 1014,767 C 1038,842 1026,957 1117,1002',
    },
    {
      id: 'train-inside',
      detail: true,
      path: 'M 715,795 C 770,748 826,708 894,719 C 936,726 950,766 959,817 L 974,909',
    },
    {
      id: 'train-curl',
      detail: true,
      path: 'M 821,950 C 873,974 930,934 941,897 C 954,861 934,810 941,758',
    },
    {
      id: 'train-hem',
      detail: true,
      path: 'M 550,1007 C 603,976 591,931 604,891 C 625,932 626,976 665,1004',
    },
    {
      id: 'train-right-fold',
      detail: true,
      path: 'M 974,909 C 1013,913 1043,953 1047,969 L 1117,1002 L 1168,969',
    },
  ],
  ribbon: [
    {
      id: 'ribbon-upper',
      detail: false,
      path: 'M 273,843 C 210,832 166,792 159,737 C 138,665 213,603 319,580 C 393,561 450,581 493,604 C 551,638 578,682 585,736',
    },
    {
      id: 'ribbon-lower',
      detail: false,
      path: 'M 273,843 C 229,842 190,826 184,807 C 151,772 190,692 229,654 C 290,595 399,598 469,633 C 540,674 553,743 556,810 C 559,881 515,942 464,981',
    },
    {
      id: 'ribbon-fold',
      detail: true,
      path: 'M 273,843 C 196,815 175,773 177,746 C 176,683 240,630 322,593 C 388,573 451,594 493,619 C 541,651 566,693 571,742 C 582,840 537,939 479,965',
    },
  ],
};

const PART_TIMINGS: Readonly<Record<StarlightPart, readonly [number, number]>> = {
  orbit: [0.05, 0.12],
  sky: [0.12, 0.18],
  groom: [0.18, 0.42],
  bride: [0.42, 0.54],
  veil: [0.54, 0.62],
  dress: [0.62, 0.72],
  train: [0.72, 0.8],
  ribbon: [0.8, 0.92],
};

export const STARLIGHT_EDGES: readonly StarlightEdge[] = Object.freeze(
  STARLIGHT_PARTS.flatMap((part) => {
    const paths = EDGE_PATHS_BY_PART[part];
    const [start, end] = PART_TIMINGS[part];
    return paths.map((edge, index) => {
      const revealStart = start + ((end - start) * index) / paths.length;
      const revealEnd = start + ((end - start) * (index + 1)) / paths.length;
      return Object.freeze({ ...edge, part, revealStart, revealEnd });
    });
  }),
);

type StarSpec = readonly [
  id: string,
  x: number,
  y: number,
  kind: StarlightStarKind,
  edgeId: string,
  edgeProgress: number,
  twinkle: boolean,
  power: number,
];
const STAR_SPECS: readonly StarSpec[] = [
  ['s001', 634, 88, 'accent', 'orbit-left-top', 1, true, 1],
  ['s002', 69, 650, 'accent', 'orbit-left-bottom', 1, true, 1],
  ['s003', 1200, 650, 'accent', 'orbit-right-bottom', 0, true, 1],
  ['s004', 634, 1105, 'accent', 'orbit-bottom', 0.4788, true, 1],
  ['s005', 263, 225, 'accent', 'orbit-left-middle', 1, true, 1],
  ['s006', 1018, 241, 'accent', 'orbit-right-middle', 0, true, 1],
  ['s007', 283, 365, 'accent', 'groom-shoulder', 0.5715, true, 0.8],
  ['s008', 388, 209, 'accent', 'groom-hair-lock', 0, true, 1],
  ['s009', 551, 266, 'accent', 'bride-hair-crown', 0.3755, true, 1],
  ['s010', 528, 437, 'anchor', 'bride-shoulder', 0, false, 0.55],
  ['s011', 493, 604, 'accent', 'bride-arm', 1, true, 1],
  ['s012', 811, 551, 'accent', 'veil-inner-two', 1, true, 1],
  ['s013', 585, 736, 'accent', 'dress-outer-left', 0.4098, true, 1],
  ['s014', 433, 809, 'accent', 'groom-leg-right', 0.4544, true, 1],
  ['s015', 335, 906, 'accent', 'groom-leg-left', 0.6876, true, 1],
  ['s016', 261, 1011, 'accent', 'groom-leg-left', 1, true, 1],
  ['s017', 893, 695, 'accent', 'train-upper', 0.3402, true, 1],
  ['s018', 941, 758, 'accent', 'sky-south-east', 0, true, 1],
  ['s019', 974, 909, 'accent', 'dress-train-edge', 0.5023, true, 1],
  ['s020', 1117, 1002, 'accent', 'train-right-fold', 0.7437, true, 1],
  ['s021', 159, 737, 'accent', 'ribbon-upper', 0.2185, true, 1],
  ['s022', 175, 982, 'anchor', 'orbit-left-bottom', 0, false, 1],
  ['s023', 138.8, 923.3, 'minor', 'orbit-left-bottom', 0.1948, false, 0.42],
  ['s025', 88.8, 801.2, 'minor', 'orbit-left-bottom', 0.5682, false, 0.42],
  ['s026', 75.2, 737.6, 'minor', 'orbit-left-bottom', 0.7519, false, 0.42],
  ['s028', 71.7, 590.6, 'minor', 'orbit-left-middle', 0.1234, false, 0.42],
  ['s029', 80.5, 532.4, 'minor', 'orbit-left-middle', 0.2455, false, 0.42],
  ['s031', 116.5, 421, 'minor', 'orbit-left-middle', 0.4887, false, 0.42],
  ['s032', 143.8, 368.3, 'minor', 'orbit-left-middle', 0.6119, false, 0.42],
  ['s034', 217, 270, 'minor', 'orbit-left-middle', 0.8665, false, 0.42],
  ['s035', 312.8, 185.2, 'minor', 'orbit-left-top', 0.1575, false, 0.42],
  ['s037', 421.6, 125.7, 'minor', 'orbit-left-top', 0.4641, false, 0.42],
  ['s038', 480.5, 106.2, 'minor', 'orbit-left-top', 0.6173, false, 0.42],
  ['s040', 607.2, 88.2, 'minor', 'orbit-left-top', 0.9339, false, 0.42],
  ['s041', 704.8, 90.4, 'minor', 'orbit-right-top', 0.1662, false, 0.42],
  ['s043', 836.2, 120, 'minor', 'orbit-right-top', 0.4831, false, 0.42],
  ['s044', 895.8, 146.7, 'minor', 'orbit-right-top', 0.6363, false, 0.42],
  ['s046', 999.9, 222.4, 'minor', 'orbit-right-top', 0.9392, false, 0.42],
  ['s047', 1057.9, 285.8, 'minor', 'orbit-right-middle', 0.1308, false, 0.42],
  ['s049', 1124.5, 382.1, 'minor', 'orbit-right-middle', 0.3865, false, 0.42],
  ['s050', 1156.3, 446.1, 'minor', 'orbit-right-middle', 0.5425, false, 0.42],
  ['s052', 1194.6, 580.6, 'minor', 'orbit-right-middle', 0.8481, false, 0.42],
  ['s053', 1109, 968, 'anchor', 'orbit-right-bottom', 1, false, 1],
  ['s055', 1189.6, 775.9, 'minor', 'orbit-right-bottom', 0.3767, false, 0.42],
  ['s056', 1173.5, 836.4, 'minor', 'orbit-right-bottom', 0.563, false, 0.42],
  ['s058', 1120.4, 950.2, 'minor', 'orbit-right-bottom', 0.937, false, 0.42],
  ['s059', 362, 1081, 'anchor', 'orbit-bottom', 0, false, 1],
  ['s060', 913, 1080, 'anchor', 'orbit-bottom', 1, false, 1],
  ['s061', 428, 1092.9, 'minor', 'orbit-bottom', 0.1209, false, 0.42],
  ['s062', 498.2, 1101.5, 'minor', 'orbit-bottom', 0.2482, false, 0.42],
  ['s064', 644.2, 1108.6, 'minor', 'orbit-bottom', 0.5118, false, 0.42],
  ['s065', 716.9, 1106.9, 'minor', 'orbit-bottom', 0.6427, false, 0.42],
  ['s067', 852.9, 1092.7, 'minor', 'orbit-bottom', 0.8893, false, 0.42],
  ['s068', 163, 935, 'anchor', 'orbit-inner-left', 0, false, 1],
  ['s069', 634, 104, 'anchor', 'orbit-inner-left', 1, false, 1],
  ['s070', 1090, 945, 'anchor', 'orbit-inner-right', 1, false, 1],
  ['s071', 685, 220, 'anchor', 'sky-north-east', 0, false, 1],
  ['s073', 783, 242, 'minor', 'sky-north-east', 0.3345, false, 0.42],
  ['s074', 831.5, 277.5, 'minor', 'sky-north-east', 0.4899, false, 0.42],
  ['s076', 950.3, 275.4, 'minor', 'sky-north-east', 0.8103, false, 0.42],
  ['s077', 1008.3, 245.9, 'minor', 'sky-north-east', 0.9729, false, 0.42],
  ['s078', 1085, 489, 'anchor', 'sky-east', 0.4079, false, 1],
  ['s079', 1003, 316.8, 'minor', 'sky-east', 0.1024, false, 0.42],
  ['s080', 988, 392.7, 'minor', 'sky-east', 0.2048, false, 0.42],
  ['s082', 1076.4, 483.5, 'minor', 'sky-east', 0.3944, false, 0.42],
  ['s083', 1034, 509, 'minor', 'sky-east', 0.4804, false, 0.42],
  ['s085', 963.6, 592.8, 'minor', 'sky-east', 0.655, false, 0.42],
  ['s086', 1030.7, 619.7, 'minor', 'sky-east', 0.7507, false, 0.42],
  ['s088', 1079.7, 537.7, 'minor', 'sky-east', 0.9351, false, 0.42],
  ['s089', 141, 415, 'anchor', 'sky-west', 0, false, 1],
  ['s091', 156.8, 498.2, 'minor', 'sky-west', 0.4831, false, 0.42],
  ['s092', 111.8, 485.8, 'minor', 'sky-west', 0.7225, false, 0.42],
  ['s093', 193, 497, 'anchor', 'sky-west', 0.3517, false, 1],
  ['s094', 328, 413, 'anchor', 'groom-back', 0, false, 0.65],
  ['s095', 243, 453, 'minor', 'sky-west-branch', 0.2854, false, 0.42],
  ['s097', 305.5, 389, 'minor', 'sky-west-branch', 0.859, false, 0.42],
  ['s098', 202, 902, 'anchor', 'sky-south-west', 0, false, 1],
  ['s099', 66, 1070, 'anchor', 'sky-south-west', 1, false, 1],
  ['s100', 181.8, 962, 'minor', 'sky-south-west', 0.2491, false, 0.42],
  ['s101', 130.8, 976.8, 'minor', 'sky-south-west', 0.5075, false, 0.42],
  ['s103', 75, 1026, 'anchor', 'sky-south-west', 0.8233, false, 1],
  ['s104', 31, 1047, 'anchor', 'sky-south-west-branch', 1, false, 1],
  ['s105', 1014, 767, 'anchor', 'sky-south-east', 1, false, 1],
  ['s106', 903, 810.7, 'minor', 'sky-south-east', 0.1803, false, 0.42],
  ['s107', 914, 861, 'minor', 'sky-south-east', 0.3771, false, 0.42],
  ['s109', 990.7, 849.8, 'minor', 'sky-south-east', 0.7611, false, 0.42],
  ['s110', 1010.7, 778.8, 'minor', 'sky-south-east', 0.9659, false, 0.42],
  ['s111', 347, 304, 'anchor', 'groom-hair-outline', 0, false, 1],
  ['s112', 450, 255, 'anchor', 'groom-hair-outline', 1, false, 0.45],
  ['s113', 355, 242.2, 'minor', 'groom-hair-outline', 0.2759, false, 0.42],
  ['s115', 460.7, 222.1, 'minor', 'groom-hair-outline', 0.8213, false, 0.42],
  ['s116', 403, 323, 'anchor', 'groom-neck', 0, false, 0.45],
  ['s118', 409, 394, 'anchor', 'groom-front', 0, false, 0.5],
  ['s120', 357, 291, 'anchor', 'groom-hair-lock', 1, false, 1],
  ['s121', 385, 268, 'anchor', 'groom-hair-lock', 0.6268, false, 1],
  ['s124', 438, 278, 'accent', 'groom-profile', 0.1862, false, 0.48],
  ['s128', 299.7, 345.2, 'minor', 'groom-shoulder', 0.4047, false, 0.42],
  ['s129', 342, 554, 'anchor', 'groom-back', 1, false, 0.65],
  ['s130', 339.6, 477.5, 'minor', 'groom-back', 0.4618, false, 0.45],
  ['s132', 432, 563, 'anchor', 'groom-front', 1, false, 0.7],
  ['s133', 404.4, 555, 'minor', 'groom-jacket-hem', 0.686, false, 0.42],
  ['s134', 424.8, 458.1, 'minor', 'groom-front', 0.3857, false, 0.42],
  ['s136', 417, 484, 'anchor', 'groom-lapel-outer', 1, false, 0.45],
  ['s141', 313, 385, 'anchor', 'groom-sleeve', 0, false, 0.45],
  ['s142', 405, 520, 'anchor', 'groom-sleeve', 1, false, 0.5],
  ['s145', 334, 615, 'anchor', 'groom-leg-left', 0, false, 1],
  ['s146', 333, 677.9, 'minor', 'groom-leg-left', 0.1486, false, 0.42],
  ['s148', 332.4, 808.5, 'minor', 'groom-leg-left', 0.4571, false, 0.42],
  ['s149', 333.7, 874.7, 'minor', 'groom-leg-left', 0.6137, false, 0.42],
  ['s151', 285, 990.5, 'minor', 'groom-leg-left', 0.9254, false, 0.42],
  ['s152', 366, 634, 'anchor', 'groom-leg-inside', 0, false, 1],
  ['s153', 337, 980, 'anchor', 'groom-leg-inside', 1, false, 1],
  ['s154', 367.6, 699.3, 'minor', 'groom-leg-inside', 0.1853, false, 0.42],
  ['s155', 373.5, 766, 'minor', 'groom-leg-inside', 0.3751, false, 0.42],
  ['s157', 363.5, 893, 'minor', 'groom-leg-inside', 0.7421, false, 0.42],
  ['s158', 345, 952.7, 'minor', 'groom-leg-inside', 0.9192, false, 0.42],
  ['s159', 430, 623, 'anchor', 'groom-leg-right', 0, false, 1],
  ['s160', 493, 1007, 'anchor', 'groom-leg-right', 1, false, 1],
  ['s161', 428.1, 689.9, 'minor', 'groom-leg-right', 0.1632, false, 0.42],
  ['s163', 432.7, 819.9, 'minor', 'groom-leg-right', 0.4811, false, 0.42],
  ['s164', 430.7, 885.4, 'minor', 'groom-leg-right', 0.6407, false, 0.42],
  ['s166', 478.5, 994, 'minor', 'groom-leg-right', 0.9526, false, 0.42],
  ['s169', 319.9, 988.8, 'minor', 'groom-shoes', 0.2318, false, 0.42],
  ['s170', 349.8, 1007.2, 'minor', 'groom-shoes', 0.4638, false, 0.42],
  ['s172', 535, 308, 'anchor', 'bride-hair-crown', 0, false, 0.45],
  ['s173', 625, 297, 'anchor', 'bride-bun', 0, false, 1],
  ['s175', 565, 346, 'anchor', 'bride-neck', 0, false, 0.45],
  ['s178', 600, 338, 'anchor', 'bride-bun', 0.631, false, 1],
  ['s179', 577.5, 321.7, 'minor', 'bride-hairline', 0.6938, false, 0.42],
  ['s180', 622, 345, 'minor', 'bride-bun', 0.4313, false, 0.42],
  ['s181', 624.7, 315.9, 'minor', 'bride-bun', 0.868, false, 0.42],
  ['s182', 570, 264, 'anchor', 'bride-hair-strand', 0, false, 1],
  ['s183', 615, 292, 'anchor', 'bride-hair-strand', 1, false, 1],
  ['s184', 548, 322, 'accent', 'bride-profile', 0.26, false, 0.5],
  ['s187', 572, 535, 'anchor', 'bride-neckline', 1, false, 1],
  ['s188', 610, 400, 'minor', 'bride-neckline', 0.3076, false, 0.42],
  ['s190', 574.5, 524.6, 'minor', 'bride-neckline', 0.9478, false, 0.42],
  ['s191', 587, 393, 'anchor', 'bride-shoulder', 1, false, 0.5],
  ['s193', 527.7, 496.9, 'minor', 'bride-arm', 0.3598, false, 0.42],
  ['s194', 514.1, 557.4, 'minor', 'bride-arm', 0.7106, false, 0.42],
  ['s195', 560, 423, 'anchor', 'bride-arm-inner', 0, false, 0.4],
  ['s196', 505, 592, 'anchor', 'bride-arm-inner', 1, false, 1],
  ['s197', 498, 621, 'anchor', 'bride-fingers', 1, false, 1],
  ['s199', 696, 414.4, 'minor', 'veil-upper', 0.4362, false, 0.42],
  ['s200', 729.9, 476.5, 'minor', 'veil-upper', 0.6553, false, 0.42],
  ['s202', 623, 588, 'anchor', 'veil-fold-left', 1, false, 1],
  ['s203', 768.1, 598.7, 'minor', 'veil-lower', 0.2934, false, 0.42],
  ['s204', 705.8, 603.2, 'minor', 'veil-lower', 0.595, false, 0.42],
  ['s205', 644.9, 581, 'minor', 'veil-lower', 0.8939, false, 0.42],
  ['s206', 638, 310, 'anchor', 'veil-inner-one', 0, false, 1],
  ['s207', 761, 587, 'anchor', 'veil-inner-one', 1, false, 1],
  ['s208', 649, 319, 'anchor', 'veil-inner-two', 0, false, 1],
  ['s209', 637, 349, 'anchor', 'veil-fold-middle', 0, false, 1],
  ['s210', 632, 576, 'anchor', 'veil-stitch', 1, false, 1],
  ['s211', 464, 981, 'anchor', 'dress-outer-left', 1, false, 1],
  ['s212', 573.5, 599.7, 'minor', 'dress-outer-left', 0.1317, false, 0.42],
  ['s214', 582.3, 794.5, 'minor', 'dress-outer-left', 0.529, false, 0.42],
  ['s215', 569.1, 855.5, 'minor', 'dress-outer-left', 0.6561, false, 0.42],
  ['s217', 500.7, 960, 'minor', 'dress-outer-left', 0.9138, false, 0.42],
  ['s218', 821, 950, 'anchor', 'dress-outer-right', 1, false, 1],
  ['s220', 638.5, 652.1, 'minor', 'dress-outer-right', 0.2758, false, 0.42],
  ['s221', 668.8, 713.7, 'minor', 'dress-outer-right', 0.4163, false, 0.42],
  ['s223', 724.3, 831.3, 'minor', 'dress-outer-right', 0.6825, false, 0.42],
  ['s224', 755.9, 885.5, 'minor', 'dress-outer-right', 0.8109, false, 0.42],
  ['s226', 578, 557, 'anchor', 'dress-fold-one', 0, false, 1],
  ['s227', 745, 1023, 'anchor', 'dress-fold-one', 1, false, 1],
  ['s228', 592, 586, 'anchor', 'dress-fold-two', 0, false, 1],
  ['s229', 818, 998, 'anchor', 'dress-fold-two', 1, false, 1],
  ['s230', 617, 625, 'anchor', 'dress-fold-three', 0, false, 1],
  ['s231', 921, 949, 'anchor', 'dress-fold-three', 1, false, 1],
  ['s232', 568, 647, 'anchor', 'dress-fold-left', 0, false, 1],
  ['s233', 493, 950, 'anchor', 'dress-fold-left', 1, false, 1],
  ['s235', 584.2, 1018.6, 'minor', 'dress-scallop', 0.4315, false, 0.42],
  ['s236', 646.8, 1010.9, 'minor', 'dress-scallop', 0.6458, false, 0.42],
  ['s238', 1168, 969, 'anchor', 'dress-train-edge', 1, false, 1],
  ['s239', 814.2, 1023.9, 'minor', 'dress-train-edge', 0.1286, false, 0.42],
  ['s241', 925, 964.9, 'minor', 'dress-train-edge', 0.3646, false, 0.42],
  ['s242', 967.9, 916.9, 'minor', 'dress-train-edge', 0.4839, false, 0.42],
  ['s244', 1034.1, 1007.6, 'minor', 'dress-train-edge', 0.7189, false, 0.42],
  ['s245', 1096.9, 1016.3, 'minor', 'dress-train-edge', 0.8387, false, 0.42],
  ['s247', 699, 779, 'anchor', 'dress-outer-right', 0.5635, false, 1],
  ['s248', 751.9, 739.6, 'minor', 'train-upper', 0.1036, false, 0.42],
  ['s250', 870.6, 695.6, 'minor', 'train-upper', 0.3049, false, 0.42],
  ['s251', 932.4, 698, 'minor', 'train-upper', 0.4024, false, 0.42],
  ['s253', 1030.2, 845.7, 'minor', 'train-upper', 0.7067, false, 0.42],
  ['s254', 1045.1, 912, 'minor', 'train-upper', 0.8135, false, 0.42],
  ['s256', 715, 795, 'anchor', 'train-inside', 0, false, 1],
  ['s257', 550, 1007, 'anchor', 'dress-scallop', 0.3093, false, 1],
  ['s258', 665, 1004, 'anchor', 'dress-scallop', 0.7114, false, 1],
  ['s259', 273, 843, 'anchor', 'ribbon-fold', 0, false, 1],
  ['s260', 211.1, 819.1, 'minor', 'ribbon-upper', 0.0873, false, 0.42],
  ['s262', 155.5, 710.5, 'minor', 'ribbon-upper', 0.2535, false, 0.42],
  ['s263', 181.1, 650.7, 'minor', 'ribbon-upper', 0.3404, false, 0.42],
  ['s265', 290.1, 587.5, 'minor', 'ribbon-upper', 0.507, false, 0.42],
  ['s266', 352.5, 573.8, 'minor', 'ribbon-upper', 0.5905, false, 0.42],
  ['s268', 480.5, 597.6, 'minor', 'ribbon-upper', 0.7631, false, 0.42],
  ['s269', 534.8, 635.1, 'minor', 'ribbon-upper', 0.8497, false, 0.42],
  ['s271', 211.3, 830.5, 'minor', 'ribbon-lower', 0.0676, false, 0.42],
  ['s272', 172.6, 783.1, 'minor', 'ribbon-lower', 0.1358, false, 0.42],
  ['s274', 218.1, 665.7, 'minor', 'ribbon-lower', 0.2738, false, 0.42],
  ['s275', 267.8, 627.2, 'minor', 'ribbon-lower', 0.3415, false, 0.42],
  ['s277', 455.4, 626.8, 'minor', 'ribbon-lower', 0.5475, false, 0.42],
  ['s278', 507.8, 663.6, 'minor', 'ribbon-lower', 0.6163, false, 0.42],
  ['s280', 553.7, 778.6, 'minor', 'ribbon-lower', 0.7509, false, 0.42],
  ['s281', 554.1, 842.5, 'minor', 'ribbon-lower', 0.8193, false, 0.42],
  ['s283', 479, 965, 'anchor', 'ribbon-fold', 1, false, 1],
];

const EDGE_BY_ID = new Map(STARLIGHT_EDGES.map((edge) => [edge.id, edge]));
export const STARLIGHT_STARS: readonly StarlightStar[] = Object.freeze([
  ...STAR_SPECS.map(([id, x, y, kind, edgeId, edgeProgress, twinkle, power]) => {
    const edge = EDGE_BY_ID.get(edgeId);
    if (!edge) throw new Error(`Unknown source edge "${edgeId}" for star "${id}"`);
    return Object.freeze({
      id,
      x,
      y,
      kind,
      edgeId,
      edgeProgress,
      twinkle,
      power,
      revealAt: edge.revealStart + (edge.revealEnd - edge.revealStart) * edgeProgress,
    });
  }),
  ...[
    {
      id: 'galaxy-star-1',
      x: 478.59,
      y: 568.44,
      kind: 'accent' as const,
      revealAt: 0.92,
      power: 0.4,
      twinkle: true,
    },
    {
      id: 'galaxy-star-2',
      x: 283.93,
      y: 479.42,
      kind: 'accent' as const,
      revealAt: 0.92,
      power: 0.4,
      twinkle: false,
    },
    {
      id: 'galaxy-star-3',
      x: 127.16,
      y: 555.47,
      kind: 'accent' as const,
      revealAt: 0.92,
      power: 0.4,
      twinkle: false,
    },
    {
      id: 'galaxy-star-4',
      x: 140.31,
      y: 822.47,
      kind: 'accent' as const,
      revealAt: 0.92,
      power: 0.4,
      twinkle: false,
    },
    {
      id: 'galaxy-star-5',
      x: 887.36,
      y: 715.01,
      kind: 'accent' as const,
      revealAt: 0.92,
      power: 0.4,
      twinkle: false,
    },
    {
      id: 'galaxy-star-6',
      x: 1017.71,
      y: 742.27,
      kind: 'accent' as const,
      revealAt: 0.92,
      power: 0.4,
      twinkle: false,
    },
    {
      id: 'galaxy-star-7',
      x: 1128.25,
      y: 858.96,
      kind: 'accent' as const,
      revealAt: 0.92,
      power: 0.4,
      twinkle: false,
    },
    {
      id: 'galaxy-star-8',
      x: 1080.02,
      y: 1027.51,
      kind: 'accent' as const,
      revealAt: 0.92,
      power: 0.4,
      twinkle: false,
    },
    {
      id: 'galaxy-star-9',
      x: 871.05,
      y: 986.52,
      kind: 'accent' as const,
      revealAt: 0.92,
      power: 0.4,
      twinkle: false,
    },
    {
      id: 'galaxy-star-10',
      x: 317.25,
      y: 993.67,
      kind: 'accent' as const,
      revealAt: 0.92,
      power: 0.4,
      twinkle: false,
    },
    {
      id: 'galaxy-star-11',
      x: 403.2,
      y: 1012.82,
      kind: 'accent' as const,
      revealAt: 0.92,
      power: 0.4,
      twinkle: false,
    },
  ].map((star) => Object.freeze(star)),
]);

const SILK_PARTS: readonly StarlightPart[] = ['groom', 'dress', 'groom', 'ribbon'];
const SILK_PATHS = [
  'M 625,297 C 679,306 686,489 811,551 C 790,571 780,599 752,606 C 711,630 671,559 623,588 C 609,505 643,418 622,345 Z',
  'M 572,535 C 621,612 658,689 699,779 C 754,735 811,693 893,695 C 958,694 1001,719 1014,767 C 1038,842 1026,957 1117,1002 C 1073,1035 1030,1019 1025,1002 C 1005,975 1001,943 974,909 C 909,994 846,1039 745,1023 C 715,1031 690,1024 665,1004 C 614,1025 583,1024 550,1007 C 519,1002 490,1006 464,981 C 532,955 588,868 585,736 C 580,654 570,600 572,535 Z',
  'M 347,304 C 329,321 300,340 283,365 C 300,393 317,407 328,413 C 342,456 341,507 342,554 C 366,549 406,552 432,563 C 434,496 423,435 409,394 L 391,345 Z',
  'M 273,843 C 210,832 166,792 159,737 C 138,665 213,603 319,580 C 393,561 450,581 493,604 C 551,638 578,682 585,736 C 578,682 530,657 469,633 C 399,598 290,595 229,654 C 190,692 151,772 184,807 C 190,826 229,842 273,843 Z',
] as const;
const DUST_SPECS = [
  [733.16, 818.9, 1.49, 0.41],
  [747.92, 812.75, 0.6, 0.25],
  [735.05, 804.17, 0.81, 0.46],
  [725.33, 798.75, 1.48, 0.35],
  [715.77, 793.23, 1.46, 0.5],
  [706.08, 787.86, 0.84, 0.24],
  [696.44, 768.73, 1.17, 0.42],
  [685.8, 750.2, 0.67, 0.22],
  [674.57, 746.23, 1.53, 0.36],
  [673.07, 733.35, 0.68, 0.5],
  [660.48, 726.78, 0.6, 0.25],
  [659, 717.67, 1.16, 0.59],
  [582.54, 661.73, 1.5, 0.31],
  [578.53, 650.85, 1, 0.58],
  [568.63, 646.57, 1.19, 0.46],
  [567.32, 632.54, 1.55, 0.55],
  [555.07, 631.15, 0.84, 0.27],
  [565.16, 635.94, 0.6, 0.25],
  [551.91, 619.16, 1.36, 0.35],
  [539.4, 618.41, 0.65, 0.41],
  [520.71, 625.62, 0.7, 0.51],
  [523.55, 606.26, 1.16, 0.38],
  [517.79, 597.55, 0.88, 0.31],
  [527.44, 610.62, 0.6, 0.25],
  [508.77, 593.11, 0.89, 0.42],
  [493.85, 580.51, 1.29, 0.46],
  [485.25, 575.94, 1.27, 0.3],
  [482.86, 562.65, 0.91, 0.45],
  [491.22, 569, 0.6, 0.25],
  [464.44, 572.64, 0.91, 0.37],
  [465.21, 554.7, 0.96, 0.48],
  [458, 548.54, 1.17, 0.57],
  [454.13, 537.21, 0.99, 0.31],
  [428.35, 561.33, 1.32, 0.4],
  [423.47, 548, 0.6, 0.25],
  [438.2, 527.62, 1.34, 0.34],
  [427.35, 528.06, 0.82, 0.35],
  [411.26, 520.2, 1.48, 0.49],
  [400.38, 522.01, 1.4, 0.24],
  [408.62, 538.14, 0.6, 0.25],
  [394.97, 513.64, 1.12, 0.28],
  [389.26, 505.77, 1.18, 0.52],
  [377.89, 509.96, 0.66, 0.45],
  [374.97, 496.07, 1.28, 0.54],
  [359.97, 510, 1.54, 0.29],
  [358.65, 495.87, 0.6, 0.25],
  [357.25, 495.41, 0.98, 0.31],
  [350.36, 490.77, 1.58, 0.28],
  [342.31, 489.49, 0.68, 0.53],
  [334.87, 486.89, 0.75, 0.5],
  [326.11, 488.89, 1.41, 0.42],
  [322.9, 489.15, 0.6, 0.25],
  [316.62, 494.57, 0.73, 0.57],
  [311.51, 485.31, 1.23, 0.5],
  [304.46, 483.19, 1.53, 0.32],
  [297.22, 482.39, 0.84, 0.61],
  [290.11, 481.66, 1.47, 0.41],
  [291.35, 470.11, 0.6, 0.25],
  [276.18, 481.01, 1.11, 0.46],
  [269.97, 474.47, 0.9, 0.57],
  [256.16, 481.54, 0.94, 0.58],
  [256.35, 476.01, 0.6, 0.25],
  [249.66, 474.43, 1.54, 0.25],
  [243.14, 476.19, 1.49, 0.57],
  [236.67, 476.46, 1.02, 0.45],
  [229.91, 473.94, 1.11, 0.49],
  [225.09, 484.73, 1.56, 0.52],
  [226.25, 466.22, 0.6, 0.25],
  [212.11, 482.22, 1.29, 0.41],
  [204.46, 478.01, 1.08, 0.31],
  [187.74, 485.6, 1.54, 0.59],
  [187.33, 496.84, 1.06, 0.5],
  [182.26, 498.99, 1.13, 0.46],
  [175.58, 498.93, 1.51, 0.6],
  [175.5, 486.38, 0.6, 0.25],
  [170.07, 500.97, 0.9, 0.24],
  [164.52, 511.83, 1.01, 0.45],
  [154.2, 517.3, 0.68, 0.61],
  [150.66, 517.84, 0.6, 0.25],
  [135.53, 516.94, 1.52, 0.53],
  [138.51, 527.05, 1.49, 0.31],
  [132.75, 537.74, 1.28, 0.42],
  [145.86, 534.79, 0.6, 0.25],
  [138.47, 548.18, 0.78, 0.36],
  [134.14, 552.39, 1.51, 0.42],
  [127.87, 555.83, 1.55, 0.49],
  [131.91, 564.4, 0.98, 0.35],
  [125.12, 567.93, 0.96, 0.28],
  [118.39, 563.51, 0.6, 0.25],
  [110.98, 568.98, 0.68, 0.44],
  [127.95, 581.98, 0.99, 0.57],
  [126.22, 587.76, 0.76, 0.34],
  [112.64, 596.84, 1.14, 0.31],
  [108.17, 597.02, 0.6, 0.25],
  [125.81, 619.22, 0.66, 0.27],
  [105.13, 629.24, 0.76, 0.36],
  [104.48, 631.15, 0.6, 0.25],
  [91.5, 641.97, 1.53, 0.24],
  [102.64, 649.86, 1.04, 0.22],
  [111.93, 657.21, 0.82, 0.47],
  [109.16, 664.07, 0.98, 0.54],
  [124.94, 663.91, 0.6, 0.25],
  [98.14, 671.23, 1.11, 0.3],
  [102.29, 678.39, 0.66, 0.51],
  [116.3, 684.86, 1.58, 0.35],
  [104.26, 692.89, 0.97, 0.26],
  [100.21, 723.7, 0.71, 0.55],
  [121.39, 727.51, 1.25, 0.26],
  [123.51, 734.57, 1.23, 0.37],
  [106.83, 735.67, 0.6, 0.25],
  [132.24, 740.08, 1.13, 0.36],
  [102.14, 755.36, 0.84, 0.27],
  [112.99, 760.63, 1.28, 0.38],
  [118.1, 775.53, 0.71, 0.32],
  [100.93, 772.2, 0.6, 0.25],
  [126.29, 789.43, 1.29, 0.2],
  [127.72, 797.42, 0.67, 0.29],
  [141.35, 808.89, 0.7, 0.47],
  [138.04, 813.53, 0.6, 0.25],
  [141.95, 817.37, 1.26, 0.29],
  [137.2, 828.76, 0.86, 0.51],
  [147.04, 832.88, 1.4, 0.54],
  [149.67, 840.75, 1.6, 0.34],
  [149.02, 850.68, 1.27, 0.44],
  [150.26, 846.15, 0.6, 0.25],
  [154.48, 857.16, 0.83, 0.54],
  [167.32, 858.79, 0.93, 0.45],
  [167.07, 868.92, 1.09, 0.33],
  [170.46, 876.81, 1.13, 0.61],
  [179.56, 880.53, 0.82, 0.42],
  [192.2, 878.67, 0.6, 0.25],
  [185.83, 886.26, 0.76, 0.55],
  [193.59, 901.83, 1.39, 0.22],
  [203.21, 916.43, 1.06, 0.23],
  [207.13, 917.86, 0.6, 0.25],
  [212.25, 919.73, 1.56, 0.52],
  [221.23, 935.81, 1.11, 0.53],
  [226.51, 943.06, 1.35, 0.38],
  [223.27, 935.73, 0.6, 0.25],
  [237.04, 944.07, 1.42, 0.21],
  [249.16, 955.86, 1.24, 0.48],
  [259.38, 955.87, 1.52, 0.21],
  [261.5, 967.06, 1.1, 0.49],
  [268.05, 965.52, 0.6, 0.25],
  [435.77, 1019.8, 0.68, 0.54],
  [442.43, 1008.26, 0.68, 0.6],
  [441.89, 996.96, 0.6, 0.25],
  [450.75, 1016.4, 0.77, 0.39],
  [457.36, 1008.61, 0.87, 0.58],
  [463.72, 1001.25, 1.25, 0.49],
  [474.71, 1019.95, 0.84, 0.34],
  [481.36, 1013.44, 0.88, 0.23],
  [483.81, 1031.35, 0.6, 0.25],
  [490.32, 1017.54, 0.68, 0.49],
  [496.9, 1011.36, 0.7, 0.55],
  [501.67, 999.56, 1.26, 0.52],
  [510.47, 1001.97, 0.67, 0.31],
  [535.91, 981.2, 1.07, 0.36],
  [545.66, 984.08, 1.49, 0.34],
  [568.81, 959.66, 1.31, 0.59],
  [582.8, 968.19, 1.07, 0.33],
  [593.51, 954.15, 0.89, 0.25],
  [610.45, 949.72, 0.99, 0.5],
  [618.12, 945.96, 0.92, 0.46],
  [631.66, 935.54, 0.74, 0.41],
  [642.71, 935.6, 1.41, 0.25],
  [644.52, 923.97, 1.03, 0.57],
  [648.13, 914.78, 1.02, 0.53],
  [657.78, 912.57, 1.2, 0.48],
  [664.25, 919.22, 0.6, 0.25],
  [663.32, 905.55, 0.96, 0.31],
  [669.09, 898.76, 0.99, 0.29],
  [677.95, 895.07, 1.09, 0.3],
  [687.07, 891.4, 0.72, 0.52],
  [692.05, 883.52, 1.13, 0.55],
  [686.34, 892.98, 0.6, 0.25],
  [691.31, 870.38, 0.84, 0.56],
  [702.01, 867.77, 0.73, 0.28],
  [710.14, 862.58, 1.03, 0.42],
  [715.79, 855.14, 0.69, 0.45],
  [721.72, 847.87, 1.28, 0.35],
  [729.91, 850.86, 0.6, 0.25],
  [722.35, 836.38, 1.43, 0.61],
  [733.24, 820.99, 1.03, 0.29],
  [742.09, 817.26, 0.83, 0.37],
  [741, 826.03, 0.6, 0.25],
  [754.14, 817.91, 0.93, 0.2],
  [750.17, 806.44, 1.15, 0.27],
  [755.74, 793.98, 1.22, 0.34],
  [765.38, 785.39, 0.91, 0.45],
  [772.47, 783.51, 1.15, 0.3],
  [778.58, 780.99, 1.13, 0.3],
  [785.79, 779.9, 0.94, 0.54],
  [784.5, 770.01, 1.3, 0.24],
  [788.04, 774.72, 0.6, 0.25],
  [796.44, 766.1, 0.94, 0.52],
  [792.43, 752.32, 0.94, 0.4],
  [801.63, 754.7, 0.67, 0.56],
  [810.25, 756.99, 0.98, 0.26],
  [814.93, 763.67, 0.6, 0.25],
  [808.12, 744.73, 1.22, 0.22],
  [820.98, 744.51, 0.96, 0.52],
  [825.34, 741.61, 0.91, 0.55],
  [826.71, 733.58, 1.25, 0.21],
  [834.19, 742.48, 0.6, 0.25],
  [836.32, 740.34, 0.69, 0.3],
  [849.87, 734.71, 0.86, 0.38],
  [852.74, 729.13, 1.48, 0.32],
  [846.61, 741.55, 0.6, 0.25],
  [861.08, 707.9, 1.1, 0.47],
  [867, 709.68, 1.53, 0.44],
  [873.27, 713.69, 1.52, 0.32],
  [876.5, 710.82, 0.6, 0.25],
  [880.04, 721.29, 0.85, 0.27],
  [893.83, 720.24, 0.81, 0.56],
  [901.62, 705.25, 0.78, 0.46],
  [911.92, 722.07, 1.09, 0.5],
  [916.3, 703.64, 0.75, 0.62],
  [925.32, 719.11, 1.37, 0.53],
  [931.17, 702.78, 0.68, 0.39],
  [934.48, 718.46, 1.07, 0.37],
  [939.02, 718.97, 1.33, 0.45],
  [943.17, 722.03, 0.91, 0.62],
  [944.51, 716.28, 0.6, 0.25],
  [956.1, 705.32, 1.34, 0.51],
  [965.31, 710.15, 1.49, 0.55],
  [966.24, 724.76, 1.35, 0.45],
  [968.43, 732.05, 0.6, 0.25],
  [972.53, 720.7, 1.39, 0.35],
  [973.32, 733.26, 1.57, 0.36],
  [980.53, 727.37, 1.04, 0.49],
  [993.4, 708.58, 1.47, 0.22],
  [997.49, 737.6, 1.16, 0.33],
  [1004.12, 735.6, 0.76, 0.27],
  [1006.44, 742.1, 1.02, 0.35],
  [1020.34, 738.68, 1.03, 0.22],
  [1021.9, 746.31, 1.19, 0.28],
  [1027.44, 747.52, 1.21, 0.3],
  [1032, 750.39, 0.84, 0.33],
  [1044.27, 761.43, 1.01, 0.55],
  [1052.39, 760.17, 0.7, 0.6],
  [1051.3, 770.47, 1.07, 0.53],
  [1061.57, 775.91, 1.5, 0.41],
  [1063.98, 781.82, 1.38, 0.34],
  [1077.46, 794.61, 1.51, 0.36],
  [1082.21, 798.99, 1.56, 0.29],
  [1090.4, 800.17, 0.95, 0.34],
  [1094.97, 804.63, 0.91, 0.37],
  [1097.03, 818.85, 1, 0.35],
  [1101.81, 822.66, 1.48, 0.45],
  [1112.59, 829.35, 0.77, 0.3],
  [1120.71, 830.98, 1.02, 0.41],
  [1133.34, 839.19, 0.6, 0.25],
  [1116.66, 846.7, 0.87, 0.22],
  [1122.32, 849.74, 0.9, 0.39],
  [1129.29, 858.23, 1.18, 0.26],
  [1119.86, 853.73, 0.6, 0.25],
  [1130.65, 863.41, 1.46, 0.28],
  [1121.83, 872.65, 0.96, 0.6],
  [1143.46, 869.52, 1.49, 0.23],
  [1128.25, 880.43, 1.06, 0.61],
  [1136.61, 882.73, 0.82, 0.38],
  [1138.05, 888.17, 0.6, 0.25],
  [1132.05, 889.07, 0.68, 0.56],
  [1137.22, 892.51, 1.09, 0.51],
  [1150.47, 909.25, 1.59, 0.43],
  [1141.19, 914.83, 1.5, 0.46],
  [1134.92, 919.55, 1, 0.44],
  [1128.62, 923.77, 0.69, 0.23],
  [1130.1, 931.45, 1.44, 0.35],
  [1149.63, 936.93, 1.27, 0.51],
  [1131.48, 939.2, 1.54, 0.41],
  [1142.3, 944.76, 0.78, 0.56],
  [1113.7, 982.58, 1.3, 0.22],
  [1122.4, 993.88, 0.71, 0.5],
  [1131.82, 1007.19, 0.88, 0.54],
  [1120.94, 1003.83, 1.21, 0.34],
  [1119.84, 1008.94, 1.12, 0.48],
  [1106.71, 1012.7, 0.6, 0.25],
  [1106.91, 1008.1, 1.28, 0.34],
  [1095.46, 1007.22, 1.5, 0.44],
  [1093.8, 1011.96, 1.1, 0.23],
  [1086.34, 1023.49, 0.6, 0.25],
  [1089.45, 1013.05, 1.38, 0.53],
  [1094.05, 1028.9, 1.49, 0.25],
  [1082.4, 1017.98, 1.58, 0.46],
  [1081.18, 1025.24, 1.43, 0.55],
  [1074.73, 1022.49, 0.79, 0.32],
  [1072.68, 1022.79, 0.6, 0.25],
  [1069.58, 1034.49, 1.57, 0.58],
  [1063.31, 1031.85, 1, 0.53],
  [1047.99, 1032.84, 1.47, 0.45],
  [1045.83, 1046.23, 0.81, 0.26],
  [1039.42, 1042.55, 1.09, 0.28],
  [1033.8, 1042.39, 1.52, 0.37],
  [1027.44, 1037.4, 0.97, 0.56],
  [1030.03, 1039.25, 0.6, 0.25],
  [1017.61, 1052.49, 1.04, 0.4],
  [1005.75, 1042.94, 1.1, 0.61],
  [1006.01, 1032.84, 0.6, 0.25],
  [1001.49, 1042.38, 1.23, 0.54],
  [992.73, 1047.42, 1.05, 0.42],
  [980.16, 1042.64, 0.8, 0.31],
  [975.65, 1043.37, 1.33, 0.57],
  [970.7, 1045.73, 1.11, 0.35],
  [967.5, 1040.05, 0.92, 0.29],
  [954.98, 1036.27, 1.31, 0.42],
  [951.02, 1034.28, 1.24, 0.38],
  [944.36, 1039.19, 0.75, 0.43],
  [940.85, 1035.64, 1.53, 0.57],
  [940.42, 1044.11, 0.6, 0.25],
  [938.01, 1030.76, 1.49, 0.39],
  [932.83, 1031.09, 0.8, 0.6],
  [925.4, 1025.28, 1.05, 0.29],
  [919.05, 1017.66, 0.84, 0.43],
  [903.73, 1024.43, 1.46, 0.29],
  [900.82, 1019.84, 1.48, 0.39],
  [898.16, 1006.45, 1.27, 0.43],
  [889.56, 1001.69, 0.66, 0.34],
  [888.08, 995.6, 0.89, 0.24],
  [888.43, 987.36, 1.07, 0.35],
  [888.28, 990.74, 0.6, 0.25],
  [861.67, 1011.96, 1.29, 0.43],
  [881.22, 980.85, 1.16, 0.25],
  [863.62, 993.44, 1.4, 0.22],
  [870.7, 970.42, 1.47, 0.26],
  [881.05, 959.05, 0.6, 0.25],
  [853.72, 981.09, 1.55, 0.29],
  [856.83, 970.35, 1.39, 0.6],
  [855.01, 964.87, 1.54, 0.44],
  [846.43, 966.1, 1.04, 0.31],
  [851.82, 946.56, 0.67, 0.44],
  [837.11, 946.1, 0.66, 0.47],
  [835.34, 940.66, 1.04, 0.56],
  [825.33, 928.51, 0.76, 0.34],
  [816.75, 928.78, 1.55, 0.52],
  [821.24, 918.23, 1.59, 0.4],
  [807.89, 915.37, 0.9, 0.58],
  [800.43, 914.41, 1.32, 0.41],
  [800.88, 907.3, 0.73, 0.35],
  [788.97, 909.61, 1.25, 0.35],
  [796.94, 896.93, 0.74, 0.28],
  [791.25, 904.94, 0.6, 0.25],
  [787.6, 897.2, 1.39, 0.4],
  [790.85, 881.74, 1.43, 0.41],
  [774.13, 887.09, 0.92, 0.49],
  [782.15, 875, 0.83, 0.23],
  [790.77, 878.56, 0.6, 0.25],
  [777.41, 871.89, 1.07, 0.51],
  [770.79, 870.03, 1.09, 0.46],
  [762.6, 862.87, 1.02, 0.25],
  [758.74, 859.16, 1.51, 0.48],
  [757.81, 862.91, 0.6, 0.25],
  [760.33, 851.93, 0.67, 0.62],
  [756.91, 848, 1.17, 0.47],
  [752.12, 844.96, 0.76, 0.55],
  [751.95, 839.04, 1.36, 0.51],
  [746.68, 836.36, 1.27, 0.38],
  [752.77, 835, 0.6, 0.25],
  [750.24, 828.27, 1.35, 0.47],
  [741.7, 827.63, 1.02, 0.33],
  [268.6, 971.13, 1.58, 0.51],
  [292.29, 977.77, 1.12, 0.25],
  [308.42, 979.47, 1.31, 0.46],
  [310.2, 994.15, 0.77, 0.42],
  [321.12, 987.66, 0.91, 0.28],
  [326.92, 993.39, 1.52, 0.53],
  [330.89, 1005.06, 1.33, 0.62],
  [335.89, 987.18, 0.6, 0.25],
  [337.68, 1009.21, 0.92, 0.3],
  [348.62, 998.45, 0.76, 0.54],
  [352.45, 1013.68, 1.45, 0.37],
  [360.85, 1011.11, 1.08, 0.53],
  [376.29, 1009.85, 1.06, 0.24],
  [383.18, 1014.33, 0.94, 0.4],
  [388.85, 1032.87, 0.74, 0.55],
  [397.86, 1018.93, 0.95, 0.37],
  [405.46, 1018.42, 1.57, 0.29],
  [405.4, 1009.73, 0.6, 0.25],
  [413.05, 1015.9, 0.8, 0.35],
  [428, 1015.35, 1.27, 0.43],
] as const;
const DUST_FRAGMENTS = [
  [
    'M 472.79,564.44 L 467.00,560.50 L 461.21,556.64 L 455.43,552.85 L 449.65,549.14 L 443.88,545.50 L 438.12,541.94 L 432.36,538.46 L 426.62,535.07 L 420.88,531.75 L 415.16,528.52',
    0.18,
  ],
  [
    'M 129.22,551.49 L 127.56,554.67 L 125.96,557.89 L 124.41,561.17 L 122.91,564.49 L 121.47,567.85 L 120.08,571.27 L 118.74,574.72 L 117.46,578.22 L 116.23,581.76 L 115.06,585.35',
    0.18,
  ],
  [
    'M 897.71,713.51 L 900.48,713.22 L 903.24,712.98 L 906.01,712.78 L 908.77,712.63 L 911.54,712.52 L 914.31,712.46 L 917.08,712.45 L 919.85,712.48 L 922.62,712.55 L 925.39,712.67',
    0.18,
  ],
  [
    'M 1091.94,1020.84 L 1089.94,1022.08 L 1087.90,1023.28 L 1085.83,1024.46 L 1083.72,1025.61 L 1081.58,1026.72 L 1079.40,1027.81 L 1077.18,1028.87 L 1074.93,1029.90 L 1072.65,1030.90 L 1070.33,1031.87',
    0.18,
  ],
  [
    'M 914.64,1018.70 L 912.55,1017.43 L 910.47,1016.14 L 908.39,1014.82 L 906.32,1013.48 L 904.25,1012.12 L 902.19,1010.73 L 900.13,1009.31 L 898.07,1007.88 L 896.03,1006.42 L 893.98,1004.94',
    0.18,
  ],
  [
    'M 312.02,991.49 L 315.68,993.03 L 319.35,994.50 L 323.03,995.92 L 326.72,997.29 L 330.42,998.59 L 334.13,999.84 L 337.85,1001.03 L 341.57,1002.16 L 345.31,1003.24 L 349.05,1004.26',
    0.18,
  ],
] as const;

function dustPart(x: number, y: number): StarlightPart {
  if (y < 230) return 'sky';
  if (y < 420) return x < 500 ? 'groom' : 'bride';
  if (y < 620) return x < 500 ? 'bride' : 'veil';
  if (y < 820) return x < 600 ? 'dress' : 'train';
  if (y < 1000) return x < 500 ? 'ribbon' : 'train';
  return 'ribbon';
}

export const STARLIGHT_DECORATIONS: readonly StarlightDecoration[] = Object.freeze([
  ...SILK_PATHS.map((path, index) =>
    Object.freeze({
      id: `silk-${index + 1}`,
      kind: 'silk' as const,
      part: SILK_PARTS[index],
      path,
      revealAt: PART_TIMINGS[SILK_PARTS[index]][0],
    }),
  ),
  ...DUST_SPECS.map(([x, y, r, opacity], index) => {
    const part = dustPart(x, y);
    return Object.freeze({
      id: `dust-${index + 1}`,
      kind: 'dust' as const,
      part,
      x,
      y,
      r,
      opacity,
      revealAt: PART_TIMINGS[part][0],
    });
  }),
  ...DUST_FRAGMENTS.map(([path, opacity], index) =>
    Object.freeze({
      id: `dust-fragment-${index + 1}`,
      kind: 'dust' as const,
      part: 'ribbon' as const,
      path,
      opacity,
      revealAt: 0.8,
    }),
  ),
]);

export const STARLIGHT_COMPLETE_AT = 0.92;

export function starlightEdgeById(id: string): StarlightEdge | undefined {
  return EDGE_BY_ID.get(id);
}

const STAR_BY_ID = new Map(STARLIGHT_STARS.map((star) => [star.id, star]));
export function starlightStarById(id: string): StarlightStar | undefined {
  return STAR_BY_ID.get(id);
}

export function validateStarlightData(
  edges: readonly StarlightEdge[] = STARLIGHT_EDGES,
  stars: readonly StarlightStar[] = STARLIGHT_STARS,
  decorations: readonly StarlightDecoration[] = STARLIGHT_DECORATIONS,
): true {
  const ids = new Set<string>();
  const addId = (id: string): void => {
    if (!id.trim() || ids.has(id)) throw new Error(`Duplicate or empty starlight ID "${id}"`);
    ids.add(id);
  };
  const edgeIds = new Set(edges.map((edge) => edge.id));
  for (const edge of edges) {
    addId(edge.id);
    if (!edge.path.trim() || !/^[Mm]/.test(edge.path.trim()))
      throw new Error(`Invalid path for edge "${edge.id}"`);
    if (
      !Number.isFinite(edge.revealStart) ||
      !Number.isFinite(edge.revealEnd) ||
      edge.revealStart < 0 ||
      edge.revealEnd > 1 ||
      edge.revealStart > edge.revealEnd
    )
      throw new Error(`Invalid reveal window for edge "${edge.id}"`);
  }
  for (const star of stars) {
    addId(star.id);
    if (star.edgeId && !edgeIds.has(star.edgeId))
      throw new Error(`Unknown edge "${star.edgeId}" for star "${star.id}"`);
    if (
      star.edgeProgress !== undefined &&
      (!Number.isFinite(star.edgeProgress) || star.edgeProgress < 0 || star.edgeProgress > 1)
    )
      throw new Error(`Invalid edge progress for star "${star.id}"`);
    if (
      ![star.x, star.y, star.revealAt, star.power].every(Number.isFinite) ||
      star.x < 0 ||
      star.x > 1280 ||
      star.y < 0 ||
      star.y > 1240 ||
      star.revealAt < 0 ||
      star.revealAt > 1
    )
      throw new Error(`Invalid star geometry or timing for "${star.id}"`);
  }
  for (const decoration of decorations) {
    addId(decoration.id);
    if (
      decoration.path !== undefined &&
      (!decoration.path.trim() || !/^[Mm]/.test(decoration.path.trim()))
    )
      throw new Error(`Invalid path for decoration "${decoration.id}"`);
    if (
      decoration.path === undefined &&
      (decoration.x === undefined ||
        decoration.y === undefined ||
        decoration.r === undefined ||
        decoration.r <= 0)
    )
      throw new Error(`Invalid point decoration "${decoration.id}"`);
    if (
      (decoration.x !== undefined && (decoration.x < 0 || decoration.x > 1280)) ||
      (decoration.y !== undefined && (decoration.y < 0 || decoration.y > 1240))
    )
      throw new Error(`Decoration outside viewBox "${decoration.id}"`);
    if (!Number.isFinite(decoration.revealAt) || decoration.revealAt < 0 || decoration.revealAt > 1)
      throw new Error(`Invalid reveal time for decoration "${decoration.id}"`);
  }
  return true;
}
