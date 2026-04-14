import { Component, computed, signal } from '@angular/core';
import { AwDialogComponent, DialogOptions, DialogVariants, TableCellInput, TableCellTypes } from '@assetworks-llc/aw-component-lib';
import { BaseDialogComponent } from '../../components/dialogs/base-dialog.component';

export interface AssetSearchResult {
  assetId: string;
  description: string;
}

@Component({
  selector: 'app-usage-asset-search-dialog',
  standalone: true,
  imports: [AwDialogComponent],
  template: `
    <aw-dialog class="dialog-xl"
      [ariaLabel]="'Asset Search'"
      [visible]="true"
      [dialogOptions]="dialogOptions()"
      [columnsDefinition]="columnsDefinition"
      [tableData]="tableData()"
      [enableSingleSelection]="true"
      [filterColumns]="['assetId', 'description', 'location']"
      (primaryAction)="onSelect($event)"
      (secondaryAction)="onCancel()">
    </aw-dialog>
  `,
})
export class UsageAssetSearchDialogComponent extends BaseDialogComponent {
  readonly tableData = signal([
    { assetId: 'EQ-4821', description: 'Centrifugal Pump', location: 'Building A', status: 'In Service' },
    { assetId: 'EQ-5102', description: 'Hydraulic Press', location: 'Building B', status: 'Active' },
    { assetId: 'EQ-3340', description: 'Air Compressor', location: 'Warehouse', status: 'Active' },
    { assetId: 'EQ-7789', description: 'Conveyor Belt Motor', location: 'Building A', status: 'In Service' },
    { assetId: 'EQ-2215', description: 'Generator Set', location: 'Building C', status: 'Standby' },
  ]);

  readonly columnsDefinition: TableCellInput[] = [
    { type: TableCellTypes.Title, key: 'assetId', label: 'Asset ID', sort: true },
    { type: TableCellTypes.Title, key: 'description', label: 'Description', sort: true },
    { type: TableCellTypes.Title, key: 'location', label: 'Location', sort: true },
    { type: TableCellTypes.Title, key: 'status', label: 'Status', sort: true },
  ];

  readonly dialogOptions = computed<DialogOptions>(() => ({
    variant: DialogVariants.TABLE,
    title: 'Search Assets',
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
