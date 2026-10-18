import { ComponentFixture, TestBed } from '@angular/core/testing';
import { gsap } from 'gsap';
import { DEFAULT_WEDDING_CONFIG } from '../../core/models/wedding-config';
import { Proposal } from './proposal';

describe('Proposal album stacks', () => {
  let fixture: ComponentFixture<Proposal>;
  let reducedMotion: boolean;
  let setVisible: (visible: boolean) => void;
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
    albumStackThreshold = 3,
    albumTransitionDuration = 0.7,
  ): Promise<HTMLElement> {
    fixture = TestBed.createComponent(Proposal);
    fixture.componentRef.setInput('config', {
      ...DEFAULT_WEDDING_CONFIG,
      albumStackThreshold,
      albumTransitionDuration,
      album: Array.from({ length: count }, (_, index) => ({
        imageUrl: `/album/${index}.webp`,
        alt: 'Shared alt text',
        caption: `Photo ${index + 1}`,
      })),
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    playback()?.pause(0);
    return fixture.nativeElement as HTMLElement;
  }

  function playback(): gsap.core.Timeline | null {
    return (fixture.componentInstance as unknown as { playback: gsap.core.Timeline | null })
      .playback;
  }

  function tweens(): gsap.core.Tween[] {
    return (playback()?.getChildren(false, true, false) ?? []) as gsap.core.Tween[];
  }

  function targetsClass(tween: gsap.core.Tween, className: string): boolean {
    const target: unknown = tween.targets()[0];
    return target instanceof HTMLElement && target.classList.contains(className);
  }

  it('cycles through three fixed slots without changing playback order', async () => {
    const root = await create(10);
    const slots = Array.from(root.querySelectorAll('.polaroid-slot'));
    expect(
      slots.map((slot) =>
        Array.from(slot.querySelectorAll<HTMLElement>('.polaroid')).map((photo) =>
          Number(photo.dataset['index']),
        ),
      ),
    ).toEqual([
      [0, 3, 6, 9],
      [1, 4, 7],
      [2, 5, 8],
    ]);
    const landings = tweens().filter((tween) => targetsClass(tween, 'polaroid'));
    expect(
      landings.map((tween) => Number((tween.targets()[0] as HTMLElement).dataset['index'])),
    ).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(root.querySelector('button')).toBeNull();
    expect(playback()?.paused()).toBe(true);
    expect(landings.every((tween) => Number(tween.vars.y) <= 0)).toBe(true);
    expect(
      new Set(fixture.componentInstance.polaroids().map((photo) => photo.rotate)).size,
    ).toBeGreaterThan(3);
    expect(fixture.componentInstance.polaroids()[3].offset).toBeGreaterThan(
      fixture.componentInstance.polaroids()[0].offset,
    );
    playback()?.progress(1, false);
    expect(
      Array.from(root.querySelectorAll<HTMLElement>('.polaroid')).every(
        (photo) => photo.style.visibility === 'inherit' && Number(photo.style.opacity) === 1,
      ),
    ).toBe(true);
  });

  it.each([1, 2, 4])(
    'cycles through %i configured slots in original playback order',
    async (threshold) => {
      const root = await create(8, threshold);
      const slots = Array.from(root.querySelectorAll('.polaroid-slot'));
      expect(slots).toHaveLength(threshold);
      slots.forEach((slot, slotIndex) => {
        const indexes = Array.from(slot.querySelectorAll<HTMLElement>('.polaroid')).map((photo) =>
          Number(photo.dataset['index']),
        );
        expect(indexes).toEqual(
          Array.from({ length: 8 }, (_, index) => index).filter(
            (index) => index % threshold === slotIndex,
          ),
        );
      });
      const landings = tweens().filter((tween) => targetsClass(tween, 'polaroid'));
      expect(
        landings.map((tween) => Number((tween.targets()[0] as HTMLElement).dataset['index'])),
      ).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
      expect(
        fixture.componentInstance.polaroids().every((photo) => Number.isFinite(photo.rotate)),
      ).toBe(true);
      expect(fixture.componentInstance.polaroids()[threshold].offset).toBe(5);
      expect(playback()?.duration()).toBeCloseTo(8 * 2.41, 5);
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

  it.each([1, 2, 3, 7])(
    'finishes the unchanged capture before the next photo for %i images',
    async (count) => {
      await create(count);
      const landings = tweens().filter((tween) => targetsClass(tween, 'polaroid'));
      const shutters = tweens().filter((tween) => targetsClass(tween, 'snapshot-shutter'));
      const developments = tweens().filter((tween) => targetsClass(tween, 'snapshot-flash'));
      expect(shutters).toHaveLength(count);
      expect(developments).toHaveLength(count);
      landings.forEach((landing, index) => {
        const landed = landing.endTime();
        expect(landing.duration()).toBe(0.7);
        expect(shutters[index].startTime() - landed).toBeCloseTo(0.46, 5);
        expect(shutters[index].duration()).toBe(0.12);
        expect(developments[index].startTime() - landed).toBeCloseTo(0.76, 5);
        expect(developments[index].duration()).toBe(0.95);
        expect(developments[index].vars.ease).toBe('power1.inOut');
        const flash = developments[index].targets()[0] as HTMLElement;
        expect(flash.closest<HTMLElement>('.polaroid')?.dataset['index']).toBe(String(index));
        if (index + 1 < landings.length) {
          expect(landings[index + 1].startTime()).toBeGreaterThanOrEqual(
            developments[index].endTime() - 0.00001,
          );
        }
      });
      expect(playback()?.duration()).toBeCloseTo(count * 2.41, 5);
    },
  );

  it.each([
    [0.3, 0.3],
    [1, 1],
    [2, 1],
    [0, 0.7],
    [NaN, 0.7],
  ])(
    'uses transition duration %s as %s seconds without changing capture timing',
    async (configured, expected) => {
      await create(2, 3, configured);
      const landings = tweens().filter((tween) => targetsClass(tween, 'polaroid'));
      const developments = tweens().filter((tween) => targetsClass(tween, 'snapshot-flash'));
      for (const [index, landing] of landings.entries()) {
        expect(landing.duration()).toBe(expected);
        expect(developments[index].startTime() - landing.endTime()).toBeCloseTo(0.76, 5);
        expect(developments[index].duration()).toBe(0.95);
      }
      expect(landings[1].startTime()).toBeCloseTo(expected + 1.71, 5);
      expect(playback()?.duration()).toBeCloseTo(2 * (expected + 1.71), 5);
    },
  );

  it('shows every photo as a static grid under reduced motion', async () => {
    reducedMotion = true;
    const root = await create(7);
    expect(root.querySelector('.proposal-section')?.classList).toContain('reduced-motion');
    expect(playback()).toBeNull();
    const photos = Array.from(root.querySelectorAll<HTMLElement>('.polaroid'));
    expect(photos).toHaveLength(7);
    expect(photos.every((photo) => !photo.style.transform && !photo.style.visibility)).toBe(true);
    expect(photos.map((photo) => Number(photo.style.order)).sort((a, b) => a - b)).toEqual([
      0, 1, 2, 3, 4, 5, 6,
    ]);
    expect(
      Array.from(root.querySelectorAll<HTMLElement>('.snapshot-flash')).every(
        (flash) => !flash.style.opacity,
      ),
    ).toBe(true);
  });

  it('stops playback and restores every photo when reduced motion is enabled mid-sequence', async () => {
    const events = new EventTarget();
    const original = window.matchMedia('(prefers-reduced-motion: reduce)');
    vi.mocked(window.matchMedia).mockReturnValue({
      ...original,
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
    });
    const root = await create(7);
    const timeline = playback();
    const kill = vi.spyOn(timeline!, 'kill');
    timeline?.time(1.6, false);
    const change = new Event('change');
    Object.defineProperty(change, 'matches', { value: true });
    events.dispatchEvent(change);
    fixture.detectChanges();
    expect(kill).toHaveBeenCalled();
    expect(root.querySelector('.proposal-section')?.classList).toContain('reduced-motion');
    expect(
      Array.from(root.querySelectorAll<HTMLElement>('.polaroid')).every(
        (photo) => !photo.style.transform && !photo.style.visibility && photo.style.zIndex !== '',
      ),
    ).toBe(true);
    expect(
      Array.from(root.querySelectorAll<HTMLElement>('.snapshot-flash')).every(
        (flash) => !flash.style.opacity,
      ),
    ).toBe(true);
  });

  function imageAt(root: HTMLElement, index: number): HTMLImageElement {
    return root.querySelector<HTMLImageElement>(`[data-index="${index}"] img`)!;
  }

  it('requests photos sequentially only in view and pauses development offscreen', async () => {
    const root = await create(4);
    const timeline = playback()!;
    expect(root.querySelectorAll('img[src]')).toHaveLength(1); // Section ornament only.
    expect(timeline.paused()).toBe(true);
    setVisible(true);
    expect(imageAt(root, 0).getAttribute('src')).toBe('/album/0.webp');
    expect(imageAt(root, 1).hasAttribute('src')).toBe(false);
    expect(timeline.paused()).toBe(true); // Wait for the requested image.
    imageAt(root, 0).dispatchEvent(new Event('load'));
    expect(timeline.paused()).toBe(false);
    timeline.render(1.5, false, false);
    setVisible(false);
    const pausedAt = timeline.time();
    expect(timeline.paused()).toBe(true);
    expect(imageAt(root, 1).hasAttribute('src')).toBe(false);
    setVisible(true);
    expect(timeline.paused()).toBe(false);
    expect(timeline.time()).toBe(pausedAt);
    timeline.render(2.42, false, false);
    expect(timeline.time()).toBeCloseTo(2.41, 5);
    expect(timeline.paused()).toBe(true);
    expect(imageAt(root, 1).getAttribute('src')).toBe('/album/1.webp');
    expect(imageAt(root, 2).hasAttribute('src')).toBe(false);
    setVisible(false);
    imageAt(root, 1).dispatchEvent(new Event('load'));
    expect(timeline.paused()).toBe(true); // Offscreen completion must not resume.
    setVisible(true);
    expect(timeline.paused()).toBe(false);
    expect(imageAt(root, 2).hasAttribute('src')).toBe(false);
  });

  it('continues after a failed image without requesting the next photo early', async () => {
    const root = await create(2);
    setVisible(true);
    imageAt(root, 0).dispatchEvent(new Event('error'));
    expect(playback()?.paused()).toBe(false);
    expect(imageAt(root, 1).hasAttribute('src')).toBe(false);
  });

  it('loads static reduced-motion images only after the section enters view', async () => {
    reducedMotion = true;
    const root = await create(4);
    expect(root.querySelectorAll('.polaroid img[src]')).toHaveLength(0);
    setVisible(true);
    expect(root.querySelectorAll('.polaroid img[src]')).toHaveLength(4);
    setVisible(false);
    expect(playback()).toBeNull();
  });

  it('retains completed stacks on re-entry and disconnects on destruction', async () => {
    await create(1);
    setVisible(true);
    const timeline = playback()!;
    const image = (fixture.nativeElement as HTMLElement).querySelector<HTMLImageElement>(
      '.polaroid img',
    )!;
    image.dispatchEvent(new Event('load'));
    timeline.render(timeline.duration(), false, false);
    setVisible(false);
    setVisible(true);
    expect(timeline.progress()).toBe(1);
    fixture.destroy();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('handles an empty album without starting playback', async () => {
    const root = await create(0);
    expect(root.querySelectorAll('.polaroid-slot')).toHaveLength(3);
    expect(root.querySelectorAll('.polaroid')).toHaveLength(0);
    expect(playback()).toBeNull();
  });
});
