import { Component, input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  AwSearchComponent,
  AwButtonIconOnlyDirective,
  AwIconComponent,
} from '@assetworks-llc/aw-component-lib';

/** Option shape for the search dropdown. */
export interface SearchCellOption {
  label: string;
  value: string;
  description?: string;
}

/**
 * Autocomplete search cell for use inside aw-table via TableCellTypes.Custom.
 * Wraps aw-search to provide type-ahead filtering with a dropdown showing
 * both ID and description. User can also type a memorized ID directly.
 * The magnifying glass button opens the full search dialog.
 */
@Component({
  selector: 'app-table-search-cell',
  standalone: true,
  imports: [ReactiveFormsModule, AwSearchComponent, AwButtonIconOnlyDirective, AwIconComponent],
  template: `
    <div class="table-search-cell">
      <aw-search
        [ariaLabel]="ariaLabel()"
        [searchOptions]="options()"
        [placeholder]="placeholder()"
        [formControl]="ctrl">
      </aw-search>
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
    .table-search-cell { display: flex; gap: 4px; align-items: flex-start; }
    .table-search-cell aw-search { flex: 1; min-width: 0; }
  `]
})
export class TableSearchCellComponent implements OnInit {
  value = input<string>('');
  placeholder = input<string>('');
  ariaLabel = input<string>('');
  options = input<SearchCellOption[]>([]);
  showSearchButton = input<boolean>(false);
  onChange = input<((value: string) => void) | null>(null);
  /** Called when user selects from dropdown — passes the full option with description. */
  onSelect = input<((option: SearchCellOption) => void) | null>(null);
  onSearch = input<(() => void) | null>(null);

  ctrl = new FormControl<any>('');
  private _lastEmittedValue = '';

  ngOnInit(): void {
    const initial = this.value() ?? '';
    this.ctrl.setValue(initial, { emitEvent: false });
    this._lastEmittedValue = initial;

    this.ctrl.valueChanges.subscribe(val => {
      if (typeof val === 'object' && val !== null) {
        // User selected from dropdown — extract the value and update display
        const id = val.value ?? val.label ?? '';
        if (id !== this._lastEmittedValue) {
          this._lastEmittedValue = id;
          this.ctrl.setValue(id, { emitEvent: false });
          this.onChange()?.call(null, id);
          this.onSelect()?.call(null, val as SearchCellOption);
        }
      } else {
        // User is typing freely
        const str = val ?? '';
        if (str !== this._lastEmittedValue) {
          this._lastEmittedValue = str;
          this.onChange()?.call(null, str);
        }
      }
    });
  }

  onSearchClick(): void {
    this.onSearch()?.call(null);
  }
}
