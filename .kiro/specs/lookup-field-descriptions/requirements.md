# Requirements Document

## Introduction

Add description text below lookup fields in the Add Usage panel. When a user types a value and tabs off, the field resolves the value against mock data and shows either the matching description or "NOT DEFINED" below the input. This follows the production WAC field pattern from FA-Suite's Task Detail page. The feature applies to six lookup fields (Asset, Account, Operator, Department, Task, Financial Project Code) across both single-entry form and multi-entry table modes.

## Glossary

- **Add_Usage_Panel**: The full-width slide-in panel for recording equipment usage against a work order, supporting single-entry (form) and multi-entry (table) modes.
- **Single_Entry_Form**: The form-based entry mode using `aw-form-field` + `AwInput` + search button for each lookup field.
- **Multi_Entry_Table**: The table-based entry mode using `aw-table` with custom cell components for each column.
- **Lookup_Field**: A text input field with a search icon button that resolves typed values against mock data to display a description. The six lookup fields are: Asset, Account, Operator, Department, Task, and Financial Project Code.
- **Description_Text**: A `<span>` element displayed below a lookup field showing the resolved description of the typed value, or "NOT DEFINED" if no match is found.
- **MockDataService**: The Angular service providing mock data signals for operators, departments, accounts, tasks, and financial project codes.
- **TableAssetCellComponent**: The existing custom table cell component for the Asset column in multi-entry mode, which already implements the description pattern.
- **TableInputCellComponent**: The existing custom table cell component used for text input columns in multi-entry mode, which already supports `lookupOnBlur` and subtitle display.
- **WAC_Pattern**: The production field pattern from FA-Suite's Task Detail page: `aw-form-field` with input and search button, followed by a description `<span>` using `aw-c-1` typography and `text-secondary` color.

## Requirements

### Requirement 1: Single-Entry Asset Description

**User Story:** As a technician, I want to see the asset description below the Asset field in single-entry mode after typing a value and tabbing off, so that I can confirm I entered the correct asset.

#### Acceptance Criteria

1. WHEN the user types a value in the single-entry Asset field and blurs (tabs off), THE Single_Entry_Form SHALL look up the typed value against the asset search options (case-insensitive match on equipment ID).
2. WHEN a matching asset is found, THE Single_Entry_Form SHALL display the asset description below the Asset field using `aw-c-1` typography class and `text-secondary` color.
3. WHEN no matching asset is found and the field is not empty, THE Single_Entry_Form SHALL display "NOT DEFINED" below the Asset field using `aw-c-1` typography class and `text-secondary` color.
4. WHEN the Asset field is empty, THE Single_Entry_Form SHALL hide the description text below the Asset field.
5. WHEN the user clears the Asset field value, THE Single_Entry_Form SHALL clear the description text.
6. WHEN the user selects an asset via the Asset Search dialog, THE Single_Entry_Form SHALL display the selected asset's description below the Asset field.

### Requirement 2: Single-Entry Account Description

**User Story:** As a technician, I want to see the account name below the Account field in single-entry mode after typing a value and tabbing off, so that I can confirm I entered the correct account.

#### Acceptance Criteria

1. WHEN the user types a value in the single-entry Account field and blurs, THE Single_Entry_Form SHALL look up the typed value against `MockDataService.accounts()` (case-insensitive match on account ID).
2. WHEN a matching account is found, THE Single_Entry_Form SHALL display the account name below the Account field using `aw-c-1` typography class and `text-secondary` color.
3. WHEN no matching account is found and the field is not empty, THE Single_Entry_Form SHALL display "NOT DEFINED" below the Account field.
4. WHEN the Account field is empty, THE Single_Entry_Form SHALL hide the description text below the Account field.
5. WHEN the user clears the Account field value, THE Single_Entry_Form SHALL clear the description text.

### Requirement 3: Single-Entry Operator Description

**User Story:** As a technician, I want to see the operator name below the Operator field in single-entry mode after typing a value and tabbing off, so that I can confirm I entered the correct operator.

#### Acceptance Criteria

1. WHEN the user types a value in the single-entry Operator field and blurs, THE Single_Entry_Form SHALL look up the typed value against `MockDataService.operators()` (case-insensitive match on operator ID).
2. WHEN a matching operator is found, THE Single_Entry_Form SHALL display the operator name below the Operator field using `aw-c-1` typography class and `text-secondary` color.
3. WHEN no matching operator is found and the field is not empty, THE Single_Entry_Form SHALL display "NOT DEFINED" below the Operator field.
4. WHEN the Operator field is empty, THE Single_Entry_Form SHALL hide the description text below the Operator field.
5. WHEN the user clears the Operator field value, THE Single_Entry_Form SHALL clear the description text.

### Requirement 4: Single-Entry Department Description

**User Story:** As a technician, I want to see the department name below the Department field in single-entry mode after typing a value and tabbing off, so that I can confirm I entered the correct department.

#### Acceptance Criteria

1. WHEN the user types a value in the single-entry Department field and blurs, THE Single_Entry_Form SHALL look up the typed value against `MockDataService.departments()` (case-insensitive match on department ID).
2. WHEN a matching department is found, THE Single_Entry_Form SHALL display the department name below the Department field using `aw-c-1` typography class and `text-secondary` color.
3. WHEN no matching department is found and the field is not empty, THE Single_Entry_Form SHALL display "NOT DEFINED" below the Department field.
4. WHEN the Department field is empty, THE Single_Entry_Form SHALL hide the description text below the Department field.
5. WHEN the user clears the Department field value, THE Single_Entry_Form SHALL clear the description text.

### Requirement 5: Single-Entry Task Description

**User Story:** As a technician, I want to see the task description below the Task field in single-entry mode after typing a value and tabbing off, so that I can confirm I entered the correct task.

#### Acceptance Criteria

1. WHEN the user types a value in the single-entry Task field and blurs, THE Single_Entry_Form SHALL look up the typed value against `MockDataService.tasks()` (case-insensitive match on task ID).
2. WHEN a matching task is found, THE Single_Entry_Form SHALL display the task description below the Task field using `aw-c-1` typography class and `text-secondary` color.
3. WHEN no matching task is found and the field is not empty, THE Single_Entry_Form SHALL display "NOT DEFINED" below the Task field.
4. WHEN the Task field is empty, THE Single_Entry_Form SHALL hide the description text below the Task field.
5. WHEN the user clears the Task field value, THE Single_Entry_Form SHALL clear the description text.
6. WHEN the user selects a task via the Task Search dialog, THE Single_Entry_Form SHALL display the selected task's description below the Task field.

### Requirement 6: Single-Entry Financial Project Code Description

**User Story:** As a technician, I want to see the financial project code name below the Financial Project Code field in single-entry mode after typing a value and tabbing off, so that I can confirm I entered the correct code.

#### Acceptance Criteria

1. WHEN the user types a value in the single-entry Financial Project Code field and blurs, THE Single_Entry_Form SHALL look up the typed value against `MockDataService.financialProjectCodes()` (case-insensitive match on code ID).
2. WHEN a matching financial project code is found, THE Single_Entry_Form SHALL display the code name below the Financial Project Code field using `aw-c-1` typography class and `text-secondary` color.
3. WHEN no matching financial project code is found and the field is not empty, THE Single_Entry_Form SHALL display "NOT DEFINED" below the Financial Project Code field.
4. WHEN the Financial Project Code field is empty, THE Single_Entry_Form SHALL hide the description text below the Financial Project Code field.
5. WHEN the user clears the Financial Project Code field value, THE Single_Entry_Form SHALL clear the description text.

### Requirement 7: Multi-Entry Account Description

**User Story:** As a technician, I want to see the account name below the Account cell in multi-entry mode after typing a value and tabbing off, so that I can confirm I entered the correct account.

#### Acceptance Criteria

1. WHEN the user types a value in a multi-entry Account cell and blurs, THE Multi_Entry_Table SHALL look up the typed value against `MockDataService.accounts()` (case-insensitive match on account ID).
2. WHEN a matching account is found, THE Multi_Entry_Table SHALL display the account name below the Account cell input.
3. WHEN no matching account is found and the cell is not empty, THE Multi_Entry_Table SHALL display "NOT DEFINED" below the Account cell input.
4. WHEN the Account cell is empty, THE Multi_Entry_Table SHALL show a hidden spacer below the Account cell input to maintain vertical alignment with other cells.

### Requirement 8: Multi-Entry Operator Description

**User Story:** As a technician, I want to see the operator name below the Operator cell in multi-entry mode after typing a value and tabbing off, so that I can confirm I entered the correct operator.

#### Acceptance Criteria

1. WHEN the user types a value in a multi-entry Operator cell and blurs, THE Multi_Entry_Table SHALL look up the typed value against `MockDataService.operators()` (case-insensitive match on operator ID).
2. WHEN a matching operator is found, THE Multi_Entry_Table SHALL display the operator name below the Operator cell input.
3. WHEN no matching operator is found and the cell is not empty, THE Multi_Entry_Table SHALL display "NOT DEFINED" below the Operator cell input.
4. WHEN the Operator cell is empty, THE Multi_Entry_Table SHALL show a hidden spacer below the Operator cell input to maintain vertical alignment.

### Requirement 9: Multi-Entry Department Description

**User Story:** As a technician, I want to see the department name below the Department cell in multi-entry mode after typing a value and tabbing off, so that I can confirm I entered the correct department.

#### Acceptance Criteria

1. WHEN the user types a value in a multi-entry Department cell and blurs, THE Multi_Entry_Table SHALL look up the typed value against `MockDataService.departments()` (case-insensitive match on department ID).
2. WHEN a matching department is found, THE Multi_Entry_Table SHALL display the department name below the Department cell input.
3. WHEN no matching department is found and the cell is not empty, THE Multi_Entry_Table SHALL display "NOT DEFINED" below the Department cell input.
4. WHEN the Department cell is empty, THE Multi_Entry_Table SHALL show a hidden spacer below the Department cell input to maintain vertical alignment.

### Requirement 10: Multi-Entry Task Description

**User Story:** As a technician, I want to see the task description below the Task cell in multi-entry mode after typing a value and tabbing off, so that I can confirm I entered the correct task.

#### Acceptance Criteria

1. WHEN the user types a value in a multi-entry Task cell and blurs, THE Multi_Entry_Table SHALL look up the typed value against `MockDataService.tasks()` (case-insensitive match on task ID).
2. WHEN a matching task is found, THE Multi_Entry_Table SHALL display the task description below the Task cell input.
3. WHEN no matching task is found and the cell is not empty, THE Multi_Entry_Table SHALL display "NOT DEFINED" below the Task cell input.
4. WHEN the Task cell is empty, THE Multi_Entry_Table SHALL show a hidden spacer below the Task cell input to maintain vertical alignment.

### Requirement 11: Multi-Entry Financial Project Code Description

**User Story:** As a technician, I want to see the financial project code name below the Financial Project Code cell in multi-entry mode after typing a value and tabbing off, so that I can confirm I entered the correct code.

#### Acceptance Criteria

1. WHEN the user types a value in a multi-entry Financial Project Code cell and blurs, THE Multi_Entry_Table SHALL look up the typed value against `MockDataService.financialProjectCodes()` (case-insensitive match on code ID).
2. WHEN a matching financial project code is found, THE Multi_Entry_Table SHALL display the code name below the Financial Project Code cell input.
3. WHEN no matching financial project code is found and the cell is not empty, THE Multi_Entry_Table SHALL display "NOT DEFINED" below the Financial Project Code cell input.
4. WHEN the Financial Project Code cell is empty, THE Multi_Entry_Table SHALL show a hidden spacer below the Financial Project Code cell input to maintain vertical alignment.

### Requirement 12: Description Styling Consistency

**User Story:** As a developer, I want all lookup field descriptions to follow the production WAC pattern styling, so that the harness matches the production application's visual design.

#### Acceptance Criteria

1. THE Description_Text in the Single_Entry_Form SHALL use the `aw-c-1` typography class (12px/16px caption).
2. THE Description_Text in the Single_Entry_Form SHALL use `text-secondary` color (`var(--system-text-text-secondary)`).
3. THE Description_Text in the Single_Entry_Form SHALL be positioned inside the parent `.form-field` div, below the `aw-form-field` element.
4. THE Description_Text in the Single_Entry_Form SHALL have a left margin of 2px (matching the production `.field-desc` pattern).
5. THE Description_Text in the Multi_Entry_Table SHALL use the existing `table-input-cell__subtitle` styling (12px/16px, `text-secondary` color, 2px top margin).
6. WHEN a description is not displayed, THE Multi_Entry_Table SHALL render a hidden spacer element to maintain consistent row height across all cells.

### Requirement 13: Documentation Updates

**User Story:** As a developer, I want the MOCK-DATA-GUIDE.md and README.md to reflect the new lookup field description behavior, so that the documentation stays current.

#### Acceptance Criteria

1. THE MOCK-DATA-GUIDE.md SHALL document which mock data sources are used for each lookup field's description resolution.
2. THE README.md SHALL describe the lookup field description behavior in the Add Usage Panel section.
3. THE MOCK-DATA-GUIDE.md SHALL include quick scenarios for testing lookup field descriptions (match found, no match, empty field).
