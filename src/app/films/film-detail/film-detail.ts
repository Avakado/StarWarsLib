import { Component, ChangeDetectionStrategy, signal, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SwapiService } from '../../services/swapi.service';
import { Film, Person, Planet } from '../../models/swapi.interfaces';
import { Card } from '../../shared/card/card';
import { Loading } from '../../shared/loading/loading';

@Component({
  selector: 'app-film-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Card, Loading],
  template: `
    @if (loading()) {
      <app-loading />
    } @else if (film(); as f) {
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <a routerLink="/films" class="text-sm text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Zurück zu Filme
        </a>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          <div class="aspect-2/3 overflow-hidden rounded-lg bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500">
            <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <div class="md:col-span-2">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ f.title }}</h1>
            <p class="text-sm text-gray-500 mb-4">Episode {{ f.episode_id }}</p>

            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-6 text-sm">
            <div>
              <dt class="font-semibold text-gray-700">Director</dt>
              <dd class="text-gray-600">{{ f.director }}</dd>
            </div>
            <div>
              <dt class="font-semibold text-gray-700">Produzenten</dt>
              <dd class="text-gray-600">{{ f.producer }}</dd>
            </div>
            <div>
              <dt class="font-semibold text-gray-700">Erscheinungsdatum</dt>
              <dd class="text-gray-600">{{ f.release_date }}</dd>
            </div>
          </dl>

          <div class="mb-6">
            <h2 class="font-semibold text-gray-700 mb-2">Opening Crawl</h2>
            <p class="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{{ f.opening_crawl }}</p>
          </div>
          </div>
        </div>

        @if (characters().length > 0) {
          <div class="mt-12">
            <h2 class="text-2xl font-light text-gray-900 mb-6">Charaktere</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              @for (char of characters(); track char.url) {
                <app-card
                  [title]="char.name"
                  [detailLink]="'/characters/' + extractId(char.url)"
                >
                  <p>Geschlecht: {{ char.gender }}</p>
                  <p>Geburtsjahr: {{ char.birth_year }}</p>
                </app-card>
              }
            </div>
          </div>
        }

        @if (planets().length > 0) {
          <div class="mt-12">
            <h2 class="text-2xl font-light text-gray-900 mb-6">Planeten</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              @for (planet of planets(); track planet.url) {
                <app-card
                  [title]="planet.name"
                  [detailLink]="'/planets/' + extractId(planet.url)"
                >
                  <p>Klima: {{ planet.climate }}</p>
                  <p>Terrain: {{ planet.terrain }}</p>
                </app-card>
              }
            </div>
          </div>
        }
      </section>
    }
  `,
})
export class FilmDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly swapiService = inject(SwapiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly film = signal<Film | null>(null);
  protected readonly characters = signal<Person[]>([]);
  protected readonly planets = signal<Planet[]>([]);

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id')!;
          return this.swapiService.getFilm(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (film) => {
          this.film.set(film);
          this.loading.set(false);
          this.loadRelated(film);
        },
        error: () => this.loading.set(false),
      });
  }

  private loadRelated(film: Film) {
    const charUrls = film.characters.slice(0, 6);
    const planetUrls = film.planets.slice(0, 6);

    if (charUrls.length > 0) {
      forkJoin(charUrls.map((url) => this.swapiService.getResourceByUrl<Person>(url)))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((chars) => this.characters.set(chars));
    }

    if (planetUrls.length > 0) {
      forkJoin(planetUrls.map((url) => this.swapiService.getResourceByUrl<Planet>(url)))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((p) => this.planets.set(p));
    }
  }

  protected extractId(url: string): string {
    return this.swapiService.extractId(url);
  }
}
