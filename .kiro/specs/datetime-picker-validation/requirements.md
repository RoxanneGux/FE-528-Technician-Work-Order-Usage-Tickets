# Requirements Document

## Introduction

This feature adds input masking, 12h/24h time format toggling, and just-in-time validation to the date and time picker fields in the FE-528 harness Add Usage panel. Currently, users can type arbitrary characters into date/time fields with no formatting guidance or validation feedback. This spec addresses those gaps by constraining input to valid characters, providing a page-level time format toggle, and displaying inline error messages on blur when values are invalid.

## Glossary

- **Add_Usage_Panel**: The full-width slide-in panel component (`AddUsagePanelComponent`) for recording equipment usage, containing date-time picker fields for Start Date/Time and End Date/Time, and a date picker for Transaction Date.
- **Date_Time_Picker**: The `aw-date-time-picker` CCL component used for Start Date/Time and End Date/Time fields. Accepts a `[timeFormat]` input of `'12h'` or `'24h'` and projects `aw-form-message[type=error]` for error display.
- **Date_Picker**: The `aw-date-picker` CCL component used for the Transaction Date field. Has built-in date validation via its `validateDate` method.
- **Date_Input_Mask**: A keydown filter applied to date input fields that restricts typed characters to digits (`0-9`) and the forward slash (`/`) separator.
- **Time_Input_Mask**: A keydown filter applied to time input fields that restricts typed characters to digits (`0-9`), the colon (`:`) separator, and (in 12h mode) the letters `A`, `M`, `P`, and space.
- **Time_Format_Toggle**: A floating UI control on the Work_Order_Details_Page that lets the user switch between 12-hour and 24-hour time display format. Styled identically to the existing Usage Display Mode floating selector.
- **Time_Format**: The active time format setting, either `'12h'` or `'24h'`, stored as a property on `WorkOrderDetailsComponent` and passed to all Date_Time_Picker instances via the `[timeFormat]` input.
- **Blur_Validation**: Validation logic that executes when a date or time input field loses focus (blur event), checking whether the entered value conforms to the expected format and range.
- **Error_Message**: An inline error message displayed below an invalid field using the `aw-form-message` CCL component with `type="error"`, projected into the Date_Time_Picker's error content slot.
- **Work_Order_Details_Page**: The `WorkOrderDetailsComponent` page that hosts the floating selectors and opens the Add_Usage_Panel via PanelService.

## Requirements

### Requirement 1: Date Input Masking

**User Story:** As a technician, I want the date input fields to only accept valid date characters, so that I cannot accidentally type letters or symbols into a date field.

#### Acceptance Criteria

1. WHEN the user types a character into a date input field within the Date_Time_Picker, THE Date_Input_Mask SHALL allow only digits (`0-9`) and the forward slash (`/`) character.
2. WHEN the user types a character that is not a digit or forward slash, THE Date_Input_Mask SHALL prevent that character from appearing in the date input field.
3. THE Date_Input_Mask SHALL allow navigation keys (Backspace, Tab, Arrow keys, Delete, Home, End) to function normally.
4. THE Date_Input_Mask SHALL apply to the date portion of all Date_Time_Picker instances in the Add_Usage_Panel (Start Date/Time and End Date/Time).

### Requirement 2: Time Input Masking

**User Story:** As a technician, I want the time input fields to only accept valid time characters, so that I cannot accidentally type invalid characters into a time field.

#### Acceptance Criteria

1. WHILE the Time_Format is `'24h'`, WHEN the user types a character into a time input field, THE Time_Input_Mask SHALL allow only digits (`0-9`) and the colon (`:`) character.
2. WHILE the Time_Format is `'12h'`, WHEN the user types a character into a time input field, THE Time_Input_Mask SHALL allow digits (`0-9`), the colon (`:`), the letters `A`, `M`, `P` (case-insensitive), and the space character.
3. WHEN the user types a character not permitted by the active Time_Input_Mask rules, THE Time_Input_Mask SHALL prevent that character from appearing in the time input field.
4. THE Time_Input_Mask SHALL allow navigation keys (Backspace, Tab, Arrow keys, Delete, Home, End) to function normally.
5. THE Time_Input_Mask SHALL apply to the time portion of all Date_Time_Picker instances in the Add_Usage_Panel.

### Requirement 3: 12h/24h Time Format Toggle

**User Story:** As a technician, I want to switch between 12-hour and 24-hour time format, so that I can enter time values in my preferred format.

#### Acceptance Criteria

1. THE Work_Order_Details_Page SHALL display a Time_Format_Toggle as a floating selector, styled identically to the existing Usage Display Mode floating selector.
2. THE Time_Format_Toggle SHALL offer two options: "12 Hour" and "24 Hour".
3. THE Time_Format_Toggle SHALL default to `'12h'`.
4. WHEN the user selects a time format option, THE Work_Order_Details_Page SHALL update the Time_Format property to the selected value.
5. WHEN the Add_Usage_Panel opens, THE Work_Order_Details_Page SHALL pass the current Time_Format value to the Add_Usage_Panel via PanelService input data.
6. THE Add_Usage_Panel SHALL bind the received Time_Format value to the `[timeFormat]` input of all Date_Time_Picker instances.
7. WHEN the Time_Format is `'12h'`, THE Date_Time_Picker SHALL display time in `HH:MM AM/PM` format with hours ranging from 1 to 12.
8. WHEN the Time_Format is `'24h'`, THE Date_Time_Picker SHALL display time in `HH:MM` format with hours ranging from 0 to 23.

### Requirement 4: Date Validation on Blur

**User Story:** As a technician, I want to see an error message when I enter an invalid date, so that I can correct my input before submitting.

#### Acceptance Criteria

1. WHEN the user leaves a date input field (blur event) within a Date_Time_Picker, THE Add_Usage_Panel SHALL validate the entered date value.
2. IF the date value is not empty and does not match the `MM/DD/YYYY` format, THEN THE Add_Usage_Panel SHALL display an Error_Message reading "Invalid date format. Use MM/DD/YYYY".
3. IF the date value matches the `MM/DD/YYYY` format but represents an invalid calendar date (e.g., 02/30/2024 or 13/01/2024), THEN THE Add_Usage_Panel SHALL display an Error_Message reading "Invalid date".
4. IF the date value is empty, THEN THE Add_Usage_Panel SHALL not display an Error_Message (empty fields are permitted).
5. IF the date value is valid, THEN THE Add_Usage_Panel SHALL not display an Error_Message.
6. THE Error_Message SHALL be displayed using the `aw-form-message` component with `type="error"`, projected into the Date_Time_Picker's error content slot.

### Requirement 5: Time Validation on Blur

**User Story:** As a technician, I want to see an error message when I enter an invalid time, so that I can correct my input before submitting.

#### Acceptance Criteria

1. WHEN the user leaves a time input field (blur event) within a Date_Time_Picker, THE Add_Usage_Panel SHALL validate the entered time value.
2. WHILE the Time_Format is `'12h'`, IF the time value is not empty and does not match a valid 12-hour time (hours 1-12, minutes 0-59, followed by AM or PM), THEN THE Add_Usage_Panel SHALL display an Error_Message reading "Invalid time. Use HH:MM AM/PM (1-12)".
3. WHILE the Time_Format is `'24h'`, IF the time value is not empty and does not match a valid 24-hour time (hours 0-23, minutes 0-59), THEN THE Add_Usage_Panel SHALL display an Error_Message reading "Invalid time. Use HH:MM (0-23)".
4. IF the time value is empty, THEN THE Add_Usage_Panel SHALL not display an Error_Message (empty fields are permitted).
5. IF the time value is valid for the active Time_Format, THEN THE Add_Usage_Panel SHALL not display an Error_Message.
6. THE Error_Message SHALL be displayed using the `aw-form-message` component with `type="error"`, projected into the Date_Time_Picker's error content slot.

### Requirement 6: Error State Visual Feedback

**User Story:** As a technician, I want invalid fields to be visually distinct, so that I can quickly identify which fields need correction.

#### Acceptance Criteria

1. WHEN an Error_Message is displayed for a Date_Time_Picker field, THE Date_Time_Picker SHALL apply the CCL error state styling to the field.
2. WHEN the user corrects the value and the field passes validation on the next blur event, THE Add_Usage_Panel SHALL remove the Error_Message and the error state styling.
3. THE error state SHALL persist until the user modifies the field value and triggers a new blur validation that passes.

### Requirement 7: Validation State Management

**User Story:** As a developer, I want validation errors tracked per field, so that each date-time picker independently shows or hides its error state.

#### Acceptance Criteria

1. THE Add_Usage_Panel SHALL maintain independent validation error state for each Date_Time_Picker instance (Start Date/Time date, Start Date/Time time, End Date/Time date, End Date/Time time).
2. WHEN a validation error occurs on one Date_Time_Picker field, THE Add_Usage_Panel SHALL not affect the error state of other Date_Time_Picker fields.
3. THE Add_Usage_Panel SHALL store validation error messages as signals, one per validatable field, so that the template can reactively display or hide Error_Message components.
4. WHEN the Add_Usage_Panel opens, THE validation error state for all fields SHALL be clear (no errors displayed).
