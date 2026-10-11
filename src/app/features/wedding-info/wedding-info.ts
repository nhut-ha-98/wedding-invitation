import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AnimatedSection } from '../../shared/components/animated-section';
import { WeddingConfig } from '../../core/models/wedding-config';

@Component({
  selector: 'app-wedding-info',
  imports: [AnimatedSection],
  templateUrl: './wedding-info.html',
  styleUrl: './wedding-info.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeddingInfo {
  config = input.required<WeddingConfig>();
}
