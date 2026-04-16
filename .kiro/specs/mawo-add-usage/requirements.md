# Requirements Document

## Introduction

This feature adds Multi-Asset Work Order (MAWO) support to the FE-528 harness Add Usage panel. A MAWO is a work order with child work orders, each associated with a different asset. The implementation includes mock data for MAWO, a settings toggle to switch between Standard and MAWO modes, and MAWO-specific form modifications including a Children Work Orders expansion panel with search, filter, and table functionality.

## Glossary

- **Add_Usage_Panel**: The full-width slide-in panel component (`AddUsagePanelComponent`) for recording equipment usage against a work order.
- **MAWO**: Multi-Asset Work Order — a parent work order that contains multiple child work orders, each linked to a different asset.
- **Child_Work_Order**: A work order that belongs to a MAWO parent, associated with a specific asset, having its own ID, title, and status.
- **Floating_Settings_Panel**: The fixed-position settings panel in the bottom-right corner of the Add Usage page containing display mode and time format selectors.
- **MockDataService**: The Angular service (`MockDataService`) that provides all mock data for the harness application.
- **Children_Work_Orders_Panel**: An expansion panel displayed at the bottom of the MAWO form containing a search input, status filter dropdown, and a selectable table of child work orders.
- **Status_Filter**: A dropdown (`aw-select-menu`) that filters the children work orders table by work order status (All, Open, Work Finished).
- **Search_Input**: A search field (`aw-search`) that filters the children work orders table across asset ID, asset description, work order ID, and work order title.
- **Mock_Data_Guide**: The documentation file (`fe-harness-FE-528/MOCK-DATA-GUIDE.md`) that catalogs all mock data in the harness. Must be updated whenever mock data is added or changed.

## Requirements

### Requirement 1: MAWO Mock Data

**User Story:** As a developer, I want mock data for a multi-asset work order with child work orders, so that I can demonstrate and test MAWO functionality in the harness.

#### Acceptance Criteria

1. THE MockDataService SHALL provide a MAWO parent work order object containing a parent work order ID, title, and a collection of child work orders.
2. THE MockDataService SHALL provide between 5 and 8 child work orders for the MAWO parent.
3. WHEN a child work order is defined, THE MockDataService SHALL assign each child a unique work order ID, a title/description, an asset ID, an asset description, and a status value.
4. THE MockDataService SHALL include child work orders with at least two distinct status values from the set: Open, Work Finished.
5. THE MockDataService SHALL assign a different asset (unique asset ID and description) to each child work order.
6. WHEN new MAWO mock data is added to MockDataService, THE developer SHALL update `fe-harness-FE-528/MOCK-DATA-GUIDE.md` with a new section documenting the MAWO parent work order, all child work orders (work order ID, title, asset ID, asset description, status), and any new quick scenarios for MAWO functionality.

### Requirement 2: MAWO Toggle on Floating Settings Panel

**User Story:** As a user, I want a toggle on the floating settings panel to switch between Standard and MAWO work order types, so that I can choose which mode the Add Usage form operates in.

#### Acceptance Criteria

1. THE Floating_Settings_Panel SHALL display a work order type selector with the options "Standard" and "MAWO".
2. THE Floating_Settings_Panel SHALL default the work order type selector to "Standard" on initial load.
3. WHEN the user selects "MAWO" from the work order type selector, THE Add_Usage_Panel SHALL switch to MAWO mode.
4. WHEN the user selects "Standard" from the work order type selector, THE Add_Usage_Panel SHALL switch to Standard mode.
5. THE Floating_Settings_Panel SHALL render the work order type selector alongside the existing Usage Display Mode and Time Format selectors using the same `aw-select-menu` component pattern.

### Requirement 3: Hide Single/Multi Entry Toggle in MAWO Mode

**User Story:** As a user, I want the Single Entry / Multi Entry segmented button hidden in MAWO mode, so that I only see the supported single-entry form.

#### Acceptance Criteria

1. WHILE the Add_Usage_Panel is in MAWO mode, THE Add_Usage_Panel SHALL hide the Single Entry / Multi Entry segmented button.
2. WHILE the Add_Usage_Panel is in MAWO mode, THE Add_Usage_Panel SHALL display only the single-entry form.
3. WHILE the Add_Usage_Panel is in Standard mode, THE Add_Usage_Panel SHALL display the Single Entry / Multi Entry segmented button as before.

### Requirement 4: Relabel Transaction Date to Usage Date in MAWO Mode

**User Story:** As a user, I want the "Transaction Date" label to read "Usage Date" in MAWO mode, so that the terminology matches the MAWO workflow.

#### Acceptance Criteria

1. WHILE the Add_Usage_Panel is in MAWO mode, THE Add_Usage_Panel SHALL display the label "Usage Date" for the transaction date field.
2. WHILE the Add_Usage_Panel is in Standard mode, THE Add_Usage_Panel SHALL display the label "Transaction Date" for the transaction date field.
3. WHEN the user switches between Standard and MAWO modes, THE Add_Usage_Panel SHALL update the transaction date field label without requiring a page reload.

### Requirement 5: Reversal Toggle in MAWO Mode

**User Story:** As a user, I want a Reversal toggle in MAWO mode, so that I can indicate whether the usage entry is a reversal.

#### Acceptance Criteria

1. WHILE the Add_Usage_Panel is in MAWO mode, THE Add_Usage_Panel SHALL display a Reversal toggle on the same row as the Hours Used field.
2. THE Add_Usage_Panel SHALL default the Reversal toggle to the off (false) position.
3. WHILE the Add_Usage_Panel is in Standard mode, THE Add_Usage_Panel SHALL hide the Reversal toggle.

### Requirement 6: Children Work Orders Expansion Panel

**User Story:** As a user, I want a Children Work Orders expansion panel at the bottom of the MAWO form, so that I can view and select child work orders for the usage entry.

#### Acceptance Criteria

1. WHILE the Add_Usage_Panel is in MAWO mode, THE Add_Usage_Panel SHALL display a "Children Work Orders" expansion panel after the Misc fields section, using the `aw-expansion-panel` component.
2. THE Children_Work_Orders_Panel SHALL be expanded by default.
3. THE Children_Work_Orders_Panel SHALL contain a search input using the `aw-search` component.
4. THE Children_Work_Orders_Panel SHALL contain a "Work Order Status" filter dropdown using the `aw-select-menu` component with the options: All, Open, Work Finished.
5. THE Children_Work_Orders_Panel SHALL default the status filter to "All".
6. THE Children_Work_Orders_Panel SHALL display a table using the `aw-table` component with columns: Checkbox (for selection), Asset, Work Order, and Status.
7. THE Children_Work_Orders_Panel SHALL render the Asset column with the asset ID as primary text and the asset description as subtext.
8. THE Children_Work_Orders_Panel SHALL render the Work Order column with the work order ID as primary text and the work order title as subtext.
9. WHILE the Add_Usage_Panel is in Standard mode, THE Add_Usage_Panel SHALL hide the Children Work Orders expansion panel.

### Requirement 7: Children Work Orders Table Filtering

**User Story:** As a user, I want to filter the children work orders table by status and search text, so that I can quickly find specific child work orders.

#### Acceptance Criteria

1. WHEN the user selects a status from the Status_Filter dropdown, THE Children_Work_Orders_Panel SHALL display only child work orders matching the selected status.
2. WHEN the user selects "All" from the Status_Filter dropdown, THE Children_Work_Orders_Panel SHALL display all child work orders.
3. WHEN the user enters text in the Search_Input, THE Children_Work_Orders_Panel SHALL filter the table to show only rows where the search text matches any of: asset ID, asset description, work order ID, or work order title (case-insensitive).
4. WHEN both a status filter and search text are active, THE Children_Work_Orders_Panel SHALL apply both filters simultaneously, showing only rows that match both criteria.
5. WHEN the search text is cleared, THE Children_Work_Orders_Panel SHALL remove the search filter and display rows based on the current status filter only.

### Requirement 8: Standard Mode Preservation

**User Story:** As a developer, I want the existing Standard (non-MAWO) mode to continue working exactly as before, so that MAWO changes do not introduce regressions.

#### Acceptance Criteria

1. WHILE the Add_Usage_Panel is in Standard mode, THE Add_Usage_Panel SHALL display all existing form fields, entry modes, and behaviors without modification.
2. WHILE the Add_Usage_Panel is in Standard mode, THE Add_Usage_Panel SHALL support both Single Entry and Multi Entry modes as before.
3. THE Add_Usage_Panel SHALL use the same CCL components and patterns already present in the codebase for all new MAWO elements.

### Requirement 9: Reference Implementation Pattern

**User Story:** As a developer, I want the Children Work Orders panel to follow the same pattern as the Existing Service Requests panel in fe-harness-FE-3999, so that the codebase remains consistent.

#### Acceptance Criteria

1. THE Children_Work_Orders_Panel SHALL use the `.sr-search-row` SCSS pattern for the search input and status filter row layout.
2. THE Children_Work_Orders_Panel SHALL use `aw-expansion-panel`, `aw-search`, `aw-select-menu`, and `aw-table` components following the same composition pattern as the Existing Service Requests panel in `NewWorkOrderComponent`.
3. THE Children_Work_Orders_Panel SHALL use `TableCellTypes.Custom` with a text/subtext component for the Asset and Work Order columns, following the `TableTextSubtextComponent` pattern from the reference implementation.
4. THE Children_Work_Orders_Panel SHALL use `TableCellTypes.Checkbox` for the selection column.

### Requirement 10: Hide Inapplicable Fields in MAWO Mode

**User Story:** As a user, I want fields that don't apply to MAWO usage hidden in MAWO mode, so that the form only shows relevant fields.

#### Acceptance Criteria

1. WHILE the Add_Usage_Panel is in MAWO mode, THE Add_Usage_Panel SHALL hide the Start Date / Time field.
2. WHILE the Add_Usage_Panel is in MAWO mode, THE Add_Usage_Panel SHALL hide the End Date / Time field.
3. WHILE the Add_Usage_Panel is in MAWO mode, THE Add_Usage_Panel SHALL hide the Operator field.
4. WHILE the Add_Usage_Panel is in MAWO mode, THE Add_Usage_Panel SHALL hide the Department field.
5. WHILE the Add_Usage_Panel is in MAWO mode, THE Add_Usage_Panel SHALL hide the Task field.
6. WHILE the Add_Usage_Panel is in MAWO mode, THE Add_Usage_Panel SHALL hide the Financial Project Code field.
7. WHILE the Add_Usage_Panel is in Standard mode, THE Add_Usage_Panel SHALL display all fields according to the active Usage Display Mode as before.
