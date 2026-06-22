import {
  Component,
  ChangeDetectionStrategy,
  inject,
  afterNextRender,
  DestroyRef,
  viewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookStateService } from '../../core/services/book-state.service';
import { DEFAULT_WEDDING_CONFIG } from '../../core/models/wedding-config';
import { Cover } from '../../features/cover/cover';
import { Introduction } from '../../features/introduction/introduction';
import { ChapterOne } from '../../features/chapter-one/chapter-one';
import { Timeline } from '../../features/timeline/timeline';
import { Proposal } from '../../features/proposal/proposal';
import { WeddingInfo } from '../../features/wedding-info/wedding-info';
import { Rsvp } from '../../features/rsvp/rsvp';
import { Ending } from '../../features/ending/ending';
import { ChapterBreadcrumb } from '../../shared/components/chapter-breadcrumb';
import type { ChapterSection } from '../../shared/components/chapter-breadcrumb';
import { DandelionTransition } from '../../shared/components/dandelion-transition';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-main-layout',
  imports: [Cover, Introduction, ChapterOne, Timeline, Proposal, WeddingInfo, Rsvp, Ending, ChapterBreadcrumb, DandelionTransition],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  private bookState = inject(BookStateService);
  private destroyRef = inject(DestroyRef);
  private observer: IntersectionObserver | null = null;
  private currentHash = '';
  private readonly sectionIds = [
    'introduction',
    'chapter-one',
    'timeline',
    'proposal',
    'wedding-info',
    'rsvp',
    'ending',
  ];

  readonly config = DEFAULT_WEDDING_CONFIG;
  readonly bookStateSig = this.bookState.state;
  readonly sectionIndex = signal(0);
  readonly scrollProgress = signal(0);
  readonly showTransition = signal(false);

  readonly breadcrumbSections: ChapterSection[] = [
    { id: 'introduction', number: 1, label: 'Introduction' },
    { id: 'chapter-one', number: 2, label: 'Chapter One' },
    { id: 'timeline', number: 3, label: 'Timeline' },
    { id: 'proposal', number: 4, label: 'Proposal' },
    { id: 'wedding-info', number: 5, label: 'Wedding Info' },
    { id: 'rsvp', number: 6, label: 'RSVP' },
    { id: 'ending', number: 7, label: 'Ending' },
  ];

  private scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContent');

  constructor() {
    afterNextRender(() => {
      this.destroyRef.onDestroy(() => {
        ScrollTrigger.getAll().forEach((st) => st.kill());
        this.observer?.disconnect();
      });
    });
  }

  onCoverOpened(): void {
    this.bookState.setOpening();
    setTimeout(() => {
      const coverEl = document.querySelector('.cover-stage') as HTMLElement | null;
      const scrollEl = document.querySelector('.scroll-stage') as HTMLElement | null;

      this.showTransition.set(true);

      if (coverEl && scrollEl) {
        gsap.set(scrollEl, { clearProps: 'all' });

        gsap.timeline({
          onComplete: () => {
            gsap.set(coverEl, { clearProps: 'all' });
            gsap.set(scrollEl, { clearProps: 'all' });
            this.bookState.setOpen();
            this.startSectionObserver();
            this.startScrollProgressTracking();
            this.scrollToInitialHash();
          },
        })
          .to(coverEl, { x: '80%', scale: 0.9, opacity: 0, duration: 1.2, ease: 'power2.inOut' }, 0)
          .fromTo(scrollEl, { opacity: 0, x: '-8%' }, { opacity: 1, x: '0%', duration: 1.2, ease: 'power2.out' }, 0);
      } else {
        this.bookState.setOpen();
        this.startSectionObserver();
        this.startScrollProgressTracking();
        this.scrollToInitialHash();
      }
    }, 600);
  }

  onTransitionComplete(): void {
    this.showTransition.set(false);
  }

  private scrollToInitialHash(): void {
    const hash = window.location.hash.slice(1);
    if (hash && this.sectionIds.includes(hash)) {
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
      }
    }
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

    const container = this.scrollContainer().nativeElement;

    gsap.to(container, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        this.bookState.setClosed();
        this.currentHash = '';
        history.replaceState(null, '', window.location.pathname);
        const cover = document.querySelector('.cover-stage');
        if (cover) gsap.set(cover, { clearProps: 'all' });
        gsap.set(container, { clearProps: 'all' });
      },
    });
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
