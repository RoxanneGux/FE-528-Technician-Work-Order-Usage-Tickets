# Implementation Plan: MAWO Add Usage

## Overview

Add Multi-Asset Work Order (MAWO) support to the existing Add Usage panel. Implementation covers: new types/interfaces, a `TableTextSubtextComponent`, mock data in `MockDataService`, a Work Order Type toggle on the floating settings panel, MAWO-specific form modifications (hidden fields, relabeled date, reversal toggle, entry mode suppression), and a Children Work Orders expansion panel with search/filter/table. All changes are in `FE-528/fe-harness-FE-528/`.

## Tasks

- [x] 1. Create TableTextSubtextComponent and add MAWO types to usage-entry.interface.ts
  - [x] 1.1 Create `src/app/components/table-text-subtext/table-text-subtext.component.ts`
    - Copy the exact implementation from `fe-harness-FE-3999/src/app/components/table-text-subtext/table-text-subtext.component.ts`
    - Standalone component with `input()` signals for `text` and `subText`
    - Inline template with `.title` and `.sub-title` spans, inline styles with `:host { display: flex; flex-direction: column; }`
    - _Requirements: 9.3_

  - [x] 1.2 Add MAWO types to `src/app/features/add-usage/usage-entry.interface.ts`
    - Add `WorkOrderType` type alias (`'standard' | 'mawo'`)
    - Add `WORK_ORDER_TYPE_OPTIONS: SingleSelectOption[]` constant with Standard and MAWO options
    - Add `MAWO_HIDDEN_FIELDS: UsageField[]` constant listing: `startDateTime`, `endDateTime`, `operator`, `department`, `task`, `financialProjectCode`
    - Add `MockMAWOChildWorkOrder` interface with fields: `workOrderId`, `title`, `assetId`, `assetDescription`, `status` (`'Open' | 'Work Finished'`), `selected`
    - Add `MockMAWOParent` interface with fields: `parentWorkOrderId`, `parentTitle`, `children: MockMAWOChildWorkOrder[]`
    - Add `reversal: boolean` to the `UsageEntry` interface
    - _Requirements: 1.3, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 2. Add MAWO mock data to MockDataService and update MOCK-DATA-GUIDE.md
  - [x] 2.1 Add MAWO signals to `src/app/services/mock-data.service.ts`
    - Import `MockMAWOParent` and `MockMAWOChildWorkOrder` from usage-entry.interface
    - Add `mawoParent` signal with parent WO ID, title, and 6 child work orders per design (CWO-001 through CWO-006)
    - Each child has unique asset ID/description, mix of 'Open' and 'Work Finished' statuses
    - Add `mawoChildWorkOrders` computed signal that returns `mawoParent().children`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 Update `MOCK-DATA-GUIDE.md` with MAWO section
    - Add MAWO Parent Work Order section with parent WO ID and title
    - Add Children Work Orders table (work order ID, title, asset ID, asset description, status)
    - Add MAWO quick scenarios (switch to MAWO mode, see children WOs, filter by status, search children, toggle reversal)
    - _Requirements: 1.6_

- [x] 3. Checkpoint
  - Ensure the app compiles with no errors after adding types and mock data. Ask the user if questions arise.

- [x] 4. Implement MAWO mode toggle and conditional logic in AddUsagePanelComponent
  - [x] 4.1 Add MAWO signals, computed properties, and handler methods to `add-usage-panel.component.ts`
    - Import new types: `WorkOrderType`, `WORK_ORDER_TYPE_OPTIONS`, `MAWO_HIDDEN_FIELDS`, `MockMAWOChildWorkOrder`
    - Import `TableTextSubtextComponent` from `../../components/table-text-subtext/table-text-subtext.component`
    - Import `AwExpansionPanelComponent`, `AwSearchComponent`, `AwTableComponent`, `AwCheckboxComponent`, `TableCellInput`, `TableCellTypes` from CCL
    - Add all new imports to the component's `imports` array
    - Add `workOrderType` signal defaulting to `'standard'`
    - Add `isMAWO` computed signal (`workOrderType() === 'mawo'`)
    - Add `mawoVisibleFields` computed signal that filters `MAWO_HIDDEN_FIELDS` from base `visibleFields()` when `isMAWO()` is true
    - Add `workOrderTypeOptions = WORK_ORDER_TYPE_OPTIONS`
    - Add `onWorkOrderTypeChange(event)` method — extract `.value` from emitted object (same pattern as `onTimeFormatChange`), default to `'standard'` for unrecognized values
    - Add `reversal` FormControl (`new FormControl<boolean>(false)`) to `createRowFormGroup()`
    - Update `extractEntry()` to include `reversal: v.reversal ?? false`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [x] 4.2 Add Children Work Orders filtering logic and table columns to `add-usage-panel.component.ts`
    - Add `childWOSearchText` signal (string, default `''`)
    - Add `childWOStatusFilter` signal (string, default `'All'`)
    - Add `childWOStatusOptions: SingleSelectOption[]` constant with All, Open, Work Finished
    - Add `filteredChildWorkOrders` computed signal — filter by status (unless 'All') AND search text (case-insensitive match on assetId, assetDescription, workOrderId, title)
    - Add `onChildWOSearch(event)` method to update `childWOSearchText`
    - Add `onChildWOStatusFilterChange(event)` method — extract `.value` from emitted object, update `childWOStatusFilter`
    - Add `childWOColumns: TableCellInput[]` with Checkbox, Asset (Custom with TableTextSubtextComponent), Work Order (Custom with TableTextSubtextComponent), Status (Title) columns per design
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 5. Update the template and styles for MAWO mode
  - [x] 5.1 Update `add-usage-panel.component.html` for MAWO conditional rendering
    - Replace all `visibleFields()` references with `mawoVisibleFields()` throughout the template
    - Add Work Order Type selector to the floating settings panel (below Time Format), using `aw-select-menu` with `workOrderTypeOptions`, `[ngModel]="workOrderType()"`, `(ngModelChange)="onWorkOrderTypeChange($event)"`
    - Wrap the entry mode toggle `<div class="entry-mode-toggle">` in `@if (!isMAWO())`
    - Change Transaction Date label to `{{ isMAWO() ? 'Usage Date' : 'Transaction Date' }}`
    - Add Reversal toggle (`aw-checkbox`) on the same row as Hours Used, wrapped in `@if (isMAWO())`
    - Add Children Work Orders `aw-expansion-panel` after the Misc fields section, wrapped in `@if (isMAWO())`, containing:
      - `aw-search` component for search input
      - `aw-select-menu` for status filter with `childWOStatusOptions`
      - `aw-table` with `childWOColumns` and `filteredChildWorkOrders()` data
      - Layout follows `.sr-search-row` / `.sr-table-container` pattern from FE-3999 reference
    - _Requirements: 2.1, 2.5, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 8.1, 8.2, 8.3, 9.1, 9.2, 9.3, 9.4_

  - [x] 5.2 Add MAWO styles to `add-usage-panel.component.scss`
    - Add `.sr-search-row` style (flex row with gap for search + filter)
    - Add `.sr-search-input` style (flex: 1 for search field)
    - Add `.sr-table-container` style (table wrapper)
    - Add `.reversal-toggle` style (alignment for checkbox on Hours Used row)
    - Add `.work-order-type-selector` style with `margin-top: 12px` (matching `.time-format-selector` pattern)
    - _Requirements: 9.1_

- [x] 6. Checkpoint
  - Ensure the app compiles and renders correctly in both Standard and MAWO modes. Verify Standard mode is unchanged. Ask the user if questions arise.

- [ ]* 7. Write property tests for MAWO filtering and field visibility
  - [ ]* 7.1 Write property test for combined filter correctness
    - Create `src/app/features/add-usage/add-usage-panel.component.spec.ts`
    - **Property 1: Combined filter correctness**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
    - Use Jasmine loop with 100 iterations
    - Each iteration: generate random child work orders (random statuses, IDs, descriptions, titles), pick random status filter ('All', 'Open', 'Work Finished'), pick random search string
    - Instantiate the component, set `_mockData.mawoChildWorkOrders` to the random data, set `childWOStatusFilter` and `childWOSearchText`
    - Assert `filteredChildWorkOrders()` contains only rows matching both criteria (no false inclusions, no false exclusions)
    - Tag: `// Feature: mawo-add-usage, Property 1: Combined filter correctness`

  - [ ]* 7.2 Write property test for MAWO field visibility correctness
    - Add to the same spec file
    - **Property 2: MAWO field visibility correctness**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7**
    - Use Jasmine loop with 100 iterations
    - Each iteration: pick random display mode ('meter', 'business', 'both', 'all'), pick random work order type ('standard', 'mawo')
    - Set `displayMode` and `workOrderType` on the component
    - When MAWO: assert `mawoVisibleFields()` contains no field from `MAWO_HIDDEN_FIELDS`
    - When Standard: assert `mawoVisibleFields()` equals `visibleFields()` exactly
    - Tag: `// Feature: mawo-add-usage, Property 2: MAWO field visibility correctness`

- [x] 8. Final checkpoint
  - Ensure all tests pass and the app compiles cleanly. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Standard mode must remain completely unchanged (Requirement 8)
- All `aw-select-menu` change handlers must extract `.value` from the emitted object (same pattern as existing `onTimeFormatChange`)

---

## Property Coverage Matrix

| Property | Description | Task(s) | Status |
|----------|-------------|---------|--------|
| Property 1 | Combined filter correctness | 7.1 | ✅ |
| Property 2 | MAWO field visibility correctness | 7.2 | ✅ |

**Coverage: 2/2 (100%)** ✅

### How to Use This Matrix

1. **During Task Creation**: Check this matrix to ensure every property has a task
2. **During Implementation**: Reference the property number in test comments
3. **During Review**: Verify all properties are tested before merging
4. **After Changes**: Update this matrix if properties or tasks change
