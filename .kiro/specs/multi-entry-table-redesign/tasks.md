# Implementation Plan: Multi-Entry Table Redesign

## Overview

Replace the existing custom HTML `<table>` in the multi-entry section with the CCL `<aw-table>` component. Four custom cell components are created (TableInputCellComponent, TableDateCellComponent, TableDateTimeCellComponent, TableSelectCellComponent). The action column uses `aw-table`'s built-in `TableCellTypes.ActionMenu` with `optionsMenuHandler`. Column definitions are a `computed()` signal driven by `mawoVisibleFields()`. Table data is a computed signal mapping FormGroups to flat objects. An Add Row bar with an outlined button sits below the table. All existing single-entry logic (masking, dialogs, display mode) is reused. All changes are in `FE-528/fe-harness-FE-528/`.

## Tasks

- [x] 1. Create custom cell components
  - [x] 1.1 Create `src/app/components/table-input-cell/table-input-cell.component.ts`
    - Standalone component with `input()` signals: `value`, `placeholder`, `readOnly`, `inputMode`, `ariaLabel`, `showSearchButton`, `onChange`, `onSearch`, `onKeydownHandler`
    - Template: `aw-form-field` wrapping `<input AwInput>` with optional `AwButtonIconOnly` search button
    - Inline styles: flex row with 4px gap
    - Import `AwFormFieldComponent`, `AwInputDirective`, `AwButtonIconOnlyDirective`, `AwIconComponent`
    - _Requirements: 1.2, 1.3, 3.1, 6.1, 6.4, 7.1, 7.2, 7.3, 10.1, 14.2_

  - [x] 1.2 Create `src/app/components/table-date-cell/table-date-cell.component.ts`
    - Standalone component with `input.required()` signal: `formControl` (FormControl)
    - Template: `aw-form-field` wrapping `aw-date-picker` with `AwButtonIconOnly` calendar button
    - Import `AwFormFieldComponent`, `AwDatePickerComponent`, `AwButtonIconOnlyDirective`, `AwIconComponent`, `ReactiveFormsModule`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 14.2_

  - [x] 1.3 Create `src/app/components/table-date-time-cell/table-date-time-cell.component.ts`
    - Standalone component with `input.required()` signal: `formControl` (FormControl), plus `timeFormat` and `ariaLabel` inputs
    - `timePlaceholder` computed signal based on `timeFormat()`
    - Template: `aw-date-time-picker` with `AwButtonIconOnly` calendar button
    - Import `AwDateTimePickerComponent`, `AwButtonIconOnlyDirective`, `AwIconComponent`, `ReactiveFormsModule`
    - _Requirements: 9.1, 9.2, 9.3, 14.2_

  - [x] 1.4 Create `src/app/components/table-select-cell/table-select-cell.component.ts`
    - Standalone component with `input.required()` signal: `formControl` (FormControl), plus `options`, `placeholder`, `ariaLabel` inputs
    - Template: `aw-select-menu` with `[singleSelectListItems]`, `[enableListReset]`, `[placeholder]`, `[formControl]`
    - Import `AwSelectMenuComponent`, `ReactiveFormsModule`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 14.2_

- [x] 2. Checkpoint
  - Ensure the app compiles with no errors after adding the four cell components. Ask the user if questions arise.

- [x] 3. Add `assetDescription` FormControl and multi-entry computed signals to AddUsagePanelComponent
  - [x] 3.1 Add `assetDescription` to `createRowFormGroup()`
    - Add `assetDescription: new FormControl<string | null>(null)` to the FormGroup
    - _Requirements: 4.1, 4.3, 4.4_

  - [x] 3.2 Add `multiEntryTableData` computed signal
    - Maps `multiEntryRows()` FormGroups to flat objects via `getRawValue()`, adding `_rowIndex` for callback targeting
    - _Requirements: 13.1, 14.1_

  - [x] 3.3 Add `multiEntryColumns` computed signal
    - Reads `mawoVisibleFields()` and builds `TableCellInput[]` array
    - Equipment column and Equipment Description column always included
    - Action column always last
    - Dynamic columns mapped from visible field names to `TableCellInput` definitions using `combineTemplate` and the four custom cell components
    - Uses `TableCellTypes.Custom` for editable cells, `TableCellTypes.Title` for read-only text (Equipment Description, Total Usage), `TableCellTypes.ActionMenu` for action column
    - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 10.2, 10.3, 14.1, 14.2, 14.3, 14.5_

  - [x] 3.4 Add `getMultiEntryRowActions` handler
    - Returns `TableActionMenu[]` with "Clear" and "Get Components" actions per row
    - Uses `_rowIndex` from row data for callback targeting
    - _Requirements: 11.5, 11.6_

  - [x] 3.5 Add cell interaction handler methods
    - `onMultiAssetSearch(rowIndex)` — sets `_activeMultiRowIndex`, opens asset search dialog
    - `onMultiTaskSearch(rowIndex)` — sets `_activeMultiRowIndex`, opens task search dialog
    - `onMultiLookup(rowIndex, fieldName)` — calls existing `onLookupPlaceholder(fieldName)`
    - `onMultiCellChange(rowIndex, fieldName, value)` — writes value to FormGroup control
    - `onMultiAction(rowIndex, action)` — "clear" resets row to defaults from `createRowFormGroup()`
    - Update `onAssetSearchClose` and `onTaskSearchClose` to handle multi-entry row targeting when `_activeMultiRowIndex` is set
    - _Requirements: 3.3, 3.4, 3.5, 6.2, 6.3, 6.5, 11.6, 13.2_

  - [x] 3.6 Update component imports
    - Import `TableInputCellComponent`, `TableDateCellComponent`, `TableDateTimeCellComponent`, `TableSelectCellComponent`
    - Import `TableActionMenu` from CCL if not already imported
    - Add all four cell components to the `imports` array
    - _Requirements: 14.2_

- [x] 4. Checkpoint
  - Ensure the app compiles with no errors after adding signals and handlers. Ask the user if questions arise.

- [x] 5. Replace multi-entry HTML table with aw-table and Add Row bar
  - [x] 5.1 Update `add-usage-panel.component.html`
    - Replace the entire `@if (entryMode() === 'multi')` block
    - New block: `<div class="multi-entry-section">` containing `<div class="table-responsive d-block">` wrapping `<aw-table>` with `[columnsDefinition]="multiEntryColumns()"`, `[tableData]="multiEntryTableData()"`, `[optionsMenuHandler]="getMultiEntryRowActions"`, `[enableStickyOptions]="true"`, `[tableOptions]="{ noDataPlaceholder: 'No usage rows.' }"`
    - Below the table: `<div class="add-row-bar">` with `<button AwButton [buttonType]="'outlined'" (click)="addRow()">` containing `<aw-icon [iconName]="'add'">` and `<span>Add Row</span>`
    - _Requirements: 1.1, 1.4, 1.5, 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3, 12.4, 14.1, 14.4_

  - [x] 5.2 Update `add-usage-panel.component.scss`
    - Replace the old `.multi-entry-table` block (custom HTML table styles) with minimal styles
    - Keep `.multi-entry-section { padding: 16px 0 80px; }` for bottom spacing
    - Keep `.add-row-bar { padding: 8px 0; }`
    - Add `::ng-deep` rules for cell width constraints: equipment cell min-width 180px / max-width 536px, lookup cell max-width 536px, meter cell width 180px
    - _Requirements: 3.2, 6.6, 7.6, 12.1_

- [x] 6. Checkpoint
  - Ensure the app compiles and the multi-entry table renders with aw-table. Verify column visibility changes with display mode toggle. Verify Add Row appends a new row. Ask the user if questions arise.

- [ ]* 7. Write property tests for multi-entry table correctness
  - [ ]* 7.1 Write property test for column visibility correctness
    - Create or add to `src/app/features/add-usage/add-usage-panel.component.spec.ts`
    - **Property 1: Column visibility correctness**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 10.2, 10.3, 14.5**
    - Jasmine loop, 100 iterations: random display mode, random work order type, random misc toggles
    - Assert `multiEntryColumns` contains Equipment + Action always, plus one column per visible field

  - [ ]* 7.2 Write property test for lookup field population format
    - **Property 2: Lookup field population format**
    - **Validates: Requirements 3.4, 6.3**
    - Jasmine loop, 100 iterations: random equipment ID/description, random task ID/description
    - Assert Equipment input populated as `"(${id}) ${description}"`, Task input as `"(${taskId}) ${taskDescription}"`

  - [ ]* 7.3 Write property test for total usage computation
    - **Property 3: Total usage computation**
    - **Validates: Requirements 7.4**
    - Jasmine loop, 100 iterations: random business/individual usage values (including null, zero, decimals)
    - Assert `getTotalUsage()` returns `(business + individual).toFixed(2)` with null treated as 0

  - [ ]* 7.4 Write property test for decimal mask correctness
    - **Property 4: Decimal mask correctness**
    - **Validates: Requirements 7.5**
    - Jasmine loop, 100 iterations: random input strings and key events
    - Assert `onMeterKeydown` allows only keystrokes producing `^\d*\.?\d{0,2}$`, navigation keys always allowed

  - [ ]* 7.5 Write property test for clear row resets to defaults
    - **Property 5: Clear row resets to defaults**
    - **Validates: Requirements 11.6**
    - Jasmine loop, 100 iterations: populate row with random values, execute "Clear" action
    - Assert every field matches `createRowFormGroup()` defaults

  - [ ]* 7.6 Write property test for add row appends with defaults
    - **Property 6: Add row appends with defaults**
    - **Validates: Requirements 12.3**
    - Jasmine loop, 100 iterations: start with random number of rows (1–10), call `addRow()`
    - Assert row count increased by 1, new row has default values

  - [ ]* 7.7 Write property test for multi-entry extraction completeness
    - **Property 7: Multi-entry extraction completeness**
    - **Validates: Requirements 13.3**
    - Jasmine loop, 100 iterations: populate random number of rows with random values, trigger `onAdd()`
    - Assert emitted `UsageEntryResult` has `mode: 'multi'`, entries length equals row count, each entry contains corresponding row values

- [x] 8. Final checkpoint
  - Ensure all tests pass and the app compiles cleanly. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The action column uses `aw-table`'s built-in `TableCellTypes.ActionMenu` with `optionsMenuHandler` — no custom component needed
- All existing single-entry logic (masking, dialogs, display mode) is reused without duplication

---

## Property Coverage Matrix

| Property | Description | Task(s) | Status |
|----------|-------------|---------|--------|
| Property 1 | Column visibility correctness | 7.1 | ✅ |
| Property 2 | Lookup field population format | 7.2 | ✅ |
| Property 3 | Total usage computation | 7.3 | ✅ |
| Property 4 | Decimal mask correctness | 7.4 | ✅ |
| Property 5 | Clear row resets to defaults | 7.5 | ✅ |
| Property 6 | Add row appends with defaults | 7.6 | ✅ |
| Property 7 | Multi-entry extraction completeness | 7.7 | ✅ |

**Coverage: 7/7 (100%)** ✅

### How to Use This Matrix

1. **During Task Creation**: Check this matrix to ensure every property has a task
2. **During Implementation**: Reference the property number in test comments
3. **During Review**: Verify all properties are tested before merging
4. **After Changes**: Update this matrix if properties or tasks change
