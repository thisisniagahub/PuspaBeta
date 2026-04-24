# PUSPA — Project Knowledge Base

> **Pertubuhan Urus Peduli Asnaf KL & Selangor** | PPM-006-14-14032020 | v3.0.0
> Enterprise AI SaaS for asnaf (underprivileged) community management

**Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui (new-york style) + Prisma/SQLite + Zustand + Bun runtime

**Key Stats**:
- 38 ViewId routes, 33 module pages, 7 OpenClaw sub-files
- 84+ API route handlers under `/api/v1/`
- 49 Prisma models (SQLite)
- 48 shadcn/ui primitives + 3 custom components

---

## Architecture Overview

PUSPA is a **single-page application (SPA)** with client-side `ViewRenderer` routing — NOT Next.js file-based routing. The entire app shell lives at `src/app/page.tsx` with a `ViewRenderer` switch that renders modules based on `currentView` from Zustand store. This is a deliberate workaround for Turbopack `ChunkLoadError` — all modules are eagerly imported, no lazy loading.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CADDY :81                                │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │ ?XTransformPort=N│───▶│ localhost:N (other services)     │   │
│  └──────────────────┘    └──────────────────────────────────┘   │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │ default          │───▶│ localhost:3000 (Next.js)         │   │
│  └──────────────────┘    │  ┌────────────────────────────┐  │   │
│                          │  │ / (SPA shell + ViewRenderer)│  │   │
│                          │  │ /api/v1/* (84+ REST routes) │  │   │
│                          │  └────────────────────────────┘  │   │
│                          └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**3 user roles**: `staff` → `admin` → `developer` (cycle in sidebar footer)

**Brand**: #4B0082 (PUSPA purple) — used inline ~60+ times (tech debt: not in Tailwind config)

---

## Directory Structure

```
.
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # SPA shell: ViewRenderer switch + all eager imports
│   │   ├── layout.tsx          # Root layout (lang="ms", fonts, theme)
│   │   ├── globals.css         # Tailwind 4 base styles
│   │   ├── api/
│   │   │   ├── route.ts        # GET /api → health/version check
│   │   │   └── v1/             # 84+ route handlers (see src/app/api/AGENTS.md)
│   │   └── AGENTS.md           # API routes reference
│   ├── modules/                # 33 feature pages + 7 OpenClaw sub-files
│   │   ├── members/page.tsx    # ★ Gold standard module (Zod + react-hook-form)
│   │   ├── dashboard/page.tsx
│   │   ├── cases/page.tsx
│   │   ├── ... (see Module Inventory below)
│   │   ├── openclaw/           # Multi-file module (7 sub-files, NO page.tsx)
│   │   │   ├── mcp.tsx
│   │   │   ├── plugins.tsx
│   │   │   ├── integrations.tsx
│   │   │   ├── terminal.tsx
│   │   │   ├── agents.tsx
│   │   │   ├── models.tsx
│   │   │   └── automation.tsx
│   │   └── AGENTS.md           # Module conventions reference
│   ├── components/
│   │   ├── app-sidebar.tsx     # Custom: collapsible sidebar with role switcher
│   │   ├── command-palette.tsx # Custom: bilingual search (BM + EN)
│   │   ├── theme-provider.tsx  # Custom: next-themes wrapper
│   │   ├── puspa-icons.tsx     # Custom: PUSPA_ICON_MAP + PUSPA_ICON_COLORS
│   │   └── ui/                 # 48 shadcn/ui primitives
│   │       ├── button.tsx, card.tsx, dialog.tsx, ...
│   │       └── AGENTS.md       # Component library reference (if exists)
│   ├── lib/
│   │   ├── api.ts              # api.get/post/put/delete wrapper (BASE = '/api/v1')
│   │   ├── db.ts               # Prisma singleton (globalForPrisma pattern, v2 key)
│   │   ├── utils.ts            # cn() from clsx+tailwind-merge
│   │   ├── openclaw.ts         # OpenClaw SDK helpers
│   │   └── supabase.ts         # Supabase client (CONFIGURED BUT UNUSED)
│   ├── stores/
│   │   ├── app-store.ts        # Zustand + persist (currentView, userRole, sidebar)
│   │   └── ops-store.ts        # Ops Conductor state
│   ├── types/
│   │   └── index.ts            # ViewId union (38 values) + ApiResponse + shared interfaces
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   └── use-mobile.ts
│   └── middleware.ts           # x-api-key enforcement on /api/v1/* (prod only)
├── prisma/
│   ├── schema.prisma           # 49 models (see Database Schema below)
│   └── seed.ts
├── agent-ctx/                  # AI agent context files (11 .md files)
├── examples/
│   └── websocket/              # Socket.io reference code
├── public/                     # Logo assets (SVG + PNG)
├── db/
│   └── custom.db               # SQLite file
├── Caddyfile                   # Gateway :81 → :3000, XTransformPort forwarding
├── PUSPA-IMPROVEMENT-ROADMAP.md # 10 suggestions across 4 phases
└── AGENTS.md                   # ← YOU ARE HERE
```

---

## Module Inventory

### API-Connected (Live) — 18 modules

| ViewId | Module | BM Label | Sidebar Group |
|--------|--------|----------|---------------|
| `dashboard` | `modules/dashboard/page.tsx` | Dashboard | Utama |
| `members` | `modules/members/page.tsx` | Ahli Asnaf | Utama |
| `cases` | `modules/cases/page.tsx` | Kes Bantuan | Utama |
| `programmes` | `modules/programmes/page.tsx` | Program | Utama |
| `donations` | `modules/donations/page.tsx` | Donasi | Kewangan |
| `disbursements` | `modules/disbursements/page.tsx` | Pembayaran | Kewangan |
| `donors` | `modules/donors/page.tsx` | Penderma | Kewangan |
| `activities` | `modules/activities/page.tsx` | Aktiviti | Operasi |
| `agihan-bulan` | `modules/agihan-bulan/page.tsx` | Agihan Bulan | Operasi |
| `sedekah-jumaat` | `modules/sedekah-jumaat/page.tsx` | Sedekah Jumaat | Operasi |
| `volunteers` | `modules/volunteers/page.tsx` | Sukarelawan | Operasi |
| `documents` | `modules/documents/page.tsx` | Dokumen | Operasi |
| `compliance` | `modules/compliance/page.tsx` | Compliance | Pentadbiran |
| `admin` | `modules/admin/page.tsx` | Pentadbiran | Pentadbiran |
| `reports` | `modules/reports/page.tsx` | Laporan Kewangan | Pentadbiran |
| `ekyc` | `modules/ekyc/page.tsx` | eKYC | Pentadbiran |
| `tapsecure` | `modules/tapsecure/page.tsx` | TapSecure | Pentadbiran |
| `ai` | `modules/ai/page.tsx` | Alat AI | AI & Automasi |

### API-Connected (Ops) — 2 modules

| ViewId | Module | BM Label | Sidebar Group |
|--------|--------|----------|---------------|
| `ops-conductor` | `modules/ops-conductor/page.tsx` | Ops Conductor | AI & Automasi / Pengurusan Cerdas |
| `audit-trail` | `modules/audit-trail/page.tsx` | Jejak Audit | Pentadbiran |

### Mock Data (API endpoints exist, frontend not connected) — 10 modules ⚠️

| ViewId | Module | BM Label | API Path |
|--------|--------|----------|----------|
| `triage` | `modules/triage/page.tsx` | Enjin Triage | `/api/v1/cases/auto-triage` |
| `notifications` | `modules/notifications/page.tsx` | Notifikasi | `/api/v1/notifications/` |
| `multi-channel` | `modules/multi-channel/page.tsx` | Berbilang Saluran | `/api/v1/channels/` |
| `onboarding` | `modules/onboarding/page.tsx` | Onboarding Bot | `/api/v1/onboarding/` |
| `automation-rules` | `modules/automation-rules/page.tsx` | Peraturan Automasi | `/api/v1/automation/rules/` |
| `predictive` | `modules/predictive/page.tsx` | Analisis Ramalan | `/api/v1/predictive/` |
| `skills` | `modules/skills/page.tsx` | Pasar Kemahiran | `/api/v1/skills/` |
| `agent-memory` | `modules/agent-memory/page.tsx` | Memori Ejen | `/api/v1/agent/memory/` |
| `multi-agent` | `modules/multi-agent/page.tsx` | Berbilang Ejen | `/api/v1/agents/config/` |
| `audit-trail` | `modules/audit-trail/page.tsx` | Jejak Audit | `/api/v1/audit-trail/` |

> **To connect**: Replace `useState` mock arrays with `api.get()` calls. API endpoints already return proper `{ success, data }` envelopes.

### Static Content — 2 modules

| ViewId | Module | BM Label |
|--------|--------|----------|
| `docs` | `modules/docs/page.tsx` | Panduan |
| `kelas-ai` | `modules/kelas-ai/page.tsx` | Kelas AI & Vibe Coding (12 tabs) |

### OpenClaw (Developer-only, multi-file) — 7 sub-modules

| ViewId | File | BM Label |
|--------|------|----------|
| `openclaw-mcp` | `openclaw/mcp.tsx` | Pelayan MCP |
| `openclaw-plugins` | `openclaw/plugins.tsx` | Sambungan |
| `openclaw-integrations` | `openclaw/integrations.tsx` | Gateway & Channel |
| `openclaw-terminal` | `openclaw/terminal.tsx` | Console Operator |
| `openclaw-agents` | `openclaw/agents.tsx` | Ejen AI |
| `openclaw-models` | `openclaw/models.tsx` | Enjin Model |
| `openclaw-automation` | `openclaw/automation.tsx` | Automasi |

---

## Where To Look

| Task | Location | Notes |
|------|----------|-------|
| Add a new page/module | `src/modules/<name>/page.tsx` + ViewId in `src/types/index.ts` + ViewRenderer case in `src/app/page.tsx` + import in page.tsx + sidebar entry in `app-sidebar.tsx` | See `members/page.tsx` as gold standard |
| Add API endpoint | `src/app/api/v1/<domain>/route.ts` | Export `GET`/`POST`/`PUT`/`DELETE` functions; use Zod for validation |
| Add database model | `prisma/schema.prisma` → `bun run db:push` | Import `db` from `@/lib/db`, **never** `@prisma/client` directly |
| Add UI component | `src/components/ui/` (shadcn) or `src/components/` (custom) | `npx shadcn@latest add <name>` for primitives |
| Change navigation | `src/components/app-sidebar.tsx` `ALL_GROUPS` array | Add `NavItem` with `id`, `label`, `icon`, `roles` |
| Change routing | `src/app/page.tsx` `ViewRenderer` switch + `viewLabels` map | Must match `ViewId` in `src/types/index.ts` |
| Change state | `src/stores/app-store.ts` | Zustand + `persist` middleware; `partialize` only `userRole` + `onboardingDone` |
| Change brand color | `BRAND_COLOR` constant in sidebar + inline `#4B0082` across modules | TODO: move to Tailwind config |
| Connect mock module | `src/modules/<name>/page.tsx` | Replace `useState` mock arrays with `api.get()` from `@/lib/api` |
| WebSocket/realtime | `mini-services/` + `examples/websocket/` | Socket.io on separate port, Caddy `XTransformPort` |
| Form validation | `src/modules/members/page.tsx` | Only module using Zod + `react-hook-form` + `zodResolver` |
| Mobile layout pattern | `src/modules/members/page.tsx` | `hidden md:block` (Table) + `md:hidden space-y-3` (Cards) |
| Delete confirmation | `src/modules/members/page.tsx` | `AlertDialog` with destructive `AlertDialogAction` |
| API pagination | `src/app/api/v1/members/route.ts` | Gold standard: `page`, `pageSize`, `search`, `status` params |
| Parallel queries | `src/app/api/v1/dashboard/route.ts` | `Promise.all` for independent counts |

---

## Routing System (Critical)

PUSPA uses **client-side ViewRenderer** routing. Understanding this is critical — do NOT create Next.js route pages for modules.

### How Routing Works

1. **User clicks nav** → `useAppStore.setView(viewId)` sets `currentView` in Zustand
2. **ViewRenderer** in `src/app/page.tsx` reads `currentView` from store
3. **Switch statement** renders the matching module component
4. All 38 module imports are at the top of `page.tsx` (eager, no lazy loading)

### Adding a New Module (Checklist)

1. Create `src/modules/<name>/page.tsx` → `export default function XxxPage()`
2. Add ViewId to `src/types/index.ts` → `| '<name>'`
3. Add import in `src/app/page.tsx` → `import XxxPage from '@/modules/<name>/page'`
4. Add case in ViewRenderer switch → `case '<name>': return <XxxPage />`
5. Add entry in `viewLabels` map → `'<name>': 'Label Bahasa Melayu'`
6. Add `NavItem` in `src/components/app-sidebar.tsx` → `ALL_GROUPS` with `id`, `label`, `icon`, `roles`
7. (If API needed) Create `src/app/api/v1/<name>/route.ts`

### ViewId Complete List (38 values)

```typescript
// From src/types/index.ts
export type ViewId =
  | 'dashboard' | 'members' | 'cases' | 'programmes' | 'donations'
  | 'disbursements' | 'compliance' | 'admin' | 'reports' | 'activities'
  | 'ai' | 'volunteers' | 'donors' | 'documents'
  | 'openclaw-mcp' | 'openclaw-plugins' | 'openclaw-integrations'
  | 'openclaw-terminal' | 'openclaw-agents' | 'openclaw-models' | 'openclaw-automation'
  | 'ekyc' | 'tapsecure' | 'sedekah-jumaat' | 'docs'
  | 'agihan-bulan' | 'ops-conductor'
  | 'triage' | 'notifications' | 'multi-channel'
  | 'onboarding' | 'automation-rules' | 'predictive'
  | 'skills' | 'agent-memory' | 'multi-agent'
  | 'audit-trail' | 'kelas-ai'
```

---

## Sidebar Navigation

Defined in `src/components/app-sidebar.tsx` as `ALL_GROUPS` array with 7 groups:

| Group | BM Title | Roles | Items |
|-------|----------|-------|-------|
| 1 | Utama | staff, admin, developer | dashboard, members, cases, programmes |
| 2 | Kewangan | staff, admin, developer | donations, disbursements, donors |
| 3 | Operasi | staff, admin, developer | activities, agihan-bulan, sedekah-jumaat, volunteers, documents |
| 4 | Keusahawanan | staff, admin, developer | kelas-ai |
| 5 | Pentadbiran | admin, developer | admin, compliance, reports, ekyc, tapsecure, audit-trail |
| 6 | AI & Automasi | staff, admin, developer | 4 sub-sections (see below) |
| 7 | Bantuan | staff, admin, developer | docs |

**AI & Automasi sub-sections** (uses `sections` not `items`):
- **Pengurusan Cerdas** (badge: AI): ops-conductor, ai, notifications, multi-channel
- **Automasi & Ramalan** (badge: AR): onboarding, automation-rules, triage, predictive
- **Ejen & Kemahiran** (badge: EK): skills, agent-memory, multi-agent
- **OpenClaw (Developer)** (badge: OC): openclaw-mcp, openclaw-plugins, openclaw-integrations, openclaw-terminal, openclaw-agents, openclaw-models, openclaw-automation

Sidebar behavior:
- Desktop: collapsed (72px) → hover-expand (260px) with smooth transition
- Mobile: Sheet overlay (280px) with hamburger trigger
- Role switcher in footer: click to cycle staff → admin → developer
- Active item: gradient `linear-gradient(135deg, #4B0082, #6B21A8)` + left bar indicator

---

## State Management

### app-store.ts (Primary)

```typescript
// Zustand + persist middleware
interface AppState {
  currentView: string         // Active ViewId (default: 'dashboard')
  sidebarOpen: boolean        // Mobile sheet state
  commandPaletteOpen: boolean // ⌘K palette
  userRole: UserRole          // 'staff' | 'admin' | 'developer'
  onboardingDone: boolean     // First-run flag
  // Actions: setView, toggleSidebar, setSidebarOpen, setCommandPaletteOpen,
  //          setUserRole, setOnboardingDone
}
// Persist key: 'puspa-app-state'
// Partialize: only userRole + onboardingDone persisted to localStorage
```

### ops-store.ts

Ops Conductor-specific state management.

---

## API Layer

### Client: `src/lib/api.ts`

```typescript
const BASE = '/api/v1'
// Typed wrapper around fetch
export const api = {
  get:   <T>(path, params?) => apiFetch<T>(path, {}, params),
  post:  <T>(path, body)   => apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put:   <T>(path, body)   => apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path, params?) => apiFetch<T>(path, { method: 'DELETE' }, params),
}
// Response envelope: { success: boolean, data?: T, error?: string, message?: string }
// Throws on !res.ok or !json.success
```

### Server: `src/lib/db.ts`

```typescript
// Singleton PrismaClient with globalThis pattern
const PRISMA_GLOBAL_KEY = 'prismaClient_v2'
export const db = globalForPrisma[PRISMA_GLOBAL_KEY] ?? new PrismaClient({ log: ['query'] })
```

### API Route Handler Pattern

```typescript
// src/app/api/v1/<domain>/route.ts
import { db } from '@/lib/db'           // ALWAYS this import
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '50'), 100)
    const search = searchParams.get('search') || ''
    // ... query with { where: { isDeleted: false, ... } }
    return Response.json({ success: true, data: { items, total, page, pageSize, totalPages } })
  } catch (error) {
    return Response.json({ success: false, error: 'Ralat pelayan' }, { status: 500 })
  }
}
```

### API Domains (84+ routes)

```
api/v1/
  agents/config/             Agent configuration CRUD + activate
  agent/memory/              Agent memory CRUD + search + context
  ai/                        Chat + analytics
  audit-trail/               Audit trail + [txHash] + verify
  audit/                     General audit log
  automation/rules/          Automation rule CRUD + [id]/trigger
  board-members/             Board member management
  branches/                  Branch management
  cases/                     Case CRUD + auto-triage + triage-results
  channels/                  Multi-channel messages + stats
  compliance/                Compliance + ros + pdpa
  dashboard/                 Stats + activities + monthly-donations + member-distribution
  disbursements/             Disbursement CRUD
  documents/                 Document CRUD + stats
  donations/                 Donation CRUD
  donors/                    Donor CRUD + receipts + communications
  ekyc/                      eKYC + verify + reject
  integrations/whatsapp/     WhatsApp integration
  members/                   ★ Gold standard: full CRUD + Zod + pagination
  notifications/             Notification CRUD + preferences + send + logs
  onboarding/                Start + sessions + process + [id]
  openclaw/                  Snapshot + status
  ops/                       Dashboard + projects + artifacts + intent + automations + bulk
                             work-items/[id]/approve/decision + stats + resume
  organization/              Organization profile
  partners/                  Partner CRUD
  predictive/                Distribution + forecast + history
  programmes/                Programme CRUD
  reports/                   Reports + financial
  skills/                    Install + [id]/toggle + marketplace + installed
  smart-contracts/           Evaluate + logs
  tapsecure/                 Settings + biometric + logs + devices/primary
  volunteers/                Volunteer CRUD + deployments + hours + certificates
```

---

## Database Schema (49 Models)

**Provider**: SQLite | **URL**: `env("DATABASE_URL")` | **Migrations**: `db push` only (no migration files)

### Core Models

| Model | Purpose | Key Fields | Soft Delete |
|-------|---------|------------|-------------|
| `User` | System users | email, password, role (admin/ops/finance/volunteer) | `isActive` |
| `Member` | Asnaf members | memberNumber (PUSPA-XXXX), ic, monthlyIncome, status | ✅ `isDeleted` |
| `HouseholdMember` | Member dependents | relationship, age, income, isOKU, isStudent | ❌ |
| `Programme` | Aid programmes | category (8 types), budget, targetBeneficiaries | ✅ `isDeleted` |
| `Case` | Help requests | caseNumber (CS-XXXX), status (11 states), priority, verificationScore | ✅ `isDeleted` |
| `CaseNote` | Case activity log | type (note/call/visit/assessment) | ❌ |
| `CaseDocument` | Case attachments | type (ic/income_proof/medical/photo/other) | ❌ |

### Financial Models (ISF — Islamic Social Finance)

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `Donation` | All donations | fundType (zakat/sadaqah/waqf/infaq/general), zakatCategory, shariahCompliant | ✅ `isDeleted` |
| `Disbursement` | Fund disbursements | disbursementNumber (DB-XXXX), status (6 states) | ✅ `isDeleted` |
| `Donor` | Donor CRM | segment (major/regular/occasional/lapsed), totalDonated | ✅ `isDeleted` |
| `DonorCommunication` | Donor comms log | type (email/phone/whatsapp/letter) | ❌ |
| `TaxReceipt` | Tax receipts | receiptNumber (TR-YYYY-XXXX), lhdnRef | ❌ |

### Compliance Models

| Model | Purpose |
|-------|---------|
| `OrganizationProfile` | Org registration + LHDN + ROS details |
| `BoardMember` | Board composition + appointment dates |
| `Partner` | External partners with verification status |
| `ImpactMetric` | Programme impact with self-reported + verified values |
| `PublicReport` | Published reports (annual/financial/impact/audit) |
| `ComplianceChecklist` | Checklist items by category |
| `AuditLog` | System-wide audit trail |

### Security Models

| Model | Purpose |
|-------|---------|
| `EKYCVerification` | Identity verification (IC + selfie + liveness) + BNM/AMLA compliance |
| `SecuritySettings` | Per-user security: biometric, session timeout |
| `DeviceBinding` | Device registration + OTP verification |
| `SecurityLog` | Security event log (login/bind/biometric/OTP) |

### Volunteer Models

| Model | Purpose |
|-------|---------|
| `Volunteer` | Volunteer profile with skills JSON | ✅ `isDeleted` |
| `VolunteerDeployment` | Programme assignments with roles |
| `VolunteerHourLog` | Hour tracking with approval workflow |
| `VolunteerCertificate` | Auto-generated certificates (CERT-XXXX) |

### Ops Conductor Models

| Model | Purpose |
|-------|---------|
| `WorkItem` | Operations work items (WI-XXXX) with intent routing |
| `ExecutionEvent` | Work item execution logs |
| `Artifact` | Generated outputs (reports/dashboards/summaries) |
| `AutomationJob` | Scheduled jobs (one_time/fixed_rate/cron) |

### AI/Automation Models (Fasa 1-4)

| Model | Fasa | Purpose |
|-------|------|---------|
| `TriageResult` | 1 | AI case triage (P1-P5) with scoring |
| `NotificationLog` | 1 | Multi-channel notification delivery log |
| `NotificationPreference` | 1 | User notification preferences + quiet hours |
| `ChannelMessage` | 1 | Multi-channel message log (WhatsApp/Telegram/Web/SMS) |
| `OnboardingSession` | 2 | Conversational onboarding state (OB-XXXX) |
| `AutomationRule` | 2 | Event-triggered automation rules |
| `PredictionData` | 2 | ML prediction storage + backtesting |
| `InstalledSkill` | 3 | ClawHub skills marketplace |
| `AgentMemory` | 3 | Persistent agent memory with confidence + expiry |
| `AgentConfig` | 3 | Multi-agent configuration (role, model, channels, skills) |
| `AuditTrail` | 4 | Blockchain-style audit trail (txHash) |
| `SmartContractLog` | 4 | Smart contract evaluation logs |

### Other Models

| Model | Purpose |
|-------|---------|
| `Notification` | In-app notifications |
| `Capture` | Multi-type data capture (text/voice/photo/link) |
| `Document` | Document management with versioning + tags |
| `Branch` | Branch offices (KL, SEL, PEN, JOH) |
| `Activity` | Activities/Kanban with ordering |

---

## Conventions

### Routing & Architecture
- **SPA routing**: All views rendered client-side via `ViewRenderer` switch in `src/app/page.tsx`
- **All modules eagerly imported** — no lazy loading (Turbopack ChunkLoadError workaround)
- **Never** create Next.js route pages (`src/app/*/page.tsx`) for modules — ViewRenderer only
- OpenClaw is the only multi-file module (7 `.tsx` sub-files, no `page.tsx`)

### Language & Locale
- **Bahasa Melayu (BM)**: All UI text, labels, validation, toasts in Malay
- HTML `lang="ms"`
- Currency: `Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' })`
- Dates: `.toLocaleDateString('ms-MY')`
- API error messages in Malay (e.g. `'Ralat pelayan'`, `'Ahli tidak dijumpai'`)

### Data Access
- **Soft delete**: All models use `isDeleted: true` flag — never hard-delete
- **DB access**: Always `import { db } from '@/lib/db'` — never import `@prisma/client` directly
- **API calls**: Always `import { api } from '@/lib/api'` — never raw `fetch()`
- **API envelope**: `{ success: boolean, data?: T, error?: string, message?: string }`

### UI Patterns
- **Mobile-first**: Desktop `<Table>` + mobile `<Card>` list (`hidden md:block` / `md:hidden space-y-3`)
- **Delete confirmation**: Always `<AlertDialog>`, never browser `confirm()`
- **Select components**: Always shadcn `<Select>`, never native `<select>`
- **Dialogs**: Always include `<DialogTitle>` + `<DialogDescription>`
- **Sheets**: Always include `<SheetTitle>` + `<SheetDescription>`
- **Brand color**: `#4B0082` via inline `style={{ color: '#4B0082' }}` — should be Tailwind utility
- **Toast**: `import { toast } from 'sonner'` → `toast.success/error(...)` with Malay messages

### API Route Handlers
- **Zod validation**: Define schemas at top of file; use `.safeParse()` — `members/route.ts` is gold standard
- **Pagination**: Accept `page` (1-based), `pageSize` (max 100), `search`, `status` from `request.nextUrl.searchParams`
- **Parallel queries**: Use `Promise.all` for independent counts; `Promise.allSettled` for partial failure
- **Error handling**: Every handler wrapped in try/catch; HTTP status codes 400/404/409/500
- **Auth**: `x-api-key` enforced on `/api/v1/*` by `src/middleware.ts` in production only

### Module Structure
- Every module exports `export default function XxxPage()`
- Modules are intentionally self-contained (no extracted component files)
- Only `members/page.tsx` uses Zod + `react-hook-form` — all others use manual `useState` + `onChange`
- Mock-data modules: Replace `useState` hardcoded arrays with `api.get()` when connecting

---

## Anti-Patterns (NEVER DO)

| Rule | Reason |
|------|--------|
| ❌ NEVER use browser `confirm()` | Use AlertDialog |
| ❌ NEVER use native `<select>` | Use shadcn Select |
| ❌ NEVER import `@prisma/client` directly | Use `import { db } from '@/lib/db'` |
| ❌ NEVER nest `<div>` or `<Skeleton>` inside `<p>` | Use `<div>` instead |
| ❌ NEVER use `<Dialog>` without `<DialogTitle>` + `<DialogDescription>` | Accessibility |
| ❌ NEVER use `<Sheet>` without `<SheetTitle>` + `<SheetDescription>` | Accessibility |
| ❌ NEVER use `as any` | Type properly |
| ❌ NEVER hardcode `http://localhost:PORT` in fetch | Use relative paths with `?XTransformPort=PORT` |
| ❌ NEVER create Next.js route pages for modules | Use ViewRenderer only |
| ❌ NEVER write test code | Per project rules |
| ❌ NEVER use `fetch()` directly for API calls | Use `api` from `@/lib/api` |
| ❌ NEVER hard-delete records (`db.*.delete()`) | Soft-delete via `isDeleted: true` |
| ❌ NEVER return raw Prisma errors to clients | Catch and return generic Malay message |
| ❌ NEVER omit `isDeleted: false` in `where` clauses | Soft-deleted rows will leak |
| ❌ NEVER add `react-hook-form`/`zod` to modules other than members | Without migrating the whole module |

---

## Unique Styles & Features

### PUSPA SVG Icon System
- `src/components/puspa-icons.tsx` with `PUSPA_ICON_MAP` + `PUSPA_ICON_COLORS`
- Custom icon mapping for domain-specific entities

### Sidebar
- Custom collapsible: hover-expand (72px → 260px) with smooth CSS transitions
- Role switcher footer: click to cycle staff → admin → developer
- Active state: `linear-gradient(135deg, #4B0082, #6B21A8)` + left bar indicator
- Sub-section labels with badge abbreviations (AI, AR, EK, OC) when collapsed

### Command Palette
- Bilingual search: BM labels + EN keywords
- Role-filtered results
- `⌘K` keyboard shortcut

### OpenClaw (Developer-only)
- 7 sub-modules under `src/modules/openclaw/`
- AI Ops framework: MCP servers, plugins, integrations, terminal, agents, models, automation
- API: `/api/v1/openclaw/snapshot` + `/api/v1/openclaw/status`

### Brand Color Tech Debt
- `style={{ color: '#4B0082' }}` used ~60+ times across modules
- `BRAND_COLOR` constant defined in `app-sidebar.tsx`
- Should be moved to Tailwind config as a named utility

---

## Tech Debt & Known Issues

| Issue | Details | Impact |
|-------|---------|--------|
| Inline brand color | `#4B0082` used ~60+ times inline instead of Tailwind class | Hard to rebrand, inconsistent |
| 10 mock AI modules | API endpoints exist but frontend uses hardcoded `useState` arrays | Features don't work end-to-end |
| Eager module imports | All 38 modules imported at page load (Turbopack workaround) | Large initial bundle |
| Only 1 module with Zod | `members/page.tsx` is the only one with proper form validation | Other modules have weaker validation |
| Unused dependencies | `@tanstack/react-query`, `@tanstack/react-table`, `next-auth`, `next-intl`, `supabase` | Bloated node_modules |
| Supabase client unused | `src/lib/supabase.ts` configured but never used | Dead code |
| SQLite + db push | No migrations, dev-only database | Not production-ready |
| No CI/CD | Manual deployment, no tests, no Docker | Deployment risk |
| No auth system | `x-api-key` middleware only in production; client has no login flow | Security gap |

---

## Commands

```bash
bun run dev          # Start Next.js on :3000 (logs to dev.log)
bun run lint         # ESLint check
bun run db:push      # Push Prisma schema to SQLite (no migrations)
bun run db:generate  # Generate Prisma client
```

---

## Infrastructure

### Caddy Gateway (`Caddyfile`)

- Listens on `:81`
- Default: reverse proxy to `localhost:3000` (Next.js)
- `?XTransformPort=<port>` query param: reverse proxy to `localhost:<port>`
- Used for WebSocket services and other mini-services on different ports

### Deployment
- No CI/CD pipeline, no Docker
- Manual deployment process
- Bun runtime for development

---

## Sub-AGENTS.md References

Detailed documentation exists in these locations:

| File | Scope |
|------|-------|
| `src/app/api/AGENTS.md` | API route handler conventions, patterns, anti-patterns |
| `src/modules/AGENTS.md` | Module page conventions, status matrix, gold standard reference |

> **Note**: Sub-AGENTS.md files for `src/lib/`, `src/stores/`, `src/components/`, `prisma/`, and `src/modules/openclaw/` are referenced in project context but may not yet exist on disk.

---

## Improvement Roadmap

`PUSPA-IMPROVEMENT-ROADMAP.md` contains 10 improvement suggestions across 4 phases:

| Phase | Priority | Suggestions |
|-------|----------|-------------|
| **Fasa 1** | 🔴 High | #1 Multi-Channel Communication (WhatsApp/Telegram), #2 AI Agent Automation (Auto-triage) |
| **Fasa 2** | 🟡 Medium | #3 Predictive Analytics, #5 Smart Onboarding Bot, #6 Workflow Automation Enhancement |
| **Fasa 3** | 🟡 Medium | #7 ClawHub Skills Marketplace, #8 Persistent Agent Memory, #9 Multi-Agent Architecture |
| **Fasa 4** | 🟢 Low | #4 Blockchain & Smart Contracts, #10 Real-time Notifications |

Target: Transform from SaaS management tool → AI-native autonomous platform.

---

## Quick Reference: File Modification Checklist

### Adding a New Module
```
1. src/types/index.ts              → Add ViewId union value
2. src/modules/<name>/page.tsx     → Create module, export default function
3. src/app/page.tsx                → Import module + add ViewRenderer case + add viewLabels entry
4. src/components/app-sidebar.tsx  → Add NavItem to ALL_GROUPS
5. prisma/schema.prisma            → Add model (if needed) → bun run db:push
6. src/app/api/v1/<name>/route.ts  → Create API handler (if needed)
```

### Connecting a Mock Module to API
```
1. src/modules/<name>/page.tsx     → Replace useState mock arrays with api.get()
2. Handle loading states (Skeleton)
3. Handle error states (toast.error)
4. Test CRUD operations via api.post/put/delete
```

### Adding a Database Field
```
1. prisma/schema.prisma            → Add field to model
2. bun run db:push                 → Apply to SQLite
3. bun run db:generate             → Regenerate Prisma client
4. src/app/api/v1/<model>/route.ts → Update Zod schema + handler
5. src/modules/<model>/page.tsx    → Update form + table + card
```
