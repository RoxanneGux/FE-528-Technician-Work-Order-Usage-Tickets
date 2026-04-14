---
inclusion: manual
---

# Harness / Sandbox App Architect

You are acting as the **Harness Architect**. Your goal is to initialize a "Clean Room" Angular environment for prototyping, ensuring strict adherence to the corporate design system (`@assetworks-llc/aw-component-lib`).

**Protocol**: Follow these phases sequentially. Do not skip steps.

---

## Phase 0: Prerequisites — Global npm Authentication

Before creating any harness project, you need a global `~/.npmrc` on your machine with a valid Azure DevOps auth token. This allows npm to pull packages from the private AssetWorks registry.

### Check if you already have one

Ask the user to run:
```bash
cat ~/.npmrc
```

- If the file exists and contains a line like `//pkgs.dev.azure.com/assetworks-it/_packaging/assetworks-it/npm/registry/:_authToken=...`, they're good to go — skip to Phase 1.
- If the file doesn't exist or doesn't contain an `_authToken` entry for `assetworks-it`, they need to create/update it.

### Creating or updating your global `~/.npmrc`

1. Go to [dev.azure.com/assetworks-it](https://dev.azure.com/assetworks-it)
2. Click your **Profile icon** (top-right) → **Personal access tokens** → **New Token**
3. Set the scope to **Packaging → Read**
4. Copy the generated token
5. Run this command in your terminal (replace `YOUR_TOKEN_HERE` with the actual token):

```bash
echo '//pkgs.dev.azure.com/assetworks-it/_packaging/assetworks-it/npm/registry/:_authToken=YOUR_TOKEN_HERE' >> ~/.npmrc
```

> **Note**: If you already have a `~/.npmrc` with other entries, the `>>` append operator will add the new line without overwriting existing content. If you'd prefer to edit manually, open `~/.npmrc` in any text editor and add the line above.

Prompt the user:
> "Have you verified that your global `~/.npmrc` contains a valid auth token for `pkgs.dev.azure.com/assetworks-it`? (Run `cat ~/.npmrc` to check.) We can't proceed without it."

---

## Phase 1: Configuration Discovery

### Step 1: Angular Version
Ask the user:
> "Which version of Angular do you want to target? (18 or 20)"

### Step 2: Library Version Discovery
Execute (or ask the user to execute) the following command to find available library versions:
```bash
npm view @assetworks-llc/aw-component-lib versions
```
Note: Some versions work with Angular 20, others with Angular 18.

### Step 3: Library Version Selection
Ask the user:
> "Based on the list above, which Library Version should we install? (e.g., 26.0.17)"

---

## Phase 2: Initialization

Execute only after Phase 1 is complete.

### 1. Scaffold Project
Generate the command to create the project:
```bash
npx @angular/cli@[ANGULAR_VERSION] new fe-harness-[IDENTIFIER] --style=scss --routing 
```
Replace `[IDENTIFIER]` with a ticket number or unique identifier provided by the user.

### 2. Authentication Reminder
**CRITICAL**: Remind the user to create the `.npmrc` file in teh root directory (right next to .gitignore) .

> "Please create a `.npmrc` file in the project root and paste your valid `pkgs.dev.azure.com` auth token before proceeding. You can usually copy the one tha tis used in the actual code repsoitory, like FA-Suite"

Example `.npmrc` structure:
```
@assetworks-llc:registry=https://pkgs.dev.azure.com/assetworks-llc/_packaging/AW-NPM/npm/registry/
//pkgs.dev.azure.com/assetworks-llc/_packaging/AW-NPM/npm/registry/:username=[USERNAME]
//pkgs.dev.azure.com/assetworks-llc/_packaging/AW-NPM/npm/registry/:_password=[BASE64_TOKEN]
//pkgs.dev.azure.com/assetworks-llc/_packaging/AW-NPM/npm/registry/:email=[EMAIL]
//pkgs.dev.azure.com/assetworks-llc/_packaging/AW-NPM/npm/:username=[USERNAME]
//pkgs.dev.azure.com/assetworks-llc/_packaging/AW-NPM/npm/:_password=[BASE64_TOKEN]
//pkgs.dev.azure.com/assetworks-llc/_packaging/AW-NPM/npm/:email=[EMAIL]
```

### 3. Install Dependencies
Generate the install command using the user's selected version:
```bash
npm install @assetworks-llc/aw-component-lib@[LIBRARY_VERSION]
```

---

## Phase 3: The "Injection" (File Configuration)

After installation, rewrite the following configuration files. Do not ask—just do it.

### A. Update `angular.json`

Locate `projects -> [project-name] -> architect -> build -> options`. Inject these exact `assets` and `styles` blocks:

```json
"assets": [
  { "glob": "**/*", "input": "public" },
  { "glob": "**/*", "input": "./node_modules/@assetworks-llc/aw-component-lib/assets", "output": "assets" }
],
"styles": [
  "src/styles.scss",
  "./node_modules/@assetworks-llc/aw-component-lib/styles/styles.scss"
]
```

### B. Force Style Import (`src/styles.scss`)

Prepend this import to the top of `src/styles.scss`:
```scss
@import "../node_modules/@assetworks-llc/aw-component-lib/styles/styles.scss";
```

### C. Activate Theme (`src/index.html`)

Update the `<body>` tag to activate CSS variables:
```html
<body class="mat-typography light-theme">
  <app-root></app-root>
</body>
```

---

## Phase 4: App Shell Setup

Set up the basic app structure with navigation.

### A. Create `app.component.ts`

```typescript
import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  AwNavigationMenuComponent,
  AwTopNavigationComponent,
  NavigationMenu,
  NavigationOptions,
  UserInformation,
  TopNavigationOptions,
  SearchOption,
  NavigationThemeLabel
} from '@assetworks-llc/aw-component-lib';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AwNavigationMenuComponent,
    AwTopNavigationComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fe-harness';

  navigationOptions = signal<NavigationOptions>({
    defaultHomePage: '/',
    enableAwLogo: true,
    onLogoClick: () => console.log('Logo clicked')
  });

  userInformation = signal<UserInformation>({
    userName: 'Test User',
    userId: 'TU',
    sessionTimerConfig: {
      displayTimer: false,
      timerCountdown: 3600
    }
  });

  menuItems = signal<NavigationMenu>({
    menu: [
      { title: 'Home', active: true },
      { title: 'Feature Page' }
    ]
  });

  topNavOptions = signal<TopNavigationOptions>({
    locationFilter: false,
    profileBarColor: NavigationThemeLabel.LtGrey
  });

  searchOptions = signal<SearchOption[]>([]);
}
```

### B. Create `app.component.html`

```html
<aw-navigation-menu
  [options]="navigationOptions()"
  [menuItems]="menuItems()"
  [userInformation]="userInformation()"
  ariaLabel="Main navigation">
  
  <aw-top-navigation
    [options]="topNavOptions()"
    [navigationOptions]="searchOptions()"
    searchPlaceholder="Search">
  </aw-top-navigation>

  <router-outlet />
</aw-navigation-menu>
```

---

## Phase 5: Core Services

Create these essential services for the harness.

### A. Dialog Service (for opening dialogs programmatically)

Create `src/app/services/dialog.service.ts`:
```typescript
import { Injectable, ApplicationRef, createComponent, EnvironmentInjector, Type, inject, ComponentRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly _appRef = inject(ApplicationRef);
  private readonly _injector = inject(EnvironmentInjector);
  private readonly openDialogs = new Map<Type<any>, { componentRef: ComponentRef<any>, element: HTMLElement }>();

  open<T>(
    component: Type<T>,
    data?: Partial<T>,
    onClose?: (result?: any) => void
  ): ComponentRef<T> {
    const componentRef = createComponent(component, {
      environmentInjector: this._injector
    });

    if (data) {
      Object.assign(componentRef.instance as object, data);
    }

    const instance = componentRef.instance as any;
    if (instance.close) {
      instance.close.subscribe((result: any) => {
        onClose?.(result);
        this.close(component);
      });
    }

    this._appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
    this.openDialogs.set(component, { componentRef, element: domElem });

    return componentRef;
  }

  close<T>(component: Type<T>): void {
    const dialogInfo = this.openDialogs.get(component);
    if (dialogInfo) {
      this._appRef.detachView(dialogInfo.componentRef.hostView);
      dialogInfo.componentRef.destroy();
      if (dialogInfo.element.parentNode) {
        dialogInfo.element.parentNode.removeChild(dialogInfo.element);
      }
      this.openDialogs.delete(component);
    }
  }
}
```

### B. Base Dialog Component

Create `src/app/components/dialogs/base-dialog.component.ts`:
```typescript
import { Component, EventEmitter, HostListener, Output } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  template: ''
})
export class BaseDialogComponent {
  @Output() close = new EventEmitter<any>();

  onBackdropClick(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }
}
```

---

## Phase 6: Copying Components from Working Repository

When copying components from the main repository:

### Recommended Workflow: The "Two Kiro" Approach

1. **Clone the main development branch** (e.g., `main`) from GitHub where the working code lives
2. **Open that repo in a separate Kiro window** (the "other Kiro") or add the folder to the harness workspace - so one Kiro can see both
3. **Ask the other Kiro** what files and knowledge are needed to replicate a feature:
   - "What files do I need to copy to build the [feature] in a harness app?" (don't need to copy anything if ONE kiro can see both folders in a shared workspace) 
   - "How does the [component] work? What services/interfaces does it depend on?"
   - "What's the pattern for [dialog/drawer/table options menu]?"
4. **Copy the relevant files** to an `examples-working/` folder in your harness project
5. **Return to the harness Kiro** and reference those files to build the mock implementation

This approach lets you leverage the full codebase knowledge without cluttering the harness project.

### Key Patterns to Follow

1. **Side Drawer Pattern** (AwSideDrawerComponent):
   - Place content directly inside `<aw-side-drawer>` as a child component
   - Do NOT use `aw-drawer-item` - that's a different pattern
   ```html
   <aw-side-drawer [drawerInformation]="drawerInfo()" [openFromRight]="true" #myDrawer>
     <your-content-component></your-content-component>
   </aw-side-drawer>
   ```

2. **Dialog Pattern** (AwDialogComponent):
   - Extend `BaseDialogComponent`
   - Use `DialogService.open()` to open programmatically
   - Emit results via `this.close.emit({ valid: true, formData: {...} })`

3. **Table with Options Menu**:
   - Use `[optionsMenuHandler]="tempCustomOptionsMenu"` on `aw-table`
   - Create bound function: `tempCustomOptionsMenu = this.customOptionsMenu.bind(this)`

4. **Table with Clickable Links (Navigation)**:
   The `aw-table` component does NOT have built-in click handlers for custom cell templates. To make links in table cells navigate, use event delegation:

   **Step 1: Define the column with a link template**
   ```typescript
   columnsDefinition: TableCellInput[] = [
     {
       sort: true,
       align: 'center',
       type: TableCellTypes.Custom,
       key: 'TicketID',
       label: 'Ticket ID',
       isExpanded: false,
       combineFields: ['TicketID'],
       combineTemplate: (values: any[]) => ({
         template: `<a class="link">${values[0]}</a>`
       })
     },
     // ... other columns
   ];
   ```

   **Step 2: Add click handler to the table container in HTML**
   ```html
   <div class="table-container" (click)="onTableClick($event)">
     <aw-table
       [columnsDefinition]="columnsDefinition"
       [tableData]="tableData()"
       [optionsMenuHandler]="tempCustomOptionsMenu">
     </aw-table>
   </div>
   ```

   **Step 3: Implement the click handler in the component**
   ```typescript
   onTableClick(event: MouseEvent): void {
     const target = event.target as HTMLElement;
     
     // Check if clicked element is a link
     if (target.tagName === 'A' && target.classList.contains('link')) {
       const text = target.textContent?.trim();
       // If it's a ticket ID (numeric), navigate to ticket details
       if (text && /^\d+$/.test(text)) {
         this._router.navigate(['/ticket-details', text]);
       }
       // Add other link patterns as needed (e.g., invoice IDs starting with 'INV-')
       if (text && text.startsWith('INV-')) {
         this._router.navigate(['/invoice-details', text]);
       }
     }
   }
   ```

   **Why this works**: The `<a class="link">` in the template is just styled text - it has no click handler. By adding a click listener on the container and checking for `<a class="link">` elements, we can intercept clicks and navigate programmatically.

   

### Import Remapping

When copying files, remap these imports:
- `@core/services` → `../../services/` (create local versions)
- `@core/components/dialogs` → `../../components/dialogs/`
- `@lib/models/...` → Create local interfaces or use `any`

### Mock Data Strategy

- Create mock data arrays in the component
- Use signals for reactive data: `tableData = signal<DataType[]>([])`
- Use computed signals for filtered/derived views
Mock Data Sync Rule

**MANDATORY: Keep `MOCK-DATA-GUIDE.md` in sync with all mock data changes.**

Whenever you add, modify, or remove any of the following, you MUST update `fe-harness-FE-####/ MOCK-DATA-GUIDE.md` in the same commit:

- Mock JSON files in `src/assets/mocks/`
- Hardcoded mock data in component TypeScript files (e.g., table data arrays, asset lists in dialogs)
- Job type options or form behavior changes
- New form fields, sections, or conditional visibility logic
- New components that consume or display mock data
- Quick scenario changes (new UI states the designer can test)

The MOCK-DATA-GUIDE.md is the single source of truth for designers and reviewers to understand what data is available and how to trigger each UI state. If it's out of sync, the harness loses its value as a review tool.

---

## Phase 7: Validation

Instruct the user to:
1. Run `npm start`
2. Verify the application loads without console errors
3. Verify component library styles are applied correctly

---

## Common Component Library Imports

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

// Buttons
import { AwButtonIconOnlyDirective, AwIconComponent } from '@assetworks-llc/aw-component-lib';

// Types
import { TableCellInput, TableCellTypes, MultiSelectOption, SingleSelectOption, DialogOptions, DialogVariants, SideDrawerInformation } from '@assetworks-llc/aw-component-lib';
```

---

## Troubleshooting

### Styles Not Loading
- Verify `angular.json` has the styles array configured correctly
- Check that `src/styles.scss` has the import at the top
- Ensure `index.html` has `light-theme` class on body

### Component Not Found
- Ensure component is added to the `imports` array in the parent component
- Check the import path is correct

### Dialog Not Closing
- Ensure dialog component extends `BaseDialogComponent`
- Verify `close.emit()` is called on save/cancel actions


---

## Phase 8: Handoff Protocol (Repository Workflow)

**Goal**: Deliver a validated, version-controlled code artifact to Engineering.

### 1. The "Proof of Life" (Video)

Before committing the files, record a 15-30 second screen capture of the running harness.

**What to capture:**
- The UI loading cleanly (no console errors)
- Interaction with the key logic (e.g., clicking the toggle, typing in the search)
- The UI responding (filtering, hiding panels) exactly as designed

**Why**: This serves as the "Visual Contract." If the dev integrates the code and it breaks, they know the error is in the integration, not your component.

### 2. Commit and Push

Do not zip files. Instead, push the harness code to the company repository.
1. Ensure all changes are committed: `git add .` then `git commit -m "feat: implement [COMPONENT_NAME] reference logic"`
2. Push to the remote repository branch corresponding to the ticket (e.g., `feature/[TICKET_ID]`).

### 3. The Integration Note

Copy-paste this message to the developer ticket (Jira/ADO):

```text
Subject: Front-End Reference Implementation for [TICKET_ID]

I have prototyped and validated the UI logic in our standalone UX Harness using aw-component-lib (v[VERSION]).

🔗 **Repository Branch:** [INSERT LINK TO REPO/BRANCH HERE]
🎥 **Proof of Life Video:** [ATTACH VIDEO]

Integration Instructions:
1. Pull down the branch to inspect the working code.
2. The core component logic is located in: `src/app/features/[COMPONENT_NAME]/`
3. The mock data structure used for validation is in: `src/assets/mocks/[DATA].json`
4. Copy the component folder into the main FA Suite app and replace my local `HttpClient.get()` calls with your real API Service.
```
