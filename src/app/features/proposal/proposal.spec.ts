import { ComponentFixture, TestBed } from '@angular/core/testing';
import { gsap } from 'gsap';
import { DEFAULT_WEDDING_CONFIG } from '../../core/models/wedding-config';
import { Proposal } from './proposal';
import { ProposalAlbumPlayer } from './proposal-album-player';

/** Exercises real GSAP sequences with explicit image and viewport events. */
describe('Proposal album stacks', () => {
  let fixture: ComponentFixture<Proposal>;
  let setVisible: (visible: boolean) => void;
  let reducedMotion: boolean;
  const disconnect = vi.fn();

  beforeEach(() => {
    reducedMotion = false;
    disconnect.mockClear();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          setVisible = (visible: boolean): void =>
            callback(
              [{ isIntersecting: visible } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            );
        }
        observe(): void {}
        disconnect = disconnect;
      },
    );
    const matchMedia = window.matchMedia.bind(window);
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      ...matchMedia(query),
      matches: query === '(prefers-reduced-motion: reduce)' && reducedMotion,
    }));
    TestBed.configureTestingModule({ imports: [Proposal] });
  });

  afterEach(() => {
    fixture?.destroy();
    gsap.globalTimeline.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  async function create(
    count: number,
    threshold = 3,
    duration = 0.7,
    delay = 3,
  ): Promise<HTMLElement> {
    fixture = TestBed.createComponent(Proposal);
    fixture.componentRef.setInput('config', {
      ...DEFAULT_WEDDING_CONFIG,
      albumStackThreshold: threshold,
      albumTransitionDuration: duration,
      albumAutoStackDelay: delay,
      album: Array.from({ length: count }, (_, index) => ({
        imageUrl: `/album/${index}.webp`,
        alt: 'Shared alt text',
        caption: `Photo ${index + 1}`,
      })),
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function runtime(): {
    animation: gsap.core.Timeline | null;
    autoTimer: gsap.core.Tween | null;
    pendingPrint: { index: number } | null;
  } {
    const player = (fixture.componentInstance as unknown as { player: ProposalAlbumPlayer }).player;
    return player as unknown as ReturnType<typeof runtime>;
  }

  function imageAt(root: HTMLElement, index: number): HTMLImageElement {
    return root.querySelector<HTMLImageElement>(`[data-index="${index}"] img`)!;
  }

  function load(root: HTMLElement, index: number): gsap.core.Timeline {
    imageAt(root, index).dispatchEvent(new Event('load'));
    const animation = runtime().animation;
    if (!animation) throw new Error(`No animation for photo ${index}`);
    return animation.pause(0);
  }

  function finish(): void {
    runtime().animation?.progress(1, false);
    runtime().autoTimer?.pause();
    fixture.detectChanges();
  }

  function nextAuto(): void {
    runtime().autoTimer?.progress(1, false);
  }

  it.each([1, 2, 3, 4])(
    'keeps the photo pool fixed across clicks for %i slots',
    async (threshold) => {
      const root = await create(10, threshold);
      const pools = (): string[][] =>
        Array.from(root.querySelectorAll('.polaroid-slot')).map((slot) =>
          Array.from(slot.querySelectorAll<HTMLElement>('.polaroid')).map(
            (photo) => photo.dataset['index']!,
          ),
        );
      const expected = Array.from({ length: threshold }, (_, slot) =>
        Array.from({ length: 10 }, (_, index) => index)
          .filter((index) => index % threshold === slot)
          .map(String),
      );
      expect(pools()).toEqual(expected);
      setVisible(true);
      load(root, 0);
      finish();
      fixture.componentInstance.activateSlot(0);
      load(root, threshold);
      finish();
      expect(pools()).toEqual(expected);
      expect(fixture.componentInstance.shownCounts()[0]).toBe(2);
      expect(root.querySelectorAll('.polaroid')).toHaveLength(10);
      expect(
        Array.from(root.querySelectorAll<HTMLElement>('.polaroid-slot')).map((slot) =>
          Number(slot.dataset['photoCount']),
        ),
      ).toEqual(expected.map((pool) => pool.length));
    },
  );

  it('keeps resting offsets bounded even with a large photo pool', async () => {
    await create(120, 1);
    const offsets = fixture.componentInstance.polaroids().map((photo) => photo.offset);
    expect(offsets[0]).toBe(0);
    expect(offsets[offsets.length - 1]).toBe(8);
    expect(offsets.every((offset) => offset >= 0 && offset <= 8)).toBe(true);
    expect(new Set(offsets).size).toBe(120);
  });

  it('refits active and settled paper on resize without restarting capture', async () => {
    let resize = (): void => {};
    const disconnectResize = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = (): void => callback([], this as unknown as ResizeObserver);
        }
        observe(): void {}
        disconnect = disconnectResize;
      },
    );
    const root = await create(1);
    const paper = root.querySelector<HTMLElement>('.polaroid')!;
    const slot = paper.parentElement!;
    let slotWidth = 300;
    Object.defineProperties(paper, {
      offsetWidth: { get: () => slotWidth - 40 },
      offsetHeight: { get: () => 360 },
      offsetLeft: { get: () => 20 },
    });
    Object.defineProperty(slot, 'clientWidth', { get: () => slotWidth });
    const expectInsideSlot = (): void => {
      const radians = (Math.abs(Number(gsap.getProperty(paper, 'rotation'))) * Math.PI) / 180;
      const halfWidth = ((slotWidth - 40) * Math.cos(radians) + 360 * Math.sin(radians)) / 2;
      const center = 20 + (slotWidth - 40) / 2 + Number(gsap.getProperty(paper, 'x'));
      expect(center - halfWidth).toBeGreaterThanOrEqual(-0.001);
      expect(center + halfWidth).toBeLessThanOrEqual(slotWidth + 0.001);
    };
    setVisible(true);
    const timeline = load(root, 0);
    for (const time of [0.1, 0.3, 0.5, 0.7]) {
      timeline.time(time, false);
      expectInsideSlot();
    }
    timeline.time(0.3, false);
    slotWidth = 180;
    resize();
    for (const time of [0.3, 0.4, 0.5, 0.7]) {
      timeline.time(time, false);
      expectInsideSlot();
    }
    timeline.time(1.5, false);
    const flash = root.querySelector<HTMLElement>('.snapshot-flash')!;
    const development = flash.style.opacity;
    slotWidth = 160;
    resize();
    expectInsideSlot();
    expect(timeline.time()).toBe(1.5);
    expect(flash.style.opacity).toBe(development);
    finish();
    slotWidth = 120;
    resize();
    expectInsideSlot();
    fixture.destroy();
    expect(disconnectResize).toHaveBeenCalledOnce();
  });

  it('autoplays in original album order despite grouped DOM and retains final stacks', async () => {
    const root = await create(7);
    setVisible(true);
    for (let index = 0; index < 7; index++) {
      expect(runtime().pendingPrint?.index).toBe(index);
      expect(imageAt(root, index).getAttribute('src')).toBe(`/album/${index}.webp`);
      load(root, index);
      finish();
      if (index < 6) nextAuto();
    }
    expect(runtime().autoTimer).toBeNull();
    expect(fixture.componentInstance.shownCounts()).toEqual([3, 2, 2]);
    const styles = Array.from(root.querySelectorAll<HTMLElement>('.polaroid')).map(
      (photo) => photo.style.cssText,
    );
    setVisible(false);
    setVisible(true);
    expect(runtime().animation).toBeNull();
    expect(runtime().pendingPrint).toBeNull();
    expect(
      Array.from(root.querySelectorAll<HTMLElement>('.polaroid')).map(
        (photo) => photo.style.cssText,
      ),
    ).toEqual(styles);
  });

  it('clicks add only the clicked slot’s next photo and reset the autoplay wait', async () => {
    const root = await create(6, 2, 0.7, 5);
    setVisible(true);
    load(root, 0);
    finish();
    const previousTimer = runtime().autoTimer!;
    previousTimer.delay(1);
    const slots = root.querySelectorAll<HTMLElement>('.polaroid-slot');
    slots[0].click();
    expect(previousTimer.parent).toBeNull();
    expect(runtime().autoTimer).toBeNull();
    expect(imageAt(root, 2).hasAttribute('src')).toBe(true);
    expect(imageAt(root, 1).hasAttribute('src')).toBe(false);
    load(root, 2);
    finish();
    const newTimer = runtime().autoTimer!;
    expect(newTimer).not.toBe(previousTimer);
    expect(newTimer.duration()).toBe(0);
    expect(newTimer.delay()).toBe(5);
    expect(newTimer.progress()).toBe(0);
    nextAuto();
    expect(runtime().pendingPrint?.index).toBe(1);
    for (const index of [1, 3, 4, 5]) {
      expect(runtime().pendingPrint?.index).toBe(index);
      load(root, index);
      finish();
      if (index < 5) nextAuto();
    }
    expect(fixture.componentInstance.shownCounts()).toEqual([3, 3]);
    expect(root.querySelectorAll('.polaroid')).toHaveLength(6);
  });

  it('clicking a slot replaces another slot’s pending load without stacking its photo', async () => {
    const root = await create(6, 2);
    setVisible(true);
    load(root, 0);
    finish();
    nextAuto();
    expect(runtime().pendingPrint?.index).toBe(1);
    root.querySelector<HTMLElement>('[data-slot="0"]')!.click();
    expect(runtime().pendingPrint?.index).toBe(2);
    imageAt(root, 1).dispatchEvent(new Event('load'));
    expect(runtime().animation).toBeNull();
    expect(runtime().pendingPrint?.index).toBe(2);
    expect(fixture.componentInstance.shownCounts()).toEqual([1, 0]);
    load(root, 2);
    finish();
    expect(fixture.componentInstance.shownCounts()).toEqual([2, 0]);
    expect(runtime().autoTimer?.delay()).toBe(3);
    expect(imageAt(root, 1).closest<HTMLElement>('.polaroid')?.style.visibility).not.toBe(
      'inherit',
    );
    // Only the later autoplay timeout may resume the other slot's cached image.
    nextAuto();
    const landing = runtime().animation?.getChildren(false, true, false)[0] as gsap.core.Tween;
    expect((landing.targets()[0] as HTMLElement).dataset['index']).toBe('1');
  });

  it.each([0, 1, 2])('a click while the first photo loads targets only slot %i', async (slot) => {
    const root = await create(9);
    setVisible(true);
    root.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!.click();
    expect(runtime().pendingPrint?.index).toBe(slot);
    if (slot !== 0) {
      imageAt(root, 0).dispatchEvent(new Event('load'));
      expect(runtime().animation).toBeNull();
    }
    load(root, slot);
    finish();
    expect(fixture.componentInstance.shownCounts()).toEqual(
      [0, 1, 2].map((index) => (index === slot ? 1 : 0)),
    );
    expect(root.querySelectorAll(`[data-slot="${slot}"] .polaroid`)).toHaveLength(3);
  });

  it('keeps a single-photo stack intact when clicked after completion', async () => {
    const root = await create(1, 1);
    setVisible(true);
    load(root, 0);
    finish();
    fixture.componentInstance.activateSlot(0);
    expect(fixture.componentInstance.shownCounts()).toEqual([1]);
    expect(runtime().animation).toBeNull();
    expect(runtime().autoTimer).toBeNull();
    expect(Number(root.querySelector<HTMLElement>('.polaroid')?.style.opacity)).toBe(1);
  });

  it('queues clicks until capture finishes, without interrupting development', async () => {
    const root = await create(6, 2);
    setVisible(true);
    const first = load(root, 0);
    first.time(1.5, false);
    root.querySelectorAll<HTMLElement>('.polaroid-slot')[1].click();
    expect(runtime().animation).toBe(first);
    expect(first.time()).toBe(1.5);
    expect(imageAt(root, 1).hasAttribute('src')).toBe(false);
    finish();
    expect(runtime().pendingPrint?.index).toBe(1);
    load(root, 1);
    finish();
    expect(runtime().autoTimer?.delay()).toBe(3);
    expect(fixture.componentInstance.shownCounts()).toEqual([1, 1]);
  });

  it('pops exhausted stacks one photo at a time and can restack without changing allocation', async () => {
    const root = await create(3, 1);
    setVisible(true);
    for (let index = 0; index < 3; index++) {
      load(root, index);
      finish();
      if (index < 2) fixture.componentInstance.activateSlot(0);
    }
    const top = root.querySelector<HTMLElement>('[data-index="2"]')!;
    fixture.componentInstance.activateSlot(0);
    finish();
    expect(Number(top.style.opacity)).toBe(0);
    expect(fixture.componentInstance.shownCounts()).toEqual([2]);
    expect(root.querySelectorAll('.polaroid')).toHaveLength(3);
    fixture.componentInstance.activateSlot(0);
    finish();
    expect(fixture.componentInstance.shownCounts()).toEqual([1]);
    fixture.componentInstance.activateSlot(0);
    // Cached image can start immediately; no additional network request.
    expect(runtime().animation).not.toBeNull();
    finish();
    expect(fixture.componentInstance.shownCounts()).toEqual([2]);
    expect(root.querySelectorAll('.polaroid')).toHaveLength(3);
  });

  it('supports Enter and Space without scrolling the page', async () => {
    const root = await create(4, 2);
    setVisible(true);
    load(root, 0);
    finish();
    const slot = root.querySelectorAll<HTMLElement>('.polaroid-slot')[0];
    expect(slot.getAttribute('role')).toBe('button');
    expect(slot.tabIndex).toBe(0);
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    slot.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
    expect(runtime().pendingPrint?.index).toBe(2);
    load(root, 2);
    finish();
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    slot.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
    finish();
    expect(fixture.componentInstance.shownCounts()[0]).toBe(1);
  });

  it('pauses image loading and development offscreen, including late load completion', async () => {
    const root = await create(4);
    expect(root.querySelectorAll('.polaroid img[src]')).toHaveLength(0);
    setVisible(true);
    expect(imageAt(root, 0).hasAttribute('src')).toBe(true);
    setVisible(false);
    imageAt(root, 0).dispatchEvent(new Event('load'));
    expect(runtime().animation).toBeNull();
    setVisible(true);
    const timeline = runtime().animation!;
    timeline.pause().time(1.5, false);
    setVisible(false);
    expect(timeline.paused()).toBe(true);
    expect(imageAt(root, 1).hasAttribute('src')).toBe(false);
    setVisible(true);
    expect(timeline.paused()).toBe(false);
    expect(timeline.time()).toBe(1.5);
    finish();
    const timer = runtime().autoTimer!;
    timer.pause();
    setVisible(false);
    expect(timer.paused()).toBe(true);
    setVisible(true);
    expect(timer.paused()).toBe(false);
  });

  it('continues after an image error and cleans up playback on destruction', async () => {
    const root = await create(3);
    setVisible(true);
    imageAt(root, 0).dispatchEvent(new Event('error'));
    expect(runtime().animation).not.toBeNull();
    finish();
    const timer = runtime().autoTimer!;
    fixture.destroy();
    expect(timer.parent).toBeNull();
    expect(disconnect).toHaveBeenCalledOnce();
    const counts = fixture.componentInstance.shownCounts();
    imageAt(root, 1).dispatchEvent(new Event('load'));
    expect(fixture.componentInstance.shownCounts()).toBe(counts);
  });

  it.each([0.3, 0.7, 1])(
    'keeps original capture timing with a %s second drop, even for one photo',
    async (duration) => {
      const root = await create(1, 3, duration);
      setVisible(true);
      const timeline = load(root, 0);
      const children = timeline.getChildren(false, true, false);
      expect(children.map((child) => child.duration())).toEqual([duration, 0.12, 0.95]);
      expect(children[1].startTime()).toBeCloseTo(duration + 0.46, 5);
      expect(children[2].startTime()).toBeCloseTo(duration + 0.76, 5);
      expect(timeline.duration()).toBeCloseTo(duration + 1.71, 5);
    },
  );

  it.each([0, -1, 1.5, NaN, Infinity])(
    'falls back to three slots for invalid threshold %s',
    async (threshold) => {
      const root = await create(4, threshold);
      expect(root.querySelectorAll('.polaroid-slot')).toHaveLength(3);
      expect(fixture.componentInstance.polaroids().map((photo) => photo.slot)).toEqual([
        0, 1, 2, 0,
      ]);
    },
  );

  it.each([
    [2, 1],
    [0, 0.7],
    [NaN, 0.7],
  ])('normalizes transition duration %s to %s', async (duration, expected) => {
    await create(1, 3, duration);
    expect(fixture.componentInstance.transitionDuration()).toBe(expected);
  });

  it('uses a static noninteractive grid under reduced motion and loads only in view', async () => {
    reducedMotion = true;
    const root = await create(7);
    expect(root.querySelector('.proposal-section')?.classList).toContain('reduced-motion');
    expect(root.querySelector('[role="button"]')).toBeNull();
    expect(root.querySelectorAll('.polaroid img[src]')).toHaveLength(0);
    setVisible(true);
    expect(root.querySelectorAll('.polaroid img[src]')).toHaveLength(7);
    fixture.componentInstance.activateSlot(0);
    expect(runtime().animation).toBeNull();
    expect(runtime().autoTimer).toBeNull();
    expect(
      Array.from(root.querySelectorAll<HTMLElement>('.polaroid')).every(
        (photo) => !photo.style.transform && !photo.style.visibility,
      ),
    ).toBe(true);
  });

  it('switches an active capture to a static grid when reduced motion is enabled', async () => {
    const events = new EventTarget();
    const original = window.matchMedia('(prefers-reduced-motion: reduce)');
    vi.mocked(window.matchMedia).mockReturnValue({
      ...original,
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
    });
    const root = await create(4);
    setVisible(true);
    load(root, 0);
    const change = new Event('change');
    Object.defineProperty(change, 'matches', { value: true });
    events.dispatchEvent(change);
    fixture.detectChanges();
    expect(runtime().animation).toBeNull();
    expect(runtime().autoTimer).toBeNull();
    expect(root.querySelector('[role="button"]')).toBeNull();
    expect(root.querySelectorAll('.polaroid img[src]')).toHaveLength(4);
  });

  it('handles empty albums without starting autoplay', async () => {
    const root = await create(0);
    setVisible(true);
    fixture.componentInstance.activateSlot(0);
    expect(root.querySelectorAll('.polaroid')).toHaveLength(0);
    expect(runtime().animation).toBeNull();
    expect(runtime().autoTimer).toBeNull();
  });
});
