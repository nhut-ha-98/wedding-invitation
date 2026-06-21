import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

export interface RsvpPayload {
  name: string;
  attending: boolean;
  guests: number;
  notes: string;
}

export type RsvpStatus = 'idle' | 'submitting' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class RsvpService {
  private readonly _status = signal<RsvpStatus>('idle');
  readonly status = this._status.asReadonly();

  private readonly endpoint = '/api/rsvp';

  constructor(private http: HttpClient) {}

  submit(payload: RsvpPayload): void {
    this._status.set('submitting');
    this.http.post(this.endpoint, payload).subscribe({
      next: () => this._status.set('success'),
      error: () => this._status.set('error'),
    });
  }

  reset(): void {
    this._status.set('idle');
  }
}
