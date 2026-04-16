import { Component, input, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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
 * NOTE FOR DEVELOPERS: We attempted to use AwToolTipDirective (CCL) for the tooltip
 * on meter fields, but it does not work reliably inside aw-table custom cells.
 * The directive attaches event listeners on ngOnInit, but because aw-table destroys
 * and recreates custom cell components when tableData changes (via @for track key),
 * the tooltip element gets orphaned or never attaches properly. The native HTML
 * `title` attribute is used instead as a reliable fallback. If CCL adds support for
 * tooltips inside table cells in the future, this can be revisited.
 */
@Component({
  selector: 'app-table-input-cell',
  standalone: true,
  imports: [AwFormFieldComponent, AwInputDirective, AwButtonIconOnlyDirective, AwIconComponent],
  template: `
    <div class="table-input-cell">
      <aw-form-field #formField>
        <input AwInput #inputEl
          [value]="value()"
          [placeholder]="placeholder()"
          [readOnly]="readOnly()"
          [attr.inputmode]="inputMode()"
          [attr.aria-label]="ariaLabel()"
          [attr.title]="tooltip() || null"
          (input)="onInput($event)"
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
export class TableInputCellComponent implements AfterViewInit {
  @ViewChild('formField', { read: ElementRef }) formFieldEl!: ElementRef;
  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

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

  /** Listen for clicks on the CCL clear button inside aw-form-field. */
  ngAfterViewInit(): void {
    const el = this.formFieldEl?.nativeElement;
    if (!el) return;
    // The CCL clear button has class 'aw-form-field-clear' — listen for clicks on it
    el.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      // Check if the click was on the clear button or its child (the X icon)
      if (target.closest('.aw-form-field-clear, .aw-clear-icon, [class*="clear"]')) {
        setTimeout(() => {
          this.onChange()?.call(null, '');
        });
      }
    });
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onChange()?.call(null, value);
  }

  onKeydown(event: KeyboardEvent): void {
    this.onKeydownHandler()?.call(null, event);
  }

  onSearchClick(): void {
    this.onSearch()?.call(null);
  }
}
