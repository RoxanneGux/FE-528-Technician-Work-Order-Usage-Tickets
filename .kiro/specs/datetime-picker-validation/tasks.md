# Implementation Plan: DateTime Picker Validation

## Overview

Add input masking, 12h/24h time format toggling, and blur-based validation to the `aw-date-time-picker` fields in the Add Usage panel. All work modifies existing files — no new components created.

## Tasks

- [x] 1. Add time format infrastructure to WorkOrderDetailsComponent and usage-entry.interface.ts
  - [x] 1.1 Add `TIME_FORMAT_OPTIONS` constant to `usage-entry.interface.ts`
    - Add `TIME_FORMAT_OPTIONS: SingleSelectOption[]` with `'12 Hour'/'12h'` and `'24 Hour'/'24h'` entries
    - File: `src/app/features/add-usage/usage-entry.interface.ts`
    - _Requirements: 3.2_

  - [x] 1.2 Add time format property and floating selector to WorkOrderDetailsComponent
    - Add `public timeFormat: '12h' | '24h' = '12h'` property
    - Add `public readonly timeFormatOptions = TIME_FORMAT_OPTIONS` property
    - Import `TIME_FORMAT_OPTIONS` from `usage-entry.interface`
    - Update template: add a Time Format `aw-select-menu` inside `.floating-display-mode`, styled identically to the existing Usage Display Mode selector
    - Add `<aw-form-field-label>Time Format</aw-form-field-label>` and `<aw-select-menu>` bound to `timeFormat` with `[(ngModel)]`
    - Files: `src/app/features/work-order-details/work-order-details.component.ts`, `src/app/features/work-order-details/work-order-details.component.html`
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 1.3 Pass `timeFormat` through PanelService to AddUsagePanelComponent
    - Update `onAddUsage()` in WorkOrderDetailsComponent to include `timeFormat: this.timeFormat` in the PanelService.open input data
    - Add `public timeFormat: '12h' | '24h' = '12h'` property to AddUsagePanelComponent (set by PanelService via Object.assign)
    - File: `src/app/features/work-order-details/work-order-details.component.ts`, `src/app/features/add-usage/add-usage-panel.component.ts`
    - _Requirements: 3.4, 3.5_

- [x] 2. Bind timeFormat and update placeholders on date-time pickers
  - Add `[timeFormat]="timeFormat"` binding to both `aw-date-time-picker` instances in the template
  - Update `[placeholder]` time portion: use `'hh:mm AM/PM'` when `timeFormat === '12h'`, `'hh:mm'` when `'24h'`
  - File: `src/app/features/add-usage/add-usage-panel.component.html`
  - _Requirements: 3.6, 3.7, 3.8_

- [x] 3. Checkpoint
  - Ensure the app compiles and the time format toggle renders correctly. Ask the user if questions arise.

- [x] 4. Implement input masking on date and time fields
  - [x] 4.1 Add `onDateKeydown` method to AddUsagePanelComponent
    - Allow only digits (`0-9`), forward slash (`/`), and navigation keys (`Backspace`, `Tab`, `ArrowLeft`, `ArrowRight`, `Delete`, `Home`, `End`)
    - Prevent all other characters via `event.preventDefault()`
    - File: `src/app/features/add-usage/add-usage-panel.component.ts`
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 4.2 Add `onTimeKeydown` method to AddUsagePanelComponent
    - When `timeFormat === '24h'`: allow digits, colon (`:`), and navigation keys
    - When `timeFormat === '12h'`: allow digits, colon, letters `A/M/P` (case-insensitive), space, and navigation keys
    - Prevent all other characters via `event.preventDefault()`
    - File: `src/app/features/add-usage/add-usage-panel.component.ts`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 4.3 Attach keydown handlers to date-time picker inputs in the template
    - Use `(keydown)` on the date and time input elements within each `aw-date-time-picker` — access via `#startDateTimePicker` and `#endDateTimePicker` template refs and `@ViewChild` / `AfterViewInit` to bind `keydown` listeners on the internal date and time `<input>` elements
    - Alternatively, if the CCL exposes `(dateKeydown)` / `(timeKeydown)` outputs, use those
    - File: `src/app/features/add-usage/add-usage-panel.component.ts`, `src/app/features/add-usage/add-usage-panel.component.html`
    - _Requirements: 1.4, 2.5_

  - [ ]* 4.4 Write property test for date input mask (Property 1)
    - **Property 1: Date mask allows only digits and slash**
    - Generate 100 random printable characters; verify `onDateKeydown` allows only `0-9` and `/`, blocks all others
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 4.5 Write property test for time mask in 24h mode (Property 2)
    - **Property 2: Time mask in 24h mode allows only digits and colon**
    - Generate 100 random printable characters with `timeFormat='24h'`; verify `onTimeKeydown` allows only `0-9` and `:`, blocks all others
    - **Validates: Requirements 2.1, 2.3**

  - [ ]* 4.6 Write property test for time mask in 12h mode (Property 3)
    - **Property 3: Time mask in 12h mode allows digits, colon, AM/PM letters, and space**
    - Generate 100 random printable characters with `timeFormat='12h'`; verify `onTimeKeydown` allows `0-9`, `:`, `A/M/P/a/m/p`, and space, blocks all others
    - **Validates: Requirements 2.2, 2.3**

- [x] 5. Implement blur validation and error state management
  - [x] 5.1 Add validation error signals to AddUsagePanelComponent
    - Add four `signal<string | null>(null)` properties: `startDateError`, `startTimeError`, `endDateError`, `endTimeError`
    - These initialize to `null` (no errors on panel open)
    - File: `src/app/features/add-usage/add-usage-panel.component.ts`
    - _Requirements: 7.3, 7.4_

  - [x] 5.2 Add `validateDate` method to AddUsagePanelComponent
    - Empty string → return `null`
    - Does not match `/^\d{2}\/\d{2}\/\d{4}$/` → return `"Invalid date format. Use MM/DD/YYYY"`
    - Matches format but invalid calendar date (month not 1-12, day exceeds month max, leap year check) → return `"Invalid date"`
    - Valid → return `null`
    - File: `src/app/features/add-usage/add-usage-panel.component.ts`
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [x] 5.3 Add `validateTime` method to AddUsagePanelComponent
    - Accept `value: string` and `format: '12h' | '24h'`
    - Empty string → return `null`
    - 12h mode: does not match `/^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM|am|pm)$/` → return `"Invalid time. Use HH:MM AM/PM (1-12)"`
    - 24h mode: does not match `/^([01]?\d|2[0-3]):[0-5]\d$/` → return `"Invalid time. Use HH:MM (0-23)"`
    - Valid → return `null`
    - File: `src/app/features/add-usage/add-usage-panel.component.ts`
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [x] 5.4 Add blur handler methods and attach to template
    - Add `onStartDateBlur`, `onStartTimeBlur`, `onEndDateBlur`, `onEndTimeBlur` methods
    - Each reads the input value, calls `validateDate` or `validateTime`, and sets the corresponding error signal
    - Attach blur handlers to the date/time inputs within each `aw-date-time-picker` (same approach as keydown — via `@ViewChild` / `AfterViewInit` or CCL outputs)
    - File: `src/app/features/add-usage/add-usage-panel.component.ts`, `src/app/features/add-usage/add-usage-panel.component.html`
    - _Requirements: 4.1, 5.1, 6.2, 6.3_

  - [x] 5.5 Project error messages into date-time picker templates
    - Import `AwFormMessageComponent` in AddUsagePanelComponent
    - For each `aw-date-time-picker`, add conditional `aw-form-message[type=error]` content child:
      ```html
      @if (startDateError() || startTimeError()) {
        <aw-form-message [type]="'error'">
          {{ startDateError() || startTimeError() }}
        </aw-form-message>
      }
      ```
    - Same pattern for end date/time picker with `endDateError` / `endTimeError`
    - File: `src/app/features/add-usage/add-usage-panel.component.html`, `src/app/features/add-usage/add-usage-panel.component.ts`
    - _Requirements: 4.6, 5.6, 6.1, 7.1, 7.2_

  - [ ]* 5.6 Write property test for date validation (Property 4)
    - **Property 4: Date validation classifies all non-empty strings correctly**
    - Generate 100 random strings in MM/DD/YYYY-like patterns; verify `validateDate` returns correct error message or null
    - **Validates: Requirements 4.2, 4.3, 4.5**

  - [ ]* 5.7 Write property test for 12h time validation (Property 5)
    - **Property 5: 12h time validation classifies all non-empty strings correctly**
    - Generate 100 random time-like strings; verify `validateTime(value, '12h')` returns correct error or null
    - **Validates: Requirements 5.2, 5.5**

  - [ ]* 5.8 Write property test for 24h time validation (Property 6)
    - **Property 6: 24h time validation classifies all non-empty strings correctly**
    - Generate 100 random time-like strings; verify `validateTime(value, '24h')` returns correct error or null
    - **Validates: Requirements 5.3, 5.5**

  - [ ]* 5.9 Write property test for error clearing on valid input (Property 7)
    - **Property 7: Valid input clears error state on blur**
    - For each field, set an error signal, then call the blur handler with a valid value; verify the error signal becomes null
    - **Validates: Requirements 6.2, 6.3**

  - [ ]* 5.10 Write property test for validation state independence (Property 8)
    - **Property 8: Validation errors are independent across fields**
    - For 100 random combinations, set an error on one field and verify no other field's error signal changes
    - **Validates: Requirements 7.1, 7.2**

- [x] 6. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The `aw-date-time-picker` CCL component handles internal time display — we just pass `[timeFormat]` and project error messages
- No new components are created — all modifications are to existing files
- No API calls — this is a harness app with mock data
- Property tests use Jasmine loops (100 iterations with random data), per project testing guidelines

---

## Property Coverage Matrix

This matrix ensures all correctness properties from the design document have corresponding implementation tasks:

| Property | Description | Task(s) | Status |
|----------|-------------|---------|--------|
| Property 1 | Date mask allows only digits and slash | 4.4 | ✅ |
| Property 2 | Time mask in 24h mode allows only digits and colon | 4.5 | ✅ |
| Property 3 | Time mask in 12h mode allows digits, colon, AM/PM letters, and space | 4.6 | ✅ |
| Property 4 | Date validation classifies all non-empty strings correctly | 5.6 | ✅ |
| Property 5 | 12h time validation classifies all non-empty strings correctly | 5.7 | ✅ |
| Property 6 | 24h time validation classifies all non-empty strings correctly | 5.8 | ✅ |
| Property 7 | Valid input clears error state on blur | 5.9 | ✅ |
| Property 8 | Validation errors are independent across fields | 5.10 | ✅ |

**Coverage: 8/8 (100%)** ✅

### How to Use This Matrix

1. **During Task Creation**: Check this matrix to ensure every property has a task
2. **During Implementation**: Reference the property number in test comments
3. **During Review**: Verify all properties are tested before merging
4. **After Changes**: Update this matrix if properties or tasks change
