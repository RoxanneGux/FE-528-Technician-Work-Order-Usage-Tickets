import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  AwDialogComponent,
  AwDividerComponent,
  AwExpansionPanelComponent,
  AwFormFieldComponent,
  AwFormFieldLabelComponent,
  AwFormMessageComponent,
  AwIconComponent,
  AwInputDirective,
  AwSearchComponent,
  AwSelectMenuComponent,
  AwTableComponent,
  AwToggleComponent,
  SingleSelectOption,
  TableActionMenu,
  TableCellInput,
  TableCellTypes,
} from '@assetworks-llc/aw-component-lib';

import { TableTextSubtextComponent } from '../../components/table-text-subtext/table-text-subtext.component';
import { TableInputCellComponent } from '../../components/table-input-cell/table-input-cell.component';
import { TableDateCellComponent } from '../../components/table-date-cell/table-date-cell.component';
import { TableDateTimeCellComponent } from '../../components/table-date-time-cell/table-date-time-cell.component';
import { TableSelectCellComponent } from '../../components/table-select-cell/table-select-cell.component';
import { MockDataService } from '../../services/mock-data.service';
import { UsageAssetSearchDialogComponent } from './asset-search-dialog.component';
import { UsageTaskSearchDialogComponent } from './task-search-dialog.component';
import {
  DISPLAY_MODE_FIELDS,
  MAWO_HIDDEN_FIELDS,
  TIME_FORMAT_OPTIONS,
  USAGE_DISPLAY_MODE_OPTIONS,
  UsageDisplayMode,
  UsageEntry,
  UsageEntryResult,
  WORK_ORDER_TYPE_OPTIONS,
  WorkOrderType,
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
    FormsModule,
    ReactiveFormsModule,
    AwActionBarComponent,
    AwButtonDirective,
    AwButtonIconOnlyDirective,
    AwButtonSegmentedComponent,
    AwDatePickerComponent,
    AwDateTimePickerComponent,
    AwDialogComponent,
    AwDividerComponent,
    AwFormFieldComponent,
    AwFormFieldLabelComponent,
    AwFormMessageComponent,
    AwIconComponent,
    AwInputDirective,
    AwSearchComponent,
    AwSelectMenuComponent,
    AwTableComponent,
    AwToggleComponent,
    AwExpansionPanelComponent,
    TableTextSubtextComponent,
    TableInputCellComponent,
    TableDateCellComponent,
    TableDateTimeCellComponent,
    TableSelectCellComponent,
    UsageAssetSearchDialogComponent,
    UsageTaskSearchDialogComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './add-usage-panel.component.html',
  styleUrl: './add-usage-panel.component.scss',
})
export class AddUsagePanelComponent implements AfterViewInit {
  @ViewChild('startDateTimePicker') private _startDateTimePicker!: AwDateTimePickerComponent;
  @ViewChild('endDateTimePicker') private _endDateTimePicker!: AwDateTimePickerComponent;
  @ViewChild('transactionDatePicker') private _transactionDatePicker!: AwDatePickerComponent;

  public readonly close = output<UsageEntryResult | null>();

  private readonly _mockData = inject(MockDataService);
  private readonly _cdr = inject(ChangeDetectorRef);

  /** Active row index for multi-entry dialogs. */
  private _activeMultiRowIndex: number | null = null;

  /** Controls which fields are visible. */
  public readonly displayMode = signal<UsageDisplayMode>('all');

  /** Controls time format for date-time pickers. */
  public timeFormat: '12h' | '24h' = '12h';

  /** Display mode options for the floating selector. */
  public readonly displayModeOptions = USAGE_DISPLAY_MODE_OPTIONS;

  /** Time format options for the floating selector. */
  public readonly timeFormatOptions = TIME_FORMAT_OPTIONS;

  /** Current work order type — Standard or MAWO. */
  public readonly workOrderType = signal<WorkOrderType>('standard');

  /** Whether the panel is in MAWO mode. */
  public readonly isMAWO = computed(() => this.workOrderType() === 'mawo');

  /** Visible fields adjusted for MAWO mode and misc field toggles. */
  public readonly mawoVisibleFields = computed(() => {
    let fields = this.visibleFields();
    if (this.isMAWO()) {
      fields = fields.filter(f => !MAWO_HIDDEN_FIELDS.includes(f));
    }
    // Hide meter 2 fields if selected asset has no meter 2
    if (!this.hasMeter2()) {
      fields = fields.filter(f => !f.startsWith('meter2'));
    }
    // Apply individual misc field toggles
    if (!this.showMisc1()) fields = fields.filter(f => f !== 'misc1');
    if (!this.showMisc2()) fields = fields.filter(f => f !== 'misc2');
    if (!this.showMisc3()) fields = fields.filter(f => f !== 'misc3');
    if (!this.showMisc4()) fields = fields.filter(f => f !== 'misc4');
    return fields;
  });

  /** Work order type options for the floating selector. */
  public readonly workOrderTypeOptions = WORK_ORDER_TYPE_OPTIONS;

  /** Filtered work order type options — only Standard in multi-entry mode. */
  public readonly activeWorkOrderTypeOptions = computed(() => {
    if (this.entryMode() === 'multi') {
      return this.workOrderTypeOptions.filter(o => o.value === 'standard');
    }
    return this.workOrderTypeOptions;
  });

  /** Admin-configurable misc field visibility toggles. */
  public readonly showMisc1 = signal(true);
  public readonly showMisc2 = signal(true);
  public readonly showMisc3 = signal(true);
  public readonly showMisc4 = signal(true);

  /** Search text for children work orders table. */
  public readonly childWOSearchText = signal<string>('');

  /** Status filter FormControl for children work orders table — defaults to Open. */
  public readonly childWOStatusFilterControl = new FormControl<string>('Open');

  /** Reactive signal mirroring the status filter FormControl value. */
  public readonly childWOStatusFilter = signal<string>('Open');

  /** Status filter options for children work orders. */
  public readonly childWOStatusOptions: SingleSelectOption[] = [
    { label: 'Open', value: 'Open' },
    { label: 'All', value: 'All' },
    { label: 'Work Finished', value: 'Work Finished' },
  ];

  /** Filtered children work orders based on search and status filter. */
  public readonly filteredChildWorkOrders = computed(() => {
    let children = this._mockData.mawoChildWorkOrders();
    const status = this.childWOStatusFilter();
    const search = this.childWOSearchText().toLowerCase().trim();

    if (status !== 'All') {
      children = children.filter(c => c.status === status);
    }
    if (search) {
      children = children.filter(c =>
        c.assetId.toLowerCase().includes(search) ||
        c.assetDescription.toLowerCase().includes(search) ||
        c.workOrderId.toLowerCase().includes(search) ||
        c.title.toLowerCase().includes(search)
      );
    }
    return children;
  });

  /** Column definitions for the children work orders table. */
  public readonly childWOColumns: TableCellInput[] = [
    { type: TableCellTypes.Checkbox, key: 'selected', label: '' },
    {
      sort: true, align: 'left', type: TableCellTypes.Custom, key: 'assetId', label: 'Asset',
      combineFields: ['assetId', 'assetDescription'],
      combineTemplate: (values: any[]) => ({
        component: TableTextSubtextComponent,
        componentData: { text: values[0], subText: values[1] }
      })
    },
    {
      sort: true, align: 'left', type: TableCellTypes.Custom, key: 'workOrderId', label: 'Work Order',
      combineFields: ['workOrderId', 'title'],
      combineTemplate: (values: any[]) => ({
        component: TableTextSubtextComponent,
        componentData: { text: values[0], subText: values[1] }
      })
    },
    { sort: true, align: 'left', type: TableCellTypes.Title, key: 'status', label: 'Status' },
  ];

  /** Validation error for start date field. Null means no error. */
  public readonly startDateError = signal<string | null>(null);

  /** Validation error for start time field. Null means no error. */
  public readonly startTimeError = signal<string | null>(null);

  /** Validation error for end date field. Null means no error. */
  public readonly endDateError = signal<string | null>(null);

  /** Validation error for end time field. Null means no error. */
  public readonly endTimeError = signal<string | null>(null);

  /** Attach keydown and blur listeners to internal date/time inputs after view initializes. */
  ngAfterViewInit(): void {
    this.attachInputListeners(this._startDateTimePicker, 'start');
    this.attachInputListeners(this._endDateTimePicker, 'end');
    this.attachTransactionDateListeners();
  }

  /** Active entry mode — single form or multi-row table. */
  public readonly entryMode = signal<'single' | 'multi'>('single');

  /** Reactive form for single-entry mode. */
  public readonly singleEntryForm = this.createRowFormGroup();

  /** Array of FormGroups for multi-entry rows, initialized with one row. */
  public readonly multiEntryRows = signal<FormGroup[]>([this.createRowFormGroup()]);

  /** Flat row objects for aw-table [tableData] binding. */
  public readonly multiEntryTableData = computed(() => {
    return this.multiEntryRows().map((row, index) => {
      const raw = row.getRawValue();
      const business = parseFloat(raw.businessUsage) || 0;
      const individual = parseFloat(raw.individualUsage) || 0;
      const totalUsage = (business + individual).toFixed(2);
      return { ...raw, _rowIndex: index, totalUsage };
    });
  });

  /** Reactive column definitions for the multi-entry aw-table. */
  public readonly multiEntryColumns = computed<TableCellInput[]>(() => {
    const visibleFields = this.mawoVisibleFields();
    const columns: TableCellInput[] = [];

    // Asset column — always visible
    columns.push({
      type: TableCellTypes.Custom,
      key: 'asset',
      label: 'Asset',
      align: 'left',
      combineFields: ['asset', '_rowIndex'],
      combineTemplate: (data: any[]) => ({
        component: TableInputCellComponent,
        componentData: {
          value: data[0] || '',
          placeholder: 'Asset',
          readOnly: false,
          inputMode: 'text',
          ariaLabel: 'Asset',
          showSearchButton: true,
          onChange: (value: string) => this.onMultiCellChange(data[1], 'asset', value),
          onSearch: () => this.onMultiAssetSearch(data[1]),
          onKeydownHandler: null,
        },
      }),
    });

    // Asset Description column — always visible, read-only
    columns.push({
      type: TableCellTypes.Title,
      key: 'assetDescription',
      label: 'Asset Description',
      align: 'left',
    });

    // Dynamic columns based on visible fields
    for (const field of visibleFields) {
      if (field === 'asset') continue; // Already handled above
      const col = this.buildColumnDef(field);
      if (col) columns.push(col);
    }

    return columns;
  });

  /** Key that changes when columns change, forcing aw-table to re-render. */
  public readonly tableRenderKey = computed(() => {
    return this.multiEntryColumns().map(c => c.key).join(',');
  });

  /** Derived visible fields based on the current display mode. */
  public readonly visibleFields = computed(() => {
    return DISPLAY_MODE_FIELDS[this.displayMode()] ?? DISPLAY_MODE_FIELDS['all'];
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

  /** Mock meter data for hint text display — empty until asset is selected. */
  public readonly meter1Units = signal<string>('');
  public readonly meter1Reading = signal<number>(0);
  public readonly meter2Units = signal<string>('');
  public readonly meter2Reading = signal<number>(0);
  public readonly meter1Hint = computed(() => this.meter1Units() ? `Current: ${this.meter1Reading().toLocaleString()} ${this.meter1Units()}` : '');
  public readonly meter2Hint = computed(() => this.meter2Units() ? `Current: ${this.meter2Reading().toLocaleString()} ${this.meter2Units()}` : '');

  /** Whether the selected asset has a meter 2 — hides meter 2 fields when false. */
  public readonly hasMeter2 = computed(() => !!this.meter2Units());

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

  /** Returns action menu items for a multi-entry row. */
  public getMultiEntryRowActions = (rowData: any): TableActionMenu[] => {
    const isFirstRow = rowData._rowIndex === 0;
    const actions: TableActionMenu[] = [];

    if (isFirstRow) {
      actions.push({ title: 'Clear', action: () => this.onMultiAction(rowData._rowIndex, 'clear') });
    } else {
      actions.push({ title: 'Delete', action: () => this.onMultiAction(rowData._rowIndex, 'delete') });
    }
    actions.push({ title: 'Get Components', action: () => this.onMultiAction(rowData._rowIndex, 'getComponents') });

    return actions;
  };

  /** Switch between single and multi entry modes. */
  public toggleEntryMode(mode: 'single' | 'multi'): void {
    this.entryMode.set(mode);
  }

  /** Handle display mode selector change — extract value from select option object. */
  public onDisplayModeChange(event: any): void {
    const value = typeof event === 'object' && event !== null ? event.value : event;
    const valid: UsageDisplayMode[] = ['meter', 'business', 'both', 'all'];
    this.displayMode.set(valid.includes(value) ? value : 'all');
    this._cdr.detectChanges();
  }

  /** Handle misc field toggle change and trigger change detection for aw-table. */
  public onMiscToggle(field: number, value: boolean): void {
    if (field === 1) this.showMisc1.set(value);
    else if (field === 2) this.showMisc2.set(value);
    else if (field === 3) this.showMisc3.set(value);
    else if (field === 4) this.showMisc4.set(value);
    this._cdr.detectChanges();
  }

  /** Handle time format selector change — extract value from select option object. */
  public onTimeFormatChange(event: any): void {
    const value = typeof event === 'object' && event !== null ? event.value : event;
    this.timeFormat = value === '24h' ? '24h' : '12h';
  }

  /** Handle work order type selector change — extract value from select option object. */
  public onWorkOrderTypeChange(event: any): void {
    const value = typeof event === 'object' && event !== null ? event.value : event;
    this.workOrderType.set(value === 'mawo' ? 'mawo' : 'standard');
  }

  /** Handle children work orders search input. */
  public onChildWOSearch(event: any): void {
    const text = typeof event === 'string' ? event : (event?.searchText ?? event?.value ?? '');
    this.childWOSearchText.set(text);
  }

  /** Handle children work orders status filter change — extract value from select option object. */
  public onChildWOStatusFilterChange(event: any): void {
    const value = typeof event === 'object' && event !== null ? event.value : event;
    const resolved = value ?? 'Open';
    this.childWOStatusFilter.set(resolved);
  }

  /** Handle segmented button entry mode change. */
  public onEntryModeChange(event: { event: MouseEvent | KeyboardEvent; index: number }): void {
    const mode = event.index === 0 ? 'single' : 'multi';
    this.entryMode.set(mode);
    // MAWO not supported in multi-entry — reset to standard
    if (mode === 'multi') {
      this.workOrderType.set('standard');
    }
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

  /** Restrict input to numbers and one decimal point, max 2 decimal places. */
  public onMeterKeydown(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
    if (allowed.includes(event.key)) return;
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const selStart = input.selectionStart ?? value.length;
    const selEnd = input.selectionEnd ?? value.length;
    const newValue = value.substring(0, selStart) + event.key + value.substring(selEnd);
    if (!/^\d*\.?\d{0,2}$/.test(newValue)) {
      event.preventDefault();
    }
  }

  /** Restrict date input to digits and forward slash. */
  public onDateKeydown(event: KeyboardEvent): void {
    const navigationKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
    if (navigationKeys.includes(event.key)) return;
    if (/^[0-9/]$/.test(event.key)) return;
    event.preventDefault();
  }

  /** Restrict time input based on active time format. */
  public onTimeKeydown(event: KeyboardEvent): void {
    const navigationKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
    if (navigationKeys.includes(event.key)) return;
    if (this.timeFormat === '24h') {
      if (/^[0-9:]$/.test(event.key)) return;
    } else {
      if (/^[0-9:AaMmPp ]$/.test(event.key)) return;
    }
    event.preventDefault();
  }

  /** Validate date string on blur. Returns error message or null. */
  public validateDate(value: string): string | null {
    if (!value || value.trim() === '') return null;
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return 'Invalid date format. Use MM/DD/YYYY';
    const [monthStr, dayStr, yearStr] = value.split('/');
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const year = parseInt(yearStr, 10);
    if (month < 1 || month > 12) return 'Invalid date';
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) return 'Invalid date';
    return null;
  }

  /** Validate time string on blur based on format. Returns error message or null. */
  public validateTime(value: string, format: '12h' | '24h'): string | null {
    if (!value || value.trim() === '') return null;
    if (format === '12h') {
      if (!/^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM|am|pm)$/.test(value)) {
        return 'Invalid time. Use HH:MM AM/PM (1-12)';
      }
    } else {
      if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(value)) {
        return 'Invalid time. Use HH:MM (0-23)';
      }
    }
    return null;
  }

  /** Blur handler for start date input. */
  public onStartDateBlur(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.startDateError.set(this.validateDate(value));
  }

  /** Blur handler for start time input. */
  public onStartTimeBlur(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.startTimeError.set(this.validateTime(value, this.timeFormat));
  }

  /** Blur handler for end date input. */
  public onEndDateBlur(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.endDateError.set(this.validateDate(value));
  }

  /** Blur handler for end time input. */
  public onEndTimeBlur(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.endTimeError.set(this.validateTime(value, this.timeFormat));
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
      // Filter out blank rows before submitting
      const entries = this.multiEntryRows()
        .filter(row => this.rowHasData(row))
        .map(row => this.extractEntry(row));
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

  /** Placeholder for lookup dialogs not yet implemented. */
  public onLookupPlaceholder(fieldName: string): void {
    alert(`This button would open an aw-dialog with a table inside for searching ${fieldName} records.`);
  }

  /** Mock meter readings per asset — in production this comes from the API. */
  private readonly _assetMeterData: Record<string, { m1Units: string; m1Reading: number; m2Units: string; m2Reading: number }> = {
    'R-12345': { m1Units: 'miles', m1Reading: 45230, m2Units: 'hours', m2Reading: 1250 },
    'QA-FLEET-002': { m1Units: 'miles', m1Reading: 78500, m2Units: 'hours', m2Reading: 3200 },
    'K123-456': { m1Units: 'hours', m1Reading: 12400, m2Units: '', m2Reading: 0 },
    'QA-C-001': { m1Units: 'miles', m1Reading: 32100, m2Units: 'hours', m2Reading: 890 },
    'FL-VAN-03': { m1Units: 'miles', m1Reading: 56700, m2Units: 'hours', m2Reading: 2100 },
    'TX-TRUCK-07': { m1Units: 'miles', m1Reading: 91200, m2Units: 'hours', m2Reading: 4500 },
    'EQ-4821': { m1Units: 'hours', m1Reading: 8750, m2Units: '', m2Reading: 0 },
    'EQ-5102': { m1Units: 'hours', m1Reading: 3200, m2Units: '', m2Reading: 0 },
    'ROAD07': { m1Units: 'miles', m1Reading: 150, m2Units: '', m2Reading: 0 },
    'UX-BRIDGE-LINEAR': { m1Units: 'miles', m1Reading: 25, m2Units: '', m2Reading: 0 },
    'GEN-9900': { m1Units: 'hours', m1Reading: 18500, m2Units: 'gallons', m2Reading: 4200 },
  };

  /** Update meter hint signals based on selected asset. */
  private updateMeterHints(assetId: string | null): void {
    const data = assetId ? this._assetMeterData[assetId] : null;
    this.meter1Units.set(data?.m1Units ?? '');
    this.meter1Reading.set(data?.m1Reading ?? 0);
    this.meter2Units.set(data?.m2Units ?? '');
    this.meter2Reading.set(data?.m2Reading ?? 0);
  }

  /** Get meter hint tooltip for a specific multi-entry row based on its asset. */
  private getRowMeterHint(rowIndex: number, meterNum: 1 | 2): string {
    const row = this.multiEntryRows()[rowIndex];
    const assetId = row?.get('asset')?.value;
    if (!assetId) return '';
    const data = this._assetMeterData[assetId];
    if (!data) return '';
    const units = meterNum === 1 ? data.m1Units : data.m2Units;
    const reading = meterNum === 1 ? data.m1Reading : data.m2Reading;
    return units ? `Current: ${reading.toLocaleString()} ${units}` : '';
  }

  /** Handle asset search dialog close. */
  public onAssetSearchClose(result: any): void {
    this.showAssetSearchDialog.set(false);
    if (result?.action === 'go' && result.selectedAsset) {
      const isMulti = this._activeMultiRowIndex !== null;
      const rowIdx = this._activeMultiRowIndex;
      const targetForm = isMulti
        ? this.multiEntryRows()[rowIdx!]
        : this.singleEntryForm;
      targetForm?.get('asset')?.setValue(result.selectedAsset.EquipmentId);
      targetForm?.get('assetDescription')?.setValue(result.selectedAsset.EquipmentDescription);
      // Update meter hints for single-entry mode
      if (!isMulti) {
        this.updateMeterHints(result.selectedAsset.EquipmentId);
      }
      this._activeMultiRowIndex = null;
      if (isMulti) {
        // Auto-add row if asset was selected on the last row
        if (rowIdx === this.multiEntryRows().length - 1) {
          this.addRow();
        }
        this.multiEntryRows.set([...this.multiEntryRows()]);
      }
    }
  }

  /** Open task search dialog. */
  public onTaskSearch(): void {
    this.showTaskSearchDialog.set(true);
  }

  /** Handle task search dialog close. */
  public onTaskSearchClose(result: any): void {
    this.showTaskSearchDialog.set(false);
    if (result?.taskId) {
      const isMulti = this._activeMultiRowIndex !== null;
      const targetForm = isMulti
        ? this.multiEntryRows()[this._activeMultiRowIndex!]
        : this.singleEntryForm;
      targetForm?.get('task')?.setValue(`(${result.taskId}) ${result.taskDescription}`);
      this._activeMultiRowIndex = null;
      if (isMulti) {
        this.multiEntryRows.set([...this.multiEntryRows()]);
      }
    }
  }

  /** Handle asset search for a multi-entry row. */
  public onMultiAssetSearch(rowIndex: number): void {
    this._activeMultiRowIndex = rowIndex;
    this.showAssetSearchDialog.set(true);
  }

  /** Handle task search for a multi-entry row. */
  public onMultiTaskSearch(rowIndex: number): void {
    this._activeMultiRowIndex = rowIndex;
    this.showTaskSearchDialog.set(true);
  }

  /** Handle lookup placeholder for a multi-entry row. */
  public onMultiLookup(rowIndex: number, fieldName: string): void {
    this.onLookupPlaceholder(fieldName);
  }

  /** Handle cell value change for a multi-entry row. */
  public onMultiCellChange(rowIndex: number, fieldName: string, value: any): void {
    const row = this.multiEntryRows()[rowIndex];
    if (row) {
      row.get(fieldName)?.setValue(value, { emitEvent: false });
      // Clear asset description when asset field is cleared
      if (fieldName === 'asset' && (!value || value === '')) {
        row.get('assetDescription')?.setValue(null, { emitEvent: false });
      }
      // Auto-add a new row when user starts typing in the last row
      if (value && rowIndex === this.multiEntryRows().length - 1) {
        this.addRow();
      }
      // Only trigger table re-render for fields that affect computed display values
      // Do NOT trigger for regular text typing — it causes focus loss
      if (fieldName === 'businessUsage' || fieldName === 'individualUsage') {
        this.multiEntryRows.set([...this.multiEntryRows()]);
      }
    }
  }

  /** Handle action menu selection for a multi-entry row. */
  public onMultiAction(rowIndex: number, action: string): void {
    if (action === 'clear') {
      const row = this.multiEntryRows()[rowIndex];
      if (row) {
        const defaults = this.createRowFormGroup();
        Object.keys(defaults.controls).forEach(key => {
          row.get(key)?.setValue(defaults.get(key)?.value);
        });
        this.multiEntryRows.set([...this.multiEntryRows()]);
      }
    } else if (action === 'delete') {
      // Check if row has data
      const row = this.multiEntryRows()[rowIndex];
      if (row && this.rowHasData(row)) {
        this._pendingDeleteRowIndex = rowIndex;
        this.showDeleteRowDialog.set(true);
      } else {
        this.removeRow(rowIndex);
      }
    }
    // 'getComponents' — placeholder for future implementation
  }

  /** Signal to show/hide the delete row confirmation dialog. */
  public readonly showDeleteRowDialog = signal(false);

  /** Row index pending deletion confirmation. */
  private _pendingDeleteRowIndex: number | null = null;

  /** Check if a row FormGroup has any non-default data. */
  private rowHasData(row: FormGroup): boolean {
    const raw = row.getRawValue();
    return Object.entries(raw).some(([key, value]) => {
      if (key === 'reversal') return value === true;
      if (value instanceof Date) return true;
      if (key === 'transactionDate') return false; // Default date is always set
      return value !== null && value !== '' && value !== 0;
    });
  }

  /** Handle delete row dialog close. */
  public onDeleteRowDialogAction(confirmed: boolean): void {
    this.showDeleteRowDialog.set(false);
    if (confirmed && this._pendingDeleteRowIndex !== null) {
      this.removeRow(this._pendingDeleteRowIndex);
    }
    this._pendingDeleteRowIndex = null;
  }

  /** Map field name to TableCellInput definition for multi-entry columns. */
  private buildColumnDef(field: string): TableCellInput | null {
    const rowIndexField = '_rowIndex';

    switch (field) {
      case 'transactionDate':
        return {
          type: TableCellTypes.Custom,
          key: 'transactionDate',
          label: 'Transaction Date',
          align: 'left',
          combineFields: ['transactionDate', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableDateCellComponent,
            componentData: {
              formControl: this.multiEntryRows()[data[1]]?.get('transactionDate'),
            },
          }),
        };

      case 'hoursUsed':
        return {
          type: TableCellTypes.Custom,
          key: 'hoursUsed',
          label: 'Hours Used',
          align: 'left',
          combineFields: ['hoursUsed', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: '0.00',
              readOnly: false,
              inputMode: 'decimal',
              ariaLabel: 'Hours Used',
              showSearchButton: false,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'hoursUsed', value),
              onSearch: null,
              onKeydownHandler: (event: KeyboardEvent) => this.onMeterKeydown(event),
            },
          }),
        };

      case 'startDateTime':
        return {
          type: TableCellTypes.Custom,
          key: 'startDateTime',
          label: 'Start Date/Time',
          align: 'left',
          combineFields: ['startDateTime', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableDateTimeCellComponent,
            componentData: {
              formControl: this.multiEntryRows()[data[1]]?.get('startDateTime'),
              timeFormat: this.timeFormat,
              ariaLabel: 'Start',
            },
          }),
        };

      case 'endDateTime':
        return {
          type: TableCellTypes.Custom,
          key: 'endDateTime',
          label: 'End Date/Time',
          align: 'left',
          combineFields: ['endDateTime', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableDateTimeCellComponent,
            componentData: {
              formControl: this.multiEntryRows()[data[1]]?.get('endDateTime'),
              timeFormat: this.timeFormat,
              ariaLabel: 'End',
            },
          }),
        };

      case 'meter1Begin':
        return {
          type: TableCellTypes.Custom,
          key: 'meter1Begin',
          label: 'Meter 1 Begin',
          align: 'left',
          combineFields: ['meter1Begin', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: '0.00',
              readOnly: false,
              inputMode: 'decimal',
              ariaLabel: 'Meter 1 Begin',
              tooltip: this.getRowMeterHint(data[1], 1),
              showSearchButton: false,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'meter1Begin', value),
              onSearch: null,
              onKeydownHandler: (event: KeyboardEvent) => this.onMeterKeydown(event),
            },
          }),
        };

      case 'meter1End':
        return {
          type: TableCellTypes.Custom,
          key: 'meter1End',
          label: 'Meter 1 End',
          align: 'left',
          combineFields: ['meter1End', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: '0.00',
              readOnly: false,
              inputMode: 'decimal',
              ariaLabel: 'Meter 1 End',
              tooltip: this.getRowMeterHint(data[1], 1),
              showSearchButton: false,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'meter1End', value),
              onSearch: null,
              onKeydownHandler: (event: KeyboardEvent) => this.onMeterKeydown(event),
            },
          }),
        };

      case 'meter1Validation':
        return {
          type: TableCellTypes.Custom,
          key: 'meter1Validation',
          label: 'Meter 1 Validation',
          align: 'left',
          combineFields: ['meter1Validation', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableSelectCellComponent,
            componentData: {
              formControl: this.multiEntryRows()[data[1]]?.get('meter1Validation'),
              options: this.meterValidationOptions(),
              placeholder: 'Choose Validation',
              ariaLabel: 'Meter 1 Validation',
            },
          }),
        };

      case 'meter2Begin':
        return {
          type: TableCellTypes.Custom,
          key: 'meter2Begin',
          label: 'Meter 2 Begin',
          align: 'left',
          combineFields: ['meter2Begin', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: '0.00',
              readOnly: false,
              inputMode: 'decimal',
              ariaLabel: 'Meter 2 Begin',
              tooltip: this.getRowMeterHint(data[1], 2),
              showSearchButton: false,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'meter2Begin', value),
              onSearch: null,
              onKeydownHandler: (event: KeyboardEvent) => this.onMeterKeydown(event),
            },
          }),
        };

      case 'meter2End':
        return {
          type: TableCellTypes.Custom,
          key: 'meter2End',
          label: 'Meter 2 End',
          align: 'left',
          combineFields: ['meter2End', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: '0.00',
              readOnly: false,
              inputMode: 'decimal',
              ariaLabel: 'Meter 2 End',
              tooltip: this.getRowMeterHint(data[1], 2),
              showSearchButton: false,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'meter2End', value),
              onSearch: null,
              onKeydownHandler: (event: KeyboardEvent) => this.onMeterKeydown(event),
            },
          }),
        };

      case 'meter2Validation':
        return {
          type: TableCellTypes.Custom,
          key: 'meter2Validation',
          label: 'Meter 2 Validation',
          align: 'left',
          combineFields: ['meter2Validation', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableSelectCellComponent,
            componentData: {
              formControl: this.multiEntryRows()[data[1]]?.get('meter2Validation'),
              options: this.meterValidationOptions(),
              placeholder: 'Choose Validation',
              ariaLabel: 'Meter 2 Validation',
            },
          }),
        };

      case 'businessUsage':
        return {
          type: TableCellTypes.Custom,
          key: 'businessUsage',
          label: 'Business Usage',
          align: 'left',
          combineFields: ['businessUsage', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: '0.00',
              readOnly: false,
              inputMode: 'decimal',
              ariaLabel: 'Business Usage',
              showSearchButton: false,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'businessUsage', value),
              onSearch: null,
              onKeydownHandler: (event: KeyboardEvent) => this.onMeterKeydown(event),
            },
          }),
        };

      case 'individualUsage':
        return {
          type: TableCellTypes.Custom,
          key: 'individualUsage',
          label: 'Individual Usage',
          align: 'left',
          combineFields: ['individualUsage', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: '0.00',
              readOnly: false,
              inputMode: 'decimal',
              ariaLabel: 'Individual Usage',
              showSearchButton: false,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'individualUsage', value),
              onSearch: null,
              onKeydownHandler: (event: KeyboardEvent) => this.onMeterKeydown(event),
            },
          }),
        };

      case 'totalUsage':
        return {
          type: TableCellTypes.Custom,
          key: 'totalUsage',
          label: 'Total Usage',
          align: 'left',
          combineFields: ['businessUsage', 'individualUsage', '_rowIndex'],
          combineTemplate: (data: any[]) => {
            const business = parseFloat(data[0]) || 0;
            const individual = parseFloat(data[1]) || 0;
            const total = (business + individual).toFixed(2);
            return {
              component: TableTextSubtextComponent,
              componentData: { text: total, subText: '' },
            };
          },
        };

      case 'account':
        return {
          type: TableCellTypes.Custom,
          key: 'account',
          label: 'Account',
          align: 'left',
          combineFields: ['account', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: 'Account',
              readOnly: false,
              inputMode: 'text',
              ariaLabel: 'Account',
              showSearchButton: true,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'account', value),
              onSearch: () => this.onMultiLookup(data[1], 'account'),
              onKeydownHandler: null,
            },
          }),
        };

      case 'operator':
        return {
          type: TableCellTypes.Custom,
          key: 'operator',
          label: 'Operator',
          align: 'left',
          combineFields: ['operator', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: 'Operator',
              readOnly: false,
              inputMode: 'text',
              ariaLabel: 'Operator',
              showSearchButton: true,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'operator', value),
              onSearch: () => this.onMultiLookup(data[1], 'operator'),
              onKeydownHandler: null,
            },
          }),
        };

      case 'department':
        return {
          type: TableCellTypes.Custom,
          key: 'department',
          label: 'Department',
          align: 'left',
          combineFields: ['department', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: 'Department',
              readOnly: false,
              inputMode: 'text',
              ariaLabel: 'Department',
              showSearchButton: true,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'department', value),
              onSearch: () => this.onMultiLookup(data[1], 'department'),
              onKeydownHandler: null,
            },
          }),
        };

      case 'task':
        return {
          type: TableCellTypes.Custom,
          key: 'task',
          label: 'Task',
          align: 'left',
          combineFields: ['task', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: 'Task',
              readOnly: false,
              inputMode: 'text',
              ariaLabel: 'Task',
              showSearchButton: true,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'task', value),
              onSearch: () => this.onMultiTaskSearch(data[1]),
              onKeydownHandler: null,
            },
          }),
        };

      case 'financialProjectCode':
        return {
          type: TableCellTypes.Custom,
          key: 'financialProjectCode',
          label: 'Financial Project Code',
          align: 'left',
          combineFields: ['financialProjectCode', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: 'Financial Project Code',
              readOnly: false,
              inputMode: 'text',
              ariaLabel: 'Financial Project Code',
              showSearchButton: true,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'financialProjectCode', value),
              onSearch: () => this.onMultiLookup(data[1], 'financialProjectCode'),
              onKeydownHandler: null,
            },
          }),
        };

      case 'misc1':
        return {
          type: TableCellTypes.Custom,
          key: 'misc1',
          label: 'Misc 1',
          align: 'left',
          combineFields: ['misc1', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: 'Misc 1',
              readOnly: false,
              inputMode: 'text',
              ariaLabel: 'Misc 1',
              showSearchButton: false,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'misc1', value),
              onSearch: null,
              onKeydownHandler: null,
            },
          }),
        };

      case 'misc2':
        return {
          type: TableCellTypes.Custom,
          key: 'misc2',
          label: 'Misc 2',
          align: 'left',
          combineFields: ['misc2', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: 'Misc 2',
              readOnly: false,
              inputMode: 'text',
              ariaLabel: 'Misc 2',
              showSearchButton: false,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'misc2', value),
              onSearch: null,
              onKeydownHandler: null,
            },
          }),
        };

      case 'misc3':
        return {
          type: TableCellTypes.Custom,
          key: 'misc3',
          label: 'Misc 3',
          align: 'left',
          combineFields: ['misc3', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: 'Misc 3',
              readOnly: false,
              inputMode: 'text',
              ariaLabel: 'Misc 3',
              showSearchButton: false,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'misc3', value),
              onSearch: null,
              onKeydownHandler: null,
            },
          }),
        };

      case 'misc4':
        return {
          type: TableCellTypes.Custom,
          key: 'misc4',
          label: 'Misc 4',
          align: 'left',
          combineFields: ['misc4', rowIndexField],
          combineTemplate: (data: any[]) => ({
            component: TableInputCellComponent,
            componentData: {
              value: data[0] || '',
              placeholder: 'Misc 4',
              readOnly: false,
              inputMode: 'text',
              ariaLabel: 'Misc 4',
              showSearchButton: false,
              onChange: (value: string) => this.onMultiCellChange(data[1], 'misc4', value),
              onSearch: null,
              onKeydownHandler: null,
            },
          }),
        };

      default:
        return null;
    }
  }

  /** Create a new FormGroup for a usage entry row with today's date as default. */
  public createRowFormGroup(): FormGroup {
    return new FormGroup({
      asset: new FormControl<string | null>(null),
      assetDescription: new FormControl<string | null>(null),
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
      reversal: new FormControl<boolean>(false),
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
      reversal: v.reversal ?? false,
    };
  }

  /** Extract the value property from a select field (may be object or string). */
  private extractSelectValue(val: any): string | null {
    if (val == null) return null;
    return typeof val === 'object' && val !== null ? val.value : val;
  }

  /** Attach keydown and blur listeners to the transaction date picker's internal input. */
  private attachTransactionDateListeners(): void {
    if (!this._transactionDatePicker) return;
    const input = (this._transactionDatePicker as any).triggerInput?.nativeElement;
    if (!input) return;
    input.addEventListener('keydown', (e: KeyboardEvent) => this.onDateKeydown(e));
    input.addEventListener('blur', () => {
      const value = input.value.trim();
      if (!value) return;
      // Accept dates with or without leading zeros
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) return;
      // Also skip if FormControl has a valid Date (CCL set it via calendar)
      const ctrlValue = this.singleEntryForm.get('transactionDate')?.value;
      if (ctrlValue instanceof Date && !isNaN(ctrlValue.getTime())) return;
      // Garbage input — clear it
      input.value = '';
      this.singleEntryForm.get('transactionDate')?.setValue(null);
      (this._transactionDatePicker as any).showClearIcon?.set(false);
      this._cdr.detectChanges();
      setTimeout(() => { input.placeholder = 'mm/dd/yyyy'; });
    });
  }

  /** Attach keydown and blur listeners to the internal date and time inputs of a date-time picker. */
  private attachInputListeners(picker: AwDateTimePickerComponent, prefix: 'start' | 'end'): void {
    if (!picker) return;
    const dateInput = (picker as any).dateInput?.nativeElement;
    const timeInput = (picker as any).timeInput?.nativeElement;
    if (dateInput) {
      dateInput.addEventListener('keydown', (e: KeyboardEvent) => this.onDateKeydown(e));
      dateInput.addEventListener('blur', (e: Event) => {
        const input = (e.target as HTMLInputElement);
        const value = input.value.trim();
        if (value) {
          const error = this.validateDate(value);
          if (error) {
            // Clear garbage input — reset to CCL's committed display value
            input.value = (picker as any).getDateDisplayValue?.() ?? '';
          }
          if (prefix === 'start') this.startDateError.set(error);
          else this.endDateError.set(error);
        } else {
          if (prefix === 'start') this.startDateError.set(null);
          else this.endDateError.set(null);
        }
        this._cdr.markForCheck();
      });
    }
    if (timeInput) {
      timeInput.addEventListener('keydown', (e: KeyboardEvent) => this.onTimeKeydown(e));
      timeInput.addEventListener('blur', (e: Event) => {
        const input = (e.target as HTMLInputElement);
        const value = input.value.trim();
        if (value) {
          const error = this.validateTime(value, this.timeFormat);
          if (error) {
            // Clear garbage input — reset to CCL's committed display value
            input.value = (picker as any).getTimeDisplayValue?.() ?? '';
          }
          if (prefix === 'start') this.startTimeError.set(error);
          else this.endTimeError.set(error);
        } else {
          if (prefix === 'start') this.startTimeError.set(null);
          else this.endTimeError.set(null);
        }
        this._cdr.markForCheck();
      });
    }
  }
}
