# FE-528 Harness — Technician Work Order Usage

Standalone Angular 18 harness for the **Add Usage** panel. The Work Order Details page is included only as a launching point. Uses mock data only — no API calls, no backend required.

## Quick Start

```bash
npm install
ng serve
```

1. Open `http://localhost:4200`
2. Click **More** in the footer action bar
3. Tap **Add Usage**

## Features

### Launching Point: Work Order Details Page

The Work Order Details page is inherited from a prior harness and serves only as the entry point. The only relevant action here is **More → Add Usage** in the footer action bar.

### Add Usage Panel

Full-width slide-in panel for recording equipment usage. Supports two work order types (Standard and MAWO) and two entry modes (Single Entry and Multi Entry).

#### Floating Settings Panel (bottom-right corner)

The floating panel controls form behavior in real time:

| Setting | Options | Effect |
|---------|---------|--------|
| **Usage Display Mode** | Meter Values Only, Business Usage Only, Business Usage and Meter Values, All Values (incl. Misc) | Controls which value fields are visible. Meter fields = start/end datetime, meter begin/end, meter validation. Business fields = business usage, individual usage, total usage. Fields like Account, Operator, Department, Task, Financial Project Code are always visible regardless of mode. |
| **Time Format** | 12 Hour, 24 Hour | Switches the Start/End Date Time pickers between 12h (hh:mm AM/PM) and 24h (hh:mm) format |
| **Work Order Type** | Standard, MAWO | Switches between Standard and MAWO mode (see below) |
| **Misc Fields** | 4 independent toggles (Misc 1–4) | Each toggle shows/hides its misc field independently. Only visible in "All Values" display mode. No blank spaces when partially enabled. |

#### Input Masking and Validation

| Field | Mask / Validation |
|-------|-------------------|
| **Hours Used** | Numbers only, max 2 decimal places (e.g., `12.50`). Same mask as meter fields. |
| **Meter Begin / End** | Numbers only, max 2 decimal places |
| **Business Usage / Individual Usage** | Numbers only, max 2 decimal places. Increment/decrement buttons (±1). |
| **Total Usage** | Read-only computed field (Business + Individual) |
| **Start / End Date** | Digits and `/` only. Validates `MM/DD/YYYY` format on blur. Invalid input is cleared and reset to the last valid value. |
| **Start / End Time** | 12h mode: digits, `:`, `A`, `M`, `P`, space. 24h mode: digits and `:` only. Validates format on blur. Invalid input is cleared. |

#### Lookup Fields (text input + search icon)

These fields allow free text entry AND have a search icon button for lookup dialogs:

| Field | Search Button Behavior |
|-------|----------------------|
| **Asset** | Opens Asset Search dialog (aw-dialog table type with search) |
| **Task** | Opens Task Lookup dialog (aw-dialog table type with 3-level drill-down, defaults to Repair Group filter) |
| **Operator** | Placeholder alert (dialog not yet implemented) |
| **Account** | Placeholder alert (dialog not yet implemented) |
| **Department** | Placeholder alert (dialog not yet implemented) |
| **Financial Project Code** | Placeholder alert (dialog not yet implemented) |

#### Section Dividers

The form uses conditional dividers to separate sections:
- Between Meter 1 and Meter 2 values
- Between Meter 2 and Business Usage (only when both sections visible)
- Between Total Usage and lookup fields (Account, Operator, etc.)
- Between Financial Project Code and Misc fields

All dividers hide automatically when their adjacent sections are not visible.

#### Standard Mode

- Single Entry (form) and Multi Entry (table) modes via segmented button
- All fields visible based on Usage Display Mode selection
- Transaction Date label

#### MAWO Mode (Multi-Asset Work Order)

When "MAWO" is selected in the Work Order Type toggle:

- **Entry mode toggle hidden** — only single-entry form is available
- **Transaction Date relabeled** to "Usage Date"
- **Hidden fields**: Start Date/Time, End Date/Time, Department, Task, Financial Project Code
- **Operator stays visible** in MAWO mode
- **Reversal toggle** (aw-toggle) appears on the same row as Hours Used
- **Children Work Orders expansion panel** appears at the bottom with:
  - Search bar (filters across asset ID, asset description, work order ID, title)
  - Work Order Status filter (defaults to "Open", options: Open, All, Work Finished)
  - Table with columns: Checkbox, Asset (ID + description), Work Order (ID + title), Status
  - Asset and Work Order columns use text/subtext rendering

### Asset Search Dialog

Table-type aw-dialog with search functionality. Select an asset and click "Go" to populate the Asset field.

### Task Lookup Dialog

Table-type aw-dialog with:
- Search bar
- Task Type filter (defaults to "Repair Group", options: Repair Group, Repair Task, PM Service, Inspection)
- 3-level hierarchical drill-down: Groups → Children → Sub-children
- Breadcrumb navigation for drill-down levels

### Theme Toggle

Dark mode toggle (moon icon, bottom-right) switches between light and dark themes.

## Key Files

| File | Purpose |
|------|---------|
| `src/app/features/add-usage/` | Add Usage panel (form, MAWO, children WO table) |
| `src/app/features/add-usage/usage-entry.interface.ts` | Types, display mode field mappings, MAWO hidden fields |
| `src/app/features/add-usage/asset-search-dialog.component.ts` | Asset lookup dialog |
| `src/app/features/add-usage/task-search-dialog.component.ts` | Task lookup dialog (3-level drill-down) |
| `src/app/features/work-order-details/` | Work Order Details page |
| `src/app/features/employee-chooser/` | Employee Chooser panel |
| `src/app/features/employee-details/` | Employee Details slide-in |
| `src/app/components/table-text-subtext/` | Text/subtext cell component for aw-table |
| `src/app/services/mock-data.service.ts` | All mock data (signals) |
| `src/app/services/panel.service.ts` | Panel open/close management |
| `src/app/services/theme.service.ts` | Light/dark theme toggle |
| `MOCK-DATA-GUIDE.md` | Full mock data reference and quick scenarios |

## Project Structure

```
fe-harness-FE-528/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── details-card/              # Reusable info card
│   │   │   ├── dialogs/base-dialog        # Base dialog class
│   │   │   ├── layouts/anchor-layout/     # Sidebar anchor navigation
│   │   │   └── table-text-subtext/        # Text/subtext table cell
│   │   ├── features/
│   │   │   ├── add-usage/                 # Add Usage panel + dialogs
│   │   │   ├── employee-chooser/          # Employee Chooser panel
│   │   │   ├── employee-details/          # Employee Details slide-in
│   │   │   └── work-order-details/        # Work Order Details page
│   │   ├── services/
│   │   │   ├── mock-data.service.ts       # Mock data provider (signals)
│   │   │   ├── panel.service.ts           # Panel management
│   │   │   ├── drawer.service.ts          # Drawer management
│   │   │   ├── dialog.service.ts          # Dialog service
│   │   │   └── theme.service.ts           # Light/dark toggle
│   │   ├── app.component.*                # App shell (nav + router)
│   │   ├── app.config.ts                  # Providers
│   │   └── app.routes.ts                  # Routes
│   ├── assets/mocks/                      # JSON mock data files
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── MOCK-DATA-GUIDE.md                     # Mock data reference
├── angular.json
├── package.json
└── tsconfig.json
```

## Tech Stack

- Angular 18.2
- TypeScript 5.5
- `@assetworks-llc/aw-component-lib@26.1.1-ng18`
- SCSS
- Karma + Jasmine (testing)

## npm Authentication

This project uses `@assetworks-llc/aw-component-lib` from a private registry. Ensure your `.npmrc` is configured with the correct registry and auth token before running `npm install`.
