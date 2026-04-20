/** A single component entry in the mock data. */
export interface ComponentEntry {
  assetId: string;
  assetDescription: string;
}

/** Mock data defining which assets have components and sub-components. */
export const COMPONENT_MOCK_DATA: Record<string, ComponentEntry[]> = {
  'R-12345': [
    { assetId: 'COMP-A', assetDescription: 'FRONT AXLE ASSEMBLY' },
    { assetId: 'COMP-B', assetDescription: 'REAR DIFFERENTIAL' },
  ],
  'EQ-4821': [
    { assetId: 'COMP-C', assetDescription: 'IMPELLER SHAFT' },
    { assetId: 'COMP-D', assetDescription: 'BEARING HOUSING' },
  ],
  // Sub-component: COMP-A has a sub-component
  'COMP-A': [
    { assetId: 'SUB-A1', assetDescription: 'WHEEL HUB LEFT' },
  ],
};

/** Fields copied from parent row to component row on insertion. */
export const INHERITED_FIELDS: string[] = [
  'asset',
  'assetDescription',
  'operator',
  'department',
  'account',
  'financialProjectCode',
  'transactionDate',
];
