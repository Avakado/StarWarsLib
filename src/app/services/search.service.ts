import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchService {
  readonly searchTerm = signal('');

  search(term: string) {
    this.searchTerm.set(term);
  }

  clear() {
    this.searchTerm.set('');
  }
}
