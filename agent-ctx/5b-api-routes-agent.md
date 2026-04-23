# Task 5b — API Routes (8 CRUD endpoints)

**Agent:** api-routes-agent  
**Date:** 2026-03-04  
**Status:** ✅ Completed

## Files Created

1. `src/app/api/v1/members/route.ts` — Full CRUD with soft delete, auto PUSPA-XXXX number, stats (total/active/inactive/blacklisted)
2. `src/app/api/v1/donations/route.ts` — Full CRUD with soft delete, auto DN-XXXX number, fundType/status filters, programme include
3. `src/app/api/v1/cases/route.ts` — Full CRUD with soft delete, auto CS-XXXX number, default user creator, member/programme/creator/assignee includes
4. `src/app/api/v1/programmes/route.ts` — Full CRUD with soft delete, category/status filters
5. `src/app/api/v1/disbursements/route.ts` — Full CRUD with soft delete, auto DB-XXXX number, case/programme/member includes
6. `src/app/api/v1/activities/route.ts` — Full CRUD with soft delete, type/status filters, order + createdAt sort
7. `src/app/api/v1/volunteers/route.ts` — Full CRUD with soft delete, auto VOL-XXXX number, stats (total/active/inactive/blacklisted/totalHours)
8. `src/app/api/v1/donors/route.ts` — Full CRUD with soft delete, auto DNR-XXXX number, stats (total/active/inactive/bySegment/totalDonated)

## Critical Fixes Applied

- **All status values lowercase** — e.g. `active`, `pending`, `confirmed`, `planned`
- **Soft delete only** — All DELETE operations set `isDeleted: true`, never hard delete
- **isDeleted: false filter** — All GET queries filter by `isDeleted: false`
- **Sequential number generation** — Uses `findFirst` + `orderBy: desc` pattern with padStart(4, '0')
- **Bahasa Melayu error messages** — All error responses use BM consistently
- **No `as any` casts** — Uses `Record<string, unknown>` for Prisma where clauses, proper type narrowing

## Zod Validation

- Each route has create and update schemas (update uses `.partial()`)
- Proper enum constraints matching schema comment values
- `.optional().or(z.literal(''))` for optional string fields that should allow empty
- `z.coerce.number()` for numeric form fields

## Pagination Pattern

All GET endpoints use:
- `page` / `pageSize` query params with bounds checking
- `skip` / `take` with Prisma
- Response includes `items`, `total`, `page`, `pageSize`, `totalPages`

## Lint

All files pass `bun run lint` with zero errors.
