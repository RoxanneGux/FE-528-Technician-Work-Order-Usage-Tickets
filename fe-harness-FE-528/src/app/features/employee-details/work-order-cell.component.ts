import { Component, Input } from '@angular/core';

/** Simple cell component for displaying WO ID + description as two lines in aw-table. */
@Component({
  selector: 'app-work-order-cell',
  standalone: true,
  template: `
    <span class="aw-b-1-medium">{{ woId }}</span>
    <br />
    <span class="aw-c-1" style="color: var(--system-text-text-secondary, #5b6670)">{{ description }}</span>
  `,
})
export class WorkOrderCellComponent {
  @Input() woId = '';
  @Input() description = '';
}
