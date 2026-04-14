import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  MockOperator,
  MockDepartment,
  MockAccount,
  MockMeterValidation,
  MockFinancialProjectCode,
} from '../features/add-usage/usage-entry.interface';

export type {
  MockOperator,
  MockDepartment,
  MockAccount,
  MockMeterValidation,
  MockFinancialProjectCode,
} from '../features/add-usage/usage-entry.interface';

// ── Relative date helper ──

/**
 * Compute a Date relative to today with a specific time-of-day.
 * Pure function — no side effects, no dependency on Angular.
 *
 * @param dayOffset Number of days from today (0 = today, 1 = tomorrow, 7 = next week)
 * @param hours Hour of day (0–23)
 * @param minutes Minute of hour (0–59)
 * @returns A new Date set to today + dayOffset at the given hours:minutes
 */
export function computeRelativeDate(dayOffset: number, hours: number, minutes: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/** Map a hardcoded December 2024 day to a relative day offset from today. */
function dayToOffset(day: number): number {
  if (day === 10) return 0;       // today
  if (day === 11) return 1;       // tomorrow
  if (day === 12) return 3;
  if (day === 13) return 4;
  if (day === 14) return 5;
  if (day === 15) return 5;
  return 7;                       // Dec 16–20 → next week
}

/** Shift an ISO date string from a hardcoded Dec 2024 date to a relative offset, preserving time-of-day. */
function shiftDateString(isoDate: string): string {
  const d = new Date(isoDate);
  const day = d.getDate();
  const offset = dayToOffset(day);
  const shifted = computeRelativeDate(offset, d.getHours(), d.getMinutes());
  return shifted.toISOString();
}

/** Shift all date fields in an employee detail record to relative offsets. */
function shiftEmployeeDates(details: MockEmployeeDetail[]): MockEmployeeDetail[] {
  return details.map(emp => ({
    ...emp,
    appointments: emp.appointments.map(apt => ({
      ...apt,
      start: shiftDateString(apt.start),
      end: shiftDateString(apt.end),
    })),
    nonWorkActivities: (emp.nonWorkActivities ?? []).map(nwa => ({
      ...nwa,
      start: shiftDateString(nwa.start),
      end: shiftDateString(nwa.end),
    })),
  }));
}

// ── Work Order interfaces ──

export interface MockWorkOrder {
  locationId: string; year: number; number: number; status: string;
  jobType: string; jobTypeDescription: string; assetNumber: string;
  equipmentId: string; stationLocation: string; assetType: string;
  serviceStatus: string; openedDateTime: string; dueDateTime: string;
  contactName: string; contactPhone: string; operatorName: string;
  operatorPhone: string; attachmentsCount: number; notesCount: number;
  commentsCount: number;
}

export interface MockTask {
  taskId: string; taskDescription: string; estimatedHours: number;
  chargedHours: number; remainingHours: number; status: string;
  hasPMChecklist: boolean; serviceRequestId?: string;
}

export interface MockServiceRequest {
  serviceRequestId: string; description: string; priority: string;
  status: string; tasks: MockTask[];
}

export interface MockCurrentAssignment {
  employeeId: string; employeeName: string; taskId: string;
  taskDescription: string; startTime: string;
}

export interface MockCosts {
  laborTotal: number; partsTotal: number; commercialTotal: number; grandTotal: number;
}

export interface MockLaborPosting {
  postingId: string; employeeName: string; taskId: string;
  hours: number; date: string; timeCode: string;
}

export interface MockPartPosting {
  postingId: string; partNumber: string; description: string;
  quantity: number; unitCost: number; totalCost: number;
}

export interface MockCommercialPosting {
  postingId: string; vendor: string; description: string;
  amount: number; date: string;
}

export interface MockDelayCode {
  delayCodeId: string; description: string;
}

export interface MockPostings {
  labor: MockLaborPosting[];
  parts: MockPartPosting[];
  commercial: MockCommercialPosting[];
}

export interface WorkOrderData {
  workOrder: MockWorkOrder;
  costs: MockCosts;
  tasks: MockTask[];
  serviceRequests: MockServiceRequest[];
  postings: MockPostings;
  currentAssignments: MockCurrentAssignment[];
  delayCodes: MockDelayCode[];
}

// ── Employee interfaces ──

export interface MockCrewEmployee {
  employeeId: string; name: string; primaryCrewId: string;
  crewDescription: string; status: 'Available' | 'Busy'; isClockedIn: boolean;
  locationId?: string; shiftId?: string; skills?: string[];
}

export interface MockAdvancedEmployee {
  employeeId: string; name: string; isClockedIn: boolean; isJobbedOn: boolean;
}

export interface MockCrew {
  crewId: string; description: string;
}

export interface MockFilterOptions {
  locations: { id: string; name: string }[];
  shifts: { id: string; description: string }[];
  skills: { id: string; description: string }[];
  crews: MockCrew[];
}

export interface EmployeeData {
  crews: MockCrew[];
  crewEmployees: MockCrewEmployee[];
  advancedSearchEmployees: MockAdvancedEmployee[];
  filterOptions: MockFilterOptions;
  employeeDetails: MockEmployeeDetail[];
}

export interface SelectedEmployee {
  employeeId: string; name: string; sourceTab: 'crew' | 'advanced';
}

// ── Employee Detail interfaces ──

/** Time code summary for an employee's daily hours breakdown. */
export interface MockTimeCodeSummary {
  todaysTimesheet: number;
  capacityHours: number;
  nwaHours: number;
  hoursAvailable: number;
  assignedHours: number;
}

/** Location assignment for an employee. */
export interface MockEmployeeLocation {
  locationId: string;
  locationName: string;
  isDefault: boolean;
}

/** A task within a work order assigned to an employee. */
export interface MockEmployeeTask {
  taskId: string;
  taskDescription: string;
  estimatedHours: number;
  chargedHours: number;
  remainingHours: number;
  status: string;
}

/** A work order currently assigned to an employee. */
export interface MockEmployeeWorkOrder {
  workOrderId: string;
  description: string;
  status: string;
  priority: string;
  tasks: MockEmployeeTask[];
}

/** A non-work activity record for an employee (vacation, training, sick leave, etc.). */
export interface MockNonWorkActivity {
  id: string;
  type: string;
  start: string;
  end: string;
  hours: number;
}

/** A calendar appointment for an employee. */
export interface MockAppointment {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
}

/** Complete employee detail record with time codes, locations, work orders, appointments, and NWA. */
export interface MockEmployeeDetail {
  employeeId: string;
  timeCodeSummary: MockTimeCodeSummary;
  locations: MockEmployeeLocation[];
  workOrders: MockEmployeeWorkOrder[];
  indirectTasks: MockIndirectTask[];
  appointments: MockAppointment[];
  nonWorkActivities: MockNonWorkActivity[];
}

/** An indirect task not tied to a work order (e.g., sweeping, meetings, training). */
export interface MockIndirectTask {
  taskId: string;
  taskDescription: string;
  timePosted: number;
}

// ── Hardcoded fallback data ──

const FALLBACK_WORK_ORDER: WorkOrderData = {
  workOrder: {
    locationId: 'MAIN', year: 2024, number: 10542, status: 'Open',
    jobType: 'CM', jobTypeDescription: 'Corrective Maintenance',
    assetNumber: 'EQ-4821', equipmentId: 'PUMP-003',
    stationLocation: 'Building A - Floor 2', assetType: 'Centrifugal Pump',
    serviceStatus: 'In Service', openedDateTime: '2024-11-15T08:30:00',
    dueDateTime: '2024-12-01T17:00:00', contactName: 'Jane Smith',
    contactPhone: '(555) 123-4567', operatorName: 'Mike Johnson',
    operatorPhone: '(555) 987-6543', attachmentsCount: 3, notesCount: 5,
    commentsCount: 2
  },
  costs: { laborTotal: 1250.00, partsTotal: 875.50, commercialTotal: 450.00, grandTotal: 2575.50 },
  tasks: [
    { taskId: 'TSK-001', taskDescription: 'Inspect pump bearings and seals', estimatedHours: 2.0, chargedHours: 1.5, remainingHours: 0.5, status: 'In Progress', hasPMChecklist: true },
    { taskId: 'TSK-002', taskDescription: 'Replace worn impeller', estimatedHours: 4.0, chargedHours: 0, remainingHours: 4.0, status: 'Not Started', hasPMChecklist: false }
  ],
  serviceRequests: [
    { serviceRequestId: 'SR-001', description: 'Pump vibration exceeds threshold', priority: 'High', status: 'Open', tasks: [] }
  ],
  postings: {
    labor: [{ postingId: 'LP-001', employeeName: 'Robert Chen', taskId: 'TSK-001', hours: 1.5, date: '2024-11-18', timeCode: 'REG' }],
    parts: [{ postingId: 'PP-001', partNumber: 'BRG-2210', description: 'SKF Deep Groove Ball Bearing', quantity: 2, unitCost: 125.00, totalCost: 250.00 }],
    commercial: [{ postingId: 'CP-001', vendor: 'Precision Alignment Services', description: 'Laser alignment of motor-pump coupling', amount: 450.00, date: '2024-11-17' }]
  },
  currentAssignments: [
    { employeeId: 'EMP-101', employeeName: 'Robert Chen', taskId: 'TSK-001', taskDescription: 'Inspect pump bearings and seals', startTime: '2024-11-19T07:00:00' }
  ],
  delayCodes: [
    { delayCodeId: 'DLY-01', description: 'Waiting for Parts' },
    { delayCodeId: 'DLY-02', description: 'Equipment Unavailable' }
  ]
};

const FALLBACK_EMPLOYEES: EmployeeData = {
  crews: [
    { crewId: 'CRW-A', description: 'Maintenance Crew A' },
    { crewId: 'CRW-B', description: 'Maintenance Crew B' }
  ],
  crewEmployees: [
    { employeeId: 'EMP-101', name: 'Robert Chen', primaryCrewId: 'CRW-A', crewDescription: 'Maintenance Crew A', status: 'Busy', isClockedIn: true },
    { employeeId: 'EMP-102', name: 'Sarah Williams', primaryCrewId: 'CRW-A', crewDescription: 'Maintenance Crew A', status: 'Available', isClockedIn: true }
  ],
  advancedSearchEmployees: [
    { employeeId: 'EMP-101', name: 'Robert Chen', isClockedIn: true, isJobbedOn: true },
    { employeeId: 'EMP-102', name: 'Sarah Williams', isClockedIn: true, isJobbedOn: false }
  ],
  filterOptions: {
    locations: [{ id: 'LOC-01', name: 'Building A' }],
    shifts: [{ id: 'SH-1', description: 'Day Shift (7AM-3PM)' }],
    skills: [{ id: 'SK-01', description: 'Mechanical' }],
    crews: [{ crewId: 'CRW-A', description: 'Maintenance Crew A' }]
  },
  employeeDetails: [
    {
      employeeId: 'EMP-101',
      timeCodeSummary: { todaysTimesheet: 6.5, capacityHours: 8.0, nwaHours: 1.0, hoursAvailable: 0.5, assignedHours: 7.5 },
      locations: [
        { locationId: 'LOC-01', locationName: 'Building A', isDefault: true },
        { locationId: 'LOC-02', locationName: 'Building B', isDefault: false }
      ],
      workOrders: [
        {
          workOrderId: 'WO-2024-001', description: 'HVAC System Repair - Building A', status: 'In Progress', priority: 'High',
          tasks: [
            { taskId: 'TSK-101', taskDescription: 'Inspect compressor unit', estimatedHours: 2.0, chargedHours: 1.5, remainingHours: 0.5, status: 'In Progress' }
          ]
        }
      ],
      appointments: [
        { id: 'APT-001', title: 'Safety Training', start: '2024-12-10T09:00:00', end: '2024-12-10T11:00:00', color: '#4285f4' }
      ],
      indirectTasks: [
        { taskId: 'IDT-101', taskDescription: 'Shop floor sweeping', timePosted: 0.5 },
        { taskId: 'IDT-102', taskDescription: 'Safety meeting attendance', timePosted: 1.0 },
      ],
      nonWorkActivities: [
        { id: 'NWA-101', type: 'Training', start: '2024-12-10T13:00:00', end: '2024-12-10T15:00:00', hours: 2.0 },
        { id: 'NWA-102', type: 'Vacation', start: '2024-12-17T08:00:00', end: '2024-12-17T17:00:00', hours: 8.0 }
      ]
    },
    {
      employeeId: 'EMP-102',
      timeCodeSummary: { todaysTimesheet: 4.0, capacityHours: 8.0, nwaHours: 0.5, hoursAvailable: 3.5, assignedHours: 4.5 },
      locations: [
        { locationId: 'LOC-01', locationName: 'Building A', isDefault: true }
      ],
      workOrders: [
        {
          workOrderId: 'WO-2024-003', description: 'Electrical Panel Upgrade - Building A', status: 'In Progress', priority: 'High',
          tasks: [
            { taskId: 'TSK-201', taskDescription: 'Disconnect old panel', estimatedHours: 1.5, chargedHours: 1.5, remainingHours: 0.0, status: 'Completed' },
            { taskId: 'TSK-202', taskDescription: 'Install new breaker panel', estimatedHours: 3.0, chargedHours: 1.0, remainingHours: 2.0, status: 'In Progress' }
          ]
        }
      ],
      appointments: [
        { id: 'APT-003', title: 'Electrical Safety Certification', start: '2024-12-12T13:00:00', end: '2024-12-12T16:00:00', color: '#fbbc04' }
      ],
      indirectTasks: [
        { taskId: 'IDT-201', taskDescription: 'Tool inventory check', timePosted: 0.75 },
      ],
      nonWorkActivities: [
        { id: 'NWA-201', type: 'Sick Leave', start: '2024-12-11T08:00:00', end: '2024-12-11T17:00:00', hours: 8.0 },
        { id: 'NWA-202', type: 'Meeting', start: '2024-12-17T10:00:00', end: '2024-12-17T11:30:00', hours: 1.5 }
      ]
    }
  ]
};

const FALLBACK_OPERATORS: MockOperator[] = [
  { id: 'OP-001', name: 'John Miller' },
  { id: 'OP-002', name: 'Patricia Davis' },
  { id: 'OP-003', name: 'Thomas Wilson' },
];

const FALLBACK_DEPARTMENTS: MockDepartment[] = [
  { id: 'DEPT-001', name: 'Maintenance' },
  { id: 'DEPT-002', name: 'Operations' },
  { id: 'DEPT-003', name: 'Engineering' },
];

const FALLBACK_METER_VALIDATIONS: MockMeterValidation[] = [
  { id: 'UPDATE_TICKET', name: 'Update the ticket record' },
  { id: 'UPDATE_TRANSACTION', name: 'Update transaction only' },
  { id: 'UPDATE_TRANSACTION_FAIL', name: 'Update transaction only on fail' },
];

const FALLBACK_ACCOUNTS: MockAccount[] = [
  { id: 'ACC-001', name: 'General Maintenance' },
  { id: 'ACC-002', name: 'Capital Projects' },
  { id: 'ACC-003', name: 'Emergency Repairs' },
];

const FALLBACK_FINANCIAL_PROJECT_CODES: MockFinancialProjectCode[] = [
  { id: 'FPC-001', name: 'FY2026 Infrastructure' },
  { id: 'FPC-002', name: 'FY2026 Fleet Renewal' },
  { id: 'FPC-003', name: 'FY2026 Facility Upgrades' },
];

// ── Service ──

/**
 * Provides mock data for the harness app.
 * Loads JSON from assets/mocks/ via HttpClient, falls back to hardcoded TypeScript objects on error.
 */
@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly _http = inject(HttpClient);

  // Work order data
  public readonly workOrder = signal<MockWorkOrder>(FALLBACK_WORK_ORDER.workOrder);
  public readonly costs = signal<MockCosts>(FALLBACK_WORK_ORDER.costs);
  public readonly tasks = signal<MockTask[]>(FALLBACK_WORK_ORDER.tasks);
  public readonly serviceRequests = signal<MockServiceRequest[]>(FALLBACK_WORK_ORDER.serviceRequests);
  public readonly postings = signal<MockPostings>(FALLBACK_WORK_ORDER.postings);
  public readonly currentAssignments = signal<MockCurrentAssignment[]>(FALLBACK_WORK_ORDER.currentAssignments);
  public readonly delayCodes = signal<MockDelayCode[]>(FALLBACK_WORK_ORDER.delayCodes);

  // Employee data
  public readonly crews = signal<MockCrew[]>(FALLBACK_EMPLOYEES.crews);
  public readonly crewEmployees = signal<MockCrewEmployee[]>(FALLBACK_EMPLOYEES.crewEmployees);
  public readonly advancedSearchEmployees = signal<MockAdvancedEmployee[]>(FALLBACK_EMPLOYEES.advancedSearchEmployees);
  public readonly filterOptions = signal<MockFilterOptions>(FALLBACK_EMPLOYEES.filterOptions);
  public readonly employeeDetails = signal<MockEmployeeDetail[]>(shiftEmployeeDates(FALLBACK_EMPLOYEES.employeeDetails));

  // Usage data
  public readonly operators = signal<MockOperator[]>(FALLBACK_OPERATORS);
  public readonly departments = signal<MockDepartment[]>(FALLBACK_DEPARTMENTS);
  public readonly meterValidations = signal<MockMeterValidation[]>(FALLBACK_METER_VALIDATIONS);
  public readonly accounts = signal<MockAccount[]>(FALLBACK_ACCOUNTS);
  public readonly financialProjectCodes = signal<MockFinancialProjectCode[]>(FALLBACK_FINANCIAL_PROJECT_CODES);

  constructor() {
    this.loadWorkOrderData();
    this.loadEmployeeData();
  }

  private loadWorkOrderData(): void {
    this._http.get<WorkOrderData>('assets/mocks/work-order.json').subscribe({
      next: (data) => {
        this.workOrder.set(data.workOrder);
        this.costs.set(data.costs);
        this.tasks.set(data.tasks);
        this.serviceRequests.set(data.serviceRequests);
        this.postings.set(data.postings);
        this.currentAssignments.set(data.currentAssignments);
        this.delayCodes.set(data.delayCodes);
      },
      error: () => console.warn('MockDataService: Failed to load work-order.json, using fallback data')
    });
  }

  private loadEmployeeData(): void {
    this._http.get<EmployeeData>('assets/mocks/employees.json').subscribe({
      next: (data) => {
        this.crews.set(data.crews);
        this.crewEmployees.set(data.crewEmployees);
        this.advancedSearchEmployees.set(data.advancedSearchEmployees);
        this.filterOptions.set(data.filterOptions);
        this.employeeDetails.set(shiftEmployeeDates(data.employeeDetails));
      },
      error: () => console.warn('MockDataService: Failed to load employees.json, using fallback data')
    });
  }

  /** Look up an employee detail record by employee ID. */
  getEmployeeDetail(employeeId: string): MockEmployeeDetail | undefined {
    return this.employeeDetails().find(d => d.employeeId === employeeId);
  }
}