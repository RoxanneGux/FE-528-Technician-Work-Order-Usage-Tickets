import { Component, computed, signal } from '@angular/core';
import { AwDialogComponent, DialogOptions, DialogVariants, TableCellInput, TableCellTypes } from '@assetworks-llc/aw-component-lib';
import { BaseDialogComponent } from '../../components/dialogs/base-dialog.component';

@Component({
  selector: 'app-usage-task-search-dialog',
  standalone: true,
  imports: [AwDialogComponent],
  template: `
    <aw-dialog class="dialog-xl"
      [ariaLabel]="'Task Search'"
      [visible]="true"
      [dialogOptions]="dialogOptions()"
      [columnsDefinition]="columnsDefinition"
      [tableData]="tableData()"
      [enableSingleSelection]="true"
      [filterColumns]="['taskId', 'taskDescription']"
      (primaryAction)="onSelect($event)"
      (secondaryAction)="onCancel()">
    </aw-dialog>
  `,
})
export class UsageTaskSearchDialogComponent extends BaseDialogComponent {
  readonly tableData = signal([
    { taskId: 'TSK-001', taskDescription: 'Inspect pump bearings and seals', estimatedHours: 2.0, status: 'In Progress' },
    { taskId: 'TSK-002', taskDescription: 'Replace worn impeller', estimatedHours: 4.0, status: 'Not Started' },
    { taskId: 'TSK-003', taskDescription: 'Realign motor coupling', estimatedHours: 1.5, status: 'Complete' },
    { taskId: 'TSK-004', taskDescription: 'Test pump performance after repair', estimatedHours: 1.0, status: 'Not Started' },
  ]);

  readonly columnsDefinition: TableCellInput[] = [
    { type: TableCellTypes.Title, key: 'taskId', label: 'Task ID', sort: true },
    { type: TableCellTypes.Title, key: 'taskDescription', label: 'Description', sort: true },
    { type: TableCellTypes.Title, key: 'estimatedHours', label: 'Est. Hours', sort: true },
    { type: TableCellTypes.Title, key: 'status', label: 'Status', sort: true },
  ];

  readonly dialogOptions = computed<DialogOptions>(() => ({
    variant: DialogVariants.TABLE,
    title: 'Search Tasks',
    primaryButtonLabel: 'Select',
    secondaryButtonLabel: 'Cancel',
    enableSearch: true,
  }));

  onSelect(event: any): void {
    const row = event?.row || event;
    this.close.emit(row);
  }

  onCancel(): void {
    this.close.emit(null);
  }
}
