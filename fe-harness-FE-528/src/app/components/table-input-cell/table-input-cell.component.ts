import { Component, input, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  AwSearchComponent,
  AwButtonIconOnlyDirective,
  AwIconComponent,
} from '@assetworks-llc/aw-component-lib';

/**
 * Editable input cell for use inside aw-table via TableCellTypes.Custom.
 * Uses aw-search instead of aw-form-field because aw-search's X clear button
 * properly resets the FormControl value, while aw-form-field's X only clears the DOM.
 *
 * When searchOptions are provided, shows autocomplete dropdown.
 * When searchOptions are empty, acts as a plain text input with working clear.
 */
@Component({
  selector: 'app-table-input-cell',
  standalone: true,
  imports: [ReactiveFormsModule, AwSearchComponent, AwButtonIconOnlyDirective, AwIconComponent],
  template: `
    <div class="table-input-cell">
      <div class="table-input-cell__field">
        <aw-search
          [ariaLabel]="ariaLabel()"
          [placeholder]="placeholder()"
          [formControl]="ctrl"
          [attr.title]="tooltip() || null">
        </aw-search>
        @if (localSubtitle) {
          <span class="table-input-cell__subtitle"
            [class.table-input-cell__subtitle--error]="localSubtitleError">
            {{ localSubtitle }}
          </span>
        } @else {
          <span class="table-input-cell__spacer">&nbsp;</span>
        }
      </div>
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
    .table-input-cell__field { flex: 1; min-width: 0; }
    .table-input-cell__subtitle {
      display: block;
      font-size: 12px;
      line-height: 16px;
      color: var(--system-text-text-secondary, #5b6670);
      margin-top: 2px;
    }
    .table-input-cell__subtitle--error {
      color: var(--system-text-text-secondary, #5b6670);
    }
    .table-input-cell__spacer {
      display: block;
      font-size: 12px;
      line-height: 16px;
      margin-top: 2px;
      visibility: hidden;
    }
  `]
})
export class TableInputCellComponent implements OnInit, AfterViewInit {
  @ViewChild(AwSearchComponent, { read: ElementRef }) private _searchEl!: ElementRef;
  value = input<string>('');
  placeholder = input<string>('');
  readOnly = input<boolean>(false);
  inputMode = input<string>('text');
  ariaLabel = input<string>('');
  tooltip = input<string>('');
  subtitle = input<string>('');
  subtitleError = input<boolean>(false);
  /** Optional lookup function called on blur to get subtitle text. Returns {text, isError}. */
  lookupOnBlur = input<((value: string) => { text: string; isError: boolean }) | null>(null);
  showSearchButton = input<boolean>(false);
  onChange = input<((value: string) => void) | null>(null);
  onSearch = input<(() => void) | null>(null);
  onBlur = input<(() => void) | null>(null);
  onKeydownHandler = input<((event: KeyboardEvent) => void) | null>(null);

  ctrl = new FormControl<any>('');
  /** Local subtitle that updates on blur without re-rendering the table. */
  localSubtitle = '';
  localSubtitleError = false;

  ngOnInit(): void {
    const initial = this.value() ?? '';
    this.ctrl.setValue(initial, { emitEvent: false });
    // Set initial subtitle from inputs
    this.localSubtitle = this.subtitle();
    this.localSubtitleError = this.subtitleError();
    // If we have a lookup function and initial value, compute subtitle
    if (initial && this.lookupOnBlur()) {
      const result = this.lookupOnBlur()!(initial);
      this.localSubtitle = result.text;
      this.localSubtitleError = result.isError;
    }
    this.ctrl.valueChanges.subscribe(val => {
      const resolved = typeof val === 'object' && val !== null ? (val.value ?? val.label ?? '') : (val ?? '');
      this.onChange()?.call(null, resolved);
    });
  }

  ngAfterViewInit(): void {
    const input = this._searchEl?.nativeElement?.querySelector('input');
    if (input) {
      // Ensure aw-search displays the initial value — it can overwrite ctrl.value asynchronously
      const initial = this.value() ?? '';
      if (initial) {
        setTimeout(() => {
          input.value = initial;
        }, 0);
      }

      input.addEventListener('blur', () => {
        setTimeout(() => {
          const currentVal = this.ctrl.value ?? '';
          let resolved = typeof currentVal === 'object' ? (currentVal.value ?? '') : currentVal;

          // For decimal fields, strip non-numeric characters on blur
          if (this.inputMode() === 'decimal' && resolved) {
            const sanitized = String(resolved).replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
            if (sanitized !== String(resolved)) {
              resolved = sanitized;
              this.ctrl.setValue(sanitized, { emitEvent: false });
              input.value = sanitized;
              this.onChange()?.call(null, sanitized);
            }
          }

          // Uppercase the input value on blur (skip for decimal fields)
          if (resolved.trim() && this.inputMode() !== 'decimal') {
            const upper = resolved.trim().toUpperCase();
            this.ctrl.setValue(upper, { emitEvent: false });
            input.value = upper;
          }
          // Update subtitle locally using lookup function — no table re-render
          const lookup = this.lookupOnBlur();
          if (lookup && resolved) {
            const result = lookup(resolved);
            this.localSubtitle = result.text;
            this.localSubtitleError = result.isError;
          } else if (!resolved) {
            this.localSubtitle = '';
            this.localSubtitleError = false;
          }
          this.onBlur()?.call(null);
        }, 50);
      });
    }
  }

  onSearchClick(): void {
    this.onSearch()?.call(null);
  }
}
