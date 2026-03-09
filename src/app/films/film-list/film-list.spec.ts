import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FilmList } from './film-list';
import { FilmsStore } from '../../store/films.store';
import { SearchService } from '../../services/search.service';

const mockFilmsResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      title: 'A New Hope',
      episode_id: 4,
      opening_crawl: 'It is a period of civil war...',
      director: 'George Lucas',
      producer: 'Gary Kurtz, Rick McCallum',
      release_date: '1977-05-25',
      characters: [],
      planets: [],
      starships: [],
      vehicles: [],
      species: [],
      url: 'https://swapi.dev/api/films/1/',
    },
    {
      title: 'The Empire Strikes Back',
      episode_id: 5,
      opening_crawl: 'It is a dark time...',
      director: 'Irvin Kershner',
      producer: 'Gary Kurtz, Rick McCallum',
      release_date: '1980-05-17',
      characters: [],
      planets: [],
      starships: [],
      vehicles: [],
      species: [],
      url: 'https://swapi.dev/api/films/2/',
    },
  ],
};

describe('FilmList', () => {
  let component: FilmList;
  let fixture: ComponentFixture<FilmList>;
  let httpMock: HttpTestingController;
  let searchService: SearchService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilmList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    searchService = TestBed.inject(SearchService);
    fixture = TestBed.createComponent(FilmList);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    const req = httpMock.expectOne('https://swapi.dev/api/films/');
    req.flush(mockFilmsResponse);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load films from the store on init', () => {
    const req = httpMock.expectOne('https://swapi.dev/api/films/');
    req.flush(mockFilmsResponse);
    fixture.detectChanges();

    const store = TestBed.inject(FilmsStore);
    expect(store.sortedFilms().length).toBe(2);
    expect(store.sortedFilms()[0].title).toBe('A New Hope');
  });

  it('should sort films by episode_id', () => {
    const req = httpMock.expectOne('https://swapi.dev/api/films/');
    req.flush(mockFilmsResponse);
    fixture.detectChanges();

    const store = TestBed.inject(FilmsStore);
    expect(store.sortedFilms()[0].episode_id).toBe(4);
    expect(store.sortedFilms()[1].episode_id).toBe(5);
  });

  it('should display film titles in the template', () => {
    const req = httpMock.expectOne('https://swapi.dev/api/films/');
    req.flush(mockFilmsResponse);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('A New Hope');
    expect(compiled.textContent).toContain('The Empire Strikes Back');
  });

  it('should filter films based on search term', () => {
    const req = httpMock.expectOne('https://swapi.dev/api/films/');
    req.flush(mockFilmsResponse);
    fixture.detectChanges();

    searchService.search('empire');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('The Empire Strikes Back');
    expect(compiled.textContent).not.toContain('A New Hope');
  });

  it('should show loading indicator while loading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    expect(compiled.querySelector('app-loading')).toBeTruthy();

    const req = httpMock.expectOne('https://swapi.dev/api/films/');
    req.flush(mockFilmsResponse);
    fixture.detectChanges();
    expect(compiled.querySelector('app-loading')).toBeFalsy();
  });

  it('should show empty message when no films match search', () => {
    const req = httpMock.expectOne('https://swapi.dev/api/films/');
    req.flush(mockFilmsResponse);
    fixture.detectChanges();

    searchService.search('nonexistent');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Keine Filme gefunden');
  });
});
