import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  AwFormFieldComponent,
  AwDatePickerComponent,
  AwButtonIconOnlyDirective,
  AwIconComponent,
} from '@assetworks-llc/aw-component-lib';

/**
 * Date picker cell for use inside aw-table via TableCellTypes.Custom.
 * Renders an aw-form-field with an aw-date-picker and a calendar icon button.
 */
@Component({
  selector: 'app-table-date-cell',
  standalone: true,
  imports: [AwFormFieldComponent, AwDatePickerComponent, AwButtonIconOnlyDirective, AwIconComponent, ReactiveFormsModule],
  template: `
    <aw-form-field>
      <aw-date-picker #datePicker
        [formControl]="formControl()"
        [placeholder]="'mm/dd/yyyy'">
      </aw-date-picker>
      <button ariaLabel="calendar" type="button" AwButtonIconOnly
        [buttonType]="'primary'" (click)="datePicker.openCalendar()">
        <aw-icon [iconName]="'today'" [iconColor]="''"></aw-icon>
      </button>
    </aw-form-field>
  `
})
export class TableDateCellComponent {
  formControl = input.required<FormControl>();
}
