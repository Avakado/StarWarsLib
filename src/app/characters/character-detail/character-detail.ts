import { Component, ChangeDetectionStrategy, signal, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SwapiService } from '../../services/swapi.service';
import { Person, Film, Planet } from '../../models/swapi.interfaces';
import { Card } from '../../shared/card/card';
import { Loading } from '../../shared/loading/loading';

@Component({
  selector: 'app-character-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Card, Loading],
  template: `
    @if (loading()) {
      <app-loading />
    } @else if (person(); as p) {
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <a routerLink="/characters" class="text-sm text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Zurück zu Charaktere
        </a>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          <div class="aspect-2/3 overflow-hidden rounded-lg bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500">
            <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <div class="md:col-span-2">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">{{ p.name }}</h1>

            <dl class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt class="font-semibold text-gray-700">Größe</dt>
              <dd class="text-gray-600">{{ p.height }} cm</dd>
            </div>
            <div>
              <dt class="font-semibold text-gray-700">Gewicht</dt>
              <dd class="text-gray-600">{{ p.mass }} kg</dd>
            </div>
            <div>
              <dt class="font-semibold text-gray-700">Haarfarbe</dt>
              <dd class="text-gray-600">{{ p.hair_color }}</dd>
            </div>
            <div>
              <dt class="font-semibold text-gray-700">Hautfarbe</dt>
              <dd class="text-gray-600">{{ p.skin_color }}</dd>
            </div>
            <div>
              <dt class="font-semibold text-gray-700">Augenfarbe</dt>
              <dd class="text-gray-600">{{ p.eye_color }}</dd>
            </div>
            <div>
              <dt class="font-semibold text-gray-700">Geburtsjahr</dt>
              <dd class="text-gray-600">{{ p.birth_year }}</dd>
            </div>
            <div>
              <dt class="font-semibold text-gray-700">Geschlecht</dt>
              <dd class="text-gray-600">{{ p.gender }}</dd>
            </div>
          </dl>

          @if (homeworld(); as hw) {
            <div class="mt-6">
              <h2 class="font-semibold text-gray-700 mb-2 text-sm">Heimatwelt</h2>
              <a [routerLink]="'/planets/' + extractId(hw.url)"
                 class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                {{ hw.name }}
              </a>
            </div>
          }
          </div>
        </div>

        @if (films().length > 0) {
          <div class="mt-12">
            <h2 class="text-2xl font-light text-gray-900 mb-6">Filme</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              @for (film of films(); track film.url) {
                <app-card
                  [title]="film.title"
                  [detailLink]="'/films/' + extractId(film.url)"
                >
                  <p>Director: {{ film.director }}</p>
                  <p>Episode: {{ film.episode_id }}</p>
                </app-card>
              }
            </div>
          </div>
        }
      </section>
    }
  `,
})
export class CharacterDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly swapiService = inject(SwapiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly person = signal<Person | null>(null);
  protected readonly homeworld = signal<Planet | null>(null);
  protected readonly films = signal<Film[]>([]);

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id')!;
          return this.swapiService.getPerson(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (person) => {
          this.person.set(person);
          this.loading.set(false);
          this.loadRelated(person);
        },
        error: () => this.loading.set(false),
      });
  }

  private loadRelated(person: Person) {
    this.swapiService
      .getResourceByUrl<Planet>(person.homeworld)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((hw) => this.homeworld.set(hw));

    if (person.films.length > 0) {
      forkJoin(person.films.map((url) => this.swapiService.getResourceByUrl<Film>(url)))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((films) => this.films.set(films));
    }
  }

  protected extractId(url: string): string {
    return this.swapiService.extractId(url);
  }
}
