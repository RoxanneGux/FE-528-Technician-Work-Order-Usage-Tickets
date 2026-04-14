import { Component, computed, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AwDialogComponent,
  AwFormFieldComponent,
  AwFormFieldLabelComponent,
  AwIconComponent,
  AwInputDirective,
  AwSelectMenuComponent,
  AwTableComponent,
  DialogOptions,
  SingleSelectOption,
  TableCellInput,
  TableCellTypes,
} from '@assetworks-llc/aw-component-lib';
import { BaseDialogComponent } from '../../components/dialogs/base-dialog.component';

/**
 * Task search dialog matching the FA-Suite shared task-lookup pattern.
 *
 * Uses aw-dialog STANDARD variant with [dialog-middle] content projection
 * containing a search input, task-type filter, and aw-table with checkbox selection.
 * Client-side filtering over mock data. Emits selected task IDs as a Set on primary action.
 */
@Component({
  selector: 'app-usage-task-search-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AwDialogComponent,
    AwFormFieldComponent,
    AwFormFieldLabelComponent,
    AwInputDirective,
    AwIconComponent,
    AwSelectMenuComponent,
    AwTableComponent,
  ],
  template: `
    <aw-dialog class="dialog-xl"
      [ariaLabel]="'Task Lookup'"
      [visible]="true"
      [dialogOptions]="dialogOptions"
      (primaryAction)="chooseTask($event)"
      (secondaryAction)="closeDialog()">

      <div dialog-middle>
        <div class="table-action-bar d-flex gap-3 px-3 w-100 mb-2">
          <aw-form-field class="table-action-bar align-self-end w-100">
            <input AwInput
                   aria-label="task lookup search"
                   [readOnly]="false"
                   [placeholder]="'Search'"
                   type="text"
                   (ngModelChange)="onSearchChange($event)"
                   [ngModel]="searchQuery" />
            <aw-icon [iconName]="'search'" position="prefix"></aw-icon>
          </aw-form-field>

          <aw-select-menu class="table-action-bar"
            [singleSelectListItems]="taskTypeOptions"
            placeholder="Choose Task Type"
            [ariaLabel]="'Task Type'"
            [formControl]="taskTypeControl">
            <aw-form-field-label>Task Type</aw-form-field-label>
          </aw-select-menu>
        </div>

        <div class="table-responsive d-block">
          <aw-table
            [ariaLabel]="'task lookup table'"
            [columnsDefinition]="tableColumnDef"
            [tableData]="filteredData()"
            [tableHeight]="'400px'"
            (checkboxList)="onCheckboxChange($event)">
          </aw-table>
        </div>
      </div>
    </aw-dialog>
  `,
  styles: [`
    .table-action-bar {
      background: var(--component-table-header-cell-fill);
    }
  `],
})
export class UsageTaskSearchDialogComponent extends BaseDialogComponent {
  private _selectedTaskIds = new Set<string>();

  public searchQuery = '';
  public readonly taskTypeControl = new FormControl('');

  readonly allTasks = [
    { task: { id: 'TSK-001', description: 'Inspect pump bearings and seals' }, taskType: 'Repair Task', checkbox: false },
    { task: { id: 'TSK-002', description: 'Replace worn impeller' }, taskType: 'Repair Task', checkbox: false },
    { task: { id: 'TSK-003', description: 'Realign motor coupling' }, taskType: 'Repair Task', checkbox: false },
    { task: { id: 'TSK-004', description: 'Test pump performance' }, taskType: 'Repair Task', checkbox: false },
    { task: { id: 'PM-001', description: 'Quarterly lubrication service' }, taskType: 'PM Service', checkbox: false },
    { task: { id: 'PM-002', description: 'Annual bearing inspection' }, taskType: 'PM Service', checkbox: false },
    { task: { id: 'INS-001', description: 'Safety valve inspection' }, taskType: 'Inspection', checkbox: false },
    { task: { id: 'INS-002', description: 'Pressure vessel inspection' }, taskType: 'Inspection', checkbox: false },
  ];

  /** Track the task type filter value as a signal for reactivity in computed. */
  private readonly _taskTypeValue = signal<string>('');

  readonly filteredData = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    const taskTypeFilter = this._taskTypeValue();

    return this.allTasks.filter(row => {
      const matchesSearch = !query ||
        row.task.id.toLowerCase().includes(query) ||
        row.task.description.toLowerCase().includes(query) ||
        row.taskType.toLowerCase().includes(query);

      const matchesType = !taskTypeFilter || row.taskType === taskTypeFilter;

      return matchesSearch && matchesType;
    }).map(row => ({
      ...row,
      checkbox: this._selectedTaskIds.has(row.task.id),
    }));
  });

  readonly taskTypeOptions: SingleSelectOption[] = [
    { label: 'Repair', value: 'Repair Task' },
    { label: 'PM Service', value: 'PM Service' },
    { label: 'Inspection', value: 'Inspection' },
  ];

  readonly tableColumnDef: TableCellInput[] = [
    { type: TableCellTypes.Checkbox, key: 'checkbox' },
    {
      type: TableCellTypes.Custom, key: 'task', label: 'Task', align: 'left',
      combineFields: ['task.description', 'task.id'],
      combineTemplate: (values: string[]) => ({
        template: `<span class="aw-b-1">${values[0]}</span><br><span class="aw-c-1" style="color: var(--system-text-text-secondary)">${values[1]}</span>`,
      }),
    },
    { type: TableCellTypes.Title, key: 'taskType', label: 'Task Type', align: 'left' },
  ];

  readonly dialogOptions: DialogOptions = {
    variant: 'standard' as const,
    enableSearch: false,
    title: 'Choose Task',
    primaryButtonLabel: 'Add Task',
    secondaryButtonLabel: 'Cancel',
  };

  constructor() {
    super();
    this.taskTypeControl.valueChanges.subscribe((val: any) => {
      const value = typeof val === 'object' && val !== null ? val.value : (val || '');
      this._taskTypeValue.set(value);
    });
  }

  public onSearchChange(query: string): void {
    this.searchQuery = query;
    this._taskTypeValue.set(this._taskTypeValue());
  }

  public onCheckboxChange(event: any): void {
    this._selectedTaskIds.clear();
    if (event?.rows && Array.isArray(event.rows)) {
      event.rows.forEach((row: any) => this._selectedTaskIds.add(row.task.id));
    } else if (Array.isArray(event)) {
      event.forEach((row: any) => this._selectedTaskIds.add(row.task.id));
    }
  }

  public chooseTask(_event: any): void {
    if (this._selectedTaskIds.size > 0) {
      this.close.emit(this._selectedTaskIds);
    }
  }

  public closeDialog(): void {
    this.close.emit(null);
  }
}
