import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { FilmsStore } from '../../store/films.store';
import { Card } from '../../shared/card/card';
import { Loading } from '../../shared/loading/loading';

@Component({
  selector: 'app-film-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, Loading],
  template: `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 class="text-4xl font-light text-center mb-10 text-gray-900">Filme</h1>

      @if (store.loading()) {
        <app-loading />
      } @else if (filteredFilms().length === 0) {
        <p class="text-center text-gray-500 py-10">Keine Filme gefunden.</p>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (film of filteredFilms(); track film.url) {
            <app-card
              [title]="film.title"
              [detailLink]="'/films/' + store.extractId(film.url)"
            >
              <p>Director: {{ film.director }}</p>
              <p>Produzenten: {{ film.producer }}</p>
              <p>Erscheinungsdatum: {{ film.release_date }}</p>
            </app-card>
          }
        </div>
      }
    </section>
  `,
})
export class FilmList {
  protected readonly store = inject(FilmsStore);
  private readonly searchService = inject(SearchService);

  protected readonly filteredFilms = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase();
    const all = this.store.sortedFilms();
    if (!term) return all;
    return all.filter(
      (f) =>
        f.title.toLowerCase().includes(term) ||
        f.director.toLowerCase().includes(term) ||
        f.producer.toLowerCase().includes(term),
    );
  });

  constructor() {
    if (this.store.sortedFilms().length === 0) {
      this.store.loadFilms();
    }
  }
}
