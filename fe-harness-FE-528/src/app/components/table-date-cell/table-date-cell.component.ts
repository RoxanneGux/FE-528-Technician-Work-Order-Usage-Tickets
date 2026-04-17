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
    <div class="table-date-cell">
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
      <span class="table-date-cell__spacer">&nbsp;</span>
    </div>
  `,
  styles: [`
    .table-date-cell { display: flex; flex-direction: column; gap: 2px; }
    .table-date-cell__spacer { display: block; font-size: 12px; line-height: 16px; visibility: hidden; }
  `]
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

    // Blur validation — only reset if user typed garbage (not a valid date pattern)
    input.addEventListener('blur', () => {
      const value = input.value.trim();
      if (!value) return; // Empty is fine
      // Accept dates with or without leading zeros: M/D/YYYY, MM/DD/YYYY, etc.
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) return; // Valid format
      // Also skip if the FormControl has a valid Date object (CCL set it via calendar)
      const ctrlValue = this.formControl()?.value;
      if (ctrlValue instanceof Date && !isNaN(ctrlValue.getTime())) return;
      // Garbage input — clear it
      input.value = '';
      this.formControl()?.setValue(null);
      (this._datePicker as any).showClearIcon?.set(false);
    });
  }
}
