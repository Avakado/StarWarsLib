import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'films', pathMatch: 'full' },
  {
    path: 'films',
    loadComponent: () => import('./films/film-list/film-list').then((m) => m.FilmList),
  },
  {
    path: 'films/:id',
    loadComponent: () => import('./films/film-detail/film-detail').then((m) => m.FilmDetail),
  },
  {
    path: 'characters',
    loadComponent: () => import('./characters/character-list/character-list').then((m) => m.CharacterList),
  },
  {
    path: 'characters/:id',
    loadComponent: () => import('./characters/character-detail/character-detail').then((m) => m.CharacterDetail),
  },
  {
    path: 'planets',
    loadComponent: () => import('./planets/planet-list/planet-list').then((m) => m.PlanetList),
  },
  {
    path: 'planets/:id',
    loadComponent: () => import('./planets/planet-detail/planet-detail').then((m) => m.PlanetDetail),
  },
  { path: '**', redirectTo: 'films' },
];
