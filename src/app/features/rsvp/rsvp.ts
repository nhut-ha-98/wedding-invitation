import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AnimatedSection } from '../../shared/components/animated-section';
import { RsvpService } from '../../core/services/rsvp.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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

  readonly status = this.rsvpService.status;
  readonly errorMessage = this.rsvpService.errorMessage;

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

  onSubmit(event?: Event): void {
    event?.preventDefault();

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
