# Design System Rules — fe-929-harness

## Figma MCP Integration Guidelines

- Treat Figma MCP output (React + Tailwind) as a representation of design intent, not final code.
- Replace Tailwind utility classes with the project's SCSS patterns and `@assetworks-llc/aw-component-lib` tokens.
- Reuse existing `aw-component-lib` components instead of duplicating functionality.
- Respect existing routing, state management, and data-fetch patterns already in the repo.
- Strive for 1:1 visual parity with Figma designs. When conflicts arise, prefer design-system tokens.
- Validate the final UI against the Figma screenshot for both look and behavior.

## Token Definitions

- Design tokens (colors, typography, spacing) come from `@assetworks-llc/aw-component-lib/styles/styles.scss`.
- The library's stylesheet is imported globally in `src/styles.scss` and also referenced in `angular.json` build styles.
- Theme is activated via `<body class="mat-typography light-theme">` in `src/index.html`.
- No custom token transformation system — tokens are consumed directly from the library's SCSS.

### Figma → Storybook Color Token Mapping

Figma uses short names (e.g., `text-primary`). In code, use the corresponding CSS custom property:

| Figma Name | CSS Variable |
|---|---|
| `text-primary` | `var(--system-text-text-primary)` |
| `text-secondary` | `var(--system-text-text-secondary)` |
| `text-disabled` | `var(--system-text-text-disabled)` |
| `text-primary-alt` | `var(--system-text-text-primary-alt)` |
| `text-secondary-alt` | `var(--system-text-text-secondary-alt)` |
| `link-active` | `var(--system-links-link-active)` |
| `link-hover-longpress` | `var(--system-links-link-hover-longpress)` |
| `surfaces-raised` | `var(--system-surfaces-surfaces-raised)` |
| `surfaces-background` | `var(--system-surfaces-surfaces-background)` |
| `surfaces-lower` | `var(--system-surfaces-surfaces-lower)` |
| `stat-info` | `var(--system-status-status-info)` |
| `stat-success` | `var(--system-status-status-success)` |
| `stat-warning` | `var(--system-status-status-warning)` |
| `stat-error` | `var(--system-status-status-error)` |
| `stat-selected` | `var(--system-status-status-selected)` |
| `stat-amount` | `var(--system-status-status-amount)` |
| `stat-disabled` | `var(--system-status-status-disabled)` |
| `stat-hover` | `var(--system-status-status-hover)` |
| Line divider | `var(--system-line-divider-stroke-line-color)` |

### Figma → Storybook Typography Mapping

Figma uses style names like `headline-4`. In code, apply the corresponding CSS class:

| Figma Style | Size/Line-height | CSS Class |
|---|---|---|
| `headline-1` | 56/59 | `.aw-h-1` |
| `headline-2` | 45/48 | `.aw-h-2` |
| `headline-3` | 34/40 | `.aw-h-3` |
| `headline-4` | 24/32 | `.aw-h-4` |
| `headline-5` | 20/28 | `.aw-h-5` |
| `subtitle 1` | 16/24 | `.aw-st-1` |
| `subtitle 1 medium` | 16/24 | `.aw-st-1-medium` |
| `subtitle 1 semibold` | 16/24 | `.aw-st-1-semi-bold` |
| `body 1` | 14/20 | `.aw-b-1` |
| `body 1 medium` | 14/20 | `.aw-b-1-medium` |
| `caption` | 12/16 | `.aw-c-1` |
| `caption forced small caps` | 12/16 | `.aw-c-1` + `text-transform: uppercase` |

**Rule**: Never use raw `font-size`/`line-height`/`font-weight` in SCSS when a typography class exists. Apply the class in the template instead. Only fall back to raw values if no matching class exists.

## ⚠️ Component Library First — Mandatory Rule

**NEVER write custom HTML/CSS for UI patterns that already exist in `@assetworks-llc/aw-component-lib`.** Before creating any custom element (hint text, form messages, badges, tooltips, etc.):

1. **Assume the library has it.** The component library has been developed for years and covers most UI patterns.
2. **Check the library source** in `INN-ComponentLibrary/projects/aw-component-lib/src/` or the `.d.ts` files in `node_modules/@assetworks-llc/aw-component-lib/` to find the correct component/directive.
3. **Use the Storybook MCP** (`mcp_storybook_getComponentList`) to discover available components if unsure.
4. **Check content projection slots** in component templates — many `aw-*` components accept child content via `ng-content` selectors (e.g., `aw-form-message[type=info]` for hint text inside `aw-form-field`).
5. **Never say a library component "doesn't exist"** without thoroughly checking the source. If a grep search fails, look at the actual source files or Storybook.
6. **Only create custom elements** when explicitly told to by the user, or when the library genuinely has no equivalent after a thorough search.

### Known Library Components (Quick Reference)

| UI Pattern | Library Component | Usage |
|---|---|---|
| Form field wrapper | `AwFormFieldComponent` (`<aw-form-field>`) | Wraps inputs with label, hint, error |
| Form label | `AwFormFieldLabelComponent` (`<aw-form-field-label>`) | Label inside `aw-form-field` |
| Form hint/info text | `AwFormMessageComponent` (`<aw-form-message type="info">`) | Hint text below label, above input |
| Form error text | `AwFormMessageComponent` (`<aw-form-message type="error">`) | Error message below label |
| Input directive | `AwInputDirective` (`AwInput`) | Applied to `<input>` or `<textarea>` |
| Toast notifications | `AwToastComponent` (`<aw-toast>`) | Success/error/info toasts |
| Badge | `AwBadgeComponent` (`<aw-badge>`) | Status badges |
| Dialog | `AwDialogComponent` (`<aw-dialog>`) | Modal dialogs |
| Side drawer | `AwSideDrawerComponent` (`<aw-side-drawer>`) | Slide-out panels |
| Expansion panel | `AwExpansionPanelComponent` (`<aw-expansion-panel>`) | Collapsible sections |
| Select menu | `AwSelectMenuComponent` (`<aw-select-menu>`) | Dropdown selectors |
| Table | `AwTableComponent` (`<aw-table>`) | Data tables |
| Divider | `AwDividerComponent` (`<aw-divider>`) | Section dividers |
| Icon | `AwIconComponent` (`<aw-icon>`) | Material icons |

## Component Library

- All UI components come from `@assetworks-llc/aw-component-lib` (currently v26.0.18-ng18).
- Components are standalone Angular components imported directly into each consuming component's `imports` array.
- Custom project components live in `src/app/components/` (e.g., `aw-list`, `dialogs/base-dialog`).
- Page-level components live in `src/app/pages/` organized by feature.

### Common Imports

```typescript
// Navigation
import { AwNavigationMenuComponent, AwTopNavigationComponent } from '@assetworks-llc/aw-component-lib';

// Layout
import { AwDividerComponent, AwActionBarComponent, AwFooterComponent } from '@assetworks-llc/aw-component-lib';

// Forms
import { AwFormFieldComponent, AwFormFieldLabelComponent, AwInputDirective, AwSelectMenuComponent, AwToggleComponent } from '@assetworks-llc/aw-component-lib';

// Data Display
import { AwTableComponent, AwBadgeComponent, AwChipComponent, AwMetricCardComponent } from '@assetworks-llc/aw-component-lib';

// Overlays
import { AwDialogComponent, AwSideDrawerComponent } from '@assetworks-llc/aw-component-lib';

// Buttons & Icons
import { AwButtonDirective, AwButtonIconOnlyDirective, AwIconComponent } from '@assetworks-llc/aw-component-lib';

// Types
import { TableCellInput, TableCellTypes, MultiSelectOption, SingleSelectOption, DialogOptions, DialogVariants, SideDrawerInformation } from '@assetworks-llc/aw-component-lib';
```

## Framework & Architecture

- Angular 18 with standalone components (no NgModules).
- SCSS for component styles (`angular.json` schematics default to `style: scss`).
- Lazy-loaded routes via `loadComponent` in `app.routes.ts`.
- Reactive patterns use Angular signals (`signal()`, `computed()`, `input()`) and RxJS where needed.
- Change detection: `ChangeDetectionStrategy.OnPush` preferred.
- Forms: Reactive forms (`FormGroup`, `FormControl`) from `@angular/forms`.

## Styling Approach

- SCSS with component-scoped styles (Angular default encapsulation, some components use `ViewEncapsulation.None`).
- Global styles in `src/styles.scss` — includes library import and utility classes like `.aw-sticky-footer`, `.aw-page-min-height`.
- No Tailwind CSS — do not use utility-first CSS classes.
- Font: Roboto (set globally on `html, body`).

## Asset Management

- Library assets copied via `angular.json` glob: `node_modules/@assetworks-llc/aw-component-lib/assets` → `assets/`.
- Static assets in `public/` directory.

## Project Structure

```
src/
├── app/
│   ├── components/       # Reusable custom components (aw-list, dialogs)
│   ├── pages/            # Feature pages (lazy-loaded routes)
│   ├── services/         # Shared services (dialog.service, vendor-view.service)
│   ├── app.component.*   # Root shell with navigation
│   ├── app.config.ts     # App configuration
│   └── app.routes.ts     # Route definitions
├── styles.scss           # Global styles + library import
├── index.html            # Entry HTML with theme class
└── main.ts               # Bootstrap
```

## Key Patterns

- Dialogs extend `BaseDialogComponent` and use `DialogService` for programmatic opening.
- Table click navigation uses event delegation on container divs (aw-table has no built-in cell click handlers).
- Side drawers use `<aw-side-drawer>` with child content components.
- Services use `inject()` function (not constructor injection).

## Currency Input Fields — Standard Pattern

All currency input fields in this app use the same approach. Do NOT use `aw-icon` prefix or any icon-based dollar sign.

**How it works:**
1. Use a plain `<input AwInput>` with `placeholder="$0.00"` and `type="text"` / `inputmode="decimal"`
2. Store the FormControl value as a string (e.g., `'$45.00'`)
3. On focus: strip the `$` and formatting, show the raw number for editing
4. On blur: re-format as `$X.XX` (with comma thousands separators) and write back to the control
5. The `parseFormCurrency()` helper strips `$` and non-numeric chars when reading values for calculations

**Template pattern:**
```html
<aw-form-field>
  <aw-form-field-label>Labor Cost</aw-form-field-label>
  <input AwInput placeholder="$0.00" type="text" formControlName="laborCost"
    inputmode="decimal" aria-label="Labor Cost"
    (focus)="onCurrencyFocus('laborCost')" (blur)="onCurrencyBlur('laborCost')" />
</aw-form-field>
```

**TypeScript pattern:**
```typescript
onCurrencyFocus(controlName: string): void {
  const ctrl = this.form.get(controlName);
  if (!ctrl) return;
  const raw = String(ctrl.value ?? '').replace(/[^0-9.]/g, '');
  ctrl.setValue(raw === '0' ? '' : raw, { emitEvent: false });
}

onCurrencyBlur(controlName: string): void {
  const ctrl = this.form.get(controlName);
  if (!ctrl) return;
  let val = String(ctrl.value ?? '').replace(/[^0-9.]/g, '');
  if (val === '') return;
  const num = parseFloat(val);
  if (isNaN(num)) return;
  const formatted = '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  ctrl.setValue(formatted, { emitEvent: false });
}
```

**Rules:**
- Never use `<aw-icon [iconName]="'attach_money'">`  as a prefix for currency fields
- Never use Angular `CurrencyPipe` inside the input value — only for read-only display text
- Initial values should be set as formatted strings (e.g., `'$45.00'`) so they display correctly on load
- The `parseFormCurrency()` helper must handle both `number` and `string` types since values toggle between raw and formatted
