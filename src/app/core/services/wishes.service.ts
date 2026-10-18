import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PublishedWish {
  id: string;
  name: string;
  notes: string;
  submittedAt: number;
}

interface FirestoreValue {
  stringValue?: string;
  booleanValue?: boolean;
  timestampValue?: string;
}

interface QueryResult {
  document?: {
    name: string;
    fields?: Record<string, FirestoreValue>;
  };
}

/** Reads only manually approved RSVPs, once per page visit. */
@Injectable({ providedIn: 'root' })
export class WishesService {
  private readonly http = inject(HttpClient);
  private readonly firebase = environment.firebase;

  readonly wishes$ = this.http
    .post<QueryResult[]>(
      `https://firestore.googleapis.com/v1/projects/${this.firebase.projectId}/databases/(default)/documents:runQuery?key=${this.firebase.apiKey}`,
      {
        structuredQuery: {
          from: [{ collectionId: this.firebase.collection }],
          select: {
            fields: ['name', 'notes', 'submittedAt', 'publish'].map((fieldPath) => ({ fieldPath })),
          },
          where: {
            fieldFilter: {
              field: { fieldPath: 'publish' },
              op: 'EQUAL',
              value: { booleanValue: true },
            },
          },
        },
      },
    )
    .pipe(
      map((results): PublishedWish[] => {
        const wishes: PublishedWish[] = [];
        for (const { document } of results) {
          const fields = document?.fields;
          const notes = fields?.['notes']?.stringValue?.trim();
          if (!document || fields?.['publish']?.booleanValue !== true || !notes) continue;

          const timestamp = Date.parse(fields['submittedAt']?.timestampValue ?? '');
          wishes.push({
            id: document.name,
            name: fields['name']?.stringValue?.trim() || 'Khách mời',
            notes,
            submittedAt: Number.isFinite(timestamp) ? timestamp : 0,
          });
        }
        // Sort locally so older documents without submittedAt remain visible.
        return wishes.sort((a, b) => b.submittedAt - a.submittedAt || a.id.localeCompare(b.id));
      }),
      catchError(() => {
        console.warn('Published wishes could not be loaded. Check Firestore read permissions.');
        return of<PublishedWish[]>([]);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
}
