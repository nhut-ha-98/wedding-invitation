import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Countdown } from './countdown';
import { environment } from '../../../environments/environment';

describe('Countdown', () => {
  let fixture: ComponentFixture<Countdown>;
  const originalProduction = environment.production;
  const originalPreview = environment.countdownPreview;

  beforeEach(() => {
    environment.production = false;
    environment.countdownPreview = false;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-30T16:59:59Z'));
    TestBed.configureTestingModule({ imports: [Countdown] });
    fixture = TestBed.createComponent(Countdown);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    environment.production = originalProduction;
    environment.countdownPreview = originalPreview;
    vi.useRealTimers();
  });

  it('counts down to midnight GMT+7, independent of the device timezone', () => {
    expect(fixture.componentInstance.units().map((unit) => unit.value)).toEqual([
      '01',
      '00',
      '00',
      '01',
    ]);
    vi.advanceTimersByTime(2000);
    expect(fixture.componentInstance.units().map((unit) => unit.value)).toEqual([
      '00',
      '23',
      '59',
      '59',
    ]);
  });

  it('uses current wall-clock time after a suspended tab resumes', () => {
    vi.setSystemTime(new Date('2026-10-31T16:59:58Z'));
    vi.advanceTimersByTime(1000);
    expect(fixture.componentInstance.remainingSeconds()).toBe(1);
  });

  it('replaces the timer with the invitation message at zero', () => {
    expect(fixture.nativeElement.querySelector('[role="timer"]')).not.toBeNull();
    vi.setSystemTime(new Date('2026-10-31T16:59:59Z'));
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(fixture.componentInstance.remainingSeconds()).toBe(0);
    expect(fixture.nativeElement.querySelector('[role="timer"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent.trim()).toBe(
      'Ngày lành đã đến, hẹn bạn lúc 18g tối nay',
    );
    vi.advanceTimersByTime(86400000);
    expect(fixture.componentInstance.units().every((unit) => unit.value === '00')).toBe(true);
  });

  it('shows the invitation message when opened after the target', () => {
    fixture.destroy();
    vi.setSystemTime(new Date('2026-11-02T00:00:00+07:00'));
    fixture = TestBed.createComponent(Countdown);
    fixture.detectChanges();
    expect(fixture.componentInstance.remainingSeconds()).toBe(0);
    expect(fixture.nativeElement.querySelector('[role="timer"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent.trim()).toBe(
      'Ngày lành đã đến, hẹn bạn lúc 18g tối nay',
    );
  });

  it('bypasses the countdown when development preview is enabled', () => {
    fixture.destroy();
    environment.countdownPreview = true;
    fixture = TestBed.createComponent(Countdown);
    fixture.detectChanges();
    expect(fixture.componentInstance.remainingSeconds()).toBe(0);
    expect(fixture.nativeElement.querySelector('[role="timer"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent.trim()).toBe(
      'Ngày lành đã đến, hẹn bạn lúc 18g tối nay',
    );
  });

  it('ignores the preview flag in production', () => {
    fixture.destroy();
    environment.production = true;
    environment.countdownPreview = true;
    fixture = TestBed.createComponent(Countdown);
    fixture.detectChanges();
    expect(fixture.componentInstance.remainingSeconds()).toBe(86401);
    expect(fixture.nativeElement.querySelector('[role="timer"]')).not.toBeNull();
  });

  it('cleans up the timer when destroyed', () => {
    const countdown = fixture.componentInstance;
    const remaining = countdown.remainingSeconds();
    fixture.destroy();
    vi.advanceTimersByTime(5000);
    expect(countdown.remainingSeconds()).toBe(remaining);
  });
});
