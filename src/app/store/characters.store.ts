import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { SwapiService } from '../services/swapi.service';
import { Person } from '../models/swapi.interfaces';

interface CharactersState {
  characters: Person[];
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: CharactersState = {
  characters: [],
  currentPage: 1,
  hasNext: false,
  hasPrevious: false,
  loading: false,
  error: null,
};

export const CharactersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const swapiService = inject(SwapiService);
    return {
      loadCharacters: rxMethod<{ page: number; search: string }>(
        pipe(
          tap(({ page }) => patchState(store, { loading: true, currentPage: page, error: null })),
          switchMap(({ page, search }) =>
            swapiService.getPeople(page, search).pipe(
              tap((res) =>
                patchState(store, {
                  characters: res.results,
                  hasNext: !!res.next,
                  hasPrevious: !!res.previous,
                  loading: false,
                }),
              ),
              catchError(() => {
                patchState(store, { loading: false, error: 'Failed to load characters' });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
      extractId(url: string): string {
        return swapiService.extractId(url);
      },
    };
  }),
);
