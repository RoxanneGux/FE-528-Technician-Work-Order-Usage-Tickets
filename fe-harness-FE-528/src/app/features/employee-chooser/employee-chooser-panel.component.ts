import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  ActionBarLeft,
  ActionBarRight,
  AwActionBarComponent,
  AwButtonDirective,
  AwButtonIconOnlyDirective,
  AwChipComponent,
  AwDividerComponent,
  AwFormFieldComponent,
  AwFormFieldLabelComponent,
  AwIconComponent,
  AwInputDirective,
  AwSelectMenuComponent,
  AwSideDrawerComponent,
  AwTableComponent,
  AwFilterDrawerComponent,
  FilterDrawerInformation,
  FilterDrawerData,
  SingleSelectOption,
  TableCellInput,
  TableCellTypes,
} from '@assetworks-llc/aw-component-lib';

import { MockDataService, MockCrewEmployee } from '../../services/mock-data.service';
import { PanelService } from '../../services/panel.service';
import { EmployeeDetailsPanelComponent, EmployeeDetailResult } from '../employee-details/employee-details-panel.component';

export interface CombinedSelectionRow {
  EmployeeId: string;
  Name: string;
}

export interface EmployeeSelectionResult {
  AssignedCount: number;
  FailedCount: number;
  TotalSelected: number;
  SelectedEmployees: CombinedSelectionRow[];
}

// Side drawer filter chip labels
const FILTER_CHIPS = {
  DIRECT_EMPLOYEES: 'Direct Employees: Yes',
  LOCATION: 'Assigned Location',
  SHIFT: 'Shift',
  SKILL: 'Skill',
} as const;

/** Panel for searching and selecting employees. Matches Figma "Employee advance search" design. */
@Component({
  selector: 'app-employee-chooser-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AwActionBarComponent,
    AwButtonDirective,
    AwButtonIconOnlyDirective,
    AwChipComponent,
    AwDividerComponent,
    AwFormFieldComponent,
    AwFormFieldLabelComponent,
    AwIconComponent,
    AwInputDirective,
    AwSelectMenuComponent,
    AwSideDrawerComponent,
    AwTableComponent,
    AwFilterDrawerComponent,
  ],
  templateUrl: './employee-chooser-panel.component.html',
  styleUrl: './employee-chooser-panel.component.scss',
})
export class EmployeeChooserPanelComponent implements OnInit {
  public readonly close = output<EmployeeSelectionResult | null>();

  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _mockData = inject(MockDataService);
  private readonly _panelService = inject(PanelService);

  // Side drawer ref
  public readonly sideDrawerFilter = viewChild<AwSideDrawerComponent>('sideDrawerFilter');
  public readonly filterDrawerRef = viewChild<AwFilterDrawerComponent>('filterDrawer');

  public readonly drawerInfo: FilterDrawerInformation = {
    title: 'Additional Employee Filters',
    buttons: {
      clearButton: { visible: false },
      applyButton: { visible: false },
    },
  };

  public readonly filterData = signal<FilterDrawerData>({
    allowCollapse: false,
    filterList: {
      controls: [
        {
          type: 'toggle',
          formControlName: 'directEmployees',
          label: 'Direct Employees',
          value: true,
        },
        {
          type: 'select',
          formControlName: 'assignedLocation',
          label: 'Assigned Location',
          value: '',
          selectOptions: { MultiSelectOptions: [] },
        },
        {
          type: 'select',
          formControlName: 'shift',
          label: 'Shift',
          value: '',
          selectOptions: { MultiSelectOptions: [] },
        },
        {
          type: 'select',
          formControlName: 'skill',
          label: 'Skill',
          value: '',
          selectOptions: { MultiSelectOptions: [] },
        },
      ],
    },
  });

  // Inline filter controls
  public readonly searchControl = new FormControl('');
  public readonly crewFilterControl = new FormControl<string | null>(null);
  public readonly employeeFilterControl = new FormControl<string | null>(null);

  // Filter options (set once on init)
  public readonly crewFilterOptions = signal<SingleSelectOption[]>([]);
  public readonly employeeFilterOptions = signal<SingleSelectOption[]>([]);

  // Filter chips from side drawer
  public readonly activeFilterChips = signal<string[]>([]);

  // Table data
  public readonly tableData = signal<any[]>([]);

  // Last drawer filter state
  private _drawerFormData: Record<string, any> = { directEmployees: true };

  public readonly columns: TableCellInput[] = [
    { label: '', key: 'selected', type: TableCellTypes.Checkbox },
    { label: 'Employee', key: 'employeeDisplay', type: TableCellTypes.Title, sort: true },
    { label: 'Crew Name', key: 'crewDescription', type: TableCellTypes.Title, sort: true },
    {
      label: ' ',
      key: 'detailLink',
      type: TableCellTypes.Custom,
      combineFields: ['employeeId'],
      combineTemplate: (_values: any[]) => ({
        template: `<a class="link text-primary" style="cursor:pointer">Employee detail</a>`,
      }),
    },
  ];

  // Pending selection
  public readonly pendingSelection = signal<Set<string>>(new Set());

  // Combined confirmed selection
  public readonly combinedSelectedEmployees = signal<CombinedSelectionRow[]>([]);
  public readonly selectedCount = computed(() => this.combinedSelectedEmployees().length);

  // Footer action bar
  public readonly footerActionsLeft = signal<ActionBarLeft[]>([
    { textCallback: { title: 'Cancel', action: () => this.close.emit(null) } },
  ]);
  public readonly footerActionsRight = computed<ActionBarRight[]>(() => [
    { buttonCallback: { label: 'Select', buttonType: 'outlined', action: () => this.confirmSelection() } },
  ]);

  ngOnInit(): void {
    this.loadFilterOptions();
    this.updateFilterChips();
    this.buildTableData();

    // Subscribe to inline filter changes
    this.searchControl.valueChanges.subscribe(() => this.buildTableData());
    this.crewFilterControl.valueChanges.subscribe(() => this.buildTableData());
    this.employeeFilterControl.valueChanges.subscribe(() => this.buildTableData());
  }

  // Side drawer methods

  public openAdvancedFilter(): void {
    this.sideDrawerFilter()?.openSideDrawer();
  }

  public onFilterDrawerSubmit(event: { formData: Record<string, any>; valid: boolean }): void {
    this._drawerFormData = event.formData;
    this.updateFilterChips(event.formData);
    this.buildTableData();
  }

  public onDrawerClosed(): void {
    // Chips already updated via submittedDrawerData debounce
  }

  public removeFilterChip(chipToRemove: string): void {
    if (chipToRemove === FILTER_CHIPS.DIRECT_EMPLOYEES) {
      this.filterDrawerRef()?.setFormValue('directEmployees', false);
    }
    // For multi-select chips like "Assigned Location: Building A", we just remove the chip
    // The drawer form retains its state — removing individual multi-select values
    // would require deeper integration with the filter drawer's internal form
    this.activeFilterChips.update(chips => chips.filter(c => c !== chipToRemove));
    this.buildTableData();
  }

  // Table methods

  public onCheckboxChange(event: { rows: any[]; key: string }): void {
    const ids = new Set<string>();
    for (const row of event.rows) {
      if (row.employeeId) ids.add(row.employeeId);
    }
    this.pendingSelection.set(ids);
  }

  public addPendingToSelection(): void {
    const pendingIds = this.pendingSelection();
    if (pendingIds.size === 0) return;

    const allEmployees = this._mockData.crewEmployees();
    const existingIds = new Set(this.combinedSelectedEmployees().map(e => e.EmployeeId));

    const newSelections: CombinedSelectionRow[] = [];
    pendingIds.forEach(id => {
      if (existingIds.has(id)) return;
      const emp = allEmployees.find(e => e.employeeId === id);
      if (emp) newSelections.push({ EmployeeId: emp.employeeId, Name: emp.name });
    });

    this.combinedSelectedEmployees.update(current => [...current, ...newSelections]);
    this.pendingSelection.set(new Set());
    this.tableData.set([]);
    this._cdr.detectChanges();
    this.buildTableData();
    this._cdr.detectChanges();
  }

  public clearAllSelections(): void {
    this.combinedSelectedEmployees.set([]);
    this.pendingSelection.set(new Set());
    this.tableData.set([]);
    this._cdr.detectChanges();
    this.buildTableData();
    this._cdr.detectChanges();
  }

  public removeFromSelection(employeeId: string): void {
    this.combinedSelectedEmployees.update(current => current.filter(e => e.EmployeeId !== employeeId));
    this.buildTableData();
    this._cdr.markForCheck();
  }

  public confirmSelection(): void {
    const selected = this.combinedSelectedEmployees();
    if (selected.length === 0) return;
    this.close.emit({
      AssignedCount: selected.length,
      FailedCount: 0,
      TotalSelected: selected.length,
      SelectedEmployees: selected,
    });
  }

  /** Opens the Employee Details panel via event delegation on the table container. */
  public onEmployeeDetailClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.classList.contains('link') || !target.textContent?.includes('Employee detail')) return;

    const row = target.closest('tr');
    if (!row) return;

    const data = this.tableData();
    const rowIndex = Array.from(row.parentElement?.children ?? []).indexOf(row);
    if (rowIndex < 0 || rowIndex >= data.length) return;

    const employeeId = data[rowIndex]?.employeeId;
    if (!employeeId) return;

    this._panelService.open(
      EmployeeDetailsPanelComponent,
      { employeeId },
      (result?: EmployeeDetailResult | null) => {
        if (result) {
          const existingIds = new Set(this.combinedSelectedEmployees().map(e => e.EmployeeId));
          if (!existingIds.has(result.employeeId)) {
            this.combinedSelectedEmployees.update(current => [
              ...current,
              { EmployeeId: result.employeeId, Name: result.name },
            ]);
          }
        }
        this.buildTableData();
        this._cdr.detectChanges();
      },
      'panel-overlay-detail',
    );
  }

  // Private

  private updateFilterChips(formData?: Record<string, any>): void {
    const chips: string[] = [];
    if (formData) {
      if (formData['directEmployees']) chips.push(FILTER_CHIPS.DIRECT_EMPLOYEES);
      this.extractMultiSelectChips(formData['assignedLocation'], 'Assigned Location', chips);
      this.extractMultiSelectChips(formData['shift'], 'Shift', chips);
      this.extractMultiSelectChips(formData['skill'], 'Skill', chips);
    } else {
      // Initial state — Direct Employees is ON by default
      chips.push(FILTER_CHIPS.DIRECT_EMPLOYEES);
    }
    this.activeFilterChips.set(chips);
  }

  private extractMultiSelectChips(value: any, prefix: string, chips: string[]): void {
    if (!value || !Array.isArray(value) || value.length === 0) return;
    for (const item of value) {
      const label = typeof item === 'object' ? (item.label || item.value || '') : item;
      if (label) chips.push(`${prefix}: ${label}`);
    }
  }

  private loadFilterOptions(): void {
    const crews = this._mockData.crews();
    this.crewFilterOptions.set(crews.map(c => ({ label: c.description, value: c.crewId })));

    const employees = this._mockData.crewEmployees();
    this.employeeFilterOptions.set(employees.map(e => ({ label: e.name, value: e.employeeId })));

    // Populate side drawer filter options
    const filters = this._mockData.filterOptions();
    const locationOpts = filters.locations.map(l => ({ label: l.name, value: l.id }));
    const shiftOpts = filters.shifts.map(s => ({ label: s.description, value: s.id }));
    const skillOpts = filters.skills.map(s => ({ label: s.description, value: s.id }));

    this.filterData.set({
      allowCollapse: false,
      filterList: {
        controls: [
          { type: 'toggle', formControlName: 'directEmployees', label: 'Direct Employees', value: true },
          { type: 'select', formControlName: 'assignedLocation', label: 'Assigned Location', value: '', selectOptions: { MultiSelectOptions: locationOpts } },
          { type: 'select', formControlName: 'shift', label: 'Shift', value: '', selectOptions: { MultiSelectOptions: shiftOpts } },
          { type: 'select', formControlName: 'skill', label: 'Skill', value: '', selectOptions: { MultiSelectOptions: skillOpts } },
        ],
      },
    });
  }

  private buildTableData(): void {
    let employees = this._mockData.crewEmployees();

    const crewVal = this.crewFilterControl.value;
    if (crewVal) {
      const crewId = typeof crewVal === 'object' && crewVal !== null
        ? ((crewVal as any).value || (crewVal as any).label || '')
        : String(crewVal);
      if (crewId) employees = employees.filter(e => e.primaryCrewId === crewId);
    }

    const empVal = this.employeeFilterControl.value;
    if (empVal) {
      const empId = typeof empVal === 'object' && empVal !== null
        ? ((empVal as any).value || '')
        : String(empVal);
      if (empId) employees = employees.filter(e => e.employeeId === empId);
    }

    const searchVal = this.searchControl.value;
    if (searchVal) {
      const term = searchVal.toLowerCase();
      employees = employees.filter(e =>
        e.name.toLowerCase().includes(term) || e.employeeId.toLowerCase().includes(term)
      );
    }

    // Apply side drawer filters
    const fd = this._drawerFormData;
    if (fd) {
      const selectedLocations = this.extractMultiSelectValues(fd['assignedLocation']);
      if (selectedLocations.length > 0) {
        employees = employees.filter(e => e.locationId && selectedLocations.includes(e.locationId));
      }

      const selectedShifts = this.extractMultiSelectValues(fd['shift']);
      if (selectedShifts.length > 0) {
        employees = employees.filter(e => e.shiftId && selectedShifts.includes(e.shiftId));
      }

      const selectedSkills = this.extractMultiSelectValues(fd['skill']);
      if (selectedSkills.length > 0) {
        employees = employees.filter(e => e.skills && e.skills.some(s => selectedSkills.includes(s)));
      }
    }

    const confirmedIds = new Set(this.combinedSelectedEmployees().map(e => e.EmployeeId));
    const availableEmployees = employees.filter(e => !confirmedIds.has(e.employeeId));

    this.tableData.set(
      availableEmployees.map(e => ({
        ...e,
        employeeDisplay: `${e.name}\n${e.employeeId}`,
        selected: false,
      })),
    );
  }

  private extractMultiSelectValues(value: any): string[] {
    if (!value || !Array.isArray(value) || value.length === 0) return [];
    return value.map((item: any) => typeof item === 'object' ? (item.value || '') : item).filter(Boolean);
  }
}
