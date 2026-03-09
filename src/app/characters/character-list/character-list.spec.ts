import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CharacterList } from './character-list';
import { CharactersStore } from '../../store/characters.store';

const mockPeopleResponse = {
  count: 82,
  next: 'https://swapi.dev/api/people/?page=2',
  previous: null,
  results: [
    {
      name: 'Luke Skywalker',
      height: '172',
      mass: '77',
      hair_color: 'blond',
      skin_color: 'fair',
      eye_color: 'blue',
      birth_year: '19BBY',
      gender: 'male',
      homeworld: 'https://swapi.dev/api/planets/1/',
      films: ['https://swapi.dev/api/films/1/'],
      species: [],
      vehicles: [],
      starships: [],
      url: 'https://swapi.dev/api/people/1/',
    },
    {
      name: 'Darth Vader',
      height: '202',
      mass: '136',
      hair_color: 'none',
      skin_color: 'white',
      eye_color: 'yellow',
      birth_year: '41.9BBY',
      gender: 'male',
      homeworld: 'https://swapi.dev/api/planets/1/',
      films: ['https://swapi.dev/api/films/1/'],
      species: [],
      vehicles: [],
      starships: [],
      url: 'https://swapi.dev/api/people/4/',
    },
  ],
};

describe('CharacterList', () => {
  let component: CharacterList;
  let fixture: ComponentFixture<CharacterList>;
  let httpMock: HttpTestingController;
  let store: InstanceType<typeof CharactersStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(CharactersStore);
    fixture = TestBed.createComponent(CharacterList);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load characters via the store', fakeAsync(() => {
    store.loadCharacters({ page: 1, search: '' });
    tick();

    const req = httpMock.expectOne((r) => r.url.includes('/api/people/'));
    req.flush(mockPeopleResponse);
    tick();
    fixture.detectChanges();

    expect(store.characters().length).toBe(2);
    expect(store.characters()[0].name).toBe('Luke Skywalker');
    expect(store.characters()[1].name).toBe('Darth Vader');
  }));

  it('should display character names in the template', fakeAsync(() => {
    store.loadCharacters({ page: 1, search: '' });
    tick();

    const req = httpMock.expectOne((r) => r.url.includes('/api/people/'));
    req.flush(mockPeopleResponse);
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Luke Skywalker');
    expect(compiled.textContent).toContain('Darth Vader');
  }));

  it('should display character details in cards', fakeAsync(() => {
    store.loadCharacters({ page: 1, search: '' });
    tick();

    const req = httpMock.expectOne((r) => r.url.includes('/api/people/'));
    req.flush(mockPeopleResponse);
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('male');
    expect(compiled.textContent).toContain('19BBY');
    expect(compiled.textContent).toContain('172');
  }));

  it('should set pagination state from API response', fakeAsync(() => {
    store.loadCharacters({ page: 1, search: '' });
    tick();

    const req = httpMock.expectOne((r) => r.url.includes('/api/people/'));
    req.flush(mockPeopleResponse);
    tick();

    expect(store.hasNext()).toBe(true);
    expect(store.hasPrevious()).toBe(false);
    expect(store.currentPage()).toBe(1);
  }));

  it('should search characters via the store', fakeAsync(() => {
    store.loadCharacters({ page: 1, search: 'luke' });
    tick();

    const req = httpMock.expectOne((r) => r.urlWithParams.includes('search=luke'));
    req.flush({
      count: 1,
      next: null,
      previous: null,
      results: [mockPeopleResponse.results[0]],
    });
    tick();

    expect(store.characters().length).toBe(1);
    expect(store.characters()[0].name).toBe('Luke Skywalker');
    expect(store.hasNext()).toBe(false);
  }));

  it('should show empty message when no characters found', fakeAsync(() => {
    store.loadCharacters({ page: 1, search: '' });
    tick();

    const req = httpMock.expectOne((r) => r.url.includes('/api/people/'));
    req.flush({ count: 0, next: null, previous: null, results: [] });
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Keine Charaktere gefunden');
  }));

  it('should set loading state while fetching', fakeAsync(() => {
    expect(store.loading()).toBe(false);

    store.loadCharacters({ page: 1, search: '' });
    tick();
    expect(store.loading()).toBe(true);

    const req = httpMock.expectOne((r) => r.url.includes('/api/people/'));
    req.flush(mockPeopleResponse);
    tick();
    expect(store.loading()).toBe(false);
  }));
});
