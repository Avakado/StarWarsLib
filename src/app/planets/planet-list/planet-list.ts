import { Component, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SearchService } from '../../services/search.service';
import { PlanetsStore } from '../../store/planets.store';
import { Card } from '../../shared/card/card';
import { Loading } from '../../shared/loading/loading';

@Component({
  selector: 'app-planet-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, Loading],
  template: `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 class="text-4xl font-light text-center mb-10 text-gray-900">Planeten</h1>

      @if (store.loading()) {
        <app-loading />
      } @else if (store.planets().length === 0) {
        <p class="text-center text-gray-500 py-10">Keine Planeten gefunden.</p>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (planet of store.planets(); track planet.url) {
            <app-card
              [title]="planet.name"
              [detailLink]="'/planets/' + store.extractId(planet.url)"
            >
              <p>Klima: {{ planet.climate }}</p>
              <p>Terrain: {{ planet.terrain }}</p>
              <p>Bevölkerung: {{ planet.population }}</p>
            </app-card>
          }
        </div>

        <div class="flex justify-center items-center gap-4 mt-10">
          <button
            (click)="loadPage(store.currentPage() - 1)"
            [disabled]="!store.hasPrevious()"
            [class]="store.hasPrevious() ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
            class="px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Vorherige
          </button>
          <span class="text-sm text-gray-600">Seite {{ store.currentPage() }}</span>
          <button
            (click)="loadPage(store.currentPage() + 1)"
            [disabled]="!store.hasNext()"
            [class]="store.hasNext() ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
            class="px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Nächste
          </button>
        </div>
      }
    </section>
  `,
})
export class PlanetList {
  protected readonly store = inject(PlanetsStore);
  private readonly searchService = inject(SearchService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    toObservable(this.searchService.searchTerm)
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => this.store.loadPlanets({ page: 1, search: term }));
  }

  protected loadPage(page: number) {
    this.store.loadPlanets({ page, search: this.searchService.searchTerm() });
  }
}
