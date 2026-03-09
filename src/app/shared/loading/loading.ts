import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center py-20" role="status" aria-label="Loading">
      <div class="flex flex-col items-center gap-4">
        <div class="w-10 h-10 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
        <span class="text-gray-500 text-sm">Loading...</span>
      </div>
    </div>
  `,
})
export class Loading {}
