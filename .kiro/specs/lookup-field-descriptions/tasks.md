# Implementation Plan: Lookup Field Descriptions

## Overview

Add description text below all six lookup fields (Asset, Account, Operator, Department, Task, Financial Project Code) in both single-entry form and multi-entry table modes. Single-entry uses new signals + blur handlers + `<span>` elements. Multi-entry wires `lookupOnBlur` callbacks into existing `TableInputCellComponent` subtitle support. A shared `lookupField()` helper resolves values against mock data. All changes in `FE-528/fe-harness-FE-528/`.

## Tasks

- [x] 1. Add lookup helper, description signals, and blur handlers to component TS
  - [x] 1.1 Add `lookupField()` helper method to `add-usage-panel.component.ts`
    - Single method taking `(fieldName: string, value: string)` → `{ text: string; isError: boolean }`
    - Switch on fieldName: asset (match `assetSearchOptions()` by value), account/operator/department/financialProjectCode (match `MockDataService` signals by id), task (match `_taskLookupMap`)
    - Case-insensitive `.toLowerCase()` comparison, trim input
    - Empty/whitespace → `{ text: '', isError: false }`, no match → `{ text: 'NOT DEFINED', isError: true }`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1_

  - [x] 1.2 Add `_taskLookupMap` computed signal
    - `computed<{ id: string; name: string }[]>` with flat list of all 14 task IDs from the task search dialog data
    - _Requirements: 5.1, 10.1_

  - [x] 1.3 Add 12 description signals (6 fields × text + error)
    - `singleAssetDesc`, `singleAssetDescError`, `singleAccountDesc`, `singleAccountDescError`, `singleOperatorDesc`, `singleOperatorDescError`, `singleDepartmentDesc`, `singleDepartmentDescError`, `singleTaskDesc`, `singleTaskDescError`, `singleFpcDesc`, `singleFpcDescError`
    - All `signal<string>('')` / `signal<boolean>(false)`
    - _Requirements: 1.1–1.6, 2.1–2.5, 3.1–3.5, 4.1–4.5, 5.1–5.6, 6.1–6.5_

  - [x] 1.4 Add `onSingleFieldBlur(fieldName: string)` handler
    - Reads form value, calls `lookupField()`, sets the matching signal pair
    - _Requirements: 1.1–1.5, 2.1–2.5, 3.1–3.5, 4.1–4.5, 5.1–5.5, 6.1–6.5_

  - [x] 1.5 Update `onAssetSearchClose()` for single-entry asset description
    - After setting asset value from dialog, set `singleAssetDesc` / `singleAssetDescError`
    - _Requirements: 1.6_

  - [x] 1.6 Update `onTaskSearchClose()` for single-entry task description
    - After setting task value from dialog, call `lookupField('task', taskId)` and set `singleTaskDesc` / `singleTaskDescError`
    - _Requirements: 5.6_

- [x] 2. Add description spans to single-entry template and SCSS
  - [x] 2.1 Update `add-usage-panel.component.html` — add `(blur)` bindings and `<span>` elements
    - Add `(blur)="onSingleFieldBlur('asset')"` to Asset input, plus `@if (singleAssetDesc()) { <span class="aw-c-1 field-desc">{{ singleAssetDesc() }}</span> }` below the `field-with-icon` div
    - Repeat for account, operator, department, task, financialProjectCode
    - _Requirements: 1.1–1.6, 2.1–2.5, 3.1–3.5, 4.1–4.5, 5.1–5.6, 6.1–6.5, 12.1–12.4_

  - [x] 2.2 Update `add-usage-panel.component.scss` — add `.field-desc` class
    - `display: block; color: var(--system-text-text-secondary, #5b6670); margin-left: 2px;`
    - _Requirements: 12.1–12.4_

- [x] 3. Checkpoint — Single-entry descriptions
  - Ensure the app compiles. Verify: type `ACC-001` in Account → "General Maintenance" on blur; type `INVALID` → "NOT DEFINED"; clear field → description hidden. Repeat for all six fields. Ask the user if questions arise.

- [x] 4. Wire `lookupOnBlur` into multi-entry table column definitions
  - [x] 4.1 Update `buildColumnDef()` in `add-usage-panel.component.ts`
    - For account, operator, department, task, financialProjectCode columns: add `lookupOnBlur: (value: string) => this.lookupField('<fieldName>', value)` to `componentData`
    - `TableInputCellComponent` already handles `lookupOnBlur`, `localSubtitle`, and spacer display — no cell component changes needed
    - _Requirements: 7.1–7.4, 8.1–8.4, 9.1–9.4, 10.1–10.4, 11.1–11.4, 12.5–12.6_

- [x] 5. Checkpoint — Multi-entry descriptions
  - Ensure the app compiles. Verify: in multi-entry, type `OP-001` in Operator cell → "John Miller" on blur; type `INVALID` → "NOT DEFINED"; clear → spacer. Repeat for Account, Department, Task, Financial Project Code. Verify Asset column still works. Ask the user if questions arise.

- [x] 6. Update documentation
  - [x] 6.1 Update `MOCK-DATA-GUIDE.md`
    - Add "Lookup Field Descriptions" section documenting data sources per field (asset → `assetSearchOptions`, account → `MockDataService.accounts()`, etc.)
    - Add quick scenarios: match found, no match, empty field
    - _Requirements: 13.1, 13.3_

  - [x] 6.2 Update `README.md`
    - Add description behavior to the "Lookup Fields" section: blur resolves description, "NOT DEFINED" on mismatch, hidden when empty
    - _Requirements: 13.2_

- [ ]* 7. Write property tests for lookupField correctness
  - [ ]* 7.1 Write property test for valid ID lookup
    - **Property 1: Lookup returns correct description for valid IDs**
    - **Validates: Requirements 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1**
    - Jasmine loop, 100 iterations: random field type from 6 options, random valid ID from that field's mock data
    - Assert `lookupField(type, id)` returns `{ text: <expected name>, isError: false }`

  - [ ]* 7.2 Write property test for case-insensitive lookup
    - **Property 2: Lookup is case-insensitive**
    - **Validates: Requirements 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1**
    - Jasmine loop, 100 iterations: random field type, random valid ID with randomized casing (upper/lower/mixed)
    - Assert same description returned regardless of case

  - [ ]* 7.3 Write property test for invalid ID lookup
    - **Property 3: Lookup returns "NOT DEFINED" for invalid non-empty inputs**
    - **Validates: Requirements 1.3, 2.3, 3.3, 4.3, 5.3, 6.3, 7.3, 8.3, 9.3, 10.3, 11.3**
    - Jasmine loop, 100 iterations: random field type, random string guaranteed not in mock data
    - Assert `lookupField(type, invalidValue)` returns `{ text: 'NOT DEFINED', isError: true }`

  - [ ]* 7.4 Write property test for empty/whitespace input
    - **Property 4: Lookup returns empty for empty/whitespace input**
    - **Validates: Requirements 1.4, 1.5, 2.4, 2.5, 3.4, 3.5, 4.4, 4.5, 5.4, 5.5, 6.4, 6.5, 7.4, 8.4, 9.4, 10.4, 11.4**
    - Jasmine loop, 100 iterations: random field type, random whitespace-only string (spaces, tabs, empty)
    - Assert `lookupField(type, whitespace)` returns `{ text: '', isError: false }`

- [ ]* 8. Write unit tests for lookup field descriptions
  - [ ]* 8.1 Write unit tests for single-entry description rendering
    - Verify `<span class="aw-c-1 field-desc">` appears with correct text after blur
    - Verify span hidden when field empty
    - Verify dialog selection updates description signals
    - _Requirements: 1.1–1.6, 2.1–2.5, 3.1–3.5, 4.1–4.5, 5.1–5.6, 6.1–6.5, 12.1–12.4_

  - [ ]* 8.2 Write unit tests for multi-entry lookupOnBlur wiring
    - Verify `lookupOnBlur` callback present in column definitions for account, operator, department, task, financialProjectCode
    - Verify callback returns correct `{ text, isError }` shape
    - _Requirements: 7.1–7.4, 8.1–8.4, 9.1–9.4, 10.1–10.4, 11.1–11.4, 12.5–12.6_

- [x] 9. Final checkpoint
  - Ensure all tests pass and the app compiles cleanly. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation — checkpoint 3 after single-entry, checkpoint 5 after multi-entry
- Property tests validate the four correctness properties from the design document
- `TableInputCellComponent` already supports `lookupOnBlur` / `localSubtitle` — no cell component changes needed
- `TableAssetCellComponent` already implements the full description pattern for Asset in multi-entry — no changes needed
- Unit tests are last per project guidelines

---

## Property Coverage Matrix

| Property | Description | Task(s) | Status |
|----------|-------------|---------|--------|
| Property 1 | Lookup returns correct description for valid IDs | 7.1 | ✅ |
| Property 2 | Lookup is case-insensitive | 7.2 | ✅ |
| Property 3 | Lookup returns "NOT DEFINED" for invalid non-empty inputs | 7.3 | ✅ |
| Property 4 | Lookup returns empty for empty/whitespace input | 7.4 | ✅ |

**Coverage: 4/4 (100%)** ✅

### How to Use This Matrix

1. **During Task Creation**: Check this matrix to ensure every property has a task
2. **During Implementation**: Reference the property number in test comments
3. **During Review**: Verify all properties are tested before merging
4. **After Changes**: Update this matrix if properties or tasks change
