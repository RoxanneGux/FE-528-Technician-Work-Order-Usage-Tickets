# Requirements Document

## Introduction

The Add Usage panel is a full-width slide-in panel for the FE-528 harness Work Order Details page. It allows technicians to record equipment usage against a work order, supporting both single-entry (form) and multi-entry (table) modes. The panel follows the same PanelService pattern as the existing Employee Chooser panel. All data is mock — no API calls.

## Glossary

- **Add_Usage_Panel**: The full-width slide-in panel component opened via PanelService when the user taps "Add Usage" from the Work Order Details footer action menu.
- **Entry_Mode**: The currently active input mode — either "Single Entry" (form-based) or "Multi Entry" (table-based).
- **Usage_Entry**: A single usage record containing transaction date, hours used, operator, department, and task.
- **Single_Entry_Form**: A form layout displaying individual form fields for one Usage_Entry at a time.
- **Multi_Entry_Table**: A table layout displaying multiple Usage_Entry rows with inline editing, an add-row button, and per-row delete.
- **MockDataService**: The existing harness service that provides mock operators, departments, and tasks data.
- **PanelService**: The existing harness service that opens full-width overlay panels using Angular CDK Overlay.
- **Work_Order_Details_Page**: The existing page component that hosts the footer action bar with the "Add Usage" menu item.
- **Usage_Display_Mode**: A setting on the Work Order Details page that controls which usage fields/columns are visible in the Add Usage panel. Options: "Meter Values Only", "Business Usage and Meter Values", "Business Usage Only", "All Values".

## Requirements

### Requirement 1: Open Add Usage Panel

**User Story:** As a technician, I want to open the Add Usage panel from the Work Order Details page, so that I can record equipment usage against the work order.

#### Acceptance Criteria

1. WHEN the user taps "Add Usage" in the footer More actions menu, THE Add_Usage_Panel SHALL open as a full-width slide-in overlay using PanelService.
2. THE Add_Usage_Panel SHALL display a header with the title "Add Usage".
3. WHEN the Add_Usage_Panel opens, THE Entry_Mode SHALL default to "Single Entry".

### Requirement 2: Entry Mode Toggle

**User Story:** As a technician, I want to switch between single-entry and multi-entry modes, so that I can choose the most efficient way to record usage.

#### Acceptance Criteria

1. THE Add_Usage_Panel SHALL display a segmented toggle with two options: "Single Entry" and "Multi Entry".
2. WHEN the user selects "Single Entry", THE Add_Usage_Panel SHALL display the Single_Entry_Form.
3. WHEN the user selects "Multi Entry", THE Add_Usage_Panel SHALL display the Multi_Entry_Table.
4. THE Add_Usage_Panel SHALL visually indicate which Entry_Mode is currently active.

### Requirement 3: Single Entry Form

**User Story:** As a technician, I want to fill out a form with usage details, so that I can record a single usage entry.

#### Acceptance Criteria

1. THE Single_Entry_Form SHALL display the following fields: Transaction Date, Hours Used, Operator, Department, and Task.
2. THE Single_Entry_Form SHALL render Transaction Date as a date input field using aw-form-field.
3. THE Single_Entry_Form SHALL render Hours Used as a numeric text input field using aw-form-field.
4. THE Single_Entry_Form SHALL render Operator as a dropdown using aw-select-menu populated with mock operator data from MockDataService.
5. THE Single_Entry_Form SHALL render Department as a dropdown using aw-select-menu populated with mock department data from MockDataService.
6. THE Single_Entry_Form SHALL render Task as a dropdown using aw-select-menu populated with mock task data from MockDataService.
7. THE Single_Entry_Form SHALL default Transaction Date to today's date.

### Requirement 4: Multi Entry Table

**User Story:** As a technician, I want to add multiple usage entries in a table, so that I can efficiently record several usage records at once.

#### Acceptance Criteria

1. THE Multi_Entry_Table SHALL display columns for: Transaction Date, Hours Used, Operator, Department, Task, and a Delete action column.
2. WHEN the Multi_Entry_Table is first displayed, THE Multi_Entry_Table SHALL contain one empty row.
3. WHEN the user taps the "+ Add" button, THE Multi_Entry_Table SHALL append a new empty row to the table.
4. THE Multi_Entry_Table SHALL default the Transaction Date of each new row to today's date.
5. WHEN the user taps the delete button on a row, THE Multi_Entry_Table SHALL remove that row from the table.
6. THE Multi_Entry_Table SHALL use aw-table for rendering the table structure.
7. THE Multi_Entry_Table SHALL populate Operator, Department, and Task dropdowns with mock data from MockDataService.

### Requirement 5: Mock Data for Dropdowns

**User Story:** As a designer reviewing the harness, I want realistic dropdown options, so that I can validate the UI with representative data.

#### Acceptance Criteria

1. THE MockDataService SHALL expose a signal containing mock operator options with at least 3 entries, each having an id and name.
2. THE MockDataService SHALL expose a signal containing mock department options with at least 3 entries, each having an id and name.
3. THE MockDataService SHALL expose a signal containing mock task options derived from the existing work order tasks, each having a taskId and taskDescription.

### Requirement 6: Footer Action Bar

**User Story:** As a technician, I want Cancel and Add buttons in the panel footer, so that I can submit or discard my usage entries.

#### Acceptance Criteria

1. THE Add_Usage_Panel SHALL display a sticky footer action bar with "Cancel" and "Add" buttons using aw-action-bar.
2. WHEN the user taps "Cancel", THE Add_Usage_Panel SHALL close without returning data.
3. WHEN the user taps "Add" in Single Entry mode, THE Add_Usage_Panel SHALL close and return the single Usage_Entry to the Work_Order_Details_Page.
4. WHEN the user taps "Add" in Multi Entry mode, THE Add_Usage_Panel SHALL close and return all Usage_Entry rows to the Work_Order_Details_Page.

### Requirement 7: Panel Close and Result Handling

**User Story:** As a developer, I want the panel to return usage data on close, so that the Work Order Details page can process the result.

#### Acceptance Criteria

1. WHEN the Add_Usage_Panel closes with a result, THE Work_Order_Details_Page SHALL log the returned usage data to the console.
2. THE Add_Usage_Panel SHALL emit a close event with the usage data payload when the user taps "Add".
3. THE Add_Usage_Panel SHALL emit a close event with no payload when the user taps "Cancel".
4. THE Add_Usage_Panel SHALL follow the same PanelService open/close/result pattern as the Employee Chooser panel (EventEmitter-based close output, PanelService.open callback).

### Requirement 8: CCL Component Usage

**User Story:** As a designer, I want the panel to use the corporate component library exclusively, so that it matches the design system.

#### Acceptance Criteria

1. THE Add_Usage_Panel SHALL use aw-form-field and aw-form-field-label for all form field wrappers.
2. THE Add_Usage_Panel SHALL use aw-select-menu for all dropdown fields.
3. THE Add_Usage_Panel SHALL use aw-action-bar for the footer action bar.
4. THE Add_Usage_Panel SHALL use aw-divider for visual section separation.
5. THE Add_Usage_Panel SHALL use aw-button directives (AwButton) for all action buttons.
6. THE Add_Usage_Panel SHALL use aw-icon for the delete row icon button.
7. THE Add_Usage_Panel SHALL use aw-chip or a segmented button pattern for the Single Entry / Multi Entry toggle.

### Requirement 9: Usage Display Mode Settings

**User Story:** As a designer, I want a floating settings selector on the Work Order Details page that controls which usage fields are visible, so that I can demo different field configurations without changing code.

#### Acceptance Criteria

1. THE Work_Order_Details_Page SHALL display a floating aw-select-menu (settings selector) that allows the user to choose a Usage_Display_Mode.
2. THE settings selector SHALL offer four options: "Meter Values Only", "Business Usage and Meter Values", "Business Usage Only", and "All Values (incl. Misc Codes)".
3. THE settings selector SHALL default to "All Values (incl. Misc Codes)".
4. WHEN the Usage_Display_Mode is "Meter Values Only", THE Add_Usage_Panel SHALL show only meter-related fields (e.g., Hours Used, Transaction Date, Operator).
5. WHEN the Usage_Display_Mode is "Business Usage and Meter Values", THE Add_Usage_Panel SHALL show both business usage fields (Department, Task) and meter fields (Hours Used, Transaction Date, Operator).
6. WHEN the Usage_Display_Mode is "Business Usage Only", THE Add_Usage_Panel SHALL show only business usage fields (Department, Task, Transaction Date).
7. WHEN the Usage_Display_Mode is "All Values (incl. Misc Codes)", THE Add_Usage_Panel SHALL show all fields including any miscellaneous/custom code fields.
8. THE Usage_Display_Mode SHALL affect both the Single_Entry_Form fields and the Multi_Entry_Table columns.
9. THE Work_Order_Details_Page SHALL pass the current Usage_Display_Mode to the Add_Usage_Panel when opening it via PanelService.
