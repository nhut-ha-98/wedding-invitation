import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { environment } from '../../../environments/environment';

/** Counts down to the wedding day using an explicit timezone on every device. */
@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.html',
  styleUrl: './countdown.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Countdown implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  readonly target = '2026-11-01T00:00:00+07:00';
  private readonly targetMs = Date.parse(this.target);
  private readonly now = signal(Date.now());
  readonly remainingSeconds = computed(() =>
    !environment.production && environment.countdownPreview
      ? 0
      : Math.max(0, Math.ceil((this.targetMs - this.now()) / 1000)),
  );
  readonly units = computed(() => {
    const seconds = this.remainingSeconds();
    return [
      { label: 'Ngày', value: Math.floor(seconds / 86400) },
      { label: 'Giờ', value: Math.floor((seconds % 86400) / 3600) },
      { label: 'Phút', value: Math.floor((seconds % 3600) / 60) },
      { label: 'Giây', value: seconds % 60 },
    ].map((unit) => ({ ...unit, value: String(unit.value).padStart(2, '0') }));
  });
  readonly timerLabel = computed(() =>
    this.units()
      .map((unit) => `${unit.value} ${unit.label}`)
      .join(', '),
  );

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.now.set(Date.now());
    if (this.remainingSeconds() === 0) return;

    const timer = setInterval(() => {
      // Read wall-clock time so background tabs never accumulate timer drift.
      this.now.set(Date.now());
      if (this.remainingSeconds() === 0) clearInterval(timer);
    }, 1000);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }
}
