# Implementation Plan: Add Usage Panel

## Overview

Implement the Add Usage panel for the FE-528 harness Work Order Details page. The panel supports single-entry (form) and multi-entry (table) modes, with a floating display mode selector on the WO Details page controlling field visibility. Follows the Employee Chooser panel pattern: PanelService lifecycle, signals + OnPush, CCL-first, reactive forms.

## Tasks

- [x] 1. Create interfaces and constants
  - [x] 1.1 Create `usage-entry.interface.ts` in `src/app/features/add-usage/`
    - Define `UsageDisplayMode`, `UsageField`, `UsageEntry`, `UsageEntryResult`, `MockOperator`, `MockDepartment` types
    - Define `DISPLAY_MODE_FIELDS` constant map and `USAGE_DISPLAY_MODE_OPTIONS` array
    - _Requirements: 3.1, 4.1, 9.2, 9.4, 9.5, 9.6, 9.7_

- [x] 2. Add mock data to MockDataService
  - [x] 2.1 Add `MockOperator` and `MockDepartment` interfaces and signals to `mock-data.service.ts`
    - Add `operators` signal with at least 3 mock operator entries (id + name)
    - Add `departments` signal with at least 3 mock department entries (id + name)
    - Add hardcoded fallback data matching the pattern of existing signals
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 3. Implement AddUsagePanelComponent
  - [x] 3.1 Create `add-usage-panel.component.ts` (standalone, OnPush)
    - `close` output emitting `UsageEntryResult | null`
    - `displayMode` property set via PanelService `Object.assign` (default `'all'`)
    - `entryMode` writable signal defaulting to `'single'`
    - `singleEntryForm` FormGroup with transactionDate (today), hoursUsed, operator, department, task
    - `multiEntryRows` writable signal of FormGroup[] (initialized with one row)
    - `visibleFields` computed signal derived from `displayMode` via `DISPLAY_MODE_FIELDS`
    - `operatorOptions`, `departmentOptions`, `taskOptions` computed signals from MockDataService
    - `toggleEntryMode()`, `addRow()`, `removeRow(index)`, `onAdd()`, `onCancel()` methods
    - Import all required CCL components: aw-form-field, aw-select-menu, aw-action-bar, aw-divider, aw-chip, aw-icon, aw-table, AwButtonDirective
    - Follow Employee Chooser panel pattern for PanelService lifecycle
    - _Requirements: 1.2, 1.3, 2.1, 2.4, 3.1, 3.7, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 6.4, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [x] 3.2 Create `add-usage-panel.component.html`
    - Header with aw-divider title "Add Usage"
    - Segmented toggle (aw-chip pattern) for Single Entry / Multi Entry
    - Single Entry Form section: aw-form-field wrappers with date input, numeric input, aw-select-menu dropdowns
    - Multi Entry Table section: aw-table with inline form controls, "+ Add" button, per-row delete icon button
    - Conditionally show/hide fields based on `visibleFields` computed signal
    - Sticky footer aw-action-bar with Cancel and Add buttons
    - _Requirements: 1.2, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.6, 4.7, 6.1, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 3.3 Create `add-usage-panel.component.scss`
    - Panel-specific styles (full-width overlay, sticky footer positioning)
    - Follow existing Employee Chooser panel SCSS patterns
    - _Requirements: 8.1_

- [x] 4. Checkpoint — Verify panel renders standalone
  - Ensure the panel component compiles without errors. Ask the user if questions arise.

- [x] 5. Wire Work Order Details page
  - [x] 5.1 Add floating Usage Display Mode selector to WorkOrderDetailsComponent
    - Add `usageDisplayMode` writable signal (default `'all'`)
    - Add `displayModeOptions` using `USAGE_DISPLAY_MODE_OPTIONS`
    - Render floating aw-select-menu in the template
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 5.2 Wire "Add Usage" action to open the panel
    - Create `onAddUsage()` method calling `PanelService.open(AddUsagePanelComponent, { displayMode })`
    - Console.log returned usage data in the onClose callback
    - Update `moreActions` array to call `onAddUsage()` instead of `console.log`
    - _Requirements: 1.1, 7.1, 9.9_

- [x] 6. Update MOCK-DATA-GUIDE.md
  - Add Operators section documenting mock operator entries (id, name)
  - Add Departments section documenting mock department entries (id, name)
  - Add Usage Display Modes section documenting the four mode options and their visible fields
  - Add Add Usage Panel section to Quick Scenarios (open panel, switch modes, add rows, change display mode)
  - _Requirements: 5.1, 5.2_

- [x] 7. Checkpoint — Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 8. Unit tests
  - [ ]* 8.1 Write unit tests for AddUsagePanelComponent
    - Test default entry mode is 'single'
    - Test default transaction date is today
    - Test display mode defaults to 'all' when not provided
    - Test entry mode toggle switches views
    - Test addRow appends a row, removeRow removes correct row
    - Test onAdd emits correct UsageEntryResult for single and multi modes
    - Test onCancel emits null
    - Test CCL component usage in template
    - _Requirements: 1.3, 2.2, 2.3, 3.7, 4.3, 4.5, 6.2, 6.3, 6.4, 7.2, 7.3_

  - [ ]* 8.2 Write unit tests for WorkOrderDetailsComponent (Add Usage integration)
    - Test floating selector renders with four options
    - Test "Add Usage" menu item calls onAddUsage
    - Test onAddUsage opens panel with current display mode
    - Test onClose callback logs result to console
    - _Requirements: 1.1, 7.1, 9.1, 9.2, 9.3, 9.9_

  - [ ]* 8.3 Write unit tests for MockDataService (operators and departments)
    - Test operators signal has at least 3 entries with id and name
    - Test departments signal has at least 3 entries with id and name
    - _Requirements: 5.1, 5.2_

  - [ ]* 8.4 Write property test: Adding a row increases row count by exactly one
    - **Property 1: Adding a row increases row count by exactly one**
    - Generate random row counts (0–50), call addRow(), verify count = N + 1
    - 100 iterations with random data
    - **Validates: Requirements 4.3**

  - [ ]* 8.5 Write property test: New rows default to today's date
    - **Property 2: New rows default to today's date**
    - Generate random sequences of addRow() calls (1–20), verify each new row has today's date
    - 100 iterations with random data
    - **Validates: Requirements 4.4**

  - [ ]* 8.6 Write property test: Removing a row decreases count and removes the correct row
    - **Property 3: Removing a row decreases count and removes the correct row**
    - Generate random row counts (1–50) and random valid indices, call removeRow(), verify count = N − 1 and correct row removed
    - 100 iterations with random data
    - **Validates: Requirements 4.5**

  - [ ]* 8.7 Write property test: Single-entry Add emits correct data
    - **Property 4: Single-entry Add emits correct data**
    - Generate random valid form values, call onAdd() in single mode, verify emitted result matches
    - 100 iterations with random data
    - **Validates: Requirements 6.3**

  - [ ]* 8.8 Write property test: Multi-entry Add emits all rows
    - **Property 5: Multi-entry Add emits all rows**
    - Generate random row counts (1–20) with random form values, call onAdd() in multi mode, verify emitted result matches all rows
    - 100 iterations with random data
    - **Validates: Requirements 6.4**

  - [ ]* 8.9 Write property test: Display mode controls visible fields consistently
    - **Property 6: Display mode controls visible fields consistently**
    - For each of the 4 display modes, verify visibleFields matches DISPLAY_MODE_FIELDS mapping
    - 100 iterations with random data
    - **Validates: Requirements 9.4, 9.5, 9.6, 9.7, 9.8, 9.9**

- [x] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All work is in `fe-harness-FE-528/` directory
- Follow Employee Chooser panel as the reference pattern for PanelService lifecycle
- No ADRs apply — this is a harness/prototype app

---

## Property Coverage Matrix

| Property | Description | Task(s) | Status |
|----------|-------------|---------|--------|
| Property 1 | Adding a row increases row count by exactly one | 8.4 | ✅ |
| Property 2 | New rows default to today's date | 8.5 | ✅ |
| Property 3 | Removing a row decreases count and removes the correct row | 8.6 | ✅ |
| Property 4 | Single-entry Add emits correct data | 8.7 | ✅ |
| Property 5 | Multi-entry Add emits all rows | 8.8 | ✅ |
| Property 6 | Display mode controls visible fields consistently | 8.9 | ✅ |

**Coverage: 6/6 (100%)** ✅

### How to Use This Matrix

1. **During Task Creation**: Check this matrix to ensure every property has a task
2. **During Implementation**: Reference the property number in test comments
3. **During Review**: Verify all properties are tested before merging
4. **After Changes**: Update this matrix if properties or tasks change
