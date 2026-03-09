import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { SwapiService } from '../services/swapi.service';
import { Film } from '../models/swapi.interfaces';

interface FilmsState {
  films: Film[];
  loading: boolean;
  error: string | null;
}

const initialState: FilmsState = {
  films: [],
  loading: false,
  error: null,
};

export const FilmsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ films }) => ({
    sortedFilms: computed(() => [...films()].sort((a, b) => a.episode_id - b.episode_id)),
  })),
  withMethods((store) => {
    const swapiService = inject(SwapiService);
    return {
      loadFilms: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            swapiService.getFilms().pipe(
              tap((res) => patchState(store, { films: res.results, loading: false })),
              catchError(() => {
                patchState(store, { loading: false, error: 'Failed to load films' });
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
