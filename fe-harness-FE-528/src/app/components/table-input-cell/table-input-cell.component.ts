import { Component, input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  AwFormFieldComponent,
  AwInputDirective,
  AwButtonIconOnlyDirective,
  AwIconComponent,
} from '@assetworks-llc/aw-component-lib';

/**
 * Editable text input cell for use inside aw-table via TableCellTypes.Custom.
 * Renders an aw-form-field with an AwInput and an optional icon-only search button.
 *
 * Uses a local FormControl for two-way binding so the CCL's built-in clear (X) button
 * works correctly. The [value] one-way binding approach caused the cleared value to be
 * immediately overwritten by the stale signal input on the next change detection cycle.
 *
 * NOTE FOR DEVELOPERS: We attempted to use AwToolTipDirective (CCL) for the tooltip
 * on meter fields, but it does not work reliably inside aw-table custom cells.
 * The directive attaches event listeners on ngOnInit, but because aw-table destroys
 * and recreates custom cell components when tableData changes (via @for track key),
 * the tooltip element gets orphaned or never attaches properly. The native HTML
 * `title` attribute is used instead as a reliable fallback.
 */
@Component({
  selector: 'app-table-input-cell',
  standalone: true,
  imports: [ReactiveFormsModule, AwFormFieldComponent, AwInputDirective, AwButtonIconOnlyDirective, AwIconComponent],
  template: `
    <div class="table-input-cell">
      <aw-form-field>
        <input AwInput
          [formControl]="ctrl"
          [placeholder]="placeholder()"
          [readOnly]="readOnly()"
          [attr.inputmode]="inputMode()"
          [attr.aria-label]="ariaLabel()"
          [attr.title]="tooltip() || null"
          (keydown)="onKeydown($event)" />
      </aw-form-field>
      @if (showSearchButton()) {
        <button AwButtonIconOnly [buttonType]="'primary'"
          [ariaLabel]="'Search ' + ariaLabel()"
          type="button"
          (click)="onSearchClick()">
          <aw-icon [iconName]="'search'" [iconColor]="''"></aw-icon>
        </button>
      }
    </div>
  `,
  styles: [`
    .table-input-cell { display: flex; gap: 4px; align-items: flex-start; }
  `]
})
export class TableInputCellComponent implements OnInit {
  value = input<string>('');
  placeholder = input<string>('');
  readOnly = input<boolean>(false);
  inputMode = input<string>('text');
  ariaLabel = input<string>('');
  tooltip = input<string>('');
  showSearchButton = input<boolean>(false);
  onChange = input<((value: string) => void) | null>(null);
  onSearch = input<(() => void) | null>(null);
  onKeydownHandler = input<((event: KeyboardEvent) => void) | null>(null);

  /** Local FormControl for two-way binding — CCL clear button works with this. */
  ctrl = new FormControl<string>('');
  private _lastEmittedValue = '';

  ngOnInit(): void {
    // Set initial value from input
    const initial = this.value() ?? '';
    this.ctrl.setValue(initial, { emitEvent: false });
    this._lastEmittedValue = initial;
    // Subscribe to value changes (typing + CCL clear button)
    // Only emit when value actually changes to avoid clearing on tab-through
    this.ctrl.valueChanges.subscribe(val => {
      const newVal = val ?? '';
      if (newVal !== this._lastEmittedValue) {
        this._lastEmittedValue = newVal;
        this.onChange()?.call(null, newVal);
      }
    });
  }

  onKeydown(event: KeyboardEvent): void {
    this.onKeydownHandler()?.call(null, event);
  }

  onSearchClick(): void {
    this.onSearch()?.call(null);
  }
}
