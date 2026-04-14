# fe-harness-FE-65232 — Work Order & Employee Chooser Harness

Standalone Angular 18 harness app for the Work Order Details page and Employee Chooser panel. Uses mock data only — no API calls, no backend required.

## Quick Start

```bash
npm install
ng serve
```
Directions: 
1. Open `http://localhost:4200`. The Work Order Details page loads by default.
2. Tap Add employee
3. Tap employee details on the employee chooser table to see the new design for the Employee Details slide in page

## What This Is

This harness replicates two FA-Suite components in isolation:

1. **Work Order Details Page** — Full layout with info cards, costs, tasks, service requests, postings, currently working, work delay, and a sticky footer action bar.
2. **Employee Chooser Panel** — Slide-in panel with Crew/Advanced Search tabs, checkbox selection, combined selection table, and confirm/cancel flow.

All data comes from JSON files in `src/assets/mocks/`. No real API calls are made.

## How to Use with Your Workspace

Add this harness folder alongside your FA-Suite checkout so Kiro can see both:

```
your-workspace/
├── FA-Suite-Main/          ← your FA-Suite repo
├── fe-harness-FE-65232/    ← this harness
└── harness-app-architect.md
```

Then reference the harness components when building the real implementation.

## Key Files

| File | Purpose |
|------|---------|
| `src/app/features/work-order-details/` | Work Order Details page component |
| `src/app/features/employee-chooser/` | Employee Chooser panel component |
| `src/app/components/layouts/anchor-layout/` | Anchor sidebar layout |
| `src/app/components/details-card/` | Reusable info card component |
| `src/app/services/mock-data.service.ts` | Mock data provider (signals + JSON) |
| `src/app/services/theme.service.ts` | Light/dark theme toggle |
| `src/assets/mocks/work-order.json` | Work order mock data |
| `src/assets/mocks/employees.json` | Employee mock data |
| `MOCK-DATA-GUIDE.md` | Full mock data reference and quick scenarios |

## Kiro Usage Tips

When working with this harness alongside FA-Suite, try prompts like:

- "Look at the Work Order Details page in fe-harness-FE-65232 and help me recreate this layout in my FA-Suite module"
- "Compare the employee chooser in the harness with my current implementation and suggest what I'm missing"
- "Use the mock data structure from fe-harness-FE-65232/src/assets/mocks/work-order.json as a reference for my API response interface"
- "The harness has an anchor layout with sidebar navigation — help me wire up the same pattern in my page"

The harness includes steering files in `.kiro/steering/` that Kiro automatically picks up when working in this folder. See `harness-app-architect.md` for harness conventions.

## Mock Data Summary

| File | Contents |
|------|----------|
| `work-order.json` | Work order info, asset info, costs ($2,575.50 total), 4 tasks, 3 service requests, labor/parts/commercial postings, 2 current assignments, 4 delay codes |
| `employees.json` | 3 crews, 5 crew employees, 5 advanced search employees, filter options (3 locations, 3 shifts, 4 skills) |

See [MOCK-DATA-GUIDE.md](./MOCK-DATA-GUIDE.md) for full data reference and quick demo scenarios.

## Project Structure

```
fe-harness-FE-65232/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── details-card/          # Reusable info card
│   │   │   ├── dialogs/               # Dialog components
│   │   │   └── layouts/
│   │   │       └── anchor-layout/     # Sidebar anchor navigation
│   │   ├── features/
│   │   │   ├── employee-chooser/      # Employee Chooser panel
│   │   │   └── work-order-details/    # Work Order Details page
│   │   ├── services/
│   │   │   ├── mock-data.service.ts   # Mock data provider
│   │   │   ├── theme.service.ts       # Light/dark toggle
│   │   │   └── dialog.service.ts      # Dialog service
│   │   ├── app.component.*            # App shell (nav menu + router)
│   │   ├── app.config.ts              # Providers (animations, HTTP)
│   │   └── app.routes.ts              # Routing config
│   ├── assets/mocks/
│   │   ├── work-order.json
│   │   └── employees.json
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── .kiro/steering/
│   ├── harness-app-architect.md       # Harness conventions
│   └── mock-data-sync.md             # Mock data sync reminder
├── MOCK-DATA-GUIDE.md                 # Full mock data reference
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

This project uses `@assetworks-llc/aw-component-lib` from a private registry. Ensure your `.npmrc` is configured with the correct registry and auth token before running `npm install`. See the root `.npmrc` for the registry URL.
