import { ComponentFixture, TestBed } from '@angular/core/testing';
import { gsap } from 'gsap';
import { DEFAULT_WEDDING_CONFIG } from '../../core/models/wedding-config';
import { AudioService } from '../../core/services/audio.service';
import { Cover } from './cover';

const pageFlipMock = vi.hoisted(() => {
  type PageFlipEvent = 'flip' | 'changeState';
  type PageFlipHandler = (event: { data: number | string }) => void;

  let current: MockPageFlip | null = null;

  class MockPageFlip {
    private readonly handlers = new Map<PageFlipEvent, PageFlipHandler[]>();
    private currentPageIndex = 0;

    constructor() {
      current = this;
    }

    loadFromHTML(): void {}

    on(event: PageFlipEvent, handler: PageFlipHandler): this {
      const handlers = this.handlers.get(event) ?? [];
      handlers.push(handler);
      this.handlers.set(event, handlers);
      return this;
    }

    emit(event: PageFlipEvent, data: number | string): void {
      if (event === 'flip' && typeof data === 'number') this.currentPageIndex = data;
      for (const handler of this.handlers.get(event) ?? []) handler({ data });
    }

    getCurrentPageIndex(): number {
      return this.currentPageIndex;
    }

    flipNext(): void {
      this.emit('flip', 1);
      this.emit('changeState', 'read');
    }

    flipPrev(): void {
      this.emit('flip', 0);
      this.emit('changeState', 'read');
    }

    destroy(): void {}
  }

  return {
    PageFlip: MockPageFlip,
    current: () => {
      if (!current) throw new Error('PageFlip was not initialized');
      return current;
    },
  };
});

vi.mock('page-flip', () => ({ PageFlip: pageFlipMock.PageFlip }));

describe('Cover inside story', () => {
  const audio = {
    isMusicPlaying: vi.fn(() => false),
    playClick: vi.fn(),
    playFlip: vi.fn(),
    playMusic: vi.fn(),
    playWind: vi.fn(),
    stopMusic: vi.fn(),
    stopWind: vi.fn(),
  };

  beforeEach(async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    await TestBed.configureTestingModule({
      imports: [Cover],
      providers: [{ provide: AudioService, useValue: audio }],
    }).compileComponents();
  });

  afterEach(() => {
    gsap.globalTimeline.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function createCover(): { fixture: ComponentFixture<Cover>; cover: Cover } {
    const fixture = TestBed.createComponent(Cover);
    fixture.componentRef.setInput('config', DEFAULT_WEDDING_CONFIG);
    fixture.detectChanges();
    return { fixture, cover: fixture.componentInstance };
  }

  it('renders the three lines with the requested alignment and accessible text', () => {
    const { fixture } = createCover();
    const root = fixture.nativeElement as HTMLElement;
    const lines = Array.from(root.querySelectorAll<HTMLElement>('[data-inside-story-line]'));

    expect(lines.map((line) => line.getAttribute('aria-label'))).toEqual([
      'Mười năm bên nhau…',
      '…và câu chuyện vẫn còn đang viết',
      'Với chương mới mang tên “chúng mình”.',
    ]);
    expect(lines[0].classList).toContain('transition-text--left');
    expect(lines[1].classList).toContain('transition-text--right');
    expect(lines[2].classList).toContain('transition-text--center');
    const highlight = root.querySelector<HTMLElement>('.transition-highlight');
    expect(highlight?.textContent).toBe('“chúng\u00a0mình”.');
    expect(highlight?.hasAttribute('data-inside-story-highlight')).toBe(true);
    expect(root.querySelector<HTMLImageElement>('.cover-transition-photo')?.alt).toBe(
      'Nét vẽ đôi tay cô dâu chú rể khẽ chạm nhau',
    );

    fixture.destroy();
  }, 10_000);

  it('emits opened once after the six-second story timeline', () => {
    const { fixture, cover } = createCover();
    const opened = vi.fn();
    cover.opened.subscribe(opened);

    pageFlipMock.current().emit('flip', 1);
    pageFlipMock.current().emit('changeState', 'read');
    const timeline = (cover as unknown as { insideStoryTimeline: gsap.core.Timeline | null })
      .insideStoryTimeline;
    const photo = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.cover-photo-wrap',
    );
    timeline?.pause(0);

    expect(timeline?.duration()).toBeCloseTo(6, 5);
    expect(opened).not.toHaveBeenCalled();

    timeline?.time(3.79, false);
    expect(photo?.style.visibility).toBe('hidden');

    timeline?.time(4.7, false);
    expect(photo?.style.visibility).not.toBe('hidden');
    expect(Number(photo?.style.opacity)).toBeCloseTo(1, 5);

    timeline?.time(5.99, false);
    expect(opened).not.toHaveBeenCalled();

    timeline?.time(6, false);
    pageFlipMock.current().emit('changeState', 'read');
    expect(opened).toHaveBeenCalledTimes(1);

    fixture.destroy();
  }, 10_000);

  it('shows all content immediately and waits three seconds under reduced motion', () => {
    vi.useFakeTimers();
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(() => false),
        }) as MediaQueryList,
    );
    const { fixture, cover } = createCover();
    const opened = vi.fn();
    cover.opened.subscribe(opened);

    pageFlipMock.current().emit('flip', 1);
    pageFlipMock.current().emit('changeState', 'read');

    const root = fixture.nativeElement as HTMLElement;
    const characters = Array.from(root.querySelectorAll<HTMLElement>('.transition-character'));
    const photo = root.querySelector<HTMLElement>('.cover-photo-wrap');
    expect(characters.every((character) => character.style.visibility !== 'hidden')).toBe(true);
    expect(photo?.style.visibility).not.toBe('hidden');

    vi.advanceTimersByTime(2_999);
    expect(opened).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(opened).toHaveBeenCalledTimes(1);

    fixture.destroy();
  }, 10_000);

  it('resets the story before a second opening', () => {
    const { fixture, cover } = createCover();
    const opened = vi.fn();
    cover.opened.subscribe(opened);

    pageFlipMock.current().emit('flip', 1);
    pageFlipMock.current().emit('changeState', 'read');
    let timeline = (cover as unknown as { insideStoryTimeline: gsap.core.Timeline | null })
      .insideStoryTimeline;
    timeline?.progress(1, false);

    cover.resetFlip();
    pageFlipMock.current().emit('flip', 1);
    pageFlipMock.current().emit('changeState', 'read');
    timeline = (cover as unknown as { insideStoryTimeline: gsap.core.Timeline | null })
      .insideStoryTimeline;
    timeline?.progress(1, false);

    expect(opened).toHaveBeenCalledTimes(2);
    fixture.destroy();
  }, 10_000);
});
