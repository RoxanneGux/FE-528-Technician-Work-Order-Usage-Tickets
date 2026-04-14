import { Component, computed, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AwDialogComponent,
  AwIconComponent,
  AwSearchComponent,
  AwToggleComponent,
  DialogOptions,
  DialogVariants,
  TableCellInput,
  TableCellTypes,
} from '@assetworks-llc/aw-component-lib';
import { BaseDialogComponent } from '../../components/dialogs/base-dialog.component';

/**
 * Asset search dialog matching the FA-Suite technician home pattern.
 *
 * Uses aw-search component for the search field. Table is empty initially —
 * results appear after typing 2+ characters.
 */
@Component({
  selector: 'app-usage-asset-search-dialog',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, AwDialogComponent, AwIconComponent, AwToggleComponent, AwSearchComponent],
  template: `
    <aw-dialog
      [ariaLabel]="'Asset Search Dialog'"
      [visible]="true"
      [dialogOptions]="dialogOptions()"
      [columnsDefinition]="columnsDefinition"
      [tableData]="filteredData()"
      [enableSingleSelection]="true"
      (primaryAction)="onGo($event)"
      (secondaryAction)="onCancel()">

      <div table-top class="search-controls">
        <div style="padding: 16px 16px 0 16px;">
          <aw-search
            [formControl]="searchControl"
            [placeholder]="'Search for an asset using any of the data shown'"
            [ariaLabel]="'Search assets'">
          </aw-search>
        </div>
        <div class="d-flex align-items-center gap-2" style="padding: 16px;">
          <aw-toggle [ariaLabel]="'Include inactive assets'"
                     [(ngModel)]="includeInactive">
          </aw-toggle>
          <span class="aw-b-1">Include inactive assets</span>
        </div>
      </div>
    </aw-dialog>
  `,
  styles: [`
    :host {
      .search-controls {
        border-bottom: 1px solid var(--system-line-divider-stroke-line-color);
      }
    }
  `],
})
export class UsageAssetSearchDialogComponent extends BaseDialogComponent {
  public readonly searchControl = new FormControl('');
  public readonly searchQuery = signal('');
  public includeInactive = false;

  readonly allAssets = [
    { EquipmentId: 'EQ-4821', EquipmentDescription: 'Centrifugal Pump', AssetType: 'Pump', AssetNumber: 'AST-001', Active: true },
    { EquipmentId: 'EQ-5102', EquipmentDescription: 'Hydraulic Press', AssetType: 'Press', AssetNumber: 'AST-002', Active: true },
    { EquipmentId: 'EQ-3340', EquipmentDescription: 'Air Compressor', AssetType: 'Compressor', AssetNumber: 'AST-003', Active: false },
    { EquipmentId: 'EQ-7789', EquipmentDescription: 'Conveyor Belt Motor', AssetType: 'Motor', AssetNumber: 'AST-004', Active: true },
    { EquipmentId: 'EQ-2215', EquipmentDescription: 'Generator Set', AssetType: 'Generator', AssetNumber: 'AST-005', Active: true },
    { EquipmentId: 'R-12345', EquipmentDescription: 'Motor Pool Sedan', AssetType: 'Vehicle', AssetNumber: 'AST-006', Active: true },
    { EquipmentId: 'FL-VAN-03', EquipmentDescription: 'Fleet Van 03', AssetType: 'Vehicle', AssetNumber: 'AST-007', Active: true },
    { EquipmentId: 'TX-TRUCK-07', EquipmentDescription: 'Pickup Truck F-150', AssetType: 'Vehicle', AssetNumber: 'AST-008', Active: false },
  ];

  /** Empty until user types 2+ characters, matching FA-Suite behavior. */
  readonly filteredData = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (query.length < 2) return [];

    let assets = this.includeInactive ? this.allAssets : this.allAssets.filter(a => a.Active);

    return assets.filter(asset =>
      asset.EquipmentId.toLowerCase().includes(query) ||
      asset.EquipmentDescription.toLowerCase().includes(query) ||
      asset.AssetType.toLowerCase().includes(query) ||
      asset.AssetNumber.toLowerCase().includes(query),
    );
  });

  readonly columnsDefinition: TableCellInput[] = [
    {
      type: TableCellTypes.Custom, key: 'image', label: 'Image', sort: false, align: 'left',
      combineFields: ['EquipmentId'],
      combineTemplate: () => ({
        template: '<div style="width:40px;height:40px;background:var(--system-surfaces-surfaces-raised);border-radius:4px"></div>',
      }),
    },
    {
      type: TableCellTypes.Custom, key: 'EquipmentId', label: 'Asset', sort: true, align: 'left',
      combineFields: ['EquipmentId', 'EquipmentDescription'],
      combineTemplate: (data: any[]) => ({
        template: `<div><span class="aw-b-1">${data[0] || ''}</span><br><span class="aw-c-1" style="color:var(--system-text-text-secondary)">${data[1] || ''}</span></div>`,
      }),
    },
    { type: TableCellTypes.Title, key: 'AssetType', label: 'Asset Type', sort: true },
    { type: TableCellTypes.Title, key: 'AssetNumber', label: 'Asset Number', sort: true },
  ];

  readonly dialogOptions = computed<DialogOptions>(() => ({
    variant: DialogVariants.TABLE,
    title: 'Search Assets',
    primaryButtonLabel: 'Go',
    secondaryButtonLabel: 'Cancel',
    enableSearch: false,
  }));

  constructor() {
    super();
    this.searchControl.valueChanges.subscribe(val => {
      this.searchQuery.set(val || '');
    });
  }

  public onGo(event: any): void {
    if (event?.row) {
      this.close.emit({ selectedAsset: event.row, action: 'go' as const });
    }
  }

  public onCancel(): void {
    this.close.emit({ selectedAsset: null, action: 'cancel' as const });
  }
}
