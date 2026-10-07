import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CoupleProfile, WeddingConfig } from '../../core/models/wedding-config';
import { AnimatedSection } from '../../shared/components/animated-section';
import { SectionHeader } from '../../shared/components/section-header';
import { CoupleCard } from './couple-card';

@Component({
  selector: 'app-he-and-she',
  imports: [AnimatedSection, SectionHeader, CoupleCard],
  templateUrl: './he-and-she.html',
  styleUrl: './he-and-she.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeAndShe {
  config = input.required<WeddingConfig>();
  readonly profiles = computed<CoupleProfile[]>(() => [
    this.config().heAndShe.he,
    this.config().heAndShe.she,
  ]);
}
