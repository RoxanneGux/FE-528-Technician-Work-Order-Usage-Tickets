import { ChangeDetectionStrategy, Component, ViewEncapsulation, signal, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AwBreadCrumbComponent,
  AwButtonIconOnlyDirective,
  AwDialogComponent,
  AwIconComponent,
  AwSearchComponent,
  AwSelectMenuComponent,
  AwFormFieldLabelComponent,
  BreadCrumb,
  DialogOptions,
  DialogVariants,
  SingleSelectOption,
  TableCellInput,
  TableCellTypes,
} from '@assetworks-llc/aw-component-lib';
import { BaseDialogComponent } from '../../components/dialogs/base-dialog.component';

/** Drill-down arrow button for task hierarchy navigation. */
@Component({
  selector: 'app-task-layer-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AwButtonIconOnlyDirective, AwIconComponent],
  template: `
    @if (hasChildren()) {
      <button AwButtonIconOnly [buttonType]="'primary'" (click)="handleClick()">
        <aw-icon [iconName]="'arrow_forward_ios'" [iconColor]="'aw-royal-blue'"></aw-icon>
      </button>
    }
  `,
})
export class TaskLayerButtonComponent {
  hasChildren = input<boolean>(false);
  contractId = input<string>('');
  onDrillDown = input<(id: string) => void>();
  handleClick(): void { this.onDrillDown()?.(this.contractId()); }
}

/**
 * Task lookup dialog with 3-level hierarchical drill-down.
 * Matches the fe-929-harness add-task-dialog pattern but uses single select.
 */
@Component({
  selector: 'app-usage-task-search-dialog',
  standalone: true,
  imports: [
    AwDialogComponent,
    AwBreadCrumbComponent,
    AwSearchComponent,
    AwIconComponent,
    AwSelectMenuComponent,
    AwFormFieldLabelComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <aw-dialog class="dialog-xl"
      [ariaLabel]="'Task Lookup Dialog'"
      [visible]="true"
      [dialogOptions]="dialogOptions"
      [columnsDefinition]="currentColumns()"
      [tableData]="tableData()"
      [tableHeight]="'400px'"
      [enableSingleSelection]="true"
      (primaryAction)="handleAdd($event)"
      (secondaryAction)="handleCancel()">

      <div table-top>
        <div class="task-lookup-filters">
          <aw-search
            class="task-lookup-search"
            [searchOptions]="[]"
            [ariaLabel]="'Search tasks'"
            [placeholder]="'Search'"
            [ngModel]="searchText"
            (ngModelChange)="onSearchChange($event)">
            <aw-icon [iconName]="'search'" position="prefix"></aw-icon>
          </aw-search>

          <aw-select-menu
            class="task-lookup-type-filter"
            [ariaLabel]="'Task Type filter'"
            [enableSearch]="false"
            [singleSelectListItems]="taskTypeOptions"
            [formControl]="taskTypeControl">
            <aw-form-field-label>Task Type</aw-form-field-label>
          </aw-select-menu>
        </div>

        @if (breadcrumbs().length > 0) {
          <aw-bread-crumb class="task-lookup-breadcrumbs"
            [ariaLabel]="'Task lookup breadcrumb'"
            [breadcrumbs]="breadcrumbs()">
          </aw-bread-crumb>
        }
      </div>

    </aw-dialog>
  `,
  styles: [`
    .task-lookup-filters {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      flex-wrap: wrap;
      padding: 8px 12px;
      width: 100%;
      box-sizing: border-box;
    }
    .task-lookup-search {
      flex: 1;
      min-width: 260px;
    }
    .task-lookup-type-filter {
      width: 200px;
      flex-shrink: 0;
    }
    .task-lookup-breadcrumbs {
      padding: 4px 12px 8px;
      display: block;
    }
  `],
})
export class UsageTaskSearchDialogComponent extends BaseDialogComponent {
  searchText = '';
  taskTypeControl = new FormControl('Repair Group');

  taskTypeOptions: SingleSelectOption[] = [
    { label: 'Repair Group', value: 'Repair Group' },
    { label: 'Repair Task', value: 'Repair Task' },
    { label: 'PM Service', value: 'PM Service' },
    { label: 'Inspection', value: 'Inspection' },
  ];

  // ── Navigation state ──
  private currentLevel: 'groups' | 'children' | 'subchildren' = 'groups';
  private currentGroupId: string | null = null;
  private currentGroupName: string | null = null;
  private currentSubGroupId: string | null = null;
  private currentSubGroupName: string | null = null;

  // ── Mock data ──

  private readonly repairGroups = [
    { taskId: 'RG-001', taskDesc: 'Engine Repair', taskType: 'Repair Group', hasChildren: true },
    { taskId: 'RG-002', taskDesc: 'Brake System', taskType: 'Repair Group', hasChildren: true },
    { taskId: 'RG-003', taskDesc: 'Electrical', taskType: 'Repair Group', hasChildren: false },
    { taskId: 'TSK-105', taskDesc: 'Coolant Flush', taskType: 'PM Service', hasChildren: false },
    { taskId: 'TSK-107', taskDesc: 'Battery Replacement', taskType: 'Inspection', hasChildren: false },
    { taskId: 'TSK-109', taskDesc: 'Alignment Service', taskType: 'PM Service', hasChildren: false },
  ];

  private readonly repairGroupChildren: Record<string, any[]> = {
    'RG-001': [
      { taskId: 'RG-001-A', taskDesc: 'Oil System', taskType: 'Repair Group', hasChildren: true },
      { taskId: 'TSK-101', taskDesc: 'Oil Change', taskType: 'Repair Task', hasChildren: false },
      { taskId: 'TSK-106', taskDesc: 'Transmission Service', taskType: 'Repair Task', hasChildren: false },
    ],
    'RG-002': [
      { taskId: 'RG-002-A', taskDesc: 'Front Brakes', taskType: 'Repair Group', hasChildren: true },
      { taskId: 'TSK-102', taskDesc: 'Brake Pad Replacement', taskType: 'Repair Task', hasChildren: false },
      { taskId: 'TSK-103', taskDesc: 'Tire Rotation', taskType: 'Repair Task', hasChildren: false },
    ],
  };

  private readonly subGroupChildren: Record<string, any[]> = {
    'RG-001-A': [
      { taskId: 'TSK-110', taskDesc: 'Oil Filter Replacement', taskType: 'Repair Task', hasChildren: false },
      { taskId: 'TSK-111', taskDesc: 'Oil Pan Gasket', taskType: 'Repair Task', hasChildren: false },
      { taskId: 'TSK-112', taskDesc: 'Oil Pump Service', taskType: 'Repair Task', hasChildren: false },
    ],
    'RG-002-A': [
      { taskId: 'TSK-113', taskDesc: 'Front Brake Rotor', taskType: 'Repair Task', hasChildren: false },
      { taskId: 'TSK-114', taskDesc: 'Front Caliper Service', taskType: 'Repair Task', hasChildren: false },
    ],
  };

  // ── Column definitions ──

  private readonly drillDownColumns: TableCellInput[] = [
    {
      align: 'left', type: TableCellTypes.Custom, key: 'taskDesc', label: 'Task', sort: true,
      combineFields: ['taskDesc', 'taskId'],
      combineTemplate: (v: any[]) => ({
        template: `<div><span class="title">${v[0]}</span><br/><span class="sub-title">${v[1]}</span></div>`,
      }),
    },
    { align: 'left', type: TableCellTypes.Title, key: 'taskType', label: 'Task Type', sort: true },
    {
      type: TableCellTypes.Custom, key: 'ActionMenu', align: 'right', label: ' ',
      combineFields: ['taskId', 'hasChildren'],
      combineTemplate: (v: any[]) => ({
        component: TaskLayerButtonComponent,
        componentData: { contractId: v[0], hasChildren: v[1], onDrillDown: (id: string) => this.drillDown(id) },
      }),
    },
  ];

  private readonly leafColumns: TableCellInput[] = [
    {
      align: 'left', type: TableCellTypes.Custom, key: 'taskDesc', label: 'Task', sort: true,
      combineFields: ['taskDesc', 'taskId'],
      combineTemplate: (v: any[]) => ({
        template: `<div><span class="title">${v[0]}</span><br/><span class="sub-title">${v[1]}</span></div>`,
      }),
    },
    { align: 'left', type: TableCellTypes.Title, key: 'taskType', label: 'Task Type', sort: true },
  ];

  // ── Signals ──
  currentColumns = signal<TableCellInput[]>(this.drillDownColumns);
  tableData = signal<any[]>([]);
  breadcrumbs = signal<BreadCrumb[]>([]);

  dialogOptions: DialogOptions = {
    variant: DialogVariants.TABLE,
    title: 'Task Lookup',
    enableBackdropClick: true,
    enableSearch: false,
    primaryButtonLabel: 'Add',
    secondaryButtonLabel: 'Cancel',
  };

  constructor() {
    super();
    this.taskTypeControl.valueChanges.subscribe(() => this.reloadCurrentLevel());
    this.loadGroups();
  }

  // ── Navigation ──

  drillDown(id: string): void {
    this.searchText = '';
    if (this.currentLevel === 'groups') {
      const group = this.repairGroups.find(g => g.taskId === id);
      if (group) this.loadChildren(id, group.taskDesc);
    } else if (this.currentLevel === 'children') {
      const children = this.repairGroupChildren[this.currentGroupId!] || [];
      const subGroup = children.find((c: any) => c.taskId === id);
      if (subGroup) this.loadSubChildren(id, subGroup.taskDesc);
    }
  }

  navigateToRoot(): void { this.searchText = ''; this.loadGroups(); }

  navigateToGroup(groupId: string): void {
    this.searchText = '';
    const group = this.repairGroups.find(g => g.taskId === groupId);
    if (group) this.loadChildren(groupId, group.taskDesc);
  }

  // ── Data loading ──

  private loadGroups(): void {
    this.currentLevel = 'groups';
    this.currentGroupId = null;
    this.currentGroupName = null;
    this.currentSubGroupId = null;
    this.currentSubGroupName = null;
    this.currentColumns.set(this.drillDownColumns);
    this.tableData.set(this.applyFilters([...this.repairGroups]));
    this.breadcrumbs.set([]);
  }

  private loadChildren(groupId: string, groupName: string): void {
    this.currentLevel = 'children';
    this.currentGroupId = groupId;
    this.currentGroupName = groupName;
    this.currentSubGroupId = null;
    this.currentSubGroupName = null;
    this.currentColumns.set(this.drillDownColumns);
    this.tableData.set(this.applyFilters([...(this.repairGroupChildren[groupId] || [])]));
    this.breadcrumbs.set([
      { label: 'All Repair Groups', action: () => this.navigateToRoot() },
      { label: groupName },
    ]);
  }

  private loadSubChildren(subGroupId: string, subGroupName: string): void {
    this.currentLevel = 'subchildren';
    this.currentSubGroupId = subGroupId;
    this.currentSubGroupName = subGroupName;
    this.currentColumns.set(this.leafColumns);
    this.tableData.set(this.applyFilters([...(this.subGroupChildren[subGroupId] || [])]));
    this.breadcrumbs.set([
      { label: 'All Repair Groups', action: () => this.navigateToRoot() },
      { label: this.currentGroupName!, action: () => this.navigateToGroup(this.currentGroupId!) },
      { label: subGroupName },
    ]);
  }

  private reloadCurrentLevel(): void {
    if (this.currentLevel === 'groups') this.loadGroups();
    else if (this.currentLevel === 'children' && this.currentGroupId && this.currentGroupName)
      this.loadChildren(this.currentGroupId, this.currentGroupName);
    else if (this.currentLevel === 'subchildren' && this.currentSubGroupId && this.currentSubGroupName)
      this.loadSubChildren(this.currentSubGroupId, this.currentSubGroupName);
  }

  // ── Filtering ──

  private applyFilters(data: any[]): any[] {
    const typeVal = this.taskTypeControl.value;
    const selectedType = typeof typeVal === 'string' ? typeVal : (typeVal as any)?.label ?? '';
    if (selectedType) {
      data = data.filter((t: any) => t.taskType.toLowerCase().includes(selectedType.toLowerCase()));
    }
    if (this.searchText) {
      const q = this.searchText.toLowerCase();
      data = data.filter((t: any) =>
        t.taskDesc.toLowerCase().includes(q) || t.taskId.toLowerCase().includes(q) || t.taskType.toLowerCase().includes(q),
      );
    }
    return data;
  }

  onSearchChange(value: string): void {
    this.searchText = value;
    this.reloadCurrentLevel();
  }

  // ── Dialog actions ──

  handleAdd(event: any): void {
    const row = event?.row || event;
    if (row) this.close.emit(row);
  }

  handleCancel(): void {
    this.close.emit(null);
  }
}
