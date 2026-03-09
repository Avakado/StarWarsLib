import { Component, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SearchService } from '../../services/search.service';
import { CharactersStore } from '../../store/characters.store';
import { Card } from '../../shared/card/card';
import { Loading } from '../../shared/loading/loading';

@Component({
  selector: 'app-character-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, Loading],
  template: `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 class="text-4xl font-light text-center mb-10 text-gray-900">Charaktere</h1>

      @if (store.loading()) {
        <app-loading />
      } @else if (store.characters().length === 0) {
        <p class="text-center text-gray-500 py-10">Keine Charaktere gefunden.</p>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (char of store.characters(); track char.url) {
            <app-card
              [title]="char.name"
              [detailLink]="'/characters/' + store.extractId(char.url)"
            >
              <p>Geschlecht: {{ char.gender }}</p>
              <p>Geburtsjahr: {{ char.birth_year }}</p>
              <p>Größe: {{ char.height }} cm</p>
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
export class CharacterList {
  protected readonly store = inject(CharactersStore);
  private readonly searchService = inject(SearchService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    toObservable(this.searchService.searchTerm)
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => this.store.loadCharacters({ page: 1, search: term }));
  }

  protected loadPage(page: number) {
    this.store.loadCharacters({ page, search: this.searchService.searchTerm() });
  }
}
