# Mock Data Guide — fe-harness-FE-528

All data in this harness is mock. No API calls are made. This guide documents every piece of mock data available.

## Available Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` (default) | Work Order Details | Full work order page with all sections |

## Mock Data Files

| File | Purpose |
|------|---------|
| `src/assets/mocks/work-order.json` | Work order info, costs, tasks, service requests, postings, current assignments, delay codes |
| `src/assets/mocks/employees.json` | Crews, crew employees, advanced search employees, filter options, employee details (time codes, locations, work orders, tasks, appointments, non-work activities) |

## Work Order Fields

| Field | Value |
|-------|-------|
| Location | MAIN |
| Year / Number | 2024 / 10542 |
| Status | Open |
| Job Type | CM — Corrective Maintenance |
| Asset Number | EQ-4821 |
| Equipment ID | PUMP-003 |
| Station Location | Building A - Floor 2 |
| Asset Type | Centrifugal Pump |
| Service Status | In Service |
| Opened | 2024-11-15 08:30 |
| Due | 2024-12-01 17:00 |
| Contact | Jane Smith — (555) 123-4567 |
| Operator | Mike Johnson — (555) 987-6543 |
| Attachments / Notes / Comments | 3 / 5 / 2 |

## Tasks (4 total)

| Task ID | Description | Est. Hours | Charged | Remaining | Status | PM Checklist |
|---------|-------------|-----------|---------|-----------|--------|-------------|
| TSK-001 | Inspect pump bearings and seals | 2.0 | 1.5 | 0.5 | In Progress | Yes |
| TSK-002 | Replace worn impeller | 4.0 | 0 | 4.0 | Not Started | No |
| TSK-003 | Realign motor coupling | 1.5 | 1.5 | 0 | Complete | No |
| TSK-004 | Test pump performance after repair | 1.0 | 0 | 1.0 | Not Started | Yes |

## Service Requests (3 total)

| SR ID | Description | Priority | Status | Linked Tasks |
|-------|-------------|----------|--------|-------------|
| SR-001 | Pump vibration exceeds threshold | High | Open | TSK-003 |
| SR-002 | Seal leak detected during inspection | Medium | Open | — |
| SR-003 | Routine bearing replacement due | Low | Closed | — |

## Costs Summary

| Category | Amount |
|----------|--------|
| Labor | $1,250.00 |
| Parts | $875.50 |
| Commercial | $450.00 |
| **Grand Total** | **$2,575.50** |

## Postings

### Labor Postings (3)

| ID | Employee | Task | Hours | Date | Time Code |
|----|----------|------|-------|------|-----------|
| LP-001 | Robert Chen | TSK-001 | 1.5 | 2024-11-18 | REG |
| LP-002 | Sarah Williams | TSK-003 | 1.5 | 2024-11-17 | REG |
| LP-003 | Robert Chen | TSK-001 | 0.5 | 2024-11-19 | OT |

### Parts Postings (3)

| ID | Part # | Description | Qty | Unit Cost | Total |
|----|--------|-------------|-----|-----------|-------|
| PP-001 | BRG-2210 | SKF Deep Groove Ball Bearing | 2 | $125.00 | $250.00 |
| PP-002 | SEAL-440 | Mechanical Shaft Seal | 1 | $375.50 | $375.50 |
| PP-003 | IMP-660 | Stainless Steel Impeller | 1 | $250.00 | $250.00 |

### Commercial Postings (1)

| ID | Vendor | Description | Amount | Date |
|----|--------|-------------|--------|------|
| CP-001 | Precision Alignment Services | Laser alignment of motor-pump coupling | $450.00 | 2024-11-17 |

## Current Assignments (2)

| Employee ID | Name | Task | Start Time |
|-------------|------|------|------------|
| EMP-101 | Robert Chen | TSK-001 — Inspect pump bearings and seals | 2024-11-19 07:00 |
| EMP-104 | David Park | TSK-002 — Replace worn impeller | 2024-11-19 08:30 |

## Delay Codes (4)

| Code | Description |
|------|-------------|
| DLY-01 | Waiting for Parts |
| DLY-02 | Equipment Unavailable |
| DLY-03 | Weather Delay |
| DLY-04 | Awaiting Approval |

## Employee Data

### Crews (3)

| Crew ID | Description |
|---------|-------------|
| CRW-A | Maintenance Crew A |
| CRW-B | Maintenance Crew B |
| CRW-C | Electrical Crew |

### Crew Employees (8)

| Employee ID | Name | Crew | Status | Clocked In | Location | Shift | Skills |
|-------------|------|------|--------|-----------|----------|-------|--------|
| EMP-101 | Robert Chen | CRW-A — Maintenance Crew A | Busy | Yes | Building A | Day | Mechanical, Welding |
| EMP-102 | Sarah Williams | CRW-A — Maintenance Crew A | Available | Yes | Building A | Day | Electrical, HVAC |
| EMP-103 | James Martinez | CRW-A — Maintenance Crew A | Available | No | Building B | Swing | Mechanical |
| EMP-104 | David Park | CRW-B — Maintenance Crew B | Busy | Yes | Building B | Day | Mechanical, Electrical |
| EMP-105 | Lisa Thompson | CRW-B — Maintenance Crew B | Available | Yes | Warehouse | Swing | Welding, HVAC |
| EMP-106 | Maria Garcia | CRW-C — Electrical Crew | Available | Yes | Building A | Night | Electrical |
| EMP-107 | Kevin Wright | CRW-C — Electrical Crew | Busy | Yes | Warehouse | Day | Electrical, HVAC |
| EMP-108 | Angela Foster | CRW-A — Maintenance Crew A | Available | Yes | Building B | Night | Mechanical, Welding, HVAC |

### Advanced Search Employees (8)

| Employee ID | Name | Clocked In | Jobbed On |
|-------------|------|-----------|-----------|
| EMP-101 | Robert Chen | Yes | Yes |
| EMP-102 | Sarah Williams | Yes | No |
| EMP-103 | James Martinez | No | No |
| EMP-104 | David Park | Yes | Yes |
| EMP-105 | Lisa Thompson | Yes | No |
| EMP-106 | Maria Garcia | Yes | No |
| EMP-107 | Kevin Wright | Yes | Yes |
| EMP-108 | Angela Foster | Yes | No |

### Filter Options

| Filter | Options |
|--------|---------|
| Locations | Building A, Building B, Warehouse |
| Shifts | Day Shift (7AM-3PM), Swing Shift (3PM-11PM), Night Shift (11PM-7AM) |
| Skills | Mechanical, Electrical, Welding, HVAC |
| Crews | Maintenance Crew A, Maintenance Crew B, Electrical Crew |

## Employee Details

Each crew employee has a corresponding detail record in `employeeDetails` containing time code summary, locations, work orders with tasks, appointments, and non-work activities.

### Employee Detail Summary (8 employees)

| Employee ID | Name | Timesheet Hrs | Capacity | Available | Locations | Work Orders | Appointments | NWAs |
|-------------|------|--------------|----------|-----------|-----------|-------------|--------------|------|
| EMP-101 | Robert Chen | 6.5 | 8.0 | 0.5 | 2 | 2 | 2 | 2 |
| EMP-102 | Sarah Williams | 4.0 | 8.0 | 3.5 | 1 | 2 | 1 | 2 |
| EMP-103 | James Martinez | 0.0 | 8.0 | 8.0 | 1 | 1 | 0 | 2 |
| EMP-104 | David Park | 7.5 | 8.0 | 0.5 | 2 | 3 | 3 | 2 |
| EMP-105 | Lisa Thompson | 5.0 | 8.0 | 1.0 | 2 | 2 | 2 | 2 |
| EMP-106 | Maria Garcia | 3.0 | 8.0 | 5.0 | 2 | 0 | 1 | 2 |
| EMP-107 | Kevin Wright | 8.0 | 8.0 | 0.0 | 1 | 1 | 2 | 2 |
| EMP-108 | Angela Foster | 5.5 | 8.0 | 1.0 | 3 | 2 | 3 | 2 |

### Time Code Summary Fields

| Field | Description |
|-------|-------------|
| todaysTimesheet | Hours logged on today's timesheet |
| capacityHours | Total capacity hours for the day |
| nwaHours | Non-work activity hours |
| hoursAvailable | Remaining available hours |
| assignedHours | Total assigned hours |

### Location Fields

| Field | Description |
|-------|-------------|
| locationId | Location identifier (e.g., LOC-01) |
| locationName | Display name (e.g., Building A) |
| isDefault | Whether this is the employee's default location |

### Work Order Fields

| Field | Description |
|-------|-------------|
| workOrderId | Work order identifier (e.g., WO-2024-001) |
| description | Work order description |
| status | In Progress, Scheduled, On Hold |
| priority | Critical, High, Medium, Low |
| tasks | Array of tasks with taskId, taskDescription, estimatedHours, chargedHours, remainingHours, status |

### Appointment Fields

| Field | Description |
|-------|-------------|
| id | Appointment identifier (e.g., APT-001) |
| title | Appointment title |
| start | ISO date-time string for start (shifted to relative offset on load) |
| end | ISO date-time string for end (shifted to relative offset on load) |
| color | Hex color for calendar display |

### Non-Work Activity Fields (`MockNonWorkActivity`)

| Field | Type | Description |
|-------|------|-------------|
| id | string | NWA identifier (e.g., NWA-101) |
| type | string | Activity type: "Vacation", "Training", "Sick Leave", or "Meeting" |
| start | string | ISO date-time string for start (shifted to relative offset on load) |
| end | string | ISO date-time string for end (shifted to relative offset on load) |
| hours | number | Duration in hours (e.g., 2.0, 8.0) |

### Relative Date Shifting

All appointment, work order task, and NWA dates in `employees.json` are hardcoded as December 2024 values. During data loading, `MockDataService` shifts them to relative offsets so events are always visible on the current month:

| Original Date | Relative Offset |
|---------------|-----------------|
| Dec 10 | Today |
| Dec 11 | Tomorrow |
| Dec 12–15 | Within this week |
| Dec 16+ | Next week |

Time-of-day (hours and minutes) is preserved from the original mock data. The calendar's `selectedDate` is set to today so the current month is always visible on load.

## Calendar Events

The Employee Details panel's Calendar section (formerly "Appointments") displays three event types on the `aw-calendar`, each with distinct styling.

### Event Types

| Type | Flag Color | Icon | Label |
|------|-----------|------|-------|
| Assignment | `#0066cc` (blue) | `build` | Assignments |
| Appointment | `#00cc66` (green) | `event` | Appointments |
| Non-Work Activity | `#9933cc` (purple) | `event_busy` | Non-Work Activity |

Assignment events are derived from employee work order tasks. Appointment events come from existing appointment mock data. NWA events come from the `nonWorkActivities` array.

### Event Drawer

Clicking a day cell or a specific event on the calendar opens an `aw-side-drawer` from the right displaying all events for that day. Events are grouped by type in `aw-expansion-panel` components, ordered: Assignments → Appointments → Non-Work Activity. Groups with zero events are omitted. All groups are expanded by default.

Each group title includes the type name and count (e.g., "Assignments (2)"). If no events exist for the selected day, the drawer shows "No events for this date".

### Event Detail Fields (Drawer)

| Event Type | Fields Shown |
|------------|-------------|
| Assignment | Work Order ID, Task ID, Task Description, Status, Hours |
| Appointment | Title, Start Time, End Time, Description |
| Non-Work Activity | Type, Start Time, End Time, Hours |

Times are formatted as "H:MM AM/PM" (e.g., "9:00 AM", "2:30 PM").

## Operators (3)

| ID | Name |
|----|------|
| OP-001 | John Miller |
| OP-002 | Patricia Davis |
| OP-003 | Thomas Wilson |

## Departments (3)

| ID | Name |
|----|------|
| DEPT-001 | Maintenance |
| DEPT-002 | Operations |
| DEPT-003 | Engineering |

## Usage Display Modes

| Mode Value | Label | Visible Fields |
|------------|-------|----------------|
| `meter` | Meter Values Only | Transaction Date, Hours Used, Operator |
| `both` | Business Usage and Meter Values | Transaction Date, Hours Used, Operator, Department, Task |
| `business` | Business Usage Only | Transaction Date, Department, Task |
| `all` | All Values (incl. Misc Codes) | Transaction Date, Hours Used, Operator, Department, Task |

## Quick Scenarios

| I want to... | How |
|--------------|-----|
| See the work order details | Navigate to `http://localhost:4200` — the default route loads the Work Order Details page |
| See the employee chooser | Click "Add Employee" in the Currently Working or Tasks section |
| Add employees | Open Employee Chooser → select employees from Crew or Advanced Search tab → click "Add Employee" → click "Confirm" |
| See different task statuses | Check the Tasks section — shows In Progress (TSK-001), Not Started (TSK-002, TSK-004), and Complete (TSK-003) |
| See costs breakdown | Check the Costs section — shows labor ($1,250), parts ($875.50), commercial ($450), grand total ($2,575.50) |
| See service requests | Check the Service Requests section — 3 SRs with High/Medium/Low priorities and Open/Closed statuses |
| See labor/parts/commercial postings | Expand the Postings section — 3 labor, 3 parts, 1 commercial posting |
| See currently assigned employees | Check the Currently Working section — Robert Chen and David Park are assigned |
| See delay code options | Check the Work Delay section — dropdown with 4 delay codes |
| Switch employee chooser tabs | Open Employee Chooser → use the Crew / Advanced Search segmented button |
| Filter employees by crew | Open Employee Chooser → Crew tab → use the crew dropdown to filter |
| Remove a selected employee | Open Employee Chooser → add employees → click Remove on any row in the Selected Employees table |
| Toggle light/dark theme | Use the theme toggle in the top navigation bar |
| Filter by location | Open Employee Chooser → click filter icon → select location(s) → table filters to matching employees |
| Filter by shift | Open Employee Chooser → click filter icon → select shift(s) → table filters to matching employees |
| Filter by skill | Open Employee Chooser → click filter icon → select skill(s) → table filters to matching employees |
| See filter chips | Each side drawer selection shows as a chip (e.g., "Assigned Location: Building A", "Skill: Mechanical") |
| Remove a filter | Click X on a filter chip to remove that filter |
| Open employee detail panel | Open Employee Chooser → click "Employee detail" link on any employee row → Employee Details panel slides in on top |
| See employee skills | Open Employee Details panel → Skills metric card shows skill chips (e.g., Mechanical, Welding) |
| See time code summary | Open Employee Details panel → Time Code metric card shows today's timesheet, capacity, NWA, available, and assigned hours |
| See employee locations | Open Employee Details panel → Locations metric card shows assigned locations with default indicator |
| Expand/collapse work orders | Open Employee Details panel → click a work order expansion panel to expand/collapse, or use Expand All / Collapse All buttons |
| Search work orders | Open Employee Details panel → type in the search input to filter work orders by ID or description |
| See appointments | Open Employee Details panel → Appointments section shows a calendar month view with mock appointment events |
| See calendar events | Open Employee Details panel → Calendar section shows assignment (blue), appointment (green), and NWA (purple) events on the calendar |
| See events for a specific day | Open Employee Details panel → click any day on the calendar → side drawer opens showing all events for that day grouped by type |
| See grouped events in drawer | Click a day with multiple event types → drawer shows expansion panels: "Assignments (N)", "Appointments (N)", "Non-Work Activity (N)" |
| See NWA events | Open Employee Details panel → purple `event_busy` icons on the calendar represent Non-Work Activity events (Vacation, Training, Sick Leave, Meeting) |
| See empty day message | Click a day with no events → drawer shows "No events for this date" |
| Select employee from details | Open Employee Details panel → click "Select" → employee is added to Employee Chooser's selected chips |
| Cancel and return to chooser | Open Employee Details panel → click "Cancel" → returns to Employee Chooser without changes |
| Open the Add Usage panel | Click "Add Usage" in the footer More actions menu → panel slides in |
| Switch usage entry mode | Open Add Usage panel → click "Single Entry" or "Multi Entry" chip toggle |
| Add a multi-entry row | Open Add Usage panel → switch to Multi Entry → click "+ Add" button |
| Delete a multi-entry row | Open Add Usage panel → switch to Multi Entry → click delete icon on a row |
| Change usage display mode | Use the floating "Usage Display Mode" selector in the bottom-right corner of the WO Details page |
| See different field configurations | Change the display mode selector → open Add Usage panel → fields change based on mode |

### Side Drawer Filter Scenarios

| Filter | Employees Shown |
|--------|----------------|
| Location: Building A | Robert Chen, Sarah Williams, Maria Garcia |
| Location: Building B | James Martinez, David Park, Angela Foster |
| Location: Warehouse | Lisa Thompson, Kevin Wright |
| Shift: Day | Robert Chen, Sarah Williams, David Park, Kevin Wright |
| Shift: Swing | James Martinez, Lisa Thompson |
| Shift: Night | Maria Garcia, Angela Foster |
| Skill: Mechanical | Robert Chen, James Martinez, David Park, Angela Foster |
| Skill: Electrical | Sarah Williams, David Park, Maria Garcia, Kevin Wright |
| Skill: Welding | Robert Chen, Lisa Thompson, Angela Foster |
| Skill: HVAC | Sarah Williams, Lisa Thompson, Kevin Wright, Angela Foster |
| Location: Building A + Skill: Electrical | Sarah Williams, Maria Garcia |


## Asset Search (Add Usage Panel)

The Asset search dialog in the Add Usage panel shows assets after typing 2+ characters. Includes fleet and linear assets.

### Assets (11 total)

| Equipment ID | Description | Asset Type | Active | Meter 1 | Meter 1 Reading | Meter 2 | Meter 2 Reading |
|---|---|---|---|---|---|---|---|
| R-12345 | MOTOR POOL SEDAN | Vehicle | Yes | miles | 45,230 | hours | 1,250 |
| QA-FLEET-002 | QA FLEET TRUCK 002 | Vehicle | Yes | miles | 78,500 | hours | 3,200 |
| K123-456 | SERIES 50 DETROIT DIESEL GAS ENGINE | Engine | Yes | hours | 12,400 | — | — |
| QA-C-001 | CARGO VAN 2500 | Vehicle | Yes | miles | 32,100 | hours | 890 |
| FL-VAN-03 | FLEET VAN 03 | Vehicle | Yes | miles | 56,700 | hours | 2,100 |
| TX-TRUCK-07 | PICKUP TRUCK F-150 | Vehicle | Yes | miles | 91,200 | hours | 4,500 |
| EQ-4821 | CENTRIFUGAL PUMP | Pump | Yes | hours | 8,750 | — | — |
| EQ-5102 | HYDRAULIC PRESS | Press | No | hours | 3,200 | — | — |
| ROAD07 | HIGHWAY 07 - MAIN CORRIDOR | Linear | Yes | miles | 150 | — | — |
| UX-BRIDGE-LINEAR | UX TEST BRIDGE - LINEAR ASSET | Linear | Yes | miles | 25 | — | — |
| GEN-9900 | CATERPILLAR 3516B STANDBY DIESEL GENERATOR SET 2000KW EMERGENCY BACKUP POWER UNIT | Generator | Yes | hours | 18,500 | gallons | 4,200 |

> **Note:** Assets with "—" for Meter 2 have no second meter. When selected, Meter 2 fields (Begin, End, Validation) are hidden in both single-entry and multi-entry modes.

### Asset Search Scenarios

| I want to... | How |
|---|---|
| Search for fleet assets | Type "van" or "truck" or "sedan" in the search field |
| Search for linear assets | Type "road" or "bridge" in the search field |
| See inactive assets | Toggle "Include inactive assets" ON, then search for "hydraulic" or "press" (EQ-5102 is inactive) |
| Select an asset | Click a row, then click "Add Asset" |

## Task Lookup (Add Usage Panel)

The Task lookup dialog shows tasks filtered by type. Defaults to Repair filter.

### Tasks (9 total)

| Task ID | Description | Task Type |
|---|---|---|
| TSK-101 | Oil Change | Repair Group |
| TSK-102 | Brake Pad Replacement | Repair Group |
| TSK-103 | Tire Rotation | Repair Task |
| TSK-104 | Air Filter Replacement | Repair Task |
| TSK-105 | Coolant Flush | PM Service |
| TSK-106 | Transmission Service | Repair Group |
| TSK-107 | Battery Replacement | Inspection |
| TSK-108 | Spark Plug Replacement | Repair Task |
| TSK-109 | Alignment Service | PM Service |

### Task Lookup Scenarios

| I want to... | How |
|---|---|
| See repair tasks | Default filter is Repair — shows Repair Group and Repair Task types |
| See PM tasks | Change Task Type filter to "PM Service" |
| See inspection tasks | Change Task Type filter to "Inspection" |
| See all tasks | Clear the Task Type filter (select blank option) |
| Search for a task | Type in the search field to filter by task ID, description, or type |
| Select a task | Click a row, then click "Add" — field shows (Task ID) Description |


## MAWO Parent Work Order

| Field | Value |
|-------|-------|
| Parent Work Order ID | MAWO-2024-001 |
| Parent Title | Multi-Asset Fleet Maintenance — Q4 2024 |

### Children Work Orders (6 total)

| Work Order ID | Title | Asset ID | Asset Description | Status |
|---------------|-------|----------|-------------------|--------|
| CWO-001 | Engine oil change and filter | R-12345 | MOTOR POOL SEDAN | Open |
| CWO-002 | Brake inspection and pad replacement | QA-FLEET-002 | QA FLEET TRUCK 002 | Open |
| CWO-003 | Transmission fluid flush | QA-C-001 | CARGO VAN 2500 | Work Finished |
| CWO-004 | Coolant system service | FL-VAN-03 | FLEET VAN 03 | Open |
| CWO-005 | Tire rotation and alignment | TX-TRUCK-07 | PICKUP TRUCK F-150 | Work Finished |
| CWO-006 | Battery load test and replacement | EQ-4821 | CENTRIFUGAL PUMP | Open |

### MAWO Quick Scenarios

| I want to... | How |
|--------------|-----|
| Switch to MAWO mode | Use the "Work Order Type" selector in the floating settings panel → select "MAWO" |
| See children work orders | Switch to MAWO mode → open Add Usage panel → Children Work Orders expansion panel shows all 6 child WOs |
| Filter children by status | In the Children Work Orders panel, use the status dropdown to select "Open" (4 results) or "Work Finished" (2 results) |
| Search children work orders | In the Children Work Orders panel, type in the search field to filter by asset ID, asset description, work order ID, or title |
| Toggle reversal | Switch to MAWO mode → open Add Usage panel → use the Reversal checkbox next to Hours Used |
