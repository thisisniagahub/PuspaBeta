# src/modules/ — PUSPA Feature Modules

## OVERVIEW
Self-contained page components rendered by ViewRenderer switch in `src/app/page.tsx`, not by Next.js file-based routing.

## STRUCTURE
| Category | Files | Status |
|---|---|---|
| Core CRUD (API-connected) | dashboard, members, cases, programmes, donations, disbursements, compliance, admin, reports, activities, volunteers, donors, documents (12) | ✅ API live |
| Security/Identity | ekyc, tapsecure (2) | ✅ API live |
| Islamic Programmes | sedekah-jumaat, agihan-bulan (2) | ✅ API live |
| AI/Automation | ai, ops-conductor (2) | ✅ API live |
| AI/Automation (mock data) | triage, notifications, multi-channel, onboarding, automation-rules, predictive, skills, agent-memory, multi-agent, audit-trail (10) | ⚠️ API at /api/v1/ but frontend uses inline mock |
| Info Pages | docs, kelas-ai (2) | Static content |
| OpenClaw | openclaw/{mcp,plugins,integrations,terminal,agents,models,automation}.tsx (7) | Multi-file module |

## WHERE TO LOOK
| Task | File(s) |
|---|---|
| Add/edit member fields or validation | `members/page.tsx` |
| Connect a mock AI module to API | triage\|notifications\|multi-channel\|onboarding\|automation-rules\|predictive\|skills\|agent-memory\|multi-agent\|audit-trail → `page.tsx` |
| Add new feature module | Create `new-module/page.tsx`, export `default function NewModulePage()`, add case to ViewRenderer in `src/app/page.tsx` |
| OpenClaw sub-feature | `openclaw/<sub>.tsx` (7 files, not page.tsx) |
| Kelas AI tab content | `kelas-ai/page.tsx` (12 tabs: Visi, Kurikulum, Peserta, Tajaan, Penaja, Bajet, Impak, Logistik, Timeline, Sustainability, Surat, Integrasi) |
| Mobile layout for any CRUD module | `members/page.tsx` (gold standard for `hidden md:block` + `md:hidden space-y-3`) |
| Delete confirmation pattern | `members/page.tsx` (AlertDialog with destructive confirm) |
| Form validation pattern | `members/page.tsx` — only module with Zod + react-hook-form |

## CONVENTIONS
- Every module exports `export default function XxxPage()` — ViewRenderer calls these by route name
- OpenClaw is the only multi-file module; all others are single `page.tsx`
- API calls: `import { api } from '@/lib/api'` → `api.get/post/put/delete`
- Toast: `import { toast } from 'sonner'` → `toast.success/error(...)` with Malay messages
- Mobile dual-layout: desktop table `hidden md:block` + mobile card list `md:hidden space-y-3`
- Delete: `AlertDialog` with `AlertDialogAction` className `bg-destructive text-white hover:bg-destructive/90`
- Brand color `#4B0082` applied inline via `style={{ color: '#4B0082' }}` — NOT in Tailwind config
- Mock-data modules use `useState` with hardcoded arrays; replace with `api.get()` when connecting
- Members is the gold standard: Zod schema → `zodResolver` → `useForm` → `FormField`; all other modules use manual `useState` + `onChange`
- Pagination: client-side sort with `useMemo`, server-side fetch with `page`/`pageSize` params
- 10 unconnected AI modules have matching `/api/v1/<module>` endpoints ready — frontend just needs `api.get()` replacing mock arrays

## ANTI-PATTERNS
- ❌ Do NOT create `src/app/<module>/page.tsx` — routing is ViewRenderer-based, not file-based
- ❌ Do NOT extract components into separate files — modules are intentionally self-contained
- ❌ Do NOT add `react-hook-form`/`zod` to modules other than members without migrating the whole module
- ❌ Do NOT use `fetch()` directly — always use `api` from `@/lib/api`
- ❌ Do NOT hardcode `#4B0082` in new places — use the inline style pattern already present or reference the existing usage
- ❌ Do NOT add a `page.tsx` inside `openclaw/` — it has 7 sub-files, not a page.tsx
- ❌ Do NOT mock data in already-connected modules — only the 10 AI/automation modules still use mocks
