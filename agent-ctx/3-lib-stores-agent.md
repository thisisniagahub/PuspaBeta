# Task 3 - Core Libraries, Stores, Types & Middleware

**Status:** ✅ Completed

## Summary
Created all 7 specified files for the PuspaCare project:

1. **`src/lib/api.ts`** — Typed API client with `apiFetch` wrapper and `api` object (get/post/put/delete). Uses `/api/v1` base path and `ApiEnvelope<T>` response pattern.

2. **`src/lib/openclaw.ts`** — OpenClaw integration with `fetchOpenClawSnapshot()` and `fetchOpenClawStatus()`. Connects to bridge URL at `https://operator.gangniaga.my/puspa-bridge` with 5s timeout.

3. **`src/lib/supabase.ts`** — Lazy-initialized Supabase client. Only creates instance if env vars are configured. Uses `require()` for dynamic import (intentional lazy init pattern).

4. **`src/stores/app-store.ts`** — Zustand store with persistence for app state: currentView, sidebarOpen, commandPaletteOpen, userRole, onboardingDone. Persists userRole and onboardingDone to localStorage.

5. **`src/stores/ops-store.ts`** — Zustand store with persistence for ops/chat state: activeTab, messages array. Persists both activeTab and messages.

6. **`src/types/index.ts`** — Shared types including ViewId (union of 26 view IDs), NavItem, DashboardStats, MonthlyDonation, MemberCategory, RecentActivity, ApiResponse, PaginatedResponse.

7. **`src/middleware.ts`** — Next.js middleware protecting `/api/v1/*` routes with x-api-key header check. Bypasses in development mode.

## Lint
- One lint error was fixed: added `eslint-disable-next-line` for the intentional `require()` in supabase.ts
- All files pass `bun run lint` cleanly
