import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { class: 'block h-full' },
  template: `
    <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div class="aspect-4/3 bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500 shrink-0">
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
      <div class="p-4 flex-1 flex flex-col overflow-hidden">
        <h3 class="font-bold text-lg mb-1 text-gray-900 truncate">{{ title() }}</h3>
        <div class="text-sm text-gray-600 flex-1">
          <ng-content />
        </div>
        @if (detailLink()) {
          <a [routerLink]="detailLink()" class="text-sm text-blue-600 hover:text-blue-800 mt-3 inline-block font-medium shrink-0">
            Mehr Informationen...
          </a>
        }
      </div>
    </article>
  `,
})
export class Card {
  readonly title = input.required<string>();
  readonly detailLink = input<string | null>(null);
}
