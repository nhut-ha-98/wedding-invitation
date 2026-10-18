import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { WishesService } from './wishes.service';

describe('WishesService', () => {
  let http: HttpTestingController;
  let service: WishesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(WishesService);
  });

  afterEach(() => http.verify());

  it('queries only approved records, excludes blank wishes and caches newest-first results', () => {
    const received = vi.fn();
    service.wishes$.subscribe(received);
    const request = http.expectOne((req) => req.url.includes('/documents:runQuery?'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body.structuredQuery.where.fieldFilter).toEqual({
      field: { fieldPath: 'publish' },
      op: 'EQUAL',
      value: { booleanValue: true },
    });

    const document = (id: string, publish: object, notes: string, date?: string) => ({
      document: {
        name: id,
        fields: {
          name: { stringValue: ' Guest ' },
          notes: { stringValue: notes },
          publish,
          ...(date ? { submittedAt: { timestampValue: date } } : {}),
        },
      },
    });
    request.flush([
      document('old', { booleanValue: true }, ' Older ', '2026-01-01T00:00:00Z'),
      document('new', { booleanValue: true }, 'Newest', '2026-02-01T00:00:00Z'),
      document('undated', { booleanValue: true }, 'Undated'),
      document('false', { booleanValue: false }, 'Private'),
      document('missing', {}, 'Private'),
      document('string', { stringValue: 'true' }, 'Private'),
      document('blank', { booleanValue: true }, '  '),
      { readTime: '2026-03-01T00:00:00Z' },
    ]);
    const wishes = received.mock.calls[0][0];
    expect(wishes.map((wish: { id: string }) => wish.id)).toEqual(['new', 'old', 'undated']);
    expect(wishes[1].notes).toBe('Older');
    expect(wishes[1].name).toBe('Guest');
    service.wishes$.subscribe(received);
    expect(received).toHaveBeenCalledTimes(2);
    http.expectNone((req) => req.url.includes('/documents:runQuery?'));
  });

  it('returns an empty list when reads are denied', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const received = vi.fn();
    service.wishes$.subscribe(received);
    http
      .expectOne((req) => req.url.includes('/documents:runQuery?'))
      .flush({ error: { message: 'PERMISSION_DENIED' } }, { status: 403, statusText: 'Forbidden' });
    expect(received).toHaveBeenCalledWith([]);
    warning.mockRestore();
  });
});
