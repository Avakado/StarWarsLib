import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="bg-black text-white sticky top-0 z-50">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-6 lg:gap-8">
            <a routerLink="/" (click)="onNavClick()" class="shrink-0 leading-none"
               aria-label="Star Wars Home">
              <span class="font-black text-[0.6rem] leading-[0.85] tracking-[0.25em] text-white block">STAR</span>
              <span class="font-black text-[0.6rem] leading-[0.85] tracking-widest text-white block">WARS</span>
            </a>
            <div class="hidden md:flex items-center gap-5 text-sm font-light">
              <a routerLink="/films" routerLinkActive="underline underline-offset-4"
                 [routerLinkActiveOptions]="{ exact: false }"
                 (click)="onNavClick()"
                 class="hover:text-gray-300 transition-colors">Filme</a>
              <a routerLink="/characters" routerLinkActive="underline underline-offset-4"
                 [routerLinkActiveOptions]="{ exact: false }"
                 (click)="onNavClick()"
                 class="hover:text-gray-300 transition-colors">Charaktere</a>
              <a routerLink="/planets" routerLinkActive="underline underline-offset-4"
                 [routerLinkActiveOptions]="{ exact: false }"
                 (click)="onNavClick()"
                 class="hover:text-gray-300 transition-colors">Planeten</a>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="relative hidden sm:block">
              <input
                type="text"
                placeholder="Suche"
                [value]="searchService.searchTerm()"
                (input)="onSearch($event)"
                aria-label="Search"
                class="bg-gray-800 text-white text-sm rounded-sm px-3 py-1.5 pr-8 border border-gray-600
                       focus:outline-none focus:border-gray-400 w-36 lg:w-48 placeholder-gray-400"
              />
              <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

            <button class="md:hidden p-1" (click)="toggleMobile()" aria-label="Toggle menu"
                    [attr.aria-expanded]="mobileOpen()">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                @if (mobileOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                }
              </svg>
            </button>
          </div>
        </div>

        @if (mobileOpen()) {
          <div class="md:hidden pb-4 border-t border-gray-800 pt-3 flex flex-col gap-3">
            <a routerLink="/films" routerLinkActive="underline underline-offset-4"
               (click)="onNavClick(); closeMobile()"
               class="text-sm font-light hover:text-gray-300 transition-colors px-1">Filme</a>
            <a routerLink="/characters" routerLinkActive="underline underline-offset-4"
               (click)="onNavClick(); closeMobile()"
               class="text-sm font-light hover:text-gray-300 transition-colors px-1">Charaktere</a>
            <a routerLink="/planets" routerLinkActive="underline underline-offset-4"
               (click)="onNavClick(); closeMobile()"
               class="text-sm font-light hover:text-gray-300 transition-colors px-1">Planeten</a>
            <div class="relative sm:hidden mt-1">
              <input
                type="text"
                placeholder="Suche"
                [value]="searchService.searchTerm()"
                (input)="onSearch($event)"
                aria-label="Search"
                class="bg-gray-800 text-white text-sm rounded-sm px-3 py-1.5 pr-8 border border-gray-600
                       focus:outline-none focus:border-gray-400 w-full placeholder-gray-400"
              />
            </div>
          </div>
        }
      </nav>
    </header>
  `,
})
export class Header {
  protected readonly searchService = inject(SearchService);
  protected readonly mobileOpen = signal(false);

  protected onNavClick() {
    this.searchService.clear();
  }

  protected onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchService.search(value);
  }

  protected toggleMobile() {
    this.mobileOpen.update((v) => !v);
  }

  protected closeMobile() {
    this.mobileOpen.set(false);
  }
}
