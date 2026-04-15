import { SingleSelectOption } from '@assetworks-llc/aw-component-lib';

/** Controls whether the Add Usage panel operates in Standard or MAWO mode. */
export type WorkOrderType = 'standard' | 'mawo';

/** Controls which fields are visible in the Add Usage panel. */
export type UsageDisplayMode = 'meter' | 'business' | 'both' | 'all';

/** Identifies a single field/column in the usage form/table. */
export type UsageField =
  | 'asset'
  | 'transactionDate'
  | 'hoursUsed'
  | 'startDateTime'
  | 'endDateTime'
  | 'meter1Begin'
  | 'meter2Begin'
  | 'meter1End'
  | 'meter2End'
  | 'meter1Validation'
  | 'meter2Validation'
  | 'account'
  | 'operator'
  | 'department'
  | 'task'
  | 'financialProjectCode'
  | 'businessUsage'
  | 'individualUsage'
  | 'totalUsage'
  | 'misc1'
  | 'misc2'
  | 'misc3'
  | 'misc4';

/** Fields visible in meter display mode. */
const METER_FIELDS: UsageField[] = [
  'transactionDate',
  'hoursUsed',
  'startDateTime',
  'endDateTime',
  'meter1Begin',
  'meter2Begin',
  'meter1End',
  'meter2End',
  'meter1Validation',
  'meter2Validation',
  'operator',
];

/** Fields visible in business display mode. */
const BUSINESS_FIELDS: UsageField[] = [
  'transactionDate',
  'businessUsage',
  'individualUsage',
  'totalUsage',
  'department',
  'task',
  'account',
  'financialProjectCode',
];

/** Fields visible in both (meter + business) display mode. */
const BOTH_FIELDS: UsageField[] = [
  ...METER_FIELDS,
  ...BUSINESS_FIELDS.filter(f => !METER_FIELDS.includes(f)),
];

/** Maps each display mode to its visible fields. */
export const DISPLAY_MODE_FIELDS: Record<UsageDisplayMode, UsageField[]> = {
  meter: METER_FIELDS,
  business: BUSINESS_FIELDS,
  both: BOTH_FIELDS,
  all: ['asset', ...BOTH_FIELDS, 'misc1', 'misc2', 'misc3', 'misc4'],
};

/** Display mode options for the WO Details floating selector. */
export const USAGE_DISPLAY_MODE_OPTIONS: SingleSelectOption[] = [
  { label: 'Meter Values Only', value: 'meter' },
  { label: 'Business Usage and Meter Values', value: 'both' },
  { label: 'Business Usage Only', value: 'business' },
  { label: 'All Values (incl. Misc Codes)', value: 'all' },
];

/** Time format options for the floating selector. */
export const TIME_FORMAT_OPTIONS: SingleSelectOption[] = [
  { label: '12 Hour', value: '12h' },
  { label: '24 Hour', value: '24h' },
];

/** Work order type options for the floating settings panel selector. */
export const WORK_ORDER_TYPE_OPTIONS: SingleSelectOption[] = [
  { label: 'Standard', value: 'standard' },
  { label: 'MAWO', value: 'mawo' },
];

/** Fields hidden when in MAWO mode, regardless of display mode. */
export const MAWO_HIDDEN_FIELDS: UsageField[] = [
  'startDateTime',
  'endDateTime',
  'department',
  'task',
  'financialProjectCode',
];

/** A single usage record. */
export interface UsageEntry {
  asset: string | null;
  transactionDate: string;
  hoursUsed: number | null;
  startDateTime: string | null;
  endDateTime: string | null;
  meter1Begin: string | null;
  meter2Begin: string | null;
  meter1End: string | null;
  meter2End: string | null;
  meter1Validation: string | null;
  meter2Validation: string | null;
  account: string | null;
  operator: string | null;
  department: string | null;
  task: string | null;
  financialProjectCode: string | null;
  businessUsage: number | null;
  individualUsage: number | null;
  misc1: string | null;
  misc2: string | null;
  misc3: string | null;
  misc4: string | null;
  reversal: boolean;
}

/** Payload emitted when the panel closes with data. */
export interface UsageEntryResult {
  mode: 'single' | 'multi';
  entries: UsageEntry[];
}

/** Mock operator for dropdown options. */
export interface MockOperator {
  id: string;
  name: string;
}

/** Mock department for dropdown options. */
export interface MockDepartment {
  id: string;
  name: string;
}

/** Mock account for dropdown options. */
export interface MockAccount {
  id: string;
  name: string;
}

/** Mock meter validation for dropdown options. */
export interface MockMeterValidation {
  id: string;
  name: string;
}

/** Mock financial project code for dropdown options. */
export interface MockFinancialProjectCode {
  id: string;
  name: string;
}

/** A child work order belonging to a MAWO parent. */
export interface MockMAWOChildWorkOrder {
  workOrderId: string;
  title: string;
  assetId: string;
  assetDescription: string;
  status: 'Open' | 'Work Finished';
  selected: boolean;
}

/** MAWO parent work order with its children. */
export interface MockMAWOParent {
  parentWorkOrderId: string;
  parentTitle: string;
  children: MockMAWOChildWorkOrder[];
}
