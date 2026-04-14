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
  AwButtonSegmentedComponent,
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
import { UsageAssetSearchDialogComponent } from './asset-search-dialog.component';
import { UsageTaskSearchDialogComponent } from './task-search-dialog.component';
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
    AwButtonSegmentedComponent,
    AwDatePickerComponent,
    AwDateTimePickerComponent,
    AwDividerComponent,
    AwFormFieldComponent,
    AwFormFieldLabelComponent,
    AwIconComponent,
    AwInputDirective,
    AwSelectMenuComponent,
    UsageAssetSearchDialogComponent,
    UsageTaskSearchDialogComponent,
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

  /** Operator dropdown options — label shows (ID) Name for input display, additionalInfo shows ID in dropdown. */
  public readonly operatorOptions = computed<SingleSelectOption[]>(() =>
    this._mockData.operators().map(op => ({ label: `(${op.id}) ${op.name}`, value: op.id })),
  );

  /** Department dropdown options. */
  public readonly departmentOptions = computed<SingleSelectOption[]>(() =>
    this._mockData.departments().map(dept => ({ label: `(${dept.id}) ${dept.name}`, value: dept.id })),
  );

  /** Task dropdown options. */
  public readonly taskOptions = computed<SingleSelectOption[]>(() =>
    this._mockData.tasks().map(t => ({ label: t.taskDescription, value: t.taskId })),
  );

  /** Account dropdown options. */
  public readonly accountOptions = computed<SingleSelectOption[]>(() =>
    this._mockData.accounts().map(a => ({ label: `(${a.id}) ${a.name}`, value: a.id })),
  );

  /** Meter validation dropdown options. */
  public readonly meterValidationOptions = computed<SingleSelectOption[]>(() =>
    this._mockData.meterValidations().map(v => ({ label: v.name, value: v.id })),
  );

  /** Financial project code dropdown options. */
  public readonly financialProjectCodeOptions = computed<SingleSelectOption[]>(() =>
    this._mockData.financialProjectCodes().map(f => ({ label: `(${f.id}) ${f.name}`, value: f.id })),
  );

  /** Mock meter data for hint text display. */
  public readonly meter1Units = signal<string>('miles');
  public readonly meter1Reading = signal<number>(45230);
  public readonly meter2Units = signal<string>('hours');
  public readonly meter2Reading = signal<number>(1250);
  public readonly meter1Hint = computed(() => this.meter1Units() ? `Current: ${this.meter1Reading().toLocaleString()} ${this.meter1Units()}` : '');
  public readonly meter2Hint = computed(() => this.meter2Units() ? `Current: ${this.meter2Reading().toLocaleString()} ${this.meter2Units()}` : '');

  /** Entry mode segmented button labels. */
  public readonly entryModeLabels = ['Single Entry', 'Multi Entry'];

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

  /** Handle segmented button entry mode change. */
  public onEntryModeChange(event: { event: MouseEvent | KeyboardEvent; index: number }): void {
    this.entryMode.set(event.index === 0 ? 'single' : 'multi');
  }

  /** Increment a numeric form field value. */
  public incrementField(form: FormGroup, fieldName: string, step: number = 1): void {
    const ctrl = form.get(fieldName);
    if (!ctrl) return;
    const current = parseFloat(ctrl.value) || 0;
    ctrl.setValue(parseFloat((current + step).toFixed(2)));
  }

  /** Decrement a numeric form field value, floored at 0. */
  public decrementField(form: FormGroup, fieldName: string, step: number = 1): void {
    const ctrl = form.get(fieldName);
    if (!ctrl) return;
    const current = parseFloat(ctrl.value) || 0;
    const newVal = parseFloat((current - step).toFixed(2));
    ctrl.setValue(newVal < 0 ? 0 : newVal);
  }

  /** Compute total usage from business + individual usage values. */
  public getTotalUsage(form: FormGroup): string {
    const business = parseFloat(form.get('businessUsage')?.value) || 0;
    const individual = parseFloat(form.get('individualUsage')?.value) || 0;
    return (business + individual).toFixed(2);
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

  /** Show/hide asset search dialog. */
  public readonly showAssetSearchDialog = signal(false);

  /** Show/hide task search dialog. */
  public readonly showTaskSearchDialog = signal(false);

  /** Close panel without returning data. */
  public onCancel(): void {
    this.close.emit(null);
  }

  /** Open asset search dialog. */
  public onAssetSearch(): void {
    this.showAssetSearchDialog.set(true);
  }

  /** Handle asset search dialog close. */
  public onAssetSearchClose(result: any): void {
    this.showAssetSearchDialog.set(false);
    if (result?.action === 'go' && result.selectedAsset) {
      this.singleEntryForm.get('asset')?.setValue(`(${result.selectedAsset.EquipmentId}) ${result.selectedAsset.EquipmentDescription}`);
    }
  }

  /** Open task search dialog. */
  public onTaskSearch(): void {
    this.showTaskSearchDialog.set(true);
  }

  /** Handle task search dialog close. */
  public onTaskSearchClose(result: any): void {
    this.showTaskSearchDialog.set(false);
    if (result && result instanceof Set) {
      this.singleEntryForm.get('task')?.setValue(Array.from(result).join(', '));
    }
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
      businessUsage: new FormControl<number | null>(null),
      individualUsage: new FormControl<number | null>(null),
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
      businessUsage: v.businessUsage ?? null,
      individualUsage: v.individualUsage ?? null,
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
