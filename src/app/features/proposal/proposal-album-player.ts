import { gsap } from 'gsap';
import { InstantPhoto } from '../../shared/directives/instant-photo.directive';
import { fitStackPose, StackBounds, StackPose } from './proposal-album-layout';

/** A photo stays assigned to this slot for both automatic and manual playback. */
export interface AlbumPrint {
  readonly index: number;
  readonly slot: number;
  readonly rotate: number;
  readonly offset: number;
  readonly element: HTMLElement;
  readonly image: HTMLImageElement;
  readonly capture: InstantPhoto;
}

interface AlbumPlayerOptions {
  readonly slotCount: number;
  readonly transitionDuration: number;
  readonly autoDelay: number;
  readonly onStateChange: (counts: readonly number[], busy: boolean) => void;
}

/** Serializes capture, manual stack changes, and a viewport-aware autoplay wait. */
export class ProposalAlbumPlayer {
  private readonly pools: AlbumPrint[][];
  private readonly counts: number[];
  private readonly seen = new Set<number>();
  private readonly ready = new Set<number>();
  private readonly bounds = new Map<AlbumPrint, StackBounds>();
  private readonly popping = new Set<number>();
  private readonly imageEvents = new AbortController();
  private animation: gsap.core.Timeline | null = null;
  private activePrint: AlbumPrint | null = null;
  private readonly resizeObserver: ResizeObserver | null;
  private autoTimer: gsap.core.Tween | null = null;
  private pendingPrint: AlbumPrint | null = null;
  private pendingClick: number | null = null;
  private visible = false;
  private staticMode = false;

  constructor(
    private readonly prints: readonly AlbumPrint[],
    private readonly options: AlbumPlayerOptions,
  ) {
    this.pools = Array.from({ length: options.slotCount }, (_, slot) =>
      prints.filter((print) => print.slot === slot),
    );
    this.counts = this.pools.map(() => 0);
    this.resizeObserver =
      typeof ResizeObserver === 'function' ? new ResizeObserver(() => this.reflow()) : null;
    new Set(prints.map((print) => print.element.parentElement)).forEach((slot) => {
      if (slot) this.resizeObserver?.observe(slot);
    });
    prints.forEach((print) => {
      const ready = (): void => {
        this.ready.add(print.index);
        if (this.pendingPrint === print && this.visible && !this.staticMode) {
          this.startPush(print);
        }
      };
      print.image.addEventListener('load', ready, { signal: this.imageEvents.signal });
      print.image.addEventListener('error', ready, { signal: this.imageEvents.signal });
    });
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (!visible) {
      this.animation?.pause();
      this.autoTimer?.pause();
    } else if (this.staticMode) {
      this.prints.forEach((print) => this.requestImage(print));
    } else if (this.pendingPrint) {
      this.requestPending();
    } else if (this.animation) {
      this.animation.resume();
    } else if (this.pendingClick !== null) {
      const slot = this.pendingClick;
      this.pendingClick = null;
      this.autoTimer?.kill();
      this.autoTimer = null;
      this.advanceSlot(slot);
    } else if (this.autoTimer) {
      this.autoTimer.resume();
    } else {
      this.advanceAuto();
    }
  }

  activate(slot: number): void {
    if (!this.visible || this.staticMode || !this.pools[slot]?.length) return;
    this.autoTimer?.kill();
    this.autoTimer = null;
    // A click never cuts short a capture. Keep the latest requested slot queued.
    if (this.animation) {
      this.pendingClick = slot;
    } else if (this.pendingPrint?.slot === slot) {
      // This slot's next photo is already loading; the click uses that same photo.
      this.requestPending();
    } else {
      // An unrelated load may finish, but cannot start a capture because of this click.
      this.pendingPrint = null;
      this.pendingClick = null;
      this.options.onStateChange([...this.counts], false);
      this.advanceSlot(slot);
    }
  }

  showStatic(): void {
    this.staticMode = true;
    this.activePrint = null;
    this.animation?.kill();
    this.autoTimer?.kill();
    this.animation = null;
    this.autoTimer = null;
    this.pendingPrint = null;
    this.pendingClick = null;
    this.prints.forEach((print) => {
      gsap.set(print.element, { clearProps: 'transform,opacity,visibility' });
      gsap.set(print.element.querySelectorAll('.snapshot-flash, .snapshot-shutter'), {
        clearProps: 'transform,opacity',
      });
      if (this.visible) this.requestImage(print);
    });
    this.options.onStateChange(
      this.pools.map((pool) => pool.length),
      false,
    );
  }

  destroy(): void {
    this.resizeObserver?.disconnect();
    this.animation?.kill();
    this.autoTimer?.kill();
    this.imageEvents.abort();
  }

  private measureBounds(print: AlbumPrint): StackBounds {
    const bounds = {
      width: print.element.offsetWidth,
      height: print.element.offsetHeight,
      left: print.element.offsetLeft,
      slotWidth: print.element.parentElement?.clientWidth ?? 0,
    };
    this.bounds.set(print, bounds);
    return bounds;
  }

  private pose(print: AlbumPrint, desired: StackPose): StackPose {
    return fitStackPose(this.bounds.get(print) ?? this.measureBounds(print), desired);
  }

  private constrainMovement(print: AlbumPrint): () => void {
    const setX = gsap.quickSetter(print.element, 'x', 'px');
    return () => {
      // Fit intermediate rotations too, without layout reads or new tweens per frame.
      const pose = this.pose(print, {
        x: Number(gsap.getProperty(print.element, 'x')),
        y: 0,
        rotation: Number(gsap.getProperty(print.element, 'rotation')),
      });
      setX(pose.x);
    };
  }

  private poseVars(print: AlbumPrint, desired: StackPose): gsap.TweenVars {
    return {
      x: () => this.pose(print, desired).x,
      y: desired.y,
      rotation: () => this.pose(print, desired).rotation,
    };
  }

  private reflow(): void {
    if (this.staticMode) return;
    for (const print of this.prints) {
      this.measureBounds(print);
      if (print !== this.activePrint) {
        gsap.set(
          print.element,
          this.pose(print, {
            x: print.offset,
            y: -print.offset,
            rotation: print.rotate,
          }),
        );
      }
    }
    // Refit only the paper's movement; capture/development timing stays untouched.
    const movement = this.animation?.getChildren(false, true, false)[0];
    if (movement) {
      const progress = movement.progress();
      movement.invalidate().progress(progress, true);
      if (this.activePrint) this.constrainMovement(this.activePrint)();
    }
  }

  private requestImage(print: AlbumPrint): void {
    const source = print.image.dataset['src'];
    if (source && !print.image.hasAttribute('src')) print.image.src = source;
  }

  private requestPending(): void {
    if (!this.visible || !this.pendingPrint) return;
    const print = this.pendingPrint;
    this.requestImage(print);
    if (this.ready.has(print.index) || print.image.complete) this.startPush(print);
  }

  private push(print: AlbumPrint): void {
    this.pendingPrint = print;
    this.options.onStateChange([...this.counts], true);
    this.requestPending();
  }

  private startPush(print: AlbumPrint): void {
    this.pendingPrint = null;
    this.activePrint = print;
    this.measureBounds(print);
    const timeline = gsap.timeline({ paused: true });
    this.animation = timeline;
    timeline.fromTo(
      print.element,
      { autoAlpha: 0, ...this.poseVars(print, { x: 0, y: -45, rotation: print.rotate - 5 }) },
      {
        autoAlpha: 1,
        ...this.poseVars(print, { x: print.offset, y: -print.offset, rotation: print.rotate }),
        duration: this.options.transitionDuration,
        ease: 'power2.out',
        onUpdate: this.constrainMovement(print),
      },
    );
    // Appending extends the sequence through full development before the next landing.
    print.capture.appendTo(timeline, timeline.duration());
    timeline.eventCallback('onComplete', () => {
      this.counts[print.slot]++;
      this.seen.add(print.index);
      this.complete();
    });
    timeline.play();
  }

  private advanceSlot(slot: number): void {
    const pool = this.pools[slot];
    const count = this.counts[slot];
    if (count < pool.length && !this.popping.has(slot)) {
      this.push(pool[count]);
    } else if (count > 1) {
      this.popping.add(slot);
      const print = pool[count - 1];
      this.activePrint = print;
      this.measureBounds(print);
      this.options.onStateChange([...this.counts], true);
      this.animation = gsap
        .timeline({
          onComplete: () => {
            this.counts[slot]--;
            if (this.counts[slot] === 1) this.popping.delete(slot);
            this.complete();
          },
        })
        .fromTo(
          print.element,
          {
            autoAlpha: 1,
            ...this.poseVars(print, { x: print.offset, y: -print.offset, rotation: print.rotate }),
          },
          {
            autoAlpha: 0,
            ...this.poseVars(print, { x: print.offset, y: -60, rotation: print.rotate + 6 }),
            duration: Math.min(this.options.transitionDuration, 0.45),
            ease: 'power2.in',
            onUpdate: this.constrainMovement(print),
          },
        );
    } else {
      this.scheduleAuto();
    }
  }

  private advanceAuto(): void {
    if (!this.visible || this.staticMode) return;
    const next = this.prints.find((print) => !this.seen.has(print.index));
    if (next) this.push(next);
  }

  private complete(): void {
    this.animation = null;
    this.activePrint = null;
    this.options.onStateChange([...this.counts], false);
    if (this.visible && this.pendingClick !== null) {
      const slot = this.pendingClick;
      this.pendingClick = null;
      this.advanceSlot(slot);
    } else {
      this.scheduleAuto();
    }
  }

  private scheduleAuto(): void {
    this.autoTimer?.kill();
    this.autoTimer = null;
    if (!this.prints.some((print) => !this.seen.has(print.index))) return;
    this.autoTimer = gsap.delayedCall(this.options.autoDelay, () => {
      this.autoTimer = null;
      this.advanceAuto();
    });
    if (!this.visible) this.autoTimer.pause();
  }
}
