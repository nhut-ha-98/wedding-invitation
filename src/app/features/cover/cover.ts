import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  viewChild,
  ElementRef,
  afterNextRender,
  DestroyRef,
  inject,
} from '@angular/core';
import { PageFlip } from 'page-flip';
import type { FlipSetting } from 'page-flip';
import { WeddingConfig } from '../../core/models/wedding-config';

@Component({
  selector: 'app-cover',
  templateUrl: './cover.html',
  styleUrl: './cover.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cover {
  config = input.required<WeddingConfig>();
  opened = output<void>();

  private bookContainer = viewChild.required<ElementRef<HTMLElement>>('bookContainer');
  private destroyRef = inject(DestroyRef);
  private pageFlip: PageFlip | null = null;

  constructor() {
    afterNextRender(() => {
      this.initPageFlip();
    });
  }

  private initPageFlip(): void {
    const container = this.bookContainer().nativeElement;
    const pages = container.querySelectorAll<HTMLElement>('.page');

    this.pageFlip = new PageFlip(container, {
      width: 360,
      height: 520,
      size: 'stretch',
      flippingTime: 800,
      showCover: true,
      startZIndex: 10,
      drawShadow: true,
      swipeDistance: 20,
      disableFlipByClick: false,
      mobileScrollSupport: false,
    } as Partial<FlipSetting>);

    this.pageFlip.loadFromHTML(pages);

    this.pageFlip.on('flip', (e) => {
      if (e.data === 1) {
        setTimeout(() => this.opened.emit(), 200);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.pageFlip?.destroy();
    });
  }

  openBook(): void {
    this.pageFlip?.flipNext('top' as never);
  }
}
