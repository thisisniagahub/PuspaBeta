# OpenClaw Module — AGENTS.md

> **PUSPA Project** | `src/modules/openclaw/`
> Developer-only AI Operations framework based on OpenClaw architecture.

---

## Overview

`src/modules/openclaw/` is the **only multi-file module** in the project. Unlike every other module that has a single `page.tsx`, OpenClaw contains **7 standalone sub-module files** that are imported directly by the `ViewRenderer` in `src/app/page.tsx`.

OpenClaw implements a **4-layer AI Operations architecture**:

```
Gateway → Nodes → Channels → Skills
```

All sub-modules are **developer-only** — they are hidden from non-developer roles in the sidebar navigation.

---

## Architecture

```
src/modules/openclaw/
├── mcp.tsx            # MCP Server Management        (ViewId: openclaw-mcp)
├── plugins.tsx        # Plugin Management             (ViewId: openclaw-plugins)
├── integrations.tsx   # Gateway & Channel Management  (ViewId: openclaw-integrations)
├── terminal.tsx       # Console Operator              (ViewId: openclaw-terminal)
├── agents.tsx         # AI Agent Registry             (ViewId: openclaw-agents)
├── models.tsx         # Model Engine                  (ViewId: openclaw-models)
├── automation.tsx     # Automation Job Management     (ViewId: openclaw-automation)
└── AGENTS.md          # ← You are here
```

There is **no `page.tsx`** in this directory. The 7 files are standalone page components imported directly by ViewRenderer.

---

## Sub-module Reference

### 1. `mcp.tsx` — MCP Server Management

| Property | Value |
|---|---|
| **ViewId** | `openclaw-mcp` |
| **Purpose** | Lists and manages MCP (Model Context Protocol) servers |
| **Displays** | Server name, connection status (connected/disconnected), tools count |
| **API** | `api.get('/openclaw/snapshot')` + mock fallback |
| **State** | `useState` for items, loading, dialog state |

### 2. `plugins.tsx` — Plugin Management

| Property | Value |
|---|---|
| **ViewId** | `openclaw-plugins` |
| **Purpose** | Lists and manages installed plugins |
| **Features** | Toggle enable/disable per plugin |
| **API** | `api.get('/openclaw/snapshot')` + mock fallback |
| **State** | `useState` for items, loading, dialog state |

### 3. `integrations.tsx` — Gateway & Channel Management

| Property | Value |
|---|---|
| **ViewId** | `openclaw-integrations` |
| **Purpose** | Manages communication channels (WhatsApp, Telegram, Web, etc.) |
| **Displays** | Channel name, type, status, connected agents |
| **API** | `api.get('/openclaw/status')` + mock fallback |
| **State** | `useState` for items, loading, dialog state |

### 4. `terminal.tsx` — Console Operator

| Property | Value |
|---|---|
| **ViewId** | `openclaw-terminal` |
| **Purpose** | Interactive terminal/console UI for operator commands |
| **Displays** | Log entries with timestamps and severity levels |
| **API** | `api.get('/openclaw/status')`, `api.get('/openclaw/snapshot')` |
| **State** | `useState` for items, loading, dialog state |

### 5. `agents.tsx` — AI Agent Registry

| Property | Value |
|---|---|
| **ViewId** | `openclaw-agents` |
| **Purpose** | Lists configured AI agents with model, status, capabilities |
| **API** | `api.get('/openclaw/snapshot')` + mock fallback |
| **State** | `useState` for items, loading, dialog state |

### 6. `models.tsx` — Model Engine

| Property | Value |
|---|---|
| **ViewId** | `openclaw-models` |
| **Purpose** | Lists available AI models with provider, status, latency |
| **API** | `api.get('/openclaw/status')` + mock fallback |
| **State** | `useState` for items, loading, dialog state |

### 7. `automation.tsx` — Automation Job Management

| Property | Value |
|---|---|
| **ViewId** | `openclaw-automation` |
| **Purpose** | Full CRUD for automation jobs |
| **Features** | Create, edit, delete, toggle jobs; Dialog for add/edit; AlertDialog for delete confirmation |
| **API** | `api.get/post/delete('/ops/automations')` + mock fallback |
| **State** | `useState` for items, loading, dialog state |

---

## Common Patterns

All 7 sub-modules follow these shared conventions:

- **Export**: Each file exports a default function component.
- **State**: All use `useState` for local state (items, loading, dialog state).
- **Data fetching**: All attempt the live API first (`api.get(...)`) and fall back to mock data if the API is unreachable.
- **API client**: All import `api` from `@/lib/api`.
- **Server utilities**: `fetchOpenClawSnapshot()` and `fetchOpenClawStatus()` from `@/lib/openclaw` are server-side utilities.
- **Self-contained**: Each sub-module is intentionally standalone — no shared parent component or extracted shared files.

---

## Navigation

OpenClaw lives within the **"AI & Automasi"** sidebar group:

- **Label**: `OpenClaw (OC)` with a `DEV` badge
- **Visibility**: Only shown when `userRole === 'developer'`
- **Route structure**: Each sub-module maps to a ViewId handled by ViewRenderer in `src/app/page.tsx`

---

## External Dependencies

| Resource | Location |
|---|---|
| OpenClaw bridge client | `src/lib/openclaw.ts` |
| External bridge URL | `https://operator.gangniaga.my/puspa-bridge` (configured in `src/lib/openclaw.ts`) |
| API helper | `@/lib/api` |
| ViewRenderer | `src/app/page.tsx` |

---

## Conventions

- Each sub-module is a **standalone page component** — no shared parent.
- **No `page.tsx`** exists in this directory — the 7 files are imported directly by ViewRenderer.
- **Mock fallback data is acceptable** since the external OpenClaw operator may be offline.
- All sub-modules use `api` from `@/lib/api` for data fetching.
- `fetchOpenClawSnapshot()` and `fetchOpenClawStatus()` from `@/lib/openclaw` are server-side utilities.
- **When adding a new OpenClaw sub-module**:
  1. Create a new `.tsx` file in this directory.
  2. Add a new `ViewId` (format: `openclaw-<name>`).
  3. Add a ViewRenderer case in `src/app/page.tsx`.
  4. Add a sidebar `NavItem` under the OpenClaw section.

---

## Anti-Patterns

| Rule | Reason |
|---|---|
| ❌ **NEVER** create a `page.tsx` in openclaw/ | This module has 7 sub-files, not a single page. |
| ❌ **NEVER** extract shared components into separate files | Sub-modules are intentionally self-contained. |
| ❌ **NEVER** remove mock fallback data | The external OpenClaw operator may not always be available. |
| ❌ **NEVER** make OpenClaw visible to non-developer roles | It is admin/developer-only. |
| ❌ **NEVER** hardcode the OpenClaw bridge URL | It is configured in `src/lib/openclaw.ts`. |
