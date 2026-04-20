import { Component, computed, input } from '@angular/core';
import { AwIconComponent } from '@assetworks-llc/aw-component-lib';

/**
 * Renders N `subdirectory_arrow_right` icons based on nesting depth.
 * Used in the Component Indicator Column to visually represent parent-child hierarchy.
 */
@Component({
  selector: 'app-table-component-indicator-cell',
  standalone: true,
  imports: [AwIconComponent],
  template: `
    <div class="component-indicator-cell">
      @for (i of depthArray(); track i) {
        <aw-icon [iconName]="'subdirectory_arrow_right'" [iconSize]="16"></aw-icon>
      }
    </div>
  `,
  styles: [`
    .component-indicator-cell {
      display: flex;
      align-items: center;
      gap: 0px;
    }
  `]
})
export class TableComponentIndicatorCellComponent {
  nestingDepth = input<number>(0);

  depthArray = computed(() => {
    const depth = Math.max(0, this.nestingDepth() || 0);
    return Array.from({ length: depth }, (_, i) => i);
  });
}
