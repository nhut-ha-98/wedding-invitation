import { Injectable } from '@angular/core';

/**
 * Invisible guided tour through the story.
 *
 * Gently scrolls the page through the seven sections. Any human interaction
 * (wheel, touch, scrollbar, keyboard, pointer) kills the active leg
 * immediately; after ~10s of silence the tour resumes from where it now is,
 * forward-only. A decisive jump (breadcrumb) or the book-close ends the tour
 * for the session. Fully disabled under `prefers-reduced-motion`.
 */
@Injectable({ providedIn: 'root' })
export class StoryAutoScrollService {
  private readonly sectionIds = [
    'introduction',
    'he-and-she',
    'chapter-one',
    'timeline',
    'proposal',
    'wedding-info',
    'rsvp',
    'ending',
  ];

  /** Dwell (s) at a section once arrived, so landmarks can breathe. */
  private readonly dwellAt: Readonly<Record<string, number>> = {
    'he-and-she': 2.5,
    'wedding-info': 3,
    rsvp: 4,
  };

  private readonly idleResumeMs = 10_000;
  private readonly holdTotalMs = 7_000;
  private readonly moveBudgetMs = 73_000;

  private rafId = 0;
  private stepping = false;
  private active = false;
  private sessionEnded = true;
  private targets: number[] = [];
  private msPerPx = 0;
  private lastScrollTop = 0;
  private lastUserY = 0;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private dwellTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly onWheel = () => this.interrupt();
  private readonly onTouch = () => this.interrupt();
  private readonly onKey = () => this.interrupt();
  private readonly onPointer = () => this.interrupt();
  private readonly onScroll = () => {
    const y = getScrollY();
    if (this.stepping) {
      this.lastScrollTop = y;
      return;
    }
    if (this.active && Math.abs(y - this.lastScrollTop) > 8) {
      this.lastUserY = y;
      this.lastScrollTop = y;
      this.interrupt();
    }
  };

  startTour(): void {
    if (prefersReducedMotion() || this.active) return;
    this.active = true;
    this.sessionEnded = false;
    this.bindListeners();
    this.rebuildTargets();
    this.resumeFrom(getScrollY());
  }

  /** Ends the tour permanently (book close or a decisive entry-point jump). */
  endTour(): void {
    this.active = false;
    this.sessionEnded = true;
    this.stopRaf();
    this.clearIdle();
    this.clearDwell();
    this.unbindListeners();
  }

  private resumeFrom(y: number): void {
    if (!this.active || this.sessionEnded) return;
    const targetIndex = this.targets.findIndex((t) => t > y + 4);
    if (targetIndex < 0) {
      this.finishTour();
      return;
    }
    this.step(targetIndex);
  }

  private step(index: number): void {
    if (!this.active || this.sessionEnded || index >= this.targets.length) {
      this.finishTour();
      return;
    }
    const target = this.targets[index];
    const fromY = getScrollY();
    const dist = Math.abs(target - fromY);
    if (dist < 2) {
      this.dwell(index);
      return;
    }
    const duration = Math.max(250, dist * this.msPerPx);
    this.animate(fromY, target, duration, () => this.dwell(index));
  }

  private dwell(index: number): void {
    const section = this.sectionIds[index];
    const hold = this.dwellAt[section];
    const next = () => this.step(index + 1);
    if (!hold) {
      next();
      return;
    }
    this.dwellTimer = setTimeout(next, hold * 1000);
  }

  private finishTour(): void {
    this.active = false;
    this.sessionEnded = true;
    this.stopRaf();
    this.clearIdle();
    this.clearDwell();
    this.unbindListeners();
  }

  private interrupt(): void {
    if (!this.active) return;
    this.stopRaf();
    this.clearDwell();
    this.lastUserY = getScrollY();
    this.scheduleResume();
  }

  private scheduleResume(): void {
    this.clearIdle();
    this.idleTimer = setTimeout(() => {
      if (!this.active || this.sessionEnded) return;
      if (Math.abs(getScrollY() - this.lastUserY) > 8) return;
      this.rebuildTargets();
      this.resumeFrom(getScrollY());
    }, this.idleResumeMs);
  }

  private animate(from: number, to: number, duration: number, onDone: () => void): void {
    this.stopRaf();
    this.stepping = true;
    const startAt = performance.now();
    this.lastUserY = getScrollY();

    const frame = (now: number): void => {
      if (!this.stepping || !this.active || this.sessionEnded) {
        this.stepping = false;
        return;
      }
      const t = Math.min(1, (now - startAt) / duration);
      const y = from + (to - from) * easeInOutCubic(t);
      window.scrollTo({ top: y, behavior: 'instant' });
      this.lastScrollTop = y;
      if (t >= 1) {
        this.stepping = false;
        onDone();
        return;
      }
      this.rafId = requestAnimationFrame(frame);
    };
    this.rafId = requestAnimationFrame(frame);
  }

  private rebuildTargets(): void {
    this.msPerPx = 1;
    this.targets = this.sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
      .map((el) => el.offsetTop);

    if (this.targets.length > 1) {
      const totalDist = this.targets[this.targets.length - 1] - this.targets[0];
      this.msPerPx = totalDist > 0 ? this.moveBudgetMs / totalDist : 1;
    }
  }

  private clearIdle(): void {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private clearDwell(): void {
    if (this.dwellTimer !== null) {
      clearTimeout(this.dwellTimer);
      this.dwellTimer = null;
    }
  }

  private stopRaf(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    this.stepping = false;
  }

  private bindListeners(): void {
    window.addEventListener('wheel', this.onWheel, { passive: true });
    window.addEventListener('touchstart', this.onTouch, { passive: true });
    window.addEventListener('touchmove', this.onTouch, { passive: true });
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('pointerdown', this.onPointer);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.lastScrollTop = getScrollY();
  }

  private unbindListeners(): void {
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('touchstart', this.onTouch);
    window.removeEventListener('touchmove', this.onTouch);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('pointerdown', this.onPointer);
    window.removeEventListener('scroll', this.onScroll);
  }
}

function getScrollY(): number {
  return window.scrollY || document.documentElement.scrollTop;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
