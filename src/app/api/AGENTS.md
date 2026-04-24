# API Route Handlers — AGENTS.md

## OVERVIEW
Next.js App Router route handlers for PUSPA's REST API; root `/api` is health check, all business routes live under `/api/v1/`.

## STRUCTURE
```
api/route.ts                          ← GET health/version (no auth)
api/v1/
  agents/         config, [id], activate
  agent/memory/   [id], search, context
  ai/             chat, analytics
  audit-trail/    [txHash], verify
  automation/     rules, rules/[id]/trigger
  board-members/
  branches/
  cases/          auto-triage, triage-results
  channels/       messages, stats
  compliance/     ros, pdpa
  dashboard/      stats, activities, monthly-donations, member-distribution
  disbursements/
  documents/      stats
  donations/
  donors/         receipts, communications
  ekyc/           verify, reject
  integrations/   whatsapp
  members/        ← gold-standard route (full CRUD + Zod)
  notifications/  preferences, send, logs
  onboarding/     start, sessions, sessions/[id], process
  openclaw/       snapshot, status
  ops/            dashboard, projects, artifacts, intent, automations, bulk, work-items/[id]/approve/decision, stats
  organization/
  partners/
  predictive/     distribution, forecast, history
  programmes/
  reports/        financial
  skills/         install, [id]/toggle, marketplace, installed
  smart-contracts/ evaluate, logs
  tapsecure/      settings, biometric, logs, devices/primary
  volunteers/     deployments, hours, certificates
```

## WHERE TO LOOK

| Task | File(s) |
|---|---|
| Add/edit a member endpoint | `v1/members/route.ts` |
| Change dashboard cards/stats | `v1/dashboard/route.ts`, `v1/dashboard/stats/route.ts` |
| Notification dispatch logic | `v1/notifications/send/route.ts` |
| eKYC verification flow | `v1/ekyc/route.ts`, `v1/ekyc/verify/route.ts` |
| AI chat / agent memory | `v1/ai/chat/route.ts`, `v1/agent/memory/` |
| Case triage rules | `v1/cases/auto-triage/route.ts` |
| Compliance checks | `v1/compliance/route.ts`, `v1/compliance/ros/`, `v1/compliance/pdpa/` |
| Ops work-item approval | `v1/ops/work-items/[id]/approve/decision/route.ts` |
| Automation rule CRUD | `v1/automation/rules/route.ts`, `v1/automation/rules/[id]/` |
| Smart contract evaluation | `v1/smart-contracts/evaluate/route.ts` |
| Pagination/search pattern | `v1/members/route.ts` GET (reference) |
| Parallel query pattern | `v1/dashboard/route.ts` GET (reference) |
| Predictive analytics | `v1/predictive/forecast/route.ts`, `v1/predictive/distribution/` |

## CONVENTIONS

- **DB access**: always `import { db } from '@/lib/db'` — never import PrismaClient directly.
- **Response envelope**: every handler returns `{ success: boolean, data?: T, error?: string, message?: string }`.
- **Error handling**: every handler wrapped in try/catch; use HTTP status codes 400 (validation), 404 (not found), 409 (conflict/duplicate), 500 (server error).
- **Zod validation**: define schemas at top of file; use `.safeParse()` and return 400 with joined issue messages. `members/route.ts` is the gold standard.
- **Soft delete**: never `db.*.delete()` — use `db.*.update({ data: { isDeleted: true } })`; always filter reads with `where: { isDeleted: false }`.
- **Pagination**: accept `page` (1-based), `pageSize` (max 100), `search`, `status` from `request.nextUrl.searchParams`; return `{ items, total, page, pageSize, totalPages, stats? }`.
- **Parallel queries**: use `Promise.all` for independent counts/lookups (dashboard pattern); `Promise.allSettled` if partial failure is acceptable.
- **PUT/DELETE by query param**: some routes use `?id=xxx` instead of path params — check the specific route before assuming `[id]` folder exists.
- **GET+POST in same file**: list and create often share `route.ts`; PUT/DELETE may live in same file via query-param ID or in a dynamic `[id]` folder.
- **Auth**: `x-api-key` enforced on `/api/v1/*` by `src/middleware.ts` in production only.
- **Malay error messages**: user-facing errors in Malay (e.g. `'Ralat pelayan'`, `'Ahli tidak dijumpai'`).

## ANTI-PATTERNS

- ❌ `import { PrismaClient } from '@prisma/client'` — use `db` from `@/lib/db`.
- ❌ Hard-deleting records (`db.*.delete()`) — always soft-delete via `isDeleted: true`.
- ❌ Returning raw Prisma errors to clients — always catch and return generic message.
- ❌ Omitting `isDeleted: false` in `where` clauses — soft-deleted rows will leak.
- ❌ Sequential `await` for independent queries — use `Promise.all`.
- ❌ Bypassing Zod validation on POST/PUT body — always validate, members route is the template.
- ❌ Creating new `[id]` dynamic folders when the route already uses `?id=` query param — stay consistent with existing pattern in that domain.
