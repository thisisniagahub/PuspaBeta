# Prisma — Database Schema & Seed

This directory contains the Prisma schema and seed script for **PUSPA**.

---

## Overview

| File | Purpose |
|---|---|
| `schema.prisma` | 49 models across 20 sections, SQLite dialect |
| `seed.ts` | Comprehensive seed script with demo data |

---

## Schema Sections

| Section | Models | Purpose |
|---|---|---|
| **Core** | User | Auth, roles (admin/ops/finance/volunteer), audit logs, device bindings |
| **Member/Asnaf** | Member, HouseholdMember | Beneficiary registry with IC, income, household, bank details |
| **Programme** | Programme | Programs with budget, beneficiaries, categories (food_aid, education, etc.) |
| **Case Workflow** | Case, CaseNote, CaseDocument | Full lifecycle: draft→submitted→verifying→...→closed/rejected with scoring |
| **Donation (ISF)** | Donation | Islamic Social Finance segregation: zakat, sadaqah, waqf, infaq with shariah compliance flag |
| **Disbursement** | Disbursement | Payment processing with bank details, scheduling, approval chain |
| **Activity/Kanban** | Activity | Task/event tracking with order field for Kanban |
| **Compliance** | OrganizationProfile, BoardMember, Partner, ImpactMetric, PublicReport, ComplianceChecklist | Governance, transparency, impact verification |
| **Audit Log** | AuditLog | Generic action/entity audit trail |
| **Notification** | Notification | In-app notifications |
| **Capture** | Capture | Text/voice/photo/link captures |
| **eKYC** | EKYCVerification | IC OCR, selfie+liveness, face match, BNM compliance, AMLA screening |
| **TapSecure** | SecuritySettings, DeviceBinding, SecurityLog | Biometric auth, device binding, session timeout, security event logging |
| **Volunteer** | Volunteer, VolunteerDeployment, VolunteerHourLog, VolunteerCertificate | Full volunteer lifecycle |
| **Donor CRM** | Donor, DonorCommunication, TaxReceipt | Donor segmentation, communication history, LHDN tax receipts |
| **Document** | Document | Document management with versioning and tags |
| **Branch** | Branch | Multi-branch support (KL, SEL, PEN, JOH) |
| **Ops Conductor** | WorkItem, ExecutionEvent, Artifact, AutomationJob | AI operations orchestration with execution tracing |
| **Fasa 1: Triage** | TriageResult | AI-powered case priority scoring (P1-P5) |
| **Fasa 1: Notifications** | NotificationLog, NotificationPreference | Multi-channel notification delivery + user preferences |
| **Fasa 1: Multi-Channel** | ChannelMessage | WhatsApp/Telegram/Web/SMS message tracking |
| **Fasa 2: Onboarding** | OnboardingSession | Multi-step onboarding bot sessions |
| **Fasa 2: Automation** | AutomationRule | Event-triggered automation with conditions and actions |
| **Fasa 2: Predictive** | PredictionData | Demand forecasting, distribution optimization, fund projections |
| **Fasa 3: Skills** | InstalledSkill | ClawHub skill marketplace |
| **Fasa 3: Agent Memory** | AgentMemory | Persistent agent context with confidence scores and expiry |
| **Fasa 3: Multi-Agent** | AgentConfig | Named AI agents with roles, models, skills, channels, system prompts |
| **Fasa 4: Blockchain** | AuditTrail, SmartContractLog | Blockchain-style audit with tx hashes, smart contract evaluation |

---

## Key Schema Conventions

- **Soft delete**: All models have `isDeleted Boolean @default(false)` — NEVER hard-delete
- **Timestamps**: All models have `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`
- **Status fields**: Always lowercase strings (e.g., `'active'`, `'pending'`, not `'Active'`, `'Pending'`)
- **ID fields**: All use `@default(cuid())` for auto-generated IDs
- **Currency fields**: Stored as `Float` (MYR)
- **Prisma client**: SQLite dialect, no migrations (dev push only)

---

## Seed Data

`seed.ts` creates the following demo data:

| Entity | Count | Notes |
|---|---|---|
| Users | 2 | admin + staff |
| Branches | 2 | KL, Selangor |
| Organization profile | 1 | — |
| Members | 8 | Various asnaf categories |
| Programmes | 8 | Food aid, education, skills training, etc. |
| Donations | 10 | Zakat, sadaqah, waqf, infaq |
| Donors | 5 | — |
| Cases | 3 | — |
| Volunteers | 4 | — |
| Compliance checklist items | 12 | — |
| Board members | 5 | — |
| Partners | 3 | — |
| Activities | 5 | — |
| Disbursements | 2 | — |
| Documents | 4 | — |
| Audit logs | 1 | — |

---

## Conventions

- Always run `bun run db:push` after schema changes (no migration files)
- Run `bun run db:generate` to regenerate Prisma client
- Import `db` from `@/lib/db` — NEVER `@prisma/client` directly
- All queries must include `where: { isDeleted: false }` unless intentionally accessing soft-deleted records
- Use `db.*.update({ data: { isDeleted: true } })` for deletes — NEVER `db.*.delete()`
- When adding new models, follow the existing section organization pattern
- Add seed data to `seed.ts` for any new model that should have demo data
- Prisma client version key in `db.ts`: `prismaClient_v2` — increment if schema changes break client

---

## Anti-Patterns

- ❌ NEVER hard-delete records with `db.*.delete()` — always soft-delete
- ❌ NEVER forget `isDeleted: false` in WHERE clauses — soft-deleted rows will leak
- ❌ NEVER import `PrismaClient` directly — use `import { db } from '@/lib/db'`
- ❌ NEVER create migration files — this project uses `db push` (dev-only, no migrations)
- ❌ NEVER use SQLite for production — it's dev-only; switch to PostgreSQL for production
- ❌ NEVER store arrays in schema fields — Prisma doesn't support it; use JSON strings or separate tables
- ❌ NEVER forget to update `seed.ts` when adding new models that need demo data
