import { Component, input } from '@angular/core';
import {
  AwFormFieldComponent,
  AwInputDirective,
  AwButtonIconOnlyDirective,
  AwIconComponent,
} from '@assetworks-llc/aw-component-lib';

/**
 * Editable text input cell for use inside aw-table via TableCellTypes.Custom.
 * Renders an aw-form-field with an AwInput and an optional icon-only search button.
 */
@Component({
  selector: 'app-table-input-cell',
  standalone: true,
  imports: [AwFormFieldComponent, AwInputDirective, AwButtonIconOnlyDirective, AwIconComponent],
  template: `
    <div class="table-input-cell">
      <aw-form-field>
        <input AwInput
          [value]="value()"
          [placeholder]="placeholder()"
          [readOnly]="readOnly()"
          [attr.inputmode]="inputMode()"
          [attr.aria-label]="ariaLabel()"
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
export class TableInputCellComponent {
  value = input<string>('');
  placeholder = input<string>('');
  readOnly = input<boolean>(false);
  inputMode = input<string>('text');
  ariaLabel = input<string>('');
  showSearchButton = input<boolean>(false);
  onChange = input<((value: string) => void) | null>(null);
  onSearch = input<(() => void) | null>(null);
  onKeydownHandler = input<((event: KeyboardEvent) => void) | null>(null);

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
