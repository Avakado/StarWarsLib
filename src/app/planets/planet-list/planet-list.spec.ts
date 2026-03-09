import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PlanetList } from './planet-list';
import { PlanetsStore } from '../../store/planets.store';

const mockPlanetsResponse = {
  count: 60,
  next: 'https://swapi.dev/api/planets/?page=2',
  previous: null,
  results: [
    {
      name: 'Tatooine',
      rotation_period: '23',
      orbital_period: '304',
      diameter: '10465',
      climate: 'arid',
      gravity: '1 standard',
      terrain: 'desert',
      surface_water: '1',
      population: '200000',
      residents: ['https://swapi.dev/api/people/1/'],
      films: ['https://swapi.dev/api/films/1/'],
      url: 'https://swapi.dev/api/planets/1/',
    },
    {
      name: 'Alderaan',
      rotation_period: '24',
      orbital_period: '364',
      diameter: '12500',
      climate: 'temperate',
      gravity: '1 standard',
      terrain: 'grasslands, mountains',
      surface_water: '40',
      population: '2000000000',
      residents: ['https://swapi.dev/api/people/5/'],
      films: ['https://swapi.dev/api/films/1/'],
      url: 'https://swapi.dev/api/planets/2/',
    },
  ],
};

describe('PlanetList', () => {
  let component: PlanetList;
  let fixture: ComponentFixture<PlanetList>;
  let httpMock: HttpTestingController;
  let store: InstanceType<typeof PlanetsStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanetList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(PlanetsStore);
    fixture = TestBed.createComponent(PlanetList);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load planets via the store', fakeAsync(() => {
    store.loadPlanets({ page: 1, search: '' });
    tick();

    const req = httpMock.expectOne((r) => r.url.includes('/api/planets/'));
    req.flush(mockPlanetsResponse);
    tick();
    fixture.detectChanges();

    expect(store.planets().length).toBe(2);
    expect(store.planets()[0].name).toBe('Tatooine');
    expect(store.planets()[1].name).toBe('Alderaan');
  }));

  it('should display planet names in the template', fakeAsync(() => {
    store.loadPlanets({ page: 1, search: '' });
    tick();

    const req = httpMock.expectOne((r) => r.url.includes('/api/planets/'));
    req.flush(mockPlanetsResponse);
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Tatooine');
    expect(compiled.textContent).toContain('Alderaan');
  }));

  it('should display planet details in cards', fakeAsync(() => {
    store.loadPlanets({ page: 1, search: '' });
    tick();

    const req = httpMock.expectOne((r) => r.url.includes('/api/planets/'));
    req.flush(mockPlanetsResponse);
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('arid');
    expect(compiled.textContent).toContain('desert');
    expect(compiled.textContent).toContain('200000');
  }));

  it('should set pagination state from API response', fakeAsync(() => {
    store.loadPlanets({ page: 1, search: '' });
    tick();

    const req = httpMock.expectOne((r) => r.url.includes('/api/planets/'));
    req.flush(mockPlanetsResponse);
    tick();

    expect(store.hasNext()).toBe(true);
    expect(store.hasPrevious()).toBe(false);
    expect(store.currentPage()).toBe(1);
  }));

  it('should search planets via the store', fakeAsync(() => {
    store.loadPlanets({ page: 1, search: 'tatooine' });
    tick();

    const req = httpMock.expectOne((r) => r.urlWithParams.includes('search=tatooine'));
    req.flush({
      count: 1,
      next: null,
      previous: null,
      results: [mockPlanetsResponse.results[0]],
    });
    tick();

    expect(store.planets().length).toBe(1);
    expect(store.planets()[0].name).toBe('Tatooine');
    expect(store.hasNext()).toBe(false);
  }));

  it('should show empty message when no planets found', fakeAsync(() => {
    store.loadPlanets({ page: 1, search: '' });
    tick();

    const req = httpMock.expectOne((r) => r.url.includes('/api/planets/'));
    req.flush({ count: 0, next: null, previous: null, results: [] });
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Keine Planeten gefunden');
  }));

  it('should set loading state while fetching', fakeAsync(() => {
    expect(store.loading()).toBe(false);

    store.loadPlanets({ page: 1, search: '' });
    tick();
    expect(store.loading()).toBe(true);

    const req = httpMock.expectOne((r) => r.url.includes('/api/planets/'));
    req.flush(mockPlanetsResponse);
    tick();
    expect(store.loading()).toBe(false);
  }));
});
