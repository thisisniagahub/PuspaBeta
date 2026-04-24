# Stores — PUSPA

This directory contains Zustand global stores for the PUSPA application. Zustand is the single standard for global state management — do not use React Context for global state.

## Stores

### 1. `app-store.ts`

**Exported hook:** `useAppStore`

**State shape:**

```typescript
{
  currentView: string        // Active ViewId route — drives ViewRenderer switch
  sidebarOpen: boolean       // Desktop sidebar pinned state
  commandPaletteOpen: boolean // ⌘K palette visibility
  userRole: UserRole         // 'staff' | 'admin' | 'developer'
  onboardingDone: boolean    // Whether onboarding wizard was completed
}
```

**Actions:**

| Action | Signature | Description |
|---|---|---|
| `setCurrentView` | `(view: string) => void` | Navigate to a module page |
| `setSidebarOpen` | `(open: boolean) => void` | Pin/unpin sidebar |
| `setCommandPaletteOpen` | `(open: boolean) => void` | Toggle command palette |
| `setUserRole` | `(role: UserRole) => void` | Switch user role (affects sidebar visibility) |
| `setOnboardingDone` | `(done: boolean) => void` | Mark onboarding complete |

**Persistence:**

- Uses Zustand `persist` middleware
- Storage key: `puspa-app-state` in localStorage
- Only `userRole` and `onboardingDone` are persisted
- `currentView`, `sidebarOpen`, and `commandPaletteOpen` reset on refresh

**Key behaviors:**

- `currentView` is the **single source of truth** for which module page is displayed
- `userRole` controls sidebar navigation group visibility via `getVisibleGroups(role)`
- No URL-based routing — all navigation is state-driven
- `currentView` is NOT persisted — always starts at `'dashboard'`

---

### 2. `ops-store.ts`

**Exported hook:** `useOpsStore`

**State shape:**

```typescript
{
  chatMessages: ChatMessage[]  // Ops conductor chat history
  activeTab: string           // Current tab in ops conductor
}
```

**Actions:**

| Action | Signature | Description |
|---|---|---|
| `addChatMessage` | `(msg: ChatMessage) => void` | Append message to ops chat |
| `setActiveTab` | `(tab: string) => void` | Switch ops conductor tab |
| `clearChat` | `() => void` | Reset chat history |

**Persistence:**

- Uses Zustand `persist` middleware
- Storage key: `puspa-ops-state` in localStorage
- All state persisted (chat history survives refresh)

## Conventions

- Use `useAppStore()` in components that need navigation or role state
- Use `useOpsStore()` in the ops-conductor module
- Both stores are `'use client'` — only usable in client components
- Persisted state means `role` and `onboarding` survive page refresh
- `currentView` is NOT persisted — always starts at `'dashboard'`

## Anti-Patterns

- ❌ NEVER create new Zustand stores without checking if `app-store.ts` can hold the state
- ❌ NEVER use React Context for global state — Zustand is the standard
- ❌ NEVER access localStorage directly — let Zustand persist middleware handle it
- ❌ NEVER put module-specific state in `app-store` — keep it in the module component
- ❌ NEVER persist large data structures (like full API responses) in stores
