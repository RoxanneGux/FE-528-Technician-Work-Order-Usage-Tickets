import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  output,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import {
  ActionBarLeft,
  ActionBarRight,
  AwActionBarComponent,
  AwButtonDirective,
  AwCalendarComponent,
  AwChipComponent,
  AwDividerComponent,
  AwExpansionPanelComponent,
  AwFormFieldComponent,
  AwFormFieldLabelComponent,
  AwIconComponent,
  AwInputDirective,
  AwMetricCardComponent,
  AwSelectMenuComponent,
  AwSideDrawerComponent,
  AwTableComponent,
  CalendarEvent,
  EventStatus,
  MultiSelectOption,
  SideDrawerInformation,
  SingleSelectOption,
  TableCellInput,
  TableCellTypes,
  ViewMode,
} from '@assetworks-llc/aw-component-lib';

import {
  MockDataService,
  MockEmployeeDetail,
  MockCrewEmployee,
  MockEmployeeWorkOrder,
  MockEmployeeTask,
  MockAppointment,
  MockNonWorkActivity,
  MockIndirectTask,
} from '../../services/mock-data.service';
import { computeRelativeDate } from '../../services/mock-data.service';
import { WorkOrderCellComponent } from './work-order-cell.component';

// ── Calendar event type configuration ──

/** Discriminated union of calendar event types. */
export type CalendarEventType = 'assignment' | 'appointment' | 'nwa';

/** Style configuration per event type. */
export const EVENT_TYPE_STYLES: Record<CalendarEventType, { flagColor: string; icon: string; iconColor: string; label: string }> = {
  assignment: { flagColor: '#0066cc', icon: 'build', iconColor: '#0066cc', label: 'Assignments' },
  appointment: { flagColor: '#00cc66', icon: 'event', iconColor: '#00cc66', label: 'Appointments' },
  nwa: { flagColor: '#9933cc', icon: 'event_busy', iconColor: '#9933cc', label: 'Non-Work Activity' },
};

/** Fixed ordering for event type groups in the drawer. */
const EVENT_TYPE_ORDER: CalendarEventType[] = ['assignment', 'appointment', 'nwa'];

// ── Event detail discriminated union ──

export interface AssignmentDetail {
  type: 'assignment';
  workOrderId: string;
  taskId: string;
  taskDescription: string;
  status: string;
  hours: number;
}

export interface AppointmentDetail {
  type: 'appointment';
  title: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface NwaDetail {
  type: 'nwa';
  nwaType: string;
  startTime: string;
  endTime: string;
  hours: number;
}

export type EventDetail = AssignmentDetail | AppointmentDetail | NwaDetail;

/** A group of events of the same type for display in the drawer. */
export interface DrawerEventGroup {
  type: CalendarEventType;
  label: string;
  events: CalendarEvent[];
  details: EventDetail[];
}

// ── Pure mapping functions ──

/** Format a Date's time as "H:MM AM/PM" (e.g., "9:00 AM", "2:30 PM"). */
export function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const mm = minutes.toString().padStart(2, '0');
  return `${hours}:${mm} ${ampm}`;
}

/** Map work order tasks to CalendarEvent[], one event per task. */
export function mapAssignmentEvents(workOrders: MockEmployeeWorkOrder[]): CalendarEvent[] {
  const style = EVENT_TYPE_STYLES['assignment'];
  const events: CalendarEvent[] = [];

  for (const wo of workOrders) {
    for (const task of wo.tasks) {
      const startTime = computeRelativeDate(0, 8, 0);
      const endTime = computeRelativeDate(0, 8 + Math.ceil(task.estimatedHours), 0);
      events.push({
        id: `assignment-${task.taskId}`,
        title: task.taskDescription,
        startTime,
        endTime,
        flagColor: style.flagColor,
        icon: style.icon,
        iconColor: style.iconColor,
        description: wo.workOrderId,
        status: EventStatus.ACTIVE,
      });
    }
  }
  return events;
}

/** Map appointment mock data to CalendarEvent[]. */
export function mapAppointmentEvents(appointments: MockAppointment[]): CalendarEvent[] {
  const style = EVENT_TYPE_STYLES['appointment'];
  return appointments.map(apt => ({
    id: `appointment-${apt.id}`,
    title: apt.title,
    startTime: new Date(apt.start),
    endTime: new Date(apt.end),
    flagColor: style.flagColor,
    icon: style.icon,
    iconColor: style.iconColor,
    description: apt.title,
    status: EventStatus.ACTIVE,
  }));
}

/** Map NWA mock data to CalendarEvent[]. */
export function mapNwaEvents(nonWorkActivities: MockNonWorkActivity[]): CalendarEvent[] {
  const style = EVENT_TYPE_STYLES['nwa'];
  return nonWorkActivities.map(nwa => ({
    id: `nwa-${nwa.id}`,
    title: nwa.type,
    startTime: new Date(nwa.start),
    endTime: new Date(nwa.end),
    flagColor: style.flagColor,
    icon: style.icon,
    iconColor: style.iconColor,
    description: String(nwa.hours),
    status: EventStatus.ACTIVE,
  }));
}

/** Extract the CalendarEventType from an event's id prefix. */
function getEventType(event: CalendarEvent): CalendarEventType | null {
  if (event.id.startsWith('assignment-')) return 'assignment';
  if (event.id.startsWith('appointment-')) return 'appointment';
  if (event.id.startsWith('nwa-')) return 'nwa';
  return null;
}

/** Check if two dates fall on the same calendar day. */
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Result emitted when the user selects an employee from the details panel. */
export interface EmployeeDetailResult {
  employeeId: string;
  name: string;
}

/** Represents a grouped item for display in expansion panels across all Group By modes. */
export interface GroupedItem {
  id: string;
  title: string;
  /** 'workOrder' or 'indirectTask' — determines template rendering in Work mode. */
  itemType?: 'workOrder' | 'indirectTask';
  workOrders?: MockEmployeeWorkOrder[];
  parentWorkOrder?: MockEmployeeWorkOrder;
  task?: MockEmployeeTask;
  indirectTask?: MockIndirectTask;
  tasks?: MockEmployeeTask[];
  assetId?: string;
  assetDescription?: string;
  location?: string;
  assetWoTableData?: any[];
}

/** Mock asset derived from work order descriptions (format: "Asset Description - Location"). */
interface DerivedAsset {
  assetId: string;
  assetDescription: string;
  location: string;
  workOrders: MockEmployeeWorkOrder[];
}

/** Active Group By mode type. */
type GroupByMode = 'work' | 'asset';

/** Employee Details slide-in panel. Displays skills, time codes, locations, work orders, and appointments. */
@Component({
  selector: 'app-employee-details-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CdkScrollable,
    AwActionBarComponent,
    AwButtonDirective,
    AwCalendarComponent,
    AwChipComponent,
    AwDividerComponent,
    AwExpansionPanelComponent,
    AwFormFieldComponent,
    AwFormFieldLabelComponent,
    AwIconComponent,
    AwInputDirective,
    AwMetricCardComponent,
    AwSelectMenuComponent,
    AwSideDrawerComponent,
    AwTableComponent,
  ],
  templateUrl: './employee-details-panel.component.html',
  styleUrl: './employee-details-panel.component.scss',
})
export class EmployeeDetailsPanelComponent implements OnInit {
  /** Emits employee data on Select, null on Cancel. */
  public readonly close = output<EmployeeDetailResult | null>();

  private readonly _mockData = inject(MockDataService);

  /** Set by PanelService via Object.assign — plain property, NOT a signal input. */
  public employeeId = '';

  /** Internal signal synced from employeeId in ngOnInit so computed signals can react. */
  private readonly _employeeId = signal('');

  // ── Computed signals ──

  public readonly employee = computed<MockCrewEmployee | undefined>(() =>
    this._mockData.crewEmployees().find(e => e.employeeId === this._employeeId()),
  );

  public readonly employeeDetail = computed<MockEmployeeDetail | undefined>(() =>
    this._mockData.employeeDetails().find(d => d.employeeId === this._employeeId()),
  );

  public readonly skills = computed<string[]>(() => {
    const emp = this.employee();
    if (!emp?.skills?.length) return [];
    const skillMap = new Map(this._mockData.filterOptions().skills.map(s => [s.id, s.description]));
    return emp.skills.map(id => skillMap.get(id) ?? id);
  });

  public readonly timeCodeSummary = computed(() => this.employeeDetail()?.timeCodeSummary ?? null);

  public readonly locations = computed(() => this.employeeDetail()?.locations ?? []);

  public readonly workOrders = computed(() => this.employeeDetail()?.workOrders ?? []);

  public readonly appointments = computed(() => this.employeeDetail()?.appointments ?? []);

  /** Convert mock appointments to CalendarEvent[] for aw-calendar. */
  public readonly calendarEvents = computed<CalendarEvent[]>(() =>
    this.appointments().map(apt => ({
      id: apt.id,
      title: apt.title,
      startTime: new Date(apt.start),
      endTime: new Date(apt.end),
      flagColor: apt.color ?? '#4285f4',
      status: EventStatus.ACTIVE,
    })),
  );

  /** Combined calendar events from all three types (assignments, appointments, NWA). */
  public readonly allCalendarEvents = computed<CalendarEvent[]>(() => {
    const detail = this.employeeDetail();
    if (!detail) return [];
    const assignments = mapAssignmentEvents(detail.workOrders);
    const appts = mapAppointmentEvents(detail.appointments);
    const nwas = mapNwaEvents(detail.nonWorkActivities ?? []);
    return [...assignments, ...appts, ...nwas];
  });

  /** Default date for the scheduler — today so current month is always visible. */
  public schedulerDate = new Date();

  /** Current view mode for the scheduler. */
  public schedulerViewMode: ViewMode = 'month';

  // ── Drawer state ──

  /** ViewChild reference to the event drawer. */
  @ViewChild('eventDrawer') eventDrawer!: AwSideDrawerComponent;

  /** The currently selected day in the drawer (null when drawer is closed). */
  public readonly selectedDrawerDate = signal<Date | null>(null);

  /** Events filtered to the selected drawer date. */
  public readonly drawerEvents = computed<CalendarEvent[]>(() => {
    const date = this.selectedDrawerDate();
    if (!date) return [];
    return this.allCalendarEvents().filter(evt => {
      if (!evt.startTime) return false;
      return isSameDay(evt.startTime, date);
    });
  });

  /** Events grouped by type for the drawer, omitting empty groups, in fixed order. */
  public readonly groupedDrawerEvents = computed<DrawerEventGroup[]>(() => {
    const events = this.drawerEvents();
    const detail = this.employeeDetail();
    const groups: DrawerEventGroup[] = [];

    for (const eventType of EVENT_TYPE_ORDER) {
      const typeEvents = events.filter(e => getEventType(e) === eventType);
      if (typeEvents.length === 0) continue;

      const style = EVENT_TYPE_STYLES[eventType];
      const details = typeEvents.map(e => this._buildEventDetail(e, eventType, detail));

      groups.push({
        type: eventType,
        label: `${style.label} (${typeEvents.length})`,
        events: typeEvents,
        details,
      });
    }
    return groups;
  });

  /** ViewChildren reference to the drawer's expansion panels only. */
  @ViewChildren('drawerPanel') drawerPanels!: QueryList<AwExpansionPanelComponent>;

  /** Drawer information with formatted date title and Expand/Collapse actions. */
  public readonly drawerInfo = computed<SideDrawerInformation>(() => {
    const date = this.selectedDrawerDate();
    if (!date) return { title: 'Events' };
    const formatted = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    return {
      title: formatted,
      userActions: [
        { label: 'Expand All', icon: 'unfold_more', buttonType: 'secondary', action: () => this.expandAllDrawerPanels() },
        { label: 'Collapse All', icon: 'unfold_less', buttonType: 'secondary', action: () => this.collapseAllDrawerPanels() },
      ],
    };
  });

  /** Callback function for aw-calendar [onDayClickFn] — opens drawer for the clicked day. */
  public readonly onDayClickFn = (date: Date): void => {
    this.selectedDrawerDate.set(date);
    this.eventDrawer?.openSideDrawer();
  };

  /** Handler for aw-calendar (eventClick) — opens drawer for the event's day. */
  public onEventClick(event: CalendarEvent): void {
    if (event.startTime) {
      this.selectedDrawerDate.set(event.startTime);
      this.eventDrawer?.openSideDrawer();
    }
  }

  // ── Metric card data ──

  public readonly timeCodeCardData = computed(() => {
    const summary = this.timeCodeSummary();
    if (!summary) return [];
    return [
      { label: "Today's Timesheet", readonly: { title: String(summary.todaysTimesheet) } },
      { label: 'Capacity Hours', readonly: { title: String(summary.capacityHours) } },
      { label: 'NWA Hours', readonly: { title: String(summary.nwaHours) } },
      { label: 'Hours Available', readonly: { title: String(summary.hoursAvailable) } },
      { label: 'Assigned Hours', readonly: { title: String(summary.assignedHours) } },
    ];
  });

  public readonly locationsCardData = computed(() =>
    this.locations().map(loc => ({
      label: loc.locationName,
      readonly: { title: loc.isDefault ? 'Default' : 'Assigned' },
    })),
  );

  // ── Expansion panel state ──

  public readonly expandedPanels = signal<Map<string, boolean>>(new Map());

  @ViewChildren(AwExpansionPanelComponent) expansionPanels!: QueryList<AwExpansionPanelComponent>;

  // ── Filter controls ──

  public readonly searchControl = new FormControl('');
  public readonly groupByControl = new FormControl<string | null>('work');
  public readonly filterControl = new FormControl<string | null>(null);
  public readonly taskFilterControl = new FormControl<string | null>(null);

  /** Signal-based search term synced from FormControl for reactive filtering. */
  private readonly _searchTerm = signal('');

  /** Signal-based filter IDs synced from the WO/asset filter control. */
  private readonly _filterIds = signal<string[]>([]);

  /** Signal-based filter IDs synced from the task filter control. */
  private readonly _taskFilterIds = signal<string[]>([]);

  /** Signal tracking the active Group By mode, synced from groupByControl. */
  private readonly _groupBy = signal<GroupByMode>('work');

  /** Group By options — "Work" is preselected. */
  public readonly groupByOptions: SingleSelectOption[] = [
    { label: 'Work', value: 'work' },
    { label: 'Asset', value: 'asset' },
  ];

  // ── Group By–driven computed signals ──

  /** Active Group By mode for template switching. */
  public readonly activeGroupBy = computed<GroupByMode>(() => this._groupBy());

  /** Dynamic label for the third filter dropdown. */
  public readonly filterLabel = computed<string>(() => {
    switch (this._groupBy()) {
      case 'asset': return 'Asset';
      default: return 'Work Order';
    }
  });

  /** Dynamic placeholder for the third filter dropdown. */
  public readonly filterPlaceholder = computed<string>(() => {
    switch (this._groupBy()) {
      case 'asset': return 'Filter on asset';
      default: return 'All';
    }
  });

  /** Dynamic search placeholder based on Group By mode. */
  public readonly searchPlaceholder = computed<string>(() => {
    switch (this._groupBy()) {
      case 'asset': return 'Search assets';
      default: return 'Search Work';
    }
  });

  /** Filter options for the third dropdown — changes based on Group By mode. */
  public readonly filterOptions = computed<MultiSelectOption[]>(() => {
    switch (this._groupBy()) {
      case 'asset':
        return this._deriveAssets().map(a => ({
          label: a.assetId + ' - ' + a.assetDescription,
          value: a.assetId,
        }));
      default:
        return this.workOrders().map(wo => ({
          label: wo.workOrderId + ' - ' + wo.description,
          value: wo.workOrderId,
        }));
    }
  });

  /** Task filter options — all WO tasks + indirect tasks for the current employee. */
  public readonly taskFilterOptions = computed<MultiSelectOption[]>(() => {
    const woTasks = this.workOrders().flatMap(wo =>
      wo.tasks.map(t => ({ label: t.taskId + ' - ' + t.taskDescription, value: t.taskId })),
    );
    const indirectTasks = (this.employeeDetail()?.indirectTasks ?? []).map(t => ({
      label: t.taskId + ' - ' + t.taskDescription,
      value: t.taskId,
    }));
    return [...woTasks, ...indirectTasks];
  });

  /** Grouped items for expansion panels — structure depends on Group By mode. */
  public readonly groupedItems = computed<GroupedItem[]>(() => {
    switch (this._groupBy()) {
      case 'asset':
        return this._deriveAssets().map(a => ({
          id: a.assetId,
          title: a.assetId + ' - ' + a.assetDescription,
          assetId: a.assetId,
          assetDescription: a.assetDescription,
          location: a.location,
          workOrders: a.workOrders,
          assetWoTableData: a.workOrders.map(wo => ({
            ...wo,
            taskSummary: wo.tasks.map(t => t.taskId + ' - ' + t.taskDescription + ' (' + t.status + ')').join('; '),
          })),
        }));
      default: {
        // Work mode: WO panels + indirect task panels
        const woItems: GroupedItem[] = this.workOrders().map(wo => ({
          id: wo.workOrderId,
          title: wo.workOrderId + ' - ' + wo.description,
          itemType: 'workOrder' as const,
          tasks: wo.tasks,
        }));
        const indirectItems: GroupedItem[] = (this.employeeDetail()?.indirectTasks ?? []).map(t => ({
          id: t.taskId,
          title: t.taskId + ' - ' + t.taskDescription,
          itemType: 'indirectTask' as const,
          indirectTask: t,
        }));
        return [...woItems, ...indirectItems];
      }
    }
  });

  /** Filtered items — applies search term, WO/asset filter, and task filter to groupedItems. */
  public readonly filteredItems = computed<GroupedItem[]>(() => {
    let items = this.groupedItems();

    // Apply multi-select filter (WO or asset)
    const filterIds = this._filterIds();
    if (filterIds.length > 0) {
      items = items.filter(item => filterIds.includes(item.id));
    }

    // Apply task filter (Work mode only)
    const taskFilterIds = this._taskFilterIds();
    if (taskFilterIds.length > 0) {
      items = items.filter(item => {
        if (item.itemType === 'indirectTask') {
          return item.indirectTask ? taskFilterIds.includes(item.indirectTask.taskId) : false;
        }
        // For WO items, keep if any of its tasks match
        return item.tasks?.some(t => taskFilterIds.includes(t.taskId)) ?? false;
      });
    }

    // Apply text search
    const term = this._searchTerm().toLowerCase().trim();
    if (!term) return items;

    return items.filter(item => {
      // Always search the title
      if (item.title.toLowerCase().includes(term)) return true;

      switch (this._groupBy()) {
        case 'asset':
          return (
            item.location?.toLowerCase().includes(term) ||
            item.workOrders?.some(wo =>
              wo.workOrderId.toLowerCase().includes(term) ||
              wo.description.toLowerCase().includes(term),
            )
          );
        default:
          // Work mode: search tasks inside WO panels and indirect task fields
          if (item.itemType === 'indirectTask') {
            return item.indirectTask?.taskId.toLowerCase().includes(term) ||
              item.indirectTask?.taskDescription.toLowerCase().includes(term);
          }
          return (
            item.tasks?.some(t =>
              t.taskId.toLowerCase().includes(term) ||
              t.taskDescription.toLowerCase().includes(term) ||
              t.status.toLowerCase().includes(term),
            )
          );
      }
    });
  });

  /** Derive unique mock assets from work order descriptions. */
  private readonly _deriveAssets = computed<DerivedAsset[]>(() => {
    const assetMap = new Map<string, DerivedAsset>();
    let counter = 1;

    for (const wo of this.workOrders()) {
      const parts = wo.description.split(' - ');
      const assetDesc = parts[0]?.trim() ?? wo.description;
      const location = parts[1]?.trim() ?? 'Unknown';

      // Use the asset description as the grouping key
      if (!assetMap.has(assetDesc)) {
        const assetId = 'EQ-' + String(counter).padStart(3, '0');
        counter++;
        assetMap.set(assetDesc, {
          assetId,
          assetDescription: assetDesc,
          location,
          workOrders: [],
        });
      }
      assetMap.get(assetDesc)!.workOrders.push(wo);
    }

    return Array.from(assetMap.values());
  });

  // ── Table columns for tasks inside expansion panels (Work Orders mode) ──

  public readonly taskColumns: TableCellInput[] = [
    { label: 'Task ID', key: 'taskId', type: TableCellTypes.Title, align: 'left' },
    { label: 'Description', key: 'taskDescription', type: TableCellTypes.Title, align: 'left' },
    { label: 'Est. Hours', key: 'estimatedHours', type: TableCellTypes.Title, align: 'right' },
    { label: 'Charged', key: 'chargedHours', type: TableCellTypes.Title, align: 'right' },
    { label: 'Remaining', key: 'remainingHours', type: TableCellTypes.Title, align: 'right' },
    { label: 'Status', key: 'status', type: TableCellTypes.Title, align: 'left' },
  ];

  /** Table columns for the Asset view — WO rows with expander showing task details. */
  public readonly assetWoColumns: TableCellInput[] = [
    {
      label: 'Work Order',
      key: 'woDisplay',
      type: TableCellTypes.Custom,
      align: 'left',
      combineFields: ['workOrderId', 'description'],
      combineTemplate: (values: any[]) => ({
        component: WorkOrderCellComponent,
        componentData: { woId: values[0], description: values[1] },
      }),
    },
    { label: 'Status', key: 'status', type: TableCellTypes.Title, align: 'left', isExpanded: true },
    { label: 'Priority', key: 'priority', type: TableCellTypes.Title, align: 'left', isExpanded: true },
    {
      label: 'Tasks',
      key: 'taskSummary',
      type: TableCellTypes.Title,
      align: 'left',
      isExpanded: true,
    },
  ];

  // ── Footer action bar ──

  public readonly footerActionsLeft = signal<ActionBarLeft[]>([
    { textCallback: { title: 'Cancel', action: () => this.onCancel() } },
  ]);

  public readonly footerActionsRight = computed<ActionBarRight[]>(() => [
    { buttonCallback: { label: 'Select', buttonType: 'outlined', action: () => this.onSelect() } },
  ]);

  // ── Lifecycle ──

  ngOnInit(): void {
    this._employeeId.set(this.employeeId);

    // Sync search FormControl to signal
    this.searchControl.valueChanges.subscribe(val => {
      this._searchTerm.set(val ?? '');
    });

    // Sync Group By FormControl to signal; reset filter when mode changes
    this.groupByControl.valueChanges.subscribe(val => {
      const mode = this._extractGroupByValue(val);
      this._groupBy.set(mode);
      this.filterControl.reset(null, { emitEvent: false });
      this._filterIds.set([]);
      this.taskFilterControl.reset(null, { emitEvent: false });
      this._taskFilterIds.set([]);
    });

    // Sync filter FormControl to signal (multi-select returns array of objects or strings)
    this.filterControl.valueChanges.subscribe(val => {
      if (Array.isArray(val)) {
        this._filterIds.set(
          val.map((item: any) => (typeof item === 'object' ? (item.value ?? '') : item)).filter(Boolean),
        );
      } else {
        this._filterIds.set([]);
      }
    });

    // Sync task filter FormControl to signal
    this.taskFilterControl.valueChanges.subscribe(val => {
      if (Array.isArray(val)) {
        this._taskFilterIds.set(
          val.map((item: any) => (typeof item === 'object' ? (item.value ?? '') : item)).filter(Boolean),
        );
      } else {
        this._taskFilterIds.set([]);
      }
    });
  }

  // ── Public methods ──

  public expandAll(): void {
    this.expansionPanels?.forEach(panel => (panel as any).isExpanded = true);
  }

  public collapseAll(): void {
    this.expansionPanels?.forEach(panel => (panel as any).isExpanded = false);
  }

  public expandAllDrawerPanels(): void {
    this.drawerPanels?.forEach(panel => (panel as any).isExpanded = true);
  }

  public collapseAllDrawerPanels(): void {
    this.drawerPanels?.forEach(panel => (panel as any).isExpanded = false);
  }

  public togglePanel(itemId: string): void {
    this.expandedPanels.update(m => {
      const next = new Map(m);
      next.set(itemId, !next.get(itemId));
      return next;
    });
  }

  public isPanelExpanded(itemId: string): boolean {
    return this.expandedPanels().get(itemId) ?? false;
  }

  public onCancel(): void {
    this.close.emit(null);
  }

  public onSchedulerDateChange(date: Date): void {
    this.schedulerDate = date;
  }

  public onSchedulerViewModeChange(mode: ViewMode): void {
    this.schedulerViewMode = mode;
  }

  public onSelect(): void {
    const emp = this.employee();
    this.close.emit({
      employeeId: this.employeeId,
      name: emp?.name ?? '',
    });
  }

  // ── Private helpers ──

  /** Extract the Group By mode string from aw-select-menu value (may be object or string). */
  private _extractGroupByValue(val: any): GroupByMode {
    if (!val) return 'work';
    const raw = typeof val === 'object' ? (val.value ?? val.label ?? '') : val;
    if (raw === 'asset') return 'asset';
    return 'work';
  }

  /** Build an EventDetail for a CalendarEvent based on its type and the employee detail record. */
  private _buildEventDetail(event: CalendarEvent, eventType: CalendarEventType, detail?: MockEmployeeDetail): EventDetail {
    switch (eventType) {
      case 'assignment': {
        const taskId = event.id.replace('assignment-', '');
        let workOrderId = event.description ?? '';
        let taskDescription = event.title;
        let status = '';
        let hours = 0;
        if (detail) {
          for (const wo of detail.workOrders) {
            const task = wo.tasks.find(t => t.taskId === taskId);
            if (task) {
              workOrderId = wo.workOrderId;
              taskDescription = task.taskDescription;
              status = task.status;
              hours = task.estimatedHours;
              break;
            }
          }
        }
        return { type: 'assignment', workOrderId, taskId, taskDescription, status, hours };
      }
      case 'appointment': {
        return {
          type: 'appointment',
          title: event.title,
          startTime: event.startTime ? formatTime(event.startTime) : '',
          endTime: event.endTime ? formatTime(event.endTime) : '',
          description: event.description ?? '',
        };
      }
      case 'nwa': {
        return {
          type: 'nwa',
          nwaType: event.title,
          startTime: event.startTime ? formatTime(event.startTime) : '',
          endTime: event.endTime ? formatTime(event.endTime) : '',
          hours: parseFloat(event.description ?? '0') || 0,
        };
      }
    }
  }
}
