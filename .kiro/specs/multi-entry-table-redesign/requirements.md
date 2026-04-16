# Requirements Document

## Introduction

The Add Usage panel in the FE-528 harness supports two entry modes: Single Entry (form) and Multi Entry (table). The single-entry form is complete and polished with proper CCL components. The multi-entry table currently uses a basic HTML table with minimal fields and needs a complete redesign to match the Figma design (node 18129:4434), use the CCL `aw-table` component with `TableCellTypes.Custom` for editable cells, and support all columns controlled by the display mode toggle.

This redesign replaces the existing custom HTML table with an `aw-table` component. Editable cells use `TableCellTypes.Custom` with custom Angular components rendered inside each cell (form fields, date pickers, select menus, icon-only buttons). This approach gives us built-in dark/light mode theming, mobile responsiveness, and consistent CCL table styling for free.

## Glossary

- **Multi_Entry_Table**: The `aw-table` component rendered when the user selects "Multi Entry" mode, containing editable rows of usage data with custom cell components.
- **Custom_Cell_Component**: A standalone Angular component rendered inside an `aw-table` cell via `TableCellTypes.Custom` and `combineTemplate`, providing editable form inputs within the table.
- **Action_Column**: The rightmost column of the Multi_Entry_Table that is sticky (fixed to the right edge during horizontal scroll), contains an action menu button (three-dot icon), and has a left-side shadow to visually separate it from scrollable content.
- **Action_Menu**: A contextual menu triggered by the Action_Column button, presenting row-level actions such as "Clear" and "Get Components".
- **Add_Row_Bar**: A bar rendered below the Multi_Entry_Table with 8px padding, containing an outlined-style button with a "+" icon that appends a new empty row to the table.
- **Display_Mode_Toggle**: The floating settings panel selector that controls which columns are visible in both single-entry and multi-entry modes via the `mawoVisibleFields()` computed signal.
- **Lookup_Field**: A table cell containing a text input paired with an icon-only search button that opens a dialog or placeholder alert for record lookup (e.g., Equipment, Task, Operator, Account, Department, Financial Project Code).
- **Equipment_Description_Cell**: A read-only text cell in the Multi_Entry_Table that displays the asset description populated when an equipment asset is selected.
- **Meter_Field**: A numeric input cell with decimal mask (max 2 decimal places) and a `$00.00` or `0.00` placeholder, used for meter readings, hours, and usage values.
- **Validation_Dropdown**: An aw-select-menu dropdown cell with a "Choose Validation" placeholder, used for Meter 1 and Meter 2 validation selections.
- **Row_FormGroup**: An Angular `FormGroup` instance created by `createRowFormGroup()` that holds all field values for a single multi-entry row.
- **CCL**: The AssetWorks Component Library (`@assetworks-llc/aw-component-lib`) providing standardized UI components including `aw-table`.

## Requirements

### Requirement 1: Table Structure and Layout

**User Story:** As a user, I want the multi-entry table to use the CCL `aw-table` component with custom editable cells, so that I get built-in dark/light mode theming, mobile responsiveness, and consistent table styling.

#### Acceptance Criteria

1. WHEN the user selects "Multi Entry" mode, THE Multi_Entry_Table SHALL render using the `<aw-table>` component from `@assetworks-llc/aw-component-lib`.
2. THE Multi_Entry_Table SHALL define columns using `TableCellInput[]` with `TableCellTypes.Custom` for editable cells and `TableCellTypes.Title` for read-only text cells.
3. THE Multi_Entry_Table SHALL use `combineTemplate` on custom columns to render Custom_Cell_Components containing CCL form inputs (aw-form-field, AwInput, aw-select-menu, AwButtonIconOnly, etc.).
4. THE Multi_Entry_Table SHALL support horizontal scrolling via the `table-responsive d-block` wrapper pattern when the total column width exceeds the available viewport width.
5. THE Multi_Entry_Table SHALL initialize with exactly one empty row containing default values from `createRowFormGroup()`.

### Requirement 2: Column Visibility and Display Mode Integration

**User Story:** As a user, I want the multi-entry table columns to show and hide based on the display mode toggle, so that I see the same field visibility behavior as the single-entry form.

#### Acceptance Criteria

1. THE Multi_Entry_Table SHALL show or hide columns based on the fields returned by the `mawoVisibleFields()` computed signal.
2. WHEN the Display_Mode_Toggle value changes, THE Multi_Entry_Table SHALL immediately update column visibility to reflect the new set of visible fields.
3. WHEN the work order type is set to MAWO, THE Multi_Entry_Table SHALL hide columns for fields listed in `MAWO_HIDDEN_FIELDS` (startDateTime, endDateTime, department, task, financialProjectCode).
4. WHEN individual misc field toggles are turned off, THE Multi_Entry_Table SHALL hide the corresponding misc column (misc1, misc2, misc3, misc4).
5. THE Multi_Entry_Table SHALL always display the Equipment column and the Action_Column regardless of display mode.

### Requirement 3: Equipment Column

**User Story:** As a user, I want an Equipment column with a text input and search button, so that I can type an equipment ID or open the Asset Search dialog to find equipment.

#### Acceptance Criteria

1. THE Multi_Entry_Table SHALL render an Equipment column containing an aw-form-field with an AwInput text input and an AwButtonIconOnly search button with a "search" icon.
2. THE Equipment column input field SHALL have a minimum width of 180px and a maximum width of 536px.
3. WHEN the user clicks the search button in the Equipment column, THE Multi_Entry_Table SHALL open the Asset Search dialog (same dialog used by the single-entry form).
4. WHEN the user selects an asset from the Asset Search dialog, THE Multi_Entry_Table SHALL populate the Equipment input with the format "(EquipmentId) EquipmentDescription".
5. WHEN the user selects an asset from the Asset Search dialog, THE Multi_Entry_Table SHALL populate the Equipment_Description_Cell in the same row with the asset description text.

### Requirement 4: Equipment Description Column

**User Story:** As a user, I want a read-only Equipment Description column that shows the asset description, so that I can see the full description of the selected equipment.

#### Acceptance Criteria

1. THE Multi_Entry_Table SHALL render an Equipment Description column as a read-only text cell.
2. THE Equipment_Description_Cell SHALL allow text wrapping for long descriptions.
3. WHEN no equipment is selected for a row, THE Equipment_Description_Cell SHALL display empty content.
4. WHEN an equipment asset is selected, THE Equipment_Description_Cell SHALL display the asset description text from the selected asset.

### Requirement 5: Transaction Date Column

**User Story:** As a user, I want a Transaction Date column with a date picker and calendar button, so that I can enter or select a transaction date for each row.

#### Acceptance Criteria

1. THE Multi_Entry_Table SHALL render a Transaction Date column containing an aw-form-field with an aw-date-picker and an AwButtonIconOnly calendar button with a "today" icon.
2. THE Transaction Date column SHALL have a constrained width sufficient for the MM/DD/YYYY format, padding, and the calendar button.
3. THE Transaction Date column SHALL use the placeholder text "mm/dd/yyyy".
4. WHEN the user clicks the calendar button, THE aw-date-picker SHALL open its calendar overlay.
5. THE Transaction Date column SHALL default to today's date for new rows.

### Requirement 6: Lookup Field Columns (Task, Operator, Account, Department, Financial Project Code)

**User Story:** As a user, I want lookup field columns with text inputs and search buttons, so that I can type values or open lookup dialogs for Task, Operator, Account, Department, and Financial Project Code.

#### Acceptance Criteria

1. THE Multi_Entry_Table SHALL render a Task column containing an aw-form-field with an AwInput text input and an AwButtonIconOnly search button with a "search" icon.
2. WHEN the user clicks the Task search button, THE Multi_Entry_Table SHALL open the Task Lookup dialog (same dialog used by the single-entry form).
3. WHEN the user selects a task from the Task Lookup dialog, THE Multi_Entry_Table SHALL populate the Task input with the format "(TaskId) TaskDescription".
4. THE Multi_Entry_Table SHALL render Operator, Account, Department, and Financial Project Code columns each containing an aw-form-field with an AwInput text input and an AwButtonIconOnly search button with a "search" icon.
5. WHEN the user clicks the search button for Operator, Account, Department, or Financial Project Code, THE Multi_Entry_Table SHALL display a placeholder alert indicating the lookup dialog is not yet implemented (same behavior as the single-entry form).
6. THE Lookup_Field input fields SHALL have a maximum width of 536px.

### Requirement 7: Numeric and Meter Columns

**User Story:** As a user, I want numeric input columns for Hours Used, Meter readings, and Business/Individual Usage with decimal masking, so that I can enter numeric values with consistent formatting.

#### Acceptance Criteria

1. THE Multi_Entry_Table SHALL render a Hours Used column containing an aw-form-field with an AwInput text input, `inputmode="decimal"`, and placeholder "0.00".
2. THE Multi_Entry_Table SHALL render Meter 1 Begin, Meter 1 End, Meter 2 Begin, and Meter 2 End columns each containing an aw-form-field with an AwInput text input, `inputmode="decimal"`, and the decimal mask restricting input to numbers with up to 2 decimal places.
3. THE Multi_Entry_Table SHALL render Business Usage and Individual Usage columns each containing an aw-form-field with an AwInput text input, `inputmode="decimal"`, and placeholder "0.00".
4. THE Multi_Entry_Table SHALL render a Total Usage column as a read-only computed field displaying the sum of Business Usage and Individual Usage for that row, formatted to 2 decimal places.
5. WHEN the user types in any Meter_Field, THE Multi_Entry_Table SHALL restrict input to digits and one decimal point with a maximum of 2 decimal places (same `onMeterKeydown` behavior as the single-entry form).
6. THE Meter 1 column (standalone, from Figma) SHALL have a fixed width of 180px and use the placeholder "$00.00".

### Requirement 8: Validation Dropdown Columns

**User Story:** As a user, I want Meter 1 Validation and Meter 2 Validation dropdown columns, so that I can select a validation type for each meter reading.

#### Acceptance Criteria

1. THE Multi_Entry_Table SHALL render Meter 1 Validation and Meter 2 Validation columns each containing an aw-select-menu dropdown.
2. THE Validation_Dropdown SHALL display the placeholder text "Choose Validation".
3. THE Validation_Dropdown SHALL populate its options from the `meterValidationOptions()` computed signal.
4. THE Validation_Dropdown SHALL bind to the corresponding `meter1Validation` or `meter2Validation` FormControl in the Row_FormGroup.

### Requirement 9: Start/End Date-Time Columns

**User Story:** As a user, I want Start Date/Time and End Date/Time columns with date-time pickers, so that I can enter start and end timestamps when meter mode is active.

#### Acceptance Criteria

1. THE Multi_Entry_Table SHALL render Start Date/Time and End Date/Time columns each containing an aw-date-time-picker with a calendar button.
2. THE date-time picker columns SHALL use the `timeFormat` setting from the floating settings panel.
3. THE date-time picker columns SHALL use placeholder text "mm/dd/yyyy" for the date portion and "hh:mm AM/PM" or "hh:mm" for the time portion based on the active time format.

### Requirement 10: Misc Columns

**User Story:** As a user, I want Misc 1–4 text input columns that appear based on individual toggle settings, so that I can enter miscellaneous data when those fields are enabled.

#### Acceptance Criteria

1. THE Multi_Entry_Table SHALL render Misc 1, Misc 2, Misc 3, and Misc 4 columns each containing an aw-form-field with an AwInput text input.
2. WHEN a misc field toggle (showMisc1, showMisc2, showMisc3, showMisc4) is turned off, THE Multi_Entry_Table SHALL hide the corresponding misc column.
3. THE misc columns SHALL only be visible when the display mode is set to "all".

### Requirement 11: Sticky Action Column

**User Story:** As a user, I want a sticky action column on the right side of the table with a contextual menu, so that I can access row-level actions without scrolling horizontally.

#### Acceptance Criteria

1. THE Action_Column SHALL be the rightmost column of the Multi_Entry_Table and SHALL remain fixed (sticky) to the right edge when the table scrolls horizontally.
2. THE Action_Column header SHALL be empty (no label text).
3. THE Action_Column SHALL contain an AwButtonIconOnly button with the "more_horiz" icon (three-dot menu) for each row.
4. THE Action_Column SHALL have a left-side box shadow to visually separate it from the scrollable table content.
5. WHEN the user clicks the action menu button for a row, THE Action_Menu SHALL display the actions "Clear" and "Get Components".
6. WHEN the user selects "Clear" from the Action_Menu, THE Multi_Entry_Table SHALL reset all field values in that row to their defaults from `createRowFormGroup()`.

### Requirement 12: Add Row Action Bar

**User Story:** As a user, I want an Add Row button below the table, so that I can append new empty rows to the multi-entry table.

#### Acceptance Criteria

1. THE Add_Row_Bar SHALL render below the Multi_Entry_Table with 8px padding.
2. THE Add_Row_Bar SHALL contain a single button with outlined style, a "+" icon (add), and the label "Add Row".
3. WHEN the user clicks the "Add Row" button, THE Multi_Entry_Table SHALL append a new empty row with default values from `createRowFormGroup()`.
4. THE newly added row SHALL be immediately visible and editable.

### Requirement 13: Form Data Binding and Extraction

**User Story:** As a user, I want each table row to be backed by a reactive FormGroup, so that all entered data is captured and emitted when I click Add.

#### Acceptance Criteria

1. THE Multi_Entry_Table SHALL bind each row to a Row_FormGroup created by `createRowFormGroup()`.
2. THE Multi_Entry_Table SHALL use `formControlName` bindings for all input fields within each row.
3. WHEN the user clicks the "Add" button in the footer action bar while in multi-entry mode, THE Multi_Entry_Table SHALL extract all row data using the existing `extractEntry()` method and emit a `UsageEntryResult` with `mode: 'multi'` and the array of entries.

### Requirement 14: CCL Component Usage in Table Cells

**User Story:** As a user, I want all table cell inputs to use proper CCL components rendered via aw-table's custom cell mechanism, so that the multi-entry table has consistent look, feel, dark/light mode support, and mobile responsiveness.

#### Acceptance Criteria

1. THE Multi_Entry_Table SHALL use `<aw-table>` with `[columnsDefinition]` and `[tableData]` bindings.
2. THE Multi_Entry_Table SHALL use `TableCellTypes.Custom` with `combineTemplate` to render Custom_Cell_Components containing `<aw-form-field>`, `<input AwInput>`, `<aw-select-menu>`, `<button AwButtonIconOnly>`, `<aw-icon>`, `<aw-date-picker>`, and `<aw-date-time-picker>` inside table cells.
3. THE Multi_Entry_Table SHALL use `TableCellTypes.Title` for read-only text columns (Equipment Description, Total Usage).
4. THE Multi_Entry_Table SHALL inherit dark/light mode theming and mobile responsive behavior from the `aw-table` component automatically.
5. THE column definitions SHALL be dynamically computed based on `mawoVisibleFields()` so that columns appear and disappear as the display mode changes.
