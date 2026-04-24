# AGENTS.md — `src/components/`

> This document describes the component architecture, conventions, and rules for the PUSPA project's `src/components/` directory. AI agents and developers **must** follow these guidelines when creating, editing, or reviewing components.

---

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [Component Inventory](#component-inventory)
3. [Custom Components — Detailed Reference](#custom-components--detailed-reference)
4. [shadcn/ui Primitives](#shadcnui-primitives)
5. [Conventions](#conventions)
6. [Anti-Patterns](#anti-patterns)

---

## Directory Structure

```
src/components/
├── AGENTS.md                 ← you are here
├── app-sidebar.tsx           ← custom: collapsible role-based sidebar
├── command-palette.tsx       ← custom: bilingual search command palette
├── puspa-icons.tsx           ← custom: PUSPA SVG icon system
├── theme-provider.tsx        ← custom: next-themes wrapper
└── ui/                       ← shadcn/ui primitives (48 files, AUTO-GENERATED)
    ├── accordion.tsx
    ├── alert.tsx
    ├── alert-dialog.tsx
    ├── aspect-ratio.tsx
    ├── avatar.tsx
    ├── badge.tsx
    ├── breadcrumb.tsx
    ├── button.tsx
    ├── calendar.tsx
    ├── card.tsx
    ├── carousel.tsx
    ├── chart.tsx
    ├── checkbox.tsx
    ├── collapsible.tsx
    ├── command.tsx
    ├── context-menu.tsx
    ├── dialog.tsx
    ├── drawer.tsx
    ├── dropdown-menu.tsx
    ├── form.tsx
    ├── hover-card.tsx
    ├── input.tsx
    ├── input-otp.tsx
    ├── label.tsx
    ├── menubar.tsx
    ├── navigation-menu.tsx
    ├── pagination.tsx
    ├── popover.tsx
    ├── progress.tsx
    ├── radio-group.tsx
    ├── resizable.tsx
    ├── scroll-area.tsx
    ├── select.tsx
    ├── separator.tsx
    ├── sheet.tsx
    ├── sidebar.tsx
    ├── skeleton.tsx
    ├── slider.tsx
    ├── sonner.tsx
    ├── switch.tsx
    ├── table.tsx
    ├── tabs.tsx
    ├── textarea.tsx
    ├── toast.tsx
    ├── toaster.tsx
    ├── toggle.tsx
    ├── toggle-group.tsx
    └── tooltip.tsx
```

---

## Component Inventory

| Category | Count | Location | Editable? |
|---|---|---|---|
| Custom components | 3 | `src/components/*.tsx` | Yes |
| Icon system | 1 | `src/components/puspa-icons.tsx` | Yes |
| shadcn/ui primitives | 48 | `src/components/ui/*.tsx` | **No — regenerate via CLI** |

---

## Custom Components — Detailed Reference

### 1. `app-sidebar.tsx` — Collapsible Sidebar with Role-Based Navigation

The main application navigation sidebar. Handles both desktop and mobile layouts with distinct behaviors.

#### Internal Component Hierarchy

| Component | Purpose |
|---|---|
| `SidebarBrand` | Renders the PUSPA logo/brand mark |
| `NavItemButton` | Individual clickable nav item with icon + label |
| `NavSectionLabel` | Top-level group heading label |
| `NavSubSectionLabel` | Sub-section heading within a group |
| `RoleSwitcher` | Dropdown to switch between staff/admin/developer roles |
| `SidebarFooter` | Footer area with role switcher and user info |
| `NavGroupRenderer` | Renders a single navigation group and its children |
| `SidebarContent` | Composes all NavGroupRenderers with role filtering |
| `AppSidebar` | Root export — assembles brand, content, and footer |

#### Desktop Behavior

- Starts **collapsed** at 72px (icons-only mode)
- On hover, expands to **260px** (full labels visible)
- Can be **pinned** (stays expanded) or **collapsed** (returns to icon-only)
- Uses the `useIsDesktop()` custom hook

#### Mobile Behavior

- Rendered as a **Sheet overlay** (slide-in from left)
- Triggered by a hamburger button in the top bar
- Full-width navigation with all labels visible

#### Navigation Structure

- **7 navigation groups** total
- The "AI & Automasi" group contains **4 sub-sections**
- Items are filtered by role via `getVisibleGroups(role)`

#### Role Filtering

Three roles are supported: `staff`, `admin`, `developer`. The `getVisibleGroups(role)` function returns only the navigation groups visible to the current role.

#### Branding

- Brand color: `#4B0082` (indigo)
- Active nav items use a **gradient active state**
- PUSPA icons from `puspa-icons.tsx` are used for brand consistency

#### Key Hook: `useIsDesktop()`

```ts
// Uses useSyncExternalStore + matchMedia for SSR-safe responsive detection
const isDesktop = useIsDesktop();
```

---

### 2. `theme-provider.tsx` — next-themes ThemeProvider Wrapper

A thin wrapper around `next-themes`' `ThemeProvider`.

#### Exports

| Export | Type | Description |
|---|---|---|
| `ThemeProvider` | Component | Wraps children with theme context |

#### Configuration

| Prop | Value |
|---|---|
| `attribute` | `"class"` |
| `defaultTheme` | `"system"` |
| `enableSystem` | `true` |

#### Usage

```tsx
import { ThemeProvider } from "@/components/theme-provider";

// In layout:
<ThemeProvider>{children}</ThemeProvider>
```

---

### 3. `command-palette.tsx` — Bilingual Search Command Palette

A `cmdk`-based command palette with bilingual support and role-aware filtering.

#### Features

- **Bilingual labels**: BM (Bahasa Malaysia) display labels with EN (English) keywords for search matching
- **Role-filtered results**: Only commands/pages visible to the current user role appear
- **Keyboard shortcut**: `⌘K` (Cmd+K) opens the palette
- **Navigation**: On item select, navigates via `ViewId`-based routing

#### Search Strategy

Users can type in either BM or EN. The search index includes both the display label (BM) and supplementary English keywords, so `cetak` and `print` both find the print command.

---

### 4. `puspa-icons.tsx` — PUSPA Custom SVG Icon System

A centralized icon system for PUSPA-specific branding icons that don't exist in lucide-react.

#### Exports

| Export | Type | Description |
|---|---|---|
| `PUSPA_ICON_MAP` | `Record<string, React.ComponentType>` | Maps icon name strings to SVG React components |
| `PUSPA_ICON_COLORS` | `Record<string, string>` | Maps icon name strings to brand hex colors |

#### Usage

```tsx
import { PUSPA_ICON_MAP, PUSPA_ICON_COLORS } from "@/components/puspa-icons";

const IconComponent = PUSPA_ICON_MAP["moduleName"];
const iconColor = PUSPA_ICON_COLORS["moduleName"]; // e.g. "#4B0082"
```

#### When to Use

- **lucide-react**: For general-purpose icons (arrows, chevrons, settings, etc.)
- **puspa-icons.tsx**: For PUSPA-specific branding icons (module logos, brand marks, custom symbols)

---

## shadcn/ui Primitives

The `src/components/ui/` directory contains **48 auto-generated shadcn/ui components**. These are managed entirely by the shadcn CLI.

### Full List

`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `toggle`, `toggle-group`, `tooltip`

### Adding a New shadcn Component

```bash
npx shadcn@latest add <component-name>
```

### Updating an Existing shadcn Component

```bash
# Overwrite with the latest version (discards manual edits)
npx shadcn@latest add <component-name>
```

---

## Conventions

### File Placement

| What | Where |
|---|---|
| Custom components | `src/components/*.tsx` |
| shadcn/ui primitives | `src/components/ui/*.tsx` |
| PUSPA icons | `src/components/puspa-icons.tsx` |

### Directives

- All custom components **must** include the `'use client'` directive at the top of the file.

### Styling

- Use `cn()` from `@/lib/utils` for conditional class merging (combines `clsx` + `tailwind-merge`).
- Do not use raw string concatenation for conditional classes.

```tsx
// ✅ Correct
<div className={cn("flex items-center", isActive && "bg-primary text-primary-foreground")} />

// ❌ Wrong
<div className={"flex items-center" + (isActive ? " bg-primary text-primary-foreground" : "")} />
```

### Icons

| Need | Source |
|---|---|
| General-purpose icons (arrows, UI elements, etc.) | `lucide-react` |
| PUSPA-specific branding icons | `puspa-icons.tsx` |

### Accessibility

- All interactive elements must have proper `aria-label` or accessible labels.
- **Dialog**: Must include `<DialogTitle>` and `<DialogDescription>`.
- **Sheet**: Must include `<SheetTitle>` and `<SheetDescription>`.
- Missing these will cause accessibility violations and may break screen reader announcements.

### Imports

- Import shadcn components from `@/components/ui/<name>`.
- Import custom components from `@/components/<name>`.
- Never import directly from `@radix-ui/*`.

---

## Anti-Patterns

| Rule | Reason |
|---|---|
| ❌ **NEVER** manually edit files in `src/components/ui/` | They are auto-generated. Re-run `npx shadcn@latest add <name>` to update. Manual edits will be lost. |
| ❌ **NEVER** import from `@radix-ui/*` directly | Always use the shadcn wrapper from `@/components/ui/`. The wrappers add consistent styling, `cn()` support, and theme integration. |
| ❌ **NEVER** create duplicate icon systems | Use `lucide-react` for general icons and `puspa-icons.tsx` for PUSPA branding. Do not create a third icon system. |
| ❌ **NEVER** use `<Dialog>` without `<DialogTitle>` + `<DialogDescription>` | Required for accessibility. Omitting these causes a11y violations and silent errors. |
| ❌ **NEVER** use `<Sheet>` without `<SheetTitle>` + `<SheetDescription>` | Same reason as Dialog — required for screen readers. |
| ❌ **NEVER** place `<Badge>` inside `<p>` tags | Badge renders as an inline element that breaks paragraph semantics. Use a `<div>` container instead. |
