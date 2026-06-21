import {
  Component,
  ChangeDetectionStrategy,
  inject,
  afterNextRender,
  DestroyRef,
  viewChild,
  ElementRef,
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

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-main-layout',
  imports: [Cover, Introduction, ChapterOne, Timeline, Proposal, WeddingInfo, Rsvp, Ending],
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
      this.bookState.setOpen();
      this.startSectionObserver();
      this.scrollToInitialHash();
    }, 600);
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
