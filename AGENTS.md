# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-05
**Commit:** 0d4cf37
**Branch:** main

## OVERVIEW
PUSPA — Enterprise AI SaaS for asnaf (underprivileged) community management. Next.js 16 App Router + TypeScript + shadcn/ui + Prisma/SQLite + Zustand. Single-page app shell with client-side routing (not file-based).

## STRUCTURE
```
.
├── src/app/              # Next.js App Router (only / route used; 84 API routes)
├── src/modules/          # 38 feature pages rendered by ViewRenderer switch
├── src/components/       # 3 custom components + 48 shadcn/ui primitives
├── src/lib/              # api.ts, db.ts, openclaw.ts, supabase.ts, utils.ts
├── src/stores/           # app-store.ts (Zustand + persist), ops-store.ts
├── src/types/            # ViewId union + shared interfaces
├── prisma/               # schema.prisma (49 models), seed.ts
├── Caddyfile             # Gateway :81 → :3000, XTransformPort forwarding
└── examples/             # WebSocket reference code
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add a new page/module | `src/modules/<name>/page.tsx` + add ViewId + ViewRenderer case + sidebar entry | See `src/modules/members/page.tsx` as gold standard |
| Add API endpoint | `src/app/api/v1/<domain>/route.ts` | Export GET/POST/PUT/DELETE functions |
| Add database model | `prisma/schema.prisma` → `bun run db:push` | Import `db` from `@/lib/db`, never `@prisma/client` directly |
| Add UI component | `src/components/ui/` (shadcn) or `src/components/` (custom) | Use `npx shadcn@latest add <name>` for primitives |
| Change navigation | `src/components/app-sidebar.tsx` ALL_GROUPS array | Add NavItem with id, label, icon, roles |
| Change routing | `src/app/page.tsx` ViewRenderer switch + viewLabels map | Must match ViewId in `src/types/index.ts` |
| Change state | `src/stores/app-store.ts` | Zustand + persist middleware |
| Change brand color | `BRAND_COLOR` constant in sidebar + inline `#4B0082` across modules | TODO: move to Tailwind config |
| WebSocket/realtime | `mini-services/` + `examples/websocket/` | Socket.io on separate port, Caddy XTransformPort |

## CONVENTIONS
- **SPA routing**: All views rendered client-side via ViewRenderer switch, not Next.js file-based routing (workaround for Turbopack ChunkLoadError)
- **All modules eagerly imported** in `page.tsx` — no lazy loading
- **Bahasa Melayu (BM)**: All UI text, labels, validation, toasts in Malay. HTML `lang="ms"`
- **Soft delete**: All models use `isDeleted` flag, never hard-delete
- **API envelope**: `{ success: boolean, data?: T, error?: string, message?: string }`
- **Role-based UI**: 3 roles (staff, admin, developer) — filtered client-side in sidebar/command-palette
- **Mobile-first**: Desktop `<Table>` + mobile `<Card>` list pattern (`hidden md:block` / `md:hidden`)
- **Delete confirmation**: Always use `<AlertDialog>`, never browser `confirm()`
- **Select components**: Always use shadcn `<Select>`, never native `<select>`
- **Brand color**: `#4B0082` (PUSPA purple) — used as inline style (should be Tailwind utility)
- **Currency**: `Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' })`
- **Dates**: `.toLocaleDateString('ms-MY')`

## ANTI-PATTERNS (THIS PROJECT)
- ❌ NEVER use browser `confirm()` — use AlertDialog
- ❌ NEVER use native `<select>` — use shadcn Select
- ❌ NEVER import `@prisma/client` directly — use `import { db } from '@/lib/db'`
- ❌ NEVER nest `<div>` or `<Skeleton>` inside `<p>` — use `<div>` instead
- ❌ NEVER use `<Dialog>` without `<DialogTitle>` + `<DialogDescription>`
- ❌ NEVER use `<Sheet>` without `<SheetTitle>` + `<SheetDescription>`
- ❌ NEVER use `as any` — type properly
- ❌ NEVER hardcode `http://localhost:PORT` in fetch — use relative paths with `?XTransformPort=PORT`
- ❌ NEVER create Next.js route pages (`src/app/*/page.tsx`) for modules — use ViewRenderer only
- ❌ NEVER write test code (per project rules)

## UNIQUE STYLES
- PUSPA SVG icon system: `src/components/puspa-icons.tsx` with `PUSPA_ICON_MAP` + `PUSPA_ICON_COLORS`
- Sidebar: custom collapsible with hover-expand (72px → 260px), role switcher footer, brand gradient active state
- Command palette: bilingual search (BM labels + EN keywords), role-filtered
- OpenClaw integration: 7 sub-modules under `src/modules/openclaw/` — developer-only AI Ops framework
- 10 AI/Automation modules use **mock data** inline (API endpoints exist but frontend not connected)
- Inline `style={{ color: '#4B0082' }}` used ~60+ times instead of Tailwind class (tech debt)

## COMMANDS
```bash
bun run dev          # Start Next.js on :3000 (logs to dev.log)
bun run lint         # ESLint check
bun run db:push      # Push Prisma schema to SQLite
bun run db:generate  # Generate Prisma client
```

## NOTES
- Gateway: Caddy on `:81` proxies to `:3000`. For other services use `?XTransformPort=<port>` query param
- Turbopack used in dev — chunk loading issues are why modules are eagerly imported
- Unused dependencies: `@tanstack/react-query`, `@tanstack/react-table`, `next-auth`, `next-intl`, `supabase`
- No CI/CD pipeline, no tests, no Docker — manual deployment
- SQLite + `db push` (no migrations) — dev-only, not production-ready
- Supabase client configured (`src/lib/supabase.ts`) but unused
