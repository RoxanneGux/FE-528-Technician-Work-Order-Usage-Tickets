import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AwDialogComponent,
  AwIconComponent,
  DialogOptions,
  DialogVariants,
  TableCellInput,
  TableCellTypes,
} from '@assetworks-llc/aw-component-lib';
import { BaseDialogComponent } from '../../components/dialogs/base-dialog.component';

/**
 * Asset search dialog matching the FA-Suite asset-management pattern.
 *
 * Uses aw-dialog TABLE variant with a custom search input in [table-top]
 * and client-side filtering over mock data.
 *
 * Emits `{ selectedAsset, action: 'go' | 'cancel' }` on close.
 */
@Component({
  selector: 'app-usage-asset-search-dialog',
  standalone: true,
  imports: [FormsModule, AwDialogComponent, AwIconComponent],
  template: `
    <aw-dialog class="dialog-xl"
      [ariaLabel]="'Asset Search Dialog'"
      [visible]="true"
      [dialogOptions]="dialogOptions()"
      [columnsDefinition]="columnsDefinition"
      [tableData]="filteredData()"
      [enableSingleSelection]="true"
      (primaryAction)="onGo($event)"
      (secondaryAction)="onCancel()">

      <div table-top class="search-controls py-3 px-3">
        <div class="search-input-container position-relative">
          <aw-icon [iconName]="'search'"
                   [iconSize]="20"
                   [iconColor]="'system-text-text-secondary'"
                   class="search-icon position-absolute">
          </aw-icon>
          <input type="text"
                 class="search-input aw-b-1 w-100 rounded"
                 placeholder="Search for an asset using any of the data shown"
                 [value]="searchQuery()"
                 (input)="onSearchChange($any($event.target).value)"
                 aria-label="Search assets">
        </div>
      </div>
    </aw-dialog>
  `,
  styles: [`
    :host {
      .search-controls {
        border-bottom: 1px solid var(--system-line-divider-stroke-line-color);
      }
      .search-icon {
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
      }
      .search-input {
        padding: 8px 12px 8px 40px;
        border: 1px solid var(--system-line-divider-stroke-line-color);
        color: var(--system-text-text-primary);
        background: var(--system-surfaces-surfaces-raised);
        box-sizing: border-box;
        &::placeholder { color: var(--system-text-text-secondary); }
        &:focus { outline: 2px solid var(--system-links-link-active); outline-offset: -2px; }
      }
    }
  `],
})
export class UsageAssetSearchDialogComponent extends BaseDialogComponent {
  public readonly searchQuery = signal('');

  readonly allAssets = [
    { EquipmentId: 'EQ-4821', EquipmentDescription: 'Centrifugal Pump', AssetType: 'Pump', AssetNumber: 'AST-001' },
    { EquipmentId: 'EQ-5102', EquipmentDescription: 'Hydraulic Press', AssetType: 'Press', AssetNumber: 'AST-002' },
    { EquipmentId: 'EQ-3340', EquipmentDescription: 'Air Compressor', AssetType: 'Compressor', AssetNumber: 'AST-003' },
    { EquipmentId: 'EQ-7789', EquipmentDescription: 'Conveyor Belt Motor', AssetType: 'Motor', AssetNumber: 'AST-004' },
    { EquipmentId: 'EQ-2215', EquipmentDescription: 'Generator Set', AssetType: 'Generator', AssetNumber: 'AST-005' },
    { EquipmentId: 'R-12345', EquipmentDescription: 'Motor Pool Sedan', AssetType: 'Vehicle', AssetNumber: 'AST-006' },
    { EquipmentId: 'FL-VAN-03', EquipmentDescription: 'Fleet Van 03', AssetType: 'Vehicle', AssetNumber: 'AST-007' },
    { EquipmentId: 'TX-TRUCK-07', EquipmentDescription: 'Pickup Truck F-150', AssetType: 'Vehicle', AssetNumber: 'AST-008' },
  ];

  readonly filteredData = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.allAssets;
    return this.allAssets.filter(asset =>
      asset.EquipmentId.toLowerCase().includes(query) ||
      asset.EquipmentDescription.toLowerCase().includes(query) ||
      asset.AssetType.toLowerCase().includes(query) ||
      asset.AssetNumber.toLowerCase().includes(query),
    );
  });

  readonly columnsDefinition: TableCellInput[] = [
    {
      type: TableCellTypes.Custom, key: 'EquipmentId', label: 'Asset', sort: true, align: 'left',
      combineFields: ['EquipmentId', 'EquipmentDescription'],
      combineTemplate: (data: any[]) => ({
        template: `<div><span class="aw-b-1">${data[0] || ''}</span><br><span class="aw-c-1" style="color: var(--system-text-text-secondary)">${data[1] || ''}</span></div>`,
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

  public onSearchChange(query: string): void {
    this.searchQuery.set(query);
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
