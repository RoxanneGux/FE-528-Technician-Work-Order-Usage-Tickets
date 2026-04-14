import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  ActionBarLeft,
  ActionBarRight,
  AwActionBarComponent,
  AwButtonDirective,
  AwButtonIconOnlyDirective,
  AwChipComponent,
  AwDatePickerComponent,
  AwDateTimePickerComponent,
  AwDividerComponent,
  AwFormFieldComponent,
  AwFormFieldLabelComponent,
  AwIconComponent,
  AwInputDirective,
  AwSelectMenuComponent,
  SingleSelectOption,
} from '@assetworks-llc/aw-component-lib';

import { MockDataService } from '../../services/mock-data.service';
import {
  DISPLAY_MODE_FIELDS,
  UsageDisplayMode,
  UsageEntry,
  UsageEntryResult,
} from './usage-entry.interface';

/**
 * Full-width slide-in panel for recording equipment usage against a work order.
 * Supports single-entry (form) and multi-entry (table) modes.
 */
@Component({
  selector: 'app-add-usage-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AwActionBarComponent,
    AwButtonDirective,
    AwButtonIconOnlyDirective,
    AwChipComponent,
    AwDatePickerComponent,
    AwDateTimePickerComponent,
    AwDividerComponent,
    AwFormFieldComponent,
    AwFormFieldLabelComponent,
    AwIconComponent,
    AwInputDirective,
    AwSelectMenuComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './add-usage-panel.component.html',
  styleUrl: './add-usage-panel.component.scss',
})
export class AddUsagePanelComponent {
  public readonly close = output<UsageEntryResult | null>();

  private readonly _mockData = inject(MockDataService);

  /** Set by PanelService via Object.assign. Controls which fields are visible. */
  public displayMode: UsageDisplayMode = 'all';

  /** Active entry mode — single form or multi-row table. */
  public readonly entryMode = signal<'single' | 'multi'>('single');

  /** Reactive form for single-entry mode. */
  public readonly singleEntryForm = this.createRowFormGroup();

  /** Array of FormGroups for multi-entry rows, initialized with one row. */
  public readonly multiEntryRows = signal<FormGroup[]>([this.createRowFormGroup()]);

  /** Derived visible fields based on the current display mode. */
  public readonly visibleFields = computed(() => {
    return DISPLAY_MODE_FIELDS[this.displayMode] ?? DISPLAY_MODE_FIELDS['all'];
  });

  /** Operator dropdown options. */
  public readonly operatorOptions = computed<SingleSelectOption[]>(() =>
    this._mockData.operators().map(op => ({ label: op.name, value: op.id })),
  );

  /** Department dropdown options. */
  public readonly departmentOptions = computed<SingleSelectOption[]>(() =>
    this._mockData.departments().map(dept => ({ label: dept.name, value: dept.id })),
  );

  /** Task dropdown options. */
  public readonly taskOptions = computed<SingleSelectOption[]>(() =>
    this._mockData.tasks().map(t => ({ label: t.taskDescription, value: t.taskId })),
  );

  /** Account dropdown options. */
  public readonly accountOptions = computed<SingleSelectOption[]>(() =>
    this._mockData.accounts().map(a => ({ label: a.name, value: a.id })),
  );

  /** Meter validation dropdown options. */
  public readonly meterValidationOptions = computed<SingleSelectOption[]>(() =>
    this._mockData.meterValidations().map(v => ({ label: v.name, value: v.id })),
  );

  /** Financial project code dropdown options. */
  public readonly financialProjectCodeOptions = computed<SingleSelectOption[]>(() =>
    this._mockData.financialProjectCodes().map(f => ({ label: f.name, value: f.id })),
  );

  /** Footer action bar — Cancel on left. */
  public readonly footerActionsLeft: ActionBarLeft[] = [
    { textCallback: { title: 'Cancel', action: () => this.onCancel() } },
  ];

  /** Footer action bar — Add on right. */
  public readonly footerActionsRight: ActionBarRight[] = [
    { buttonCallback: { label: 'Add', buttonType: 'outlined', action: () => this.onAdd() } },
  ];

  /** Switch between single and multi entry modes. */
  public toggleEntryMode(mode: 'single' | 'multi'): void {
    this.entryMode.set(mode);
  }

  /** Append a new empty row to the multi-entry table. */
  public addRow(): void {
    this.multiEntryRows.update(rows => [...rows, this.createRowFormGroup()]);
  }

  /** Remove a row from the multi-entry table by index. */
  public removeRow(index: number): void {
    this.multiEntryRows.update(rows => rows.filter((_, i) => i !== index));
  }

  /** Collect form data and emit via close output. */
  public onAdd(): void {
    if (this.entryMode() === 'single') {
      const entry = this.extractEntry(this.singleEntryForm);
      this.close.emit({ mode: 'single', entries: [entry] });
    } else {
      const entries = this.multiEntryRows().map(row => this.extractEntry(row));
      this.close.emit({ mode: 'multi', entries });
    }
  }

  /** Close panel without returning data. */
  public onCancel(): void {
    this.close.emit(null);
  }

  /** Create a new FormGroup for a usage entry row with today's date as default. */
  public createRowFormGroup(): FormGroup {
    return new FormGroup({
      asset: new FormControl<string | null>(null),
      transactionDate: new FormControl<Date | null>(new Date()),
      hoursUsed: new FormControl<number | null>(null),
      startDateTime: new FormControl<Date | null>(null),
      endDateTime: new FormControl<Date | null>(null),
      meter1Begin: new FormControl<string | null>(null),
      meter2Begin: new FormControl<string | null>(null),
      meter1End: new FormControl<string | null>(null),
      meter2End: new FormControl<string | null>(null),
      meter1Validation: new FormControl<string | null>(null),
      meter2Validation: new FormControl<string | null>(null),
      account: new FormControl<string | null>(null),
      operator: new FormControl<string | null>(null),
      department: new FormControl<string | null>(null),
      task: new FormControl<string | null>(null),
      financialProjectCode: new FormControl<string | null>(null),
      misc1: new FormControl<string | null>(null),
      misc2: new FormControl<string | null>(null),
      misc3: new FormControl<string | null>(null),
      misc4: new FormControl<string | null>(null),
    });
  }

  /** Extract a UsageEntry from a FormGroup, converting Date objects to ISO strings. */
  private extractEntry(form: FormGroup): UsageEntry {
    const v = form.getRawValue();
    return {
      asset: v.asset ?? null,
      transactionDate: v.transactionDate instanceof Date ? v.transactionDate.toISOString() : (v.transactionDate ?? ''),
      hoursUsed: v.hoursUsed ?? null,
      startDateTime: v.startDateTime instanceof Date ? v.startDateTime.toISOString() : null,
      endDateTime: v.endDateTime instanceof Date ? v.endDateTime.toISOString() : null,
      meter1Begin: v.meter1Begin ?? null,
      meter2Begin: v.meter2Begin ?? null,
      meter1End: v.meter1End ?? null,
      meter2End: v.meter2End ?? null,
      meter1Validation: this.extractSelectValue(v.meter1Validation),
      meter2Validation: this.extractSelectValue(v.meter2Validation),
      account: this.extractSelectValue(v.account),
      operator: this.extractSelectValue(v.operator),
      department: this.extractSelectValue(v.department),
      task: this.extractSelectValue(v.task),
      financialProjectCode: this.extractSelectValue(v.financialProjectCode),
      misc1: v.misc1 ?? null,
      misc2: v.misc2 ?? null,
      misc3: v.misc3 ?? null,
      misc4: v.misc4 ?? null,
    };
  }

  /** Extract the value property from a select field (may be object or string). */
  private extractSelectValue(val: any): string | null {
    if (val == null) return null;
    return typeof val === 'object' && val !== null ? val.value : val;
  }
}
