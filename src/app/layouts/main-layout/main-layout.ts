import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DEFAULT_WEDDING_CONFIG } from '../../core/models/wedding-config';
import { BookStateService } from '../../core/services/book-state.service';
import { ChapterOne } from '../../features/chapter-one/chapter-one';
import { ConstellationBackground } from '../../features/constellation-background/constellation-background';
import { Cover } from '../../features/cover/cover';
import { Countdown } from '../../features/countdown/countdown';
import { Ending } from '../../features/ending/ending';
import { HeAndShe } from '../../features/he-and-she/he-and-she';
import { Introduction } from '../../features/introduction/introduction';
import { Proposal } from '../../features/proposal/proposal';
import { Rsvp } from '../../features/rsvp/rsvp';
import { Timeline } from '../../features/timeline/timeline';
import { WeddingInfo } from '../../features/wedding-info/wedding-info';
import type { ChapterSection } from '../../shared/components/chapter-breadcrumb';
import { ChapterBreadcrumb } from '../../shared/components/chapter-breadcrumb';
import { DandelionTransition } from '../../shared/components/dandelion-transition';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-main-layout',
  imports: [
    Cover,
    Introduction,
    HeAndShe,
    ChapterOne,
    Timeline,
    Proposal,
    Countdown,
    WeddingInfo,
    Rsvp,
    Ending,
    ChapterBreadcrumb,
    DandelionTransition,
    ConstellationBackground,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  private readonly document = inject(DOCUMENT);
  private bookState = inject(BookStateService);
  private destroyRef = inject(DestroyRef);
  private observer: IntersectionObserver | null = null;
  private currentHash = '';
  private coverScrollLocked = false;
  private previousScrollRestoration: ScrollRestoration | null = null;
  private readonly sectionIds = [
    'introduction',
    'he-and-she',
    'chapter-one',
    'timeline',
    'proposal',
    'wedding-info',
    'rsvp',
    'countdown',
    'ending',
  ];

  readonly config = DEFAULT_WEDDING_CONFIG;
  readonly bookStateSig = this.bookState.state;
  readonly sectionIndex = signal(0);
  readonly scrollProgress = signal(0);
  readonly showTransition = signal(false);

  readonly breadcrumbSections: ChapterSection[] = [
    { id: 'introduction', number: 1, label: 'Introduction' },
    { id: 'he-and-she', number: 2, label: 'Couple' },
    { id: 'chapter-one', number: 3, label: 'Chapter One' },
    { id: 'timeline', number: 4, label: 'Timeline' },
    { id: 'proposal', number: 5, label: 'Proposal' },
    { id: 'wedding-info', number: 6, label: 'Wedding Info' },
    { id: 'rsvp', number: 7, label: 'RSVP' },
    { id: 'countdown', number: 8, label: 'Countdown' },
    { id: 'ending', number: 9, label: 'Ending' },
  ];

  private scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContent');
  private coverComponent = viewChild.required<Cover>('coverComponent');

  private readonly preventCoverScroll = (event: Event): void => event.preventDefault();
  private readonly preventCoverKeyScroll = (event: KeyboardEvent): void => {
    if ([' ', 'ArrowDown', 'ArrowUp', 'End', 'Home', 'PageDown', 'PageUp'].includes(event.key)) {
      event.preventDefault();
    }
  };

  constructor() {
    afterNextRender(() => {
      this.disableScrollRestoration();
      this.lockCoverScroll();
      this.destroyRef.onDestroy(() => {
        ScrollTrigger.getAll().forEach((st) => st.kill());
        this.observer?.disconnect();
        this.unlockCoverScroll();
        this.restoreScrollRestoration();
      });
    });
  }

  onCoverOpened(): void {
    this.lockCoverScroll();
    this.bookState.setOpening();
    const coverEl = document.querySelector('.cover-stage') as HTMLElement | null;
    const scrollEl = document.querySelector('.scroll-stage') as HTMLElement | null;

    this.showTransition.set(true);

    const finalize = () => {
      this.scrollToInitialHash();
      this.bookState.setOpen();
      this.resetScrollPosition();
      this.unlockCoverScroll();
      this.startSectionObserver();
      this.startScrollProgressTracking();
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    };

    if (coverEl && scrollEl) {
      gsap.set(scrollEl, { opacity: 0, y: 0 });
      gsap.to(coverEl, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
      });
      gsap.to(scrollEl, {
        opacity: 1,
        duration: 0.6,
        delay: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(coverEl, { display: 'none' });
          gsap.set(scrollEl, { clearProps: 'all' });
          finalize();
        },
      });
    } else {
      finalize();
    }
  }

  onTransitionComplete(): void {
    this.showTransition.set(false);
  }

  private scrollToInitialHash(): void {
    this.resetScrollPosition();
    this.currentHash = '';
    history.replaceState(null, '', window.location.pathname);
  }

  onBreadcrumbNavigate(index: number): void {
    const section = this.breadcrumbSections[index];
    if (section) {
      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private startScrollProgressTracking(): void {
    const handler = () => {
      const scrollTop = document.documentElement.scrollTop || window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      this.scrollProgress.set(scrollHeight > 0 ? scrollTop / scrollHeight : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', handler));
  }

  onCloseBook(): void {
    this.bookState.setClosing();
    this.observer?.disconnect();

    this.lockCoverScroll();

    const container = this.scrollContainer().nativeElement;
    const coverEl = document.querySelector('.cover-stage') as HTMLElement | null;

    gsap.to(container, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.inOut',
    });

    if (coverEl) {
      gsap.set(coverEl, { display: 'block', opacity: 0 });
      gsap.to(coverEl, {
        opacity: 1,
        duration: 0.5,
        delay: 0.2,
        ease: 'power2.out',
        onComplete: () => {
          this.coverComponent().resetFlip();
          this.bookState.setClosed();
          this.currentHash = '';
          history.replaceState(null, '', window.location.pathname);
          gsap.set(container, { clearProps: 'all' });
        },
      });
    } else {
      this.coverComponent().resetFlip();
      this.bookState.setClosed();
      this.currentHash = '';
      history.replaceState(null, '', window.location.pathname);
      gsap.set(container, { clearProps: 'all' });
    }
  }

  private disableScrollRestoration(): void {
    if (!('scrollRestoration' in history)) return;
    this.previousScrollRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
  }

  private restoreScrollRestoration(): void {
    if (this.previousScrollRestoration === null) return;
    history.scrollRestoration = this.previousScrollRestoration;
    this.previousScrollRestoration = null;
  }

  private lockCoverScroll(): void {
    this.resetScrollPosition();
    if (this.coverScrollLocked) return;

    this.coverScrollLocked = true;
    this.document.documentElement.classList.add('book-cover-active');
    this.document.body.classList.add('book-cover-active');
    this.document.addEventListener('wheel', this.preventCoverScroll, {
      capture: true,
      passive: false,
    });
    this.document.addEventListener('touchmove', this.preventCoverScroll, {
      capture: true,
      passive: false,
    });
    this.document.addEventListener('keydown', this.preventCoverKeyScroll, true);
  }

  private unlockCoverScroll(): void {
    if (!this.coverScrollLocked) return;

    this.coverScrollLocked = false;
    this.document.documentElement.classList.remove('book-cover-active');
    this.document.body.classList.remove('book-cover-active');
    this.document.removeEventListener('wheel', this.preventCoverScroll, true);
    this.document.removeEventListener('touchmove', this.preventCoverScroll, true);
    this.document.removeEventListener('keydown', this.preventCoverKeyScroll, true);
  }

  private resetScrollPosition(): void {
    window.scrollTo(0, 0);
    this.document.documentElement.scrollTop = 0;
    this.document.body.scrollTop = 0;
  }

  private startSectionObserver(): void {
    const sections = this.sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }
        if (bestEntry) {
          const id = bestEntry.target.id;
          if (id && id !== this.currentHash) {
            this.currentHash = id;
            history.replaceState(null, '', `#${id}`);
            const idx = this.sectionIds.indexOf(id);
            if (idx >= 0) {
              this.sectionIndex.set(idx);
            }
          }
        }
      },
      {
        rootMargin: '-80px 0px -40% 0px',
        threshold: [0, 0.25, 0.5],
      },
    );

    sections.forEach((el) => this.observer?.observe(el));
  }
}
