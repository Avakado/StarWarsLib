import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SwapiResponse, Film, Person, Planet } from '../models/swapi.interfaces';

@Injectable({ providedIn: 'root' })
export class SwapiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://swapi.dev/api';

  getFilms(): Observable<SwapiResponse<Film>> {
    return this.http.get<SwapiResponse<Film>>(`${this.baseUrl}/films/`);
  }

  getFilm(id: string): Observable<Film> {
    return this.http.get<Film>(`${this.baseUrl}/films/${id}/`);
  }

  getPeople(page = 1, search = ''): Observable<SwapiResponse<Person>> {
    const params: Record<string, string> = { page: String(page) };
    if (search) params['search'] = search;
    return this.http.get<SwapiResponse<Person>>(`${this.baseUrl}/people/`, { params });
  }

  getPerson(id: string): Observable<Person> {
    return this.http.get<Person>(`${this.baseUrl}/people/${id}/`);
  }

  getPlanets(page = 1, search = ''): Observable<SwapiResponse<Planet>> {
    const params: Record<string, string> = { page: String(page) };
    if (search) params['search'] = search;
    return this.http.get<SwapiResponse<Planet>>(`${this.baseUrl}/planets/`, { params });
  }

  getPlanet(id: string): Observable<Planet> {
    return this.http.get<Planet>(`${this.baseUrl}/planets/${id}/`);
  }

  getResourceByUrl<T>(url: string): Observable<T> {
    return this.http.get<T>(url.replace('http://', 'https://'));
  }

  extractId(url: string): string {
    const matches = url.match(/\/(\d+)\/$/);
    return matches ? matches[1] : '';
  }
}
