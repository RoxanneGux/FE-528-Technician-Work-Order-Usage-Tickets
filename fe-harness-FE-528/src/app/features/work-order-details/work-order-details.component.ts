import { Component, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AwExpansionPanelComponent,
  AwTableComponent,
  AwActionBarComponent,
  AwDividerComponent,
  AwIconComponent,
  AwButtonDirective,
  AwSelectMenuComponent,
  TableCellInput,
  TableCellTypes,
  ActionBarLeft,
  ActionBarRight,
} from '@assetworks-llc/aw-component-lib';

import { AnchorLayoutComponent } from '../../components/layouts/anchor-layout/anchor-layout.component';
import { AnchorLink } from '../../components/layouts/anchor-layout/anchor-link.interface';
import { DetailsCardComponent, DetailsCardDataRow } from '../../components/details-card/details-card.component';
import { EmployeeChooserPanelComponent } from '../employee-chooser/employee-chooser-panel.component';
import { PanelService } from '../../services/panel.service';
import { MockDataService, MockCurrentAssignment } from '../../services/mock-data.service';

/**
 * Work Order Details page component.
 * Displays work order info, tasks, postings, service requests, and action buttons.
 * Uses AnchorLayoutComponent for sidebar navigation and CCL components for UI.
 */
@Component({
  selector: 'app-work-order-details',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    AnchorLayoutComponent,
    DetailsCardComponent,
    AwExpansionPanelComponent,
    AwTableComponent,
    AwActionBarComponent,
    AwDividerComponent,
    AwIconComponent,
    AwButtonDirective,
    AwSelectMenuComponent,
  ],
  templateUrl: './work-order-details.component.html',
  styleUrl: './work-order-details.component.scss',
})
export class WorkOrderDetailsComponent {
  public readonly mockData = inject(MockDataService);
  private readonly _panelService = inject(PanelService);

  /** Selected delay code value for the Work Delay form. */
  public selectedDelayCode = '';

  // ── Anchor links ──

  public readonly anchorLinks = computed<AnchorLink[]>(() => [
    { name: 'Details', fragment: 'work-order-details' },
    { name: 'Currently Working', fragment: 'currently-working', count: this.mockData.currentAssignments().length },
    { name: 'Tasks', fragment: 'tasks', count: this.mockData.tasks().length },
    { name: 'Service Requests', fragment: 'service-requests', count: this.mockData.serviceRequests().length },
    { name: 'Postings', fragment: 'postings' },
    { name: 'Work Delay', fragment: 'work-delay' },
  ]);

  // ── Details cards data ──

  public readonly woInfoRows = computed<DetailsCardDataRow[]>(() => {
    const wo = this.mockData.workOrder();
    return [
      { label: 'Location', value: wo.locationId },
      { label: 'Year', value: String(wo.year) },
      { label: 'Number', value: String(wo.number) },
      { label: 'Status', value: wo.status },
      { label: 'Job Type', value: `${wo.jobType} - ${wo.jobTypeDescription}` },
      { label: 'Opened', value: new Date(wo.openedDateTime).toLocaleDateString() },
      { label: 'Due', value: new Date(wo.dueDateTime).toLocaleDateString() },
    ];
  });

  public readonly assetInfoRows = computed<DetailsCardDataRow[]>(() => {
    const wo = this.mockData.workOrder();
    return [
      { label: 'Asset Number', value: wo.assetNumber },
      { label: 'Equipment ID', value: wo.equipmentId },
      { label: 'Station/Location', value: wo.stationLocation },
      { label: 'Asset Type', value: wo.assetType },
      { label: 'Service Status', value: wo.serviceStatus },
    ];
  });

  // ── Costs ──

  public readonly costs = this.mockData.costs;

  // ── Currently Working ──

  public readonly currentAssignments = this.mockData.currentAssignments;

  public readonly currentlyWorkingColumns: TableCellInput[] = [
    { label: 'Employee', key: 'employeeName', type: TableCellTypes.Title },
    { label: 'Task', key: 'taskId', type: TableCellTypes.Title },
    { label: 'Task Description', key: 'taskDescription', type: TableCellTypes.Title },
    { label: 'Start Time', key: 'startTime', type: TableCellTypes.Title },
  ];

  public readonly currentlyWorkingData = computed(() =>
    this.mockData.currentAssignments().map(a => ({
      ...a,
      startTime: new Date(a.startTime).toLocaleString(),
    }))
  );

  // ── Tasks ──

  public readonly tasks = this.mockData.tasks;

  public readonly taskColumns: TableCellInput[] = [
    { label: 'Task ID', key: 'taskId', type: TableCellTypes.Title },
    { label: 'Description', key: 'taskDescription', type: TableCellTypes.Title },
    { label: 'Est. Hours', key: 'estimatedHours', type: TableCellTypes.Title },
    { label: 'Charged', key: 'chargedHours', type: TableCellTypes.Title },
    { label: 'Remaining', key: 'remainingHours', type: TableCellTypes.Title },
    { label: 'Status', key: 'status', type: TableCellTypes.Title },
  ];

  public readonly taskData = computed(() => this.mockData.tasks());

  // ── Service Requests ──

  public readonly serviceRequests = this.mockData.serviceRequests;

  public readonly serviceRequestColumns: TableCellInput[] = [
    { label: 'SR ID', key: 'serviceRequestId', type: TableCellTypes.Title },
    { label: 'Description', key: 'description', type: TableCellTypes.Title },
    { label: 'Priority', key: 'priority', type: TableCellTypes.Title },
    { label: 'Status', key: 'status', type: TableCellTypes.Title },
  ];

  public readonly serviceRequestData = computed(() => this.mockData.serviceRequests());

  // ── Postings ──

  public readonly laborPostingColumns: TableCellInput[] = [
    { label: 'Employee', key: 'employeeName', type: TableCellTypes.Title },
    { label: 'Task', key: 'taskId', type: TableCellTypes.Title },
    { label: 'Hours', key: 'hours', type: TableCellTypes.Title },
    { label: 'Date', key: 'date', type: TableCellTypes.Title },
    { label: 'Time Code', key: 'timeCode', type: TableCellTypes.Title },
  ];

  public readonly laborPostingData = computed(() => this.mockData.postings().labor);

  public readonly partsPostingColumns: TableCellInput[] = [
    { label: 'Part Number', key: 'partNumber', type: TableCellTypes.Title },
    { label: 'Description', key: 'description', type: TableCellTypes.Title },
    { label: 'Qty', key: 'quantity', type: TableCellTypes.Title },
    { label: 'Unit Cost', key: 'unitCost', type: TableCellTypes.Title },
    { label: 'Total Cost', key: 'totalCost', type: TableCellTypes.Title },
  ];

  public readonly partsPostingData = computed(() => this.mockData.postings().parts);

  public readonly commercialPostingColumns: TableCellInput[] = [
    { label: 'Vendor', key: 'vendor', type: TableCellTypes.Title },
    { label: 'Description', key: 'description', type: TableCellTypes.Title },
    { label: 'Amount', key: 'amount', type: TableCellTypes.Title },
    { label: 'Date', key: 'date', type: TableCellTypes.Title },
  ];

  public readonly commercialPostingData = computed(() => this.mockData.postings().commercial);

  // ── Work Delay ──

  public readonly delayCodes = this.mockData.delayCodes;

  public readonly delayCodeOptions = computed(() =>
    this.mockData.delayCodes().map(dc => ({
      label: dc.description,
      value: dc.delayCodeId,
    }))
  );

  // ── Action Bar ──

  public readonly actionsLeft: ActionBarLeft[] = [
    { textCallback: { title: 'Back', action: () => this.onBack() } },
  ];

  public readonly actionsRight: ActionBarRight[] = [
    { textCallback: { title: 'Finish', action: () => this.onFinish() } },
    { buttonCallback: { label: 'Close', action: () => this.onClose(), buttonType: 'outlined' } },
  ];

  public readonly moreActions = [
    { title: 'Print Work Order', action: () => console.log('Action: Print Work Order') },
    { title: 'Duplicate Work Order', action: () => console.log('Action: Duplicate Work Order') },
    { title: 'View History', action: () => console.log('Action: View History') },
  ];

  // ── Actions ──

  onBack(): void {
    console.log('Action: Back');
  }

  onFinish(): void {
    console.log('Action: Finish');
  }

  onClose(): void {
    console.log('Action: Close');
  }

  onMoreActions(): void {
    console.log('Action: More Actions');
  }

  onAddEmployee(): void {
    this._panelService.open(EmployeeChooserPanelComponent, {}, (result) => {
      if (result?.SelectedEmployees) {
        const newAssignments: MockCurrentAssignment[] = result.SelectedEmployees.map((emp: any) => ({
          employeeId: emp.EmployeeId,
          employeeName: emp.Name,
          taskId: 'TSK-001',
          taskDescription: 'Assigned via Employee Chooser',
          startTime: new Date().toISOString(),
        }));
        this.mockData.currentAssignments.update(current => [...current, ...newAssignments]);
        console.log('Employee Chooser: Added employees to current assignments', result);
      }
    });
  }

  onStartDelay(): void {
    console.log('Action: Start Delay — code:', this.selectedDelayCode);
  }

  onStopDelay(): void {
    console.log('Action: Stop Delay');
  }

  onViewAttachments(): void {
    console.log('Action: View Attachments');
  }

  onViewNotes(): void {
    console.log('Action: View Notes');
  }

  onViewComments(): void {
    console.log('Action: View Comments');
  }
}
