# AGENTS.md — `src/lib/`

> Utility modules that form the backbone of the PUSPA application.
> Every module page depends on at least one of these files.

---

## Module Index

| File | Primary Export | Purpose |
|---|---|---|
| `utils.ts` | `cn()` | Tailwind CSS class merger |
| `api.ts` | `api` object, `apiFetch<T>()` | Typed HTTP client for internal API routes |
| `db.ts` | `db` | Singleton PrismaClient (hot-reload safe) |
| `openclaw.ts` | `fetchOpenClawSnapshot()`, `fetchOpenClawStatus()` | External OpenClaw operator bridge |
| `supabase.ts` | `isSupabaseConfigured()`, `getSupabase()` | Lazy-initialized Supabase client |

---

## 1. `utils.ts` — Tailwind Class Merger

```ts
import { cn } from '@/lib/utils'
```

**What it does:** Combines `clsx()` (conditional class construction) with `twMerge()` (Tailwind conflict resolution) into a single function.

**Signature:**
```ts
function cn(...inputs: ClassValue[]): string
```

**Pattern:** Standard shadcn/ui utility — used in virtually every component for conditional styling.

**Example:**
```tsx
<div className={cn('px-4 py-2', isActive && 'bg-primary text-white', className)} />
```

---

## 2. `api.ts` — Typed API Client

```ts
import { api, apiFetch } from '@/lib/api'
```

### `apiFetch<T>(url, options?)`

Generic typed fetch wrapper. Returns a parsed `ApiEnvelope<T>`.

**API Envelope Structure:**
```ts
interface ApiEnvelope<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### `api` Object

| Method | Signature | Notes |
|---|---|---|
| `api.get<T>(url, params?)` | `apiFetch<T>(url + query)` | Auto-appends `params` as query string |
| `api.post<T>(url, body?)` | `apiFetch<T>(url, { method: 'POST', body })` | Sets `Content-Type: application/json` |
| `api.put<T>(url, body?)` | `apiFetch<T>(url, { method: 'PUT', body })` | Sets `Content-Type: application/json` |
| `api.delete<T>(url)` | `apiFetch<T>(url, { method: 'DELETE' })` | — |

**Base Path:** All requests are prefixed with `/api/v1` (internal Next.js API routes).

**Example:**
```ts
const { data } = await api.get<User[]>('/users')
await api.post('/users', { name: 'Ada' })
await api.put(`/users/${id}`, { name: 'Grace' })
await api.delete(`/users/${id}`)
```

---

## 3. `db.ts` — Prisma Client Singleton

```ts
import { db } from '@/lib/db'
```

**What it does:** Exports a single `db` instance using the global-caching pattern to prevent multiple PrismaClient instances during Next.js dev hot reloads.

**Key Details:**

- **Global key:** `prismaClient_v2` on `globalThis` — increment the version suffix when schema changes require a fresh client (e.g., `prismaClient_v3`).
- **Query logging:** Enabled automatically in development mode.
- **Usage:** Use `db.model.findMany()`, `db.model.create()`, etc. — exactly like a PrismaClient instance.

**Example:**
```ts
import { db } from '@/lib/db'

const users = await db.user.findMany({ where: { active: true } })
```

---

## 4. `openclaw.ts` — OpenClaw Bridge

```ts
import { fetchOpenClawSnapshot, fetchOpenClawStatus } from '@/lib/openclaw'
import type { OpenClawSnapshot, OpenClawStatus } from '@/lib/openclaw'
```

**Bridge URL:** `https://operator.gangniaga.my/puspa-bridge`

### `fetchOpenClawSnapshot()`

Retrieves the full OpenClaw gateway snapshot including:

- Gateway status
- Channels
- Models
- Agents
- Automation config
- Plugins
- MCP servers

### `fetchOpenClawStatus()`

Performs a health check against the OpenClaw operator:

- Measures round-trip latency
- Enforces a **5-second timeout**
- Returns `OpenClawStatus` with health indicator

**Consumers:** All 7 OpenClaw sub-modules under `src/modules/openclaw/`.

---

## 5. `supabase.ts` — Supabase Client (Lazy)

```ts
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase'
```

**What it does:** Provides a lazily-initialized Supabase client that is only created when both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables are present.

### `isSupabaseConfigured(): boolean`

Returns `true` only if both required env vars are set. **Always call this before `getSupabase()`.**

### `getSupabase(): SupabaseClient | null`

Returns the Supabase client instance, or `null` if unconfigured.

**Current Status:** UNUSED — no env vars configured. Potential future use for file storage and real-time features.

**Example:**
```ts
if (isSupabaseConfigured()) {
  const supabase = getSupabase()
  const { data } = await supabase!.storage.from('uploads').list()
}
```

---

## Conventions

| Rule | Details |
|---|---|
| **`cn()` is the ONLY way to merge Tailwind classes** | Use it everywhere — never string-interpolate competing Tailwind utilities |
| **`api` is the ONLY way to make API calls from modules** | All module pages must use `api.get/post/put/delete` |
| **`db` is the ONLY way to access Prisma** | Always `import { db } from '@/lib/db'` |
| **OpenClaw communication goes through `openclaw.ts`** | Never call the operator URL directly |
| **Prisma schema version bumps** | When schema changes require a fresh client, increment `prismaClient_v2` → `prismaClient_v3` in `db.ts` |

---

## Anti-Patterns

| ❌ Don't | ✅ Do |
|---|---|
| Use raw `fetch()` in module pages | `import { api } from '@/lib/api'` |
| `import { PrismaClient } from '@prisma/client'` | `import { db } from '@/lib/db'` |
| Use `axios` or other HTTP clients | Use native fetch via `api.ts` |
| Hardcode API base URLs (e.g., `/api/v1/users`) | `api.get('/users')` — prefix handled automatically |
| Hardcode `http://localhost:PORT` | Use relative paths with `?XTransformPort=PORT` for other services |
| Use Supabase without checking configuration | Always call `isSupabaseConfigured()` first |
