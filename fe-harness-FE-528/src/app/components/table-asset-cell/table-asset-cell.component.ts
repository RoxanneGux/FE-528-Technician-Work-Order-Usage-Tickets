import { Component, input, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  AwFormFieldComponent,
  AwInputDirective,
  AwButtonIconOnlyDirective,
  AwIconComponent,
} from '@assetworks-llc/aw-component-lib';

/**
 * Asset lookup cell for aw-table. Follows the production WAC field pattern:
 * aw-form-field + AwInput + search button, with a description span below.
 *
 * Features:
 * - Text input with X clear button (via aw-form-field built-in clear)
 * - Search icon button to open asset dialog
 * - Description line below: shows asset description on match, "NOT DEFINED" on mismatch, empty if blank
 * - Tab-friendly — standard input, no aw-search quirks
 * - On blur: calls lookupFn to resolve description
 */
@Component({
  selector: 'app-table-asset-cell',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AwFormFieldComponent,
    AwInputDirective,
    AwButtonIconOnlyDirective,
    AwIconComponent,
  ],
  template: `
    <div class="table-asset-cell">
      <div class="table-asset-cell__field">
        <aw-form-field>
          <input AwInput
            type="text"
            [formControl]="ctrl"
            [placeholder]="placeholder()"
            [attr.aria-label]="ariaLabel()"
            (blur)="handleBlur()" />
          <button AwButtonIconOnly
            type="button"
            [buttonType]="'primary'"
            [ariaLabel]="'Search ' + ariaLabel()"
            (click)="onSearchClick()">
            <aw-icon [iconName]="'search'" [iconColor]="''"></aw-icon>
          </button>
        </aw-form-field>
        @if (descriptionText) {
          <span class="aw-c-1 table-asset-cell__desc"
            [class.table-asset-cell__desc--error]="descriptionIsError">
            {{ descriptionText }}
          </span>
        } @else {
          <span class="table-asset-cell__desc" style="visibility:hidden">&nbsp;</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .table-asset-cell { display: flex; gap: 4px; align-items: flex-start; }
    .table-asset-cell__field { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .table-asset-cell__desc {
      display: block;
      color: var(--system-text-text-secondary, #5b6670);
      margin-left: 2px;
    }
    .table-asset-cell__desc--error {
      color: var(--system-text-text-secondary, #5b6670);
    }
  `]
})
export class TableAssetCellComponent implements OnInit, AfterViewInit {
  private readonly _cdr = inject(ChangeDetectorRef);

  /** Initial value to populate the input. */
  value = input<string>('');
  placeholder = input<string>('Asset');
  ariaLabel = input<string>('Asset');

  /** Initial description text (from parent combineTemplate). */
  initialDescription = input<string>('');
  /** Whether the initial description is an error state. */
  initialDescriptionError = input<boolean>(false);

  /** Lookup function: given a typed value, returns {description, isError}. Called on blur. */
  lookupFn = input<((value: string) => { description: string; isError: boolean }) | null>(null);

  /** Called when the input value changes (on every keystroke via valueChanges). */
  onChange = input<((value: string) => void) | null>(null);

  /** Called when the search button is clicked. */
  onSearch = input<(() => void) | null>(null);

  /** Called on blur — parent can use this for auto-add-row logic. */
  onBlurCallback = input<(() => void) | null>(null);

  ctrl = new FormControl<string>('');

  /** Local description state — updated on blur without triggering table re-render. */
  descriptionText = '';
  descriptionIsError = false;

  ngOnInit(): void {
    const initial = this.value() ?? '';
    this.ctrl.setValue(initial, { emitEvent: false });

    // Set initial description
    this.descriptionText = this.initialDescription();
    this.descriptionIsError = this.initialDescriptionError();

    // If we have a lookup function and initial value, compute description
    if (initial && this.lookupFn()) {
      const result = this.lookupFn()!(initial);
      this.descriptionText = result.description;
      this.descriptionIsError = result.isError;
    }

    // Sync value to parent FormGroup on every change.
    // Use a microtask to avoid interfering with aw-form-field's clear icon toggle
    // which can steal focus on the first keystroke.
    let initialized = false;
    this.ctrl.valueChanges.subscribe(val => {
      if (!initialized) {
        initialized = true;
        setTimeout(() => this.onChange()?.call(null, val ?? ''), 0);
      } else {
        this.onChange()?.call(null, val ?? '');
      }
    });
  }

  ngAfterViewInit(): void {
    // Nothing needed — blur is handled via template (blur) binding
  }

  /** Handle blur: lookup description and notify parent. */
  handleBlur(): void {
    // Small delay to let aw-form-field clear button work before we read the value
    setTimeout(() => {
      const currentVal = (this.ctrl.value ?? '').trim();
      const lookup = this.lookupFn();

      if (lookup && currentVal) {
        const result = lookup(currentVal);
        this.descriptionText = result.description;
        this.descriptionIsError = result.isError;
      } else if (!currentVal) {
        this.descriptionText = '';
        this.descriptionIsError = false;
      }

      this._cdr.markForCheck();
      this.onBlurCallback()?.call(null);
    }, 50);
  }

  /** Handle search button click. */
  onSearchClick(): void {
    this.onSearch()?.call(null);
  }

  /** Programmatically update the value and description (called after dialog selection). */
  public setValueAndDescription(value: string, description: string): void {
    this.ctrl.setValue(value, { emitEvent: true });
    this.descriptionText = description;
    this.descriptionIsError = false;
    this._cdr.markForCheck();
  }
}
