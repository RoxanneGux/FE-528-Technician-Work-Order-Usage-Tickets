import { Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  AwDateTimePickerComponent,
  AwButtonIconOnlyDirective,
  AwIconComponent,
} from '@assetworks-llc/aw-component-lib';

/**
 * Date-time picker cell for use inside aw-table via TableCellTypes.Custom.
 * Renders an aw-date-time-picker with a calendar icon button.
 */
@Component({
  selector: 'app-table-date-time-cell',
  standalone: true,
  imports: [AwDateTimePickerComponent, AwButtonIconOnlyDirective, AwIconComponent, ReactiveFormsModule],
  template: `
    <aw-date-time-picker #dateTimePicker
      [formControl]="formControl()"
      [timeFormat]="timeFormat()"
      [ariaLabel]="{date: ariaLabel() + ' Date', time: ariaLabel() + ' Time'}"
      [placeholder]="{date: 'mm/dd/yyyy', time: timePlaceholder()}">
      <button [attr.aria-label]="'open ' + ariaLabel() + ' picker'" type="button"
        AwButtonIconOnly [buttonType]="'primary'" (click)="dateTimePicker.openDateTimePicker()">
        <aw-icon [iconName]="'today'" [iconColor]="''"></aw-icon>
      </button>
    </aw-date-time-picker>
  `
})
export class TableDateTimeCellComponent {
  formControl = input.required<FormControl>();
  timeFormat = input<'12h' | '24h'>('12h');
  ariaLabel = input<string>('');

  timePlaceholder = computed(() =>
    this.timeFormat() === '12h' ? 'hh:mm AM/PM' : 'hh:mm'
  );
}
