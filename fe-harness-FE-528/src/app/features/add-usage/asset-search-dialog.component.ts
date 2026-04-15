import { Component, computed, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AwButtonIconOnlyDirective,
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
 * Uses aw-search component. Table is empty initially — results appear
 * after typing 2+ characters. Includes toggle and barcode scan icon.
 */
@Component({
  selector: 'app-usage-asset-search-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AwDialogComponent,
    AwIconComponent,
    AwToggleComponent,
    AwSearchComponent,
    AwButtonIconOnlyDirective,
  ],
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
        <div style="display: flex; align-items: center; gap: 8px; padding: 16px; flex-wrap: nowrap;">
          <aw-toggle [ariaLabel]="'Include inactive assets'"
                     [ngModel]="includeInactive()"
                     (ngModelChange)="includeInactive.set($event)">
          </aw-toggle>
          <span class="aw-b-1" style="flex-shrink: 0;">Include inactive assets</span>
          <div style="margin-left: auto; flex-shrink: 0;">
            <button AwButtonIconOnly [buttonType]="'secondary'"
                    [disabled]="true" ariaLabel="Scan barcode">
              <aw-icon [iconName]="'barcode-scan'"></aw-icon>
            </button>
          </div>
        </div>
        @if (searchQuery().length >= 2) {
          <div class="aw-c-1" style="padding: 0 16px 8px 16px; color: var(--system-text-text-secondary)">
            Showing {{ filteredData().length }} items — Refine your search for more specific results
          </div>
        }
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
  public readonly includeInactive = signal(false);

  /** Mock assets — fleet + linear, matching FE-3999 data. */
  readonly allAssets = [
    { EquipmentId: 'R-12345', EquipmentDescription: 'MOTOR POOL SEDAN', AssetType: 'Vehicle', AssetNumber: 'R-12345', Active: true },
    { EquipmentId: 'QA-FLEET-002', EquipmentDescription: 'QA FLEET TRUCK 002', AssetType: 'Vehicle', AssetNumber: 'QA-FLEET-002', Active: true },
    { EquipmentId: 'K123-456', EquipmentDescription: 'SERIES 50 DETROIT DIESEL GAS ENGINE', AssetType: 'Engine', AssetNumber: 'K123-456', Active: true },
    { EquipmentId: 'QA-C-001', EquipmentDescription: 'CARGO VAN 2500', AssetType: 'Vehicle', AssetNumber: 'QA-C-001', Active: true },
    { EquipmentId: 'FL-VAN-03', EquipmentDescription: 'FLEET VAN 03', AssetType: 'Vehicle', AssetNumber: 'FL-VAN-03', Active: true },
    { EquipmentId: 'TX-TRUCK-07', EquipmentDescription: 'PICKUP TRUCK F-150', AssetType: 'Vehicle', AssetNumber: 'TX-TRUCK-07', Active: true },
    { EquipmentId: 'EQ-4821', EquipmentDescription: 'CENTRIFUGAL PUMP', AssetType: 'Pump', AssetNumber: 'EQ-4821', Active: true },
    { EquipmentId: 'EQ-5102', EquipmentDescription: 'HYDRAULIC PRESS', AssetType: 'Press', AssetNumber: 'EQ-5102', Active: false },
    { EquipmentId: 'ROAD07', EquipmentDescription: 'HIGHWAY 07 - MAIN CORRIDOR', AssetType: 'Linear', AssetNumber: 'ROAD07', Active: true },
    { EquipmentId: 'UX-BRIDGE-LINEAR', EquipmentDescription: 'UX TEST BRIDGE - LINEAR ASSET', AssetType: 'Linear', AssetNumber: 'UX-BRIDGE-LINEAR', Active: true },
  ];

  /** Empty until user types 2+ characters, matching FA-Suite behavior. */
  readonly filteredData = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (query.length < 2) return [];

    const assets = this.includeInactive() ? this.allAssets : this.allAssets.filter(a => a.Active);

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
        template: '<div style="width:40px;height:40px;background:var(--system-surfaces-surfaces-lower);border-radius:4px"></div>',
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
    primaryButtonLabel: 'Add Asset',
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
