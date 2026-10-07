import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface RsvpPayload {
  name: string;
  attending: boolean;
  guests: number;
  notes: string;
}

export type RsvpStatus = 'idle' | 'submitting' | 'success' | 'error';

interface FirestoreDocumentBody {
  fields: {
    name: { stringValue: string };
    attending: { booleanValue: boolean };
    guests: { integerValue: string };
    notes: { stringValue: string };
    submittedAt: { timestampValue: string };
  };
}

@Injectable({ providedIn: 'root' })
export class RsvpService {
  private readonly http = inject(HttpClient);

  private readonly _status = signal<RsvpStatus>('idle');
  readonly status = this._status.asReadonly();

  private readonly _errorMessage = signal<string | null>(null);
  readonly errorMessage = this._errorMessage.asReadonly();

  submit(payload: RsvpPayload): void {
    this._status.set('submitting');
    this._errorMessage.set(null);

    const { firebase } = environment;

    if (
      !firebase ||
      !firebase.projectId ||
      firebase.projectId.includes('YOUR_FIREBASE') ||
      !firebase.apiKey ||
      firebase.apiKey.includes('YOUR_FIREBASE')
    ) {
      this._errorMessage.set('Chưa cấu hình Firebase API Key trong environment.ts');
      this._status.set('error');
      return;
    }

    const { projectId, apiKey, collection } = firebase;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?key=${apiKey}`;

    const body: FirestoreDocumentBody = {
      fields: {
        name: { stringValue: payload.name.trim() },
        attending: { booleanValue: payload.attending },
        guests: { integerValue: String(payload.guests || 1) },
        notes: { stringValue: (payload.notes || '').trim() },
        submittedAt: { timestampValue: new Date().toISOString() },
      },
    };

    this.http.post(url, body).subscribe({
      next: () => {
        this._status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        console.error('RSVP Firestore submission error:', err);
        const serverMsg = err.error?.error?.message;
        let detail = 'Đã xảy ra lỗi khi gửi. Vui lòng thử lại.';

        if (err.status === 404 && serverMsg?.includes('database (default) does not exist')) {
          detail = 'Chưa tạo Firestore Database trong Firebase Console cho project này.';
        } else if (err.status === 403 || serverMsg?.includes('PERMISSION_DENIED')) {
          detail = 'Chưa cấp quyền ghi (Vui lòng kiểm tra Firestore Security Rules).';
        } else if (serverMsg) {
          detail = serverMsg;
        }

        this._errorMessage.set(detail);
        this._status.set('error');
      },
    });
  }

  reset(): void {
    this._status.set('idle');
    this._errorMessage.set(null);
  }
}
