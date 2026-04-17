import { AfterViewInit, Component, input, ViewChild } from '@angular/core';
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
 *
 * Includes keydown masking (digits + slash only) and blur validation
 * that resets invalid input, matching the single-entry Transaction Date behavior.
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
export class TableDateCellComponent implements AfterViewInit {
  @ViewChild('datePicker') private _datePicker!: AwDatePickerComponent;

  formControl = input.required<FormControl>();

  ngAfterViewInit(): void {
    const input = (this._datePicker as any)?.triggerInput?.nativeElement;
    if (!input) return;

    // Keydown masking — only digits and forward slash
    input.addEventListener('keydown', (e: KeyboardEvent) => {
      const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
      if (allowed.includes(e.key)) return;
      if (/^[0-9/]$/.test(e.key)) return;
      e.preventDefault();
    });

    // Blur validation — reset invalid dates
    input.addEventListener('blur', () => {
      const value = input.value.trim();
      if (value && !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        input.value = '';
        this.formControl()?.setValue(null);
        (this._datePicker as any).showClearIcon?.set(false);
      }
    });
  }
}
