import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { gsap } from 'gsap';
import { WishesService } from '../../core/services/wishes.service';
import { Wishes } from './wishes';

describe('Wishes', () => {
  let onIntersection: IntersectionObserverCallback;
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          onIntersection = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('hides the whole section when no approved wishes exist', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: WishesService, useValue: { wishes$: of([]) } }],
    });
    const fixture = TestBed.createComponent(Wishes);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('section')).toBeNull();
  });

  it('renders guest content as text in a keyboard-accessible wish', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WishesService,
          useValue: {
            wishes$: of([
              { id: '1', name: 'Guest', notes: '<img src=x onerror=alert(1)>', submittedAt: 0 },
            ]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(Wishes);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    fixture.componentInstance.revealed.set(true);
    fixture.detectChanges();
    expect(element.querySelector('blockquote')?.textContent).toContain(
      '<img src=x onerror=alert(1)>',
    );
    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('.wish-card')?.getAttribute('tabindex')).toBe('0');
    expect(element.querySelector('.wish-controls')).toBeNull();
  });

  it('masks guest names with the first letter and asterisks per remaining character', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WishesService,
          useValue: {
            wishes$: of([{ id: '1', name: 'John Doe', notes: 'Loved it!', submittedAt: 0 }]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(Wishes);
    fixture.detectChanges();
    const author = fixture.nativeElement.querySelector('.wish-author');
    expect(author?.textContent).toContain('J*** D**');
  });

  it('keeps Vietnamese honorifics visible while masking the actual name', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WishesService,
          useValue: {
            wishes$: of([{ id: '1', name: 'Bạn John Doe', notes: 'Loved it!', submittedAt: 0 }]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(Wishes);
    fixture.detectChanges();
    const author = fixture.nativeElement.querySelector('.wish-author');
    expect(author?.textContent).toContain('Bạn J*** D**');
  });

  it('shows the title, top-right icons, and keyboard navigation', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WishesService,
          useValue: {
            wishes$: of([
              { id: '1', name: 'First', notes: 'First wish', submittedAt: 2 },
              { id: '2', name: 'Second', notes: 'Second wish', submittedAt: 1 },
            ]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(Wishes);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    fixture.componentInstance.revealed.set(true);
    fixture.detectChanges();
    const active = () => root.querySelectorAll('.wish-card[aria-hidden="false"]');
    expect(active()).toHaveLength(1);
    expect(active()[0].textContent).toContain('First wish');
    expect(root.querySelector('.wish-count')).toBeNull();
    expect(root.querySelector('.wishes-title')?.textContent).toBe('Lời chúc');
    expect(root.querySelector('.wishes-header [aria-label="Lời chúc trước"] svg')).not.toBeNull();
    expect(
      root.querySelector('.wishes-header [aria-label="Lời chúc tiếp theo"] svg'),
    ).not.toBeNull();
    root
      .querySelector('section')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(active()).toHaveLength(1);
    expect(active()[0].textContent).toContain('Second wish');
    root
      .querySelector('section')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(active()[0].textContent).toContain('First wish');
    root.querySelector<HTMLButtonElement>('[aria-label="Lời chúc tiếp theo"]')!.click();
    fixture.detectChanges();
    expect(active()[0].textContent).toContain('Second wish');
  });

  it('reveals arrow selections while hover and keyboard focus pause autoplay', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WishesService,
          useValue: {
            wishes$: of([
              { id: '1', name: 'First', notes: 'First wish', submittedAt: 0 },
              { id: '2', name: 'Second', notes: 'Second wish', submittedAt: 0 },
            ]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(Wishes);
    fixture.detectChanges();
    onIntersection(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    fixture.componentInstance.revealed.set(true);
    fixture.componentInstance.reducedMotion.set(false);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    root.querySelector('section')!.dispatchEvent(new MouseEvent('mouseenter'));
    const next = root.querySelector<HTMLButtonElement>('[aria-label="Lời chúc tiếp theo"]')!;
    const previous = root.querySelector<HTMLButtonElement>('[aria-label="Lời chúc trước"]')!;
    next.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    fixture.detectChanges();

    for (const [button, expected] of [
      [next, 'Second wish'],
      [previous, 'First wish'],
    ] as const) {
      button.click();
      fixture.detectChanges();
      const card = root.querySelector<HTMLElement>('.wish-card[aria-hidden="false"]')!;
      expect(card.textContent).toContain(expected);
      const entrance = gsap.getTweensOf(card).find((tween) => tween.vars.autoAlpha === 1)!;
      expect(entrance).toBeDefined();
      expect(entrance.paused()).toBe(false);
      entrance.progress(1);
      expect(card.style.opacity).toBe('1');
      expect(card.style.visibility).not.toBe('hidden');
      const progress = gsap.getTweensOf(card.querySelector('.wish-progress-fill')!)[0];
      expect((progress.parent as gsap.core.Timeline).paused()).toBe(true);
    }
  });

  it('shuffles once and repeats the same order on subsequent cycles', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    const wishes = ['A', 'B', 'C', 'D'].map((id) => ({
      id,
      name: id,
      notes: id,
      submittedAt: 0,
    }));
    TestBed.configureTestingModule({
      providers: [{ provide: WishesService, useValue: { wishes$: of(wishes) } }],
    });
    const fixture = TestBed.createComponent(Wishes);
    const component = fixture.componentInstance;
    const current = () => component.wishes()[component.activeIndex()].id;
    const firstCycle = [current()];
    expect(component.wishes().map((wish) => wish.id)).not.toEqual(wishes.map((wish) => wish.id));
    for (let step = 1; step < wishes.length; step++) {
      component.move(1);
      firstCycle.push(current());
    }
    expect(new Set(firstCycle).size).toBe(wishes.length);

    // Changing randomness after loading must not affect subsequent cycles.
    random.mockReturnValue(0.25);
    random.mockClear();
    component.move(1);
    expect(current()).not.toBe(firstCycle.at(-1));
    const secondCycle = [current()];
    for (let step = 1; step < wishes.length; step++) {
      component.move(1);
      secondCycle.push(current());
    }
    expect([...secondCycle].sort()).toEqual([...firstCycle].sort());
    expect(secondCycle).toEqual(firstCycle);
    component.move(1);
    expect(current()).not.toBe(secondCycle.at(-1));
    expect(current()).toBe(firstCycle[0]);
    expect(random).not.toHaveBeenCalled();
  });

  it('fills the footer during reading time and preserves progress while hovered', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WishesService,
          useValue: {
            wishes$: of([
              { id: '1', name: 'First', notes: 'First wish', submittedAt: 0 },
              { id: '2', name: 'Second', notes: 'Second wish', submittedAt: 0 },
            ]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(Wishes);
    fixture.detectChanges();
    onIntersection(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    fixture.componentInstance.revealed.set(true);
    fixture.componentInstance.reducedMotion.set(false);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const fill = root.querySelector('.wish-card[aria-hidden="false"] .wish-progress-fill')!;
    const progress = gsap.getTweensOf(fill)[0];
    expect(progress.duration()).toBe(5);
    progress.progress(0.5);
    expect(Number(gsap.getProperty(fill, 'scaleX'))).toBeCloseTo(0.5);
    const timeline = progress.parent as gsap.core.Timeline;
    fixture.componentInstance.hovered.set(true);
    fixture.detectChanges();
    expect(timeline.paused()).toBe(true);
    expect(Number(gsap.getProperty(fill, 'scaleX'))).toBeCloseTo(0.5);
    fixture.componentInstance.hovered.set(false);
    fixture.detectChanges();
    expect(timeline.paused()).toBe(false);
    fixture.componentInstance.move(1);
    fixture.detectChanges();
    const nextFill = root.querySelector('.wish-card[aria-hidden="false"] .wish-progress-fill')!;
    expect(Number(gsap.getProperty(nextFill, 'scaleX'))).toBe(0);
  });

  it('waits 1.2 seconds after entering view before revealing the first wish', () => {
    const delay = vi.spyOn(gsap, 'delayedCall');
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WishesService,
          useValue: { wishes$: of([{ id: '1', name: 'Guest', notes: 'A wish', submittedAt: 0 }]) },
        },
      ],
    });
    const fixture = TestBed.createComponent(Wishes);
    fixture.detectChanges();
    expect(fixture.componentInstance.revealed()).toBe(false);
    const section: HTMLElement = fixture.nativeElement.querySelector('section');
    expect(section.getAttribute('aria-hidden')).toBe('true');
    expect(section.style.visibility).toBe('hidden');
    expect(section.inert).toBe(true);
    expect(delay).not.toHaveBeenCalled();
    onIntersection(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(fixture.componentInstance.revealed()).toBe(false);
    const revealCall = delay.mock.calls.find(([seconds]) => seconds === 1.2);
    expect(revealCall).toBeDefined();
    revealCall![1]();
    fixture.detectChanges();
    expect(fixture.componentInstance.revealed()).toBe(true);
    expect(section.getAttribute('aria-hidden')).toBe('false');
    expect(section.inert).toBe(false);
    expect(fixture.nativeElement.querySelector('.wish-card').getAttribute('aria-hidden')).toBe(
      'false',
    );
  });
});
