import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AwSelectMenuComponent, SingleSelectOption } from '@assetworks-llc/aw-component-lib';

/**
 * Select menu cell for use inside aw-table via TableCellTypes.Custom.
 * Renders an aw-select-menu dropdown.
 */
@Component({
  selector: 'app-table-select-cell',
  standalone: true,
  imports: [AwSelectMenuComponent, ReactiveFormsModule],
  template: `
    <aw-select-menu
      [singleSelectListItems]="options()"
      [enableListReset]="true"
      [placeholder]="placeholder()"
      [formControl]="formControl()"
      [ariaLabel]="ariaLabel()">
    </aw-select-menu>
  `
})
export class TableSelectCellComponent {
  options = input<SingleSelectOption[]>([]);
  placeholder = input<string>('');
  formControl = input.required<FormControl>();
  ariaLabel = input<string>('');
}
