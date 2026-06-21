import {
  Component,
  ChangeDetectionStrategy,
  inject,
  ElementRef,
  afterNextRender,
  DestroyRef,
  signal,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatedSection } from '../../shared/components/animated-section';
import { RsvpService } from '../../core/services/rsvp.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

gsap.registerPlugin(ScrollTrigger);

interface RsvpForm {
  name: FormControl<string>;
  attending: FormControl<boolean>;
  guests: FormControl<number>;
  notes: FormControl<string>;
}

@Component({
  selector: 'app-rsvp',
  imports: [AnimatedSection, ReactiveFormsModule],
  templateUrl: './rsvp.html',
  styleUrl: './rsvp.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Rsvp {
  private rsvpService = inject(RsvpService);
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  readonly status = this.rsvpService.status;

  readonly form = new FormGroup<RsvpForm>({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    attending: new FormControl(true, { nonNullable: true }),
    guests: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(10)],
    }),
    notes: new FormControl('', { nonNullable: true }),
  });

  readonly submitted = signal(false);

  constructor() {
    afterNextRender(() => {
      const card = this.el.nativeElement.querySelector('.rsvp-card');

      gsap.fromTo(
        card,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: this.el.nativeElement,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        },
      );

      this.destroyRef.onDestroy(() => {
        ScrollTrigger.getAll().forEach((st) => st.kill());
      });
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const raw = this.form.getRawValue();
    this.rsvpService.submit({
      name: raw.name,
      attending: raw.attending,
      guests: raw.guests,
      notes: raw.notes,
    });
  }

  resetForm(): void {
    this.form.reset({ name: '', attending: true, guests: 1, notes: '' });
    this.rsvpService.reset();
    this.submitted.set(false);
  }

  protected readonly required = Validators.required;
}
