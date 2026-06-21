import { Injectable, signal } from '@angular/core';

export type BookState = 'closed' | 'opening' | 'open' | 'closing';

@Injectable({ providedIn: 'root' })
export class BookStateService {
  private readonly _state = signal<BookState>('closed');
  readonly state = this._state.asReadonly();

  readonly isOpen = () => this._state() === 'open';

  setOpening(): void {
    this._state.set('opening');
  }

  setOpen(): void {
    this._state.set('open');
  }

  setClosing(): void {
    this._state.set('closing');
  }

  setClosed(): void {
    this._state.set('closed');
  }
}
