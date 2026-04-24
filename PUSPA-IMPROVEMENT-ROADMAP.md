# 🌸 PUSPA AI SaaS Enterprise — Roadmap Penambahbaikan 2026–2027

> **Pertubuhan Urus Peduli Asnaf KL & Selangor**  
> PPM-006-14-14032020 | v2.1.0 → v3.0.0  
> Dokumen ini mengandungi 10 cadangan penambahbaikan utama berdasarkan research terkini tentang OpenClaw AI Agent Framework, AI SaaS trends 2026, dan kajian akademik tentang pengurusan zakat berasaskan AI.

---

## 📑 Isi Kandungan

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Konteks: Apa Itu OpenClaw](#2-konteks-apa-itu-openclaw)
3. [Cadangan 1: Multi-Channel Communication via OpenClaw](#3-cadangan-1-multi-channel-communication-via-openclaw)
4. [Cadangan 2: AI Agent Automation untuk Pengurusan Kes Asnaf](#4-cadangan-2-ai-agent-automation-untuk-pengurusan-kes-asnaf)
5. [Cadangan 3: Predictive Analytics untuk Agihan Zakat](#5-cadangan-3-predictive-analytics-untuk-agihan-zakat)
6. [Cadangan 4: Blockchain & Smart Contracts untuk Ketelusan](#6-cadangan-4-blockchain--smart-contracts-untuk-ketelusan)
7. [Cadangan 5: Smart Onboarding Bot untuk Ahli Asnaf Baru](#7-cadangan-5-smart-onboarding-bot-untuk-ahli-asnaf-baru)
8. [Cadangan 6: Workflow Automation Enhancement](#8-cadangan-6-workflow-automation-enhancement)
9. [Cadangan 7: ClawHub Skills Marketplace Integration](#9-cadangan-7-clawhub-skills-marketplace-integration)
10. [Cadangan 8: Persistent Agent Memory](#10-cadangan-8-persistent-agent-memory)
11. [Cadangan 9: Multi-Agent Architecture](#11-cadangan-9-multi-agent-architecture)
12. [Cadangan 10: Real-time Notifications via WhatsApp/Telegram](#12-cadangan-10-real-time-notifications-via-whatsapptelegram)
13. [Matriks Prioriti & Timeline](#13-matriks-prioriti--timeline)
14. [Arkitektur Target (v3.0)](#14-arkitektur-target-v30)
15. [Sumber Rujukan](#15-sumber-rujukan)

---

## 1. Ringkasan Eksekutif

### Kedudukan Semasa (v2.1.0)

PUSPA kini mempunyai:
- **27 modul** (Dashboard, Members, Cases, Programmes, Donations, Disbursements, Compliance, Admin, Reports, Activities, AI Tools, Volunteers, Donors, Documents, eKYC, TapSecure, Sedekah Jumaat, Agihan Bulan, Ops Conductor, dan 7 modul OpenClaw)
- **57 API routes** dengan Prisma ORM + SQLite
- **3 peranan** (Staf, Pentadbir, Developer) dengan role-based navigation
- **AI Chat** asas dan analytics insight statik
- **OpenClaw modules** (MCP, Plugins, Gateway & Channel, Terminal, Agents, Models, Automation) — tetapi belum dihubungkan sepenuhnya

### Jurang Utama

| Jurang | Masalah | Impak |
|--------|---------|-------|
| **Komunikasi** | Asnaf hanya boleh akses melalui web — tiada WhatsApp/Telegram | Asnaf (kumpulan sasaran) sukar akses |
| **Automasi** | Proses manual untuk triage kes, assign sukarelawan, generate laporan | Masa pembaziran, human error |
| **Analytics** | Dashboard historical sahaja — tiada predictive | Tak boleh forecast keperluan asnaf |
| **Memori AI** | Chatbot tiada ingatan antara sesi | Pengalaman pengguna berulang |
| **Ketelusan** | Compliance manual, tiada traceability end-to-end | Risiko kepercayaan penderma |

### Matlamat v3.0

Transform PUSPA dari **SaaS management tool** kepada **AI-native autonomous platform** yang:
1. Bercakap dengan asnaf di WhatsApp/Telegram
2. Auto-triage dan auto-assign kes bantuan
3. Predict keperluan asnaf bulan depan
5. Ingat setiap interaksi dan personalized response
6. Traceable end-to-end dari donasi ke penerima

---

## 2. Konteks: Apa Itu OpenClaw

### Definisi

**OpenClaw** ialah **open-source, local-first autonomous AI agent framework** (MIT License) yang membolehkan sesiapa menjalankan AI assistant pada peranti sendiri dan berinteraksi melalui pelbagai messaging platform.

### Arkitektur 4-Lapisan

```
┌─────────────────────────────────────────────────┐
│                  GATEWAY                        │
│         (Core runtime, routing, config)          │
├─────────────────────────────────────────────────┤
│                   NODES                         │
│      (Agent processes, workspace, memory)        │
├─────────────────────────────────────────────────┤
│                 CHANNELS                         │
│   (WhatsApp, Telegram, Discord, Slack, etc.)     │
├─────────────────────────────────────────────────┤
│                  SKILLS                          │
│  (5400+ plugins: search, email, calendar, etc.)  │
└─────────────────────────────────────────────────┘
```

### Ciri-Ciri Utama

| Feature | Detail |
|---------|--------|
| **Multi-Channel** | WhatsApp, Telegram, Discord, Slack, Signal, iMessage, Google Chat, IRC, WebChat |
| **ClawHub** | Marketplace 5,400+ skills yang boleh dipasang |
| **Plugin Architecture** | Native plugins (in-process) + External skills |
| **Persistent Memory** | `MEMORY.md` — memori jangka panjang yang di-load setiap sesi |
| **Multi-Agent Routing** | Multiple isolated agents dengan workspace masing-masing |
| **ACP (Agent Client Protocol)** | Integrasi dengan Claude Code, Cursor, Copilot |
| **Agent Loop** | Intake → Context Assembly → Inference → Tool Execution → Streaming → Persistence |
| **Self-Hosted** | Berjalan pada peranti sendiri, data tak keluar |
| **License** | MIT (open source) |

### Kenapa OpenClaw Relevan untuk PUSPA?

1. **Asnaf guna WhatsApp** — OpenClaw sambung terus ke WhatsApp
2. **Self-hosted** — Data asnaf sensitif, tak boleh hantar ke cloud pihak ketiga
3. **Skills ecosystem** — 5400+ skills sedia ada, tak perlu buat dari scratch
4. **Multi-agent** — Boleh assign agent khusus untuk setiap fungsi (kewangan, operasi, compliance)
5. **MIT License** — Bebas guna dan modify

---

## 3. Cadangan 1: Multi-Channel Communication via OpenClaw

### Status: 🔴 HIGH PRIORITY

### Masalah

PUSPA kini hanya boleh diakses melalui web interface. Asnaf — kumpulan sasaran utama — kebanyakannya lebih selesa menggunakan WhatsApp. Tiada saluran komunikasi langsung di platform yang mereka sudah guna.

### Penyelesaian

Integrasi OpenClaw sebagai **multi-channel gateway** untuk menyambung PUSPA ke WhatsApp dan Telegram.

### Arkitektur

```
┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐
│ Asnaf    │───▶│   OpenClaw    │───▶│  PUSPA API  │───▶│ Database │
│ WhatsApp │    │   Gateway     │    │  (Next.js)  │    │ (SQLite) │
│ Telegram │    │  (Port 3010)  │    │  (Port 3000)│    │          │
└──────────┘    └──────────────┘    └─────────────┘    └──────────┘
```

### Komponen yang Perlu Dibina

#### 3.1 OpenClaw Gateway Service (Mini Service)

```
mini-services/openclaw-gateway/
├── package.json
├── index.ts          # Gateway entry point
├── config/
│   ├── agents.yml    # Agent configuration
│   └── channels.yml  # WhatsApp + Telegram config
└── skills/
    └── puspa/
        ├── skill.json        # Skill manifest
        ├── index.ts          # Skill logic
        └── prompts/
            └── system.md     # PUSPA system prompt
```

**Konfigurasi Agent:**

```yaml
# config/agents.yml
agents:
  - name: puspa-asnaf
    model: glm-4
    channels:
      - whatsapp
      - telegram
    skills:
      - puspa-asnaf-helper
    memory: true
    system_prompt: |
      Anda adalah Pembantu AI PUSPA — Pertubuhan Urus Peduli Asnaf KL & Selangor.
      Tugas anda:
      1. Bantu asnaf memohon bantuan
      2. Semak status permohonan
      3. Beri maklumat tentang program
      4. Sambut sumbangan dan generate receipt
      Bahasa: Bahasa Melayu utama, English jika diminta.
```

**Konfigurasi Channel:**

```yaml
# config/channels.yml
channels:
  whatsapp:
    adapter: whatsapp-business-api
    phone_number_id: ${WA_PHONE_NUMBER_ID}
    business_account_id: ${WA_BUSINESS_ACCOUNT_ID}
    verify_token: ${WA_VERIFY_TOKEN}
    
  telegram:
    adapter: telegram-bot
    bot_token: ${TELEGRAM_BOT_TOKEN}
    webhook_url: ${PUBLIC_URL}/webhook/telegram
```

#### 3.2 PUSPA Skill untuk OpenClaw

```typescript
// skills/puspa/index.ts
interface PuspaSkillConfig {
  apiBaseUrl: string;
  apiKey: string;
}

export default class PuspaAsnafSkill {
  name = 'puspa-asnaf-helper';
  description = 'PUSPA Asnaf Helper — bantu asnaf dengan permohonan, status, dan maklumat program';
  
  private api: PuspaApiClient;
  
  constructor(config: PuspaSkillConfig) {
    this.api = new PuspaApiClient(config.apiBaseUrl, config.apiKey);
  }
  
  // Tools yang agent boleh guna
  tools = [
    {
      name: 'check_application_status',
      description: 'Semak status permohonan bantuan asnaf',
      parameters: { application_id: { type: 'string', required: true } },
      handler: async (params) => {
        return await this.api.get(`/cases/${params.application_id}`);
      }
    },
    {
      name: 'submit_application',
      description: 'Hantar permohonan bantuan baru',
      parameters: {
        name: { type: 'string', required: true },
        ic_number: { type: 'string', required: true },
        category: { type: 'string', required: true },
        description: { type: 'string', required: true }
      },
      handler: async (params) => {
        return await this.api.post('/cases', {
          applicantName: params.name,
          icNumber: params.ic_number,
          category: params.category,
          description: params.description,
          channel: 'whatsapp',
          status: 'baru'
        });
      }
    },
    {
      name: 'list_programmes',
      description: 'Senarai program PUSPA yang aktif',
      parameters: {},
      handler: async () => {
        return await this.api.get('/programmes?status=active');
      }
    },
    {
      name: 'make_donation',
      description: 'Terima sumbangan dan generate receipt',
      parameters: {
        donor_name: { type: 'string', required: true },
        amount: { type: 'number', required: true },
        fund_type: { type: 'string', required: true }
      },
      handler: async (params) => {
        const donation = await this.api.post('/donations', {
          donorName: params.donor_name,
          amount: params.amount,
          fundType: params.fund_type,
          channel: 'whatsapp'
        });
        return { ...donation, receipt_url: `${this.api.baseUrl}/receipts/${donation.id}` };
      }
    }
  ];
}
```

#### 3.3 API Endpoints Tambahan

```typescript
// src/app/api/v1/integrations/openclaw/route.ts
// Endpoint untuk OpenClaw Gateway callback

export async function POST(request: Request) {
  const body = await request.json();
  const { action, data } = body;
  
  switch (action) {
    case 'check_status':
      // Query case status
      break;
    case 'submit_application':
      // Create new case
      break;
    case 'list_programmes':
      // Return active programmes
      break;
    case 'make_donation':
      // Process donation
      break;
    default:
      return Response.json({ error: 'Unknown action' }, { status: 400 });
  }
}
```

### Aliran Pengguna

```
Asnaf di WhatsApp:
1. Asnaf hantar: "Saya nak minta bantuan"
2. OpenClaw → PUSPA Skill → Auto-create case
3. Agent tanya: "Boleh bagi nama dan No. IC?"
4. Asnaf jawab → Data disimpan ke database
5. Agent: "Permohonan anda telah didaftarkan. No. kes: KS-2026-0042"
6. Notifikasi dihantar ke admin PUSPA web dashboard
```

### Prasyarat

- [ ] WhatsApp Business API access (Meta Business Manager)
- [ ] Telegram Bot via @BotFather
- [ ] OpenClaw Gateway di-deploy sebagai mini service
- [ ] PUSPA API endpoints untuk OpenClaw callback

### Anggaran Masa: 2–3 minggu

---

## 4. Cadangan 2: AI Agent Automation untuk Pengurusan Kes Asnaf

### Status: 🔴 HIGH PRIORITY

### Masalah

Pengurusan kes asnaf masih manual — staf perlu review setiap kes baru, assign ke program, dan follow up. Proses ini lambat dan boleh ada human error.

### Penyelesaian

Memanfaatkan OpenClaw Agent Loop untuk automatikkan:
1. **Auto-triage** — Prioritize kes berdasarkan urgency
2. **Auto-assign** — Assign sukarelawan/program berdasarkan lokasi & skill
3. **Auto-generate** — Laporan bulanan, receipt, dan dokumen

### Arkitektur

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Kes Baharu  │────▶│  Agent Loop  │────▶│  Auto Actions   │
│ (Web/WA/TG) │     │  (OpenClaw)  │     │                 │
└─────────────┘     └──────────────┘     ├─ Triage (P1-P5) │
                                         ├─ Assign Program  │
                                         ├─ Notify Admin    │
                                         └─ Generate Docs   │
```

### Komponen yang Perlu Dibina

#### 4.1 Triage Engine

```typescript
// src/lib/triage-engine.ts

interface CaseData {
  id: string;
  category: string;  // fakir, miskin, amil, mualaf, gharimin, riqab, gharim, ibnu sabil
  description: string;
  monthlyIncome: number;
  dependents: number;
  hasShelter: boolean;
  hasChronicIllness: boolean;
  isEmergency: boolean;
}

interface TriageResult {
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  reason: string;
  suggestedProgramme: string;
  autoAssign: boolean;
}

export function triageCase(data: CaseData): TriageResult {
  let score = 0;
  const reasons: string[] = [];
  
  // Emergency override
  if (data.isEmergency) {
    return { priority: 'P1', reason: 'Kes kecemasan — perlu tindakan segera', suggestedProgramme: 'bantuan-segera', autoAssign: true };
  }
  
  // Income scoring
  if (data.monthlyIncome === 0) { score += 40; reasons.push('Tiada pendapatan'); }
  else if (data.monthlyIncome < 500) { score += 30; reasons.push('Pendapatan sangat rendah (< RM500)'); }
  else if (data.monthlyIncome < 1000) { score += 20; reasons.push('Pendapatan rendah (< RM1,000)'); }
  
  // Dependents scoring
  if (data.dependents >= 5) { score += 20; reasons.push(`${data.dependents} tanggungan`); }
  else if (data.dependents >= 3) { score += 10; reasons.push(`${data.dependents} tanggungan`); }
  
  // Shelter
  if (!data.hasShelter) { score += 20; reasons.push('Tiada tempat tinggal'); }
  
  // Health
  if (data.hasChronicIllness) { score += 15; reasons.push('Penyakit kronik'); }
  
  // Category priority (8 asnaf categories)
  const categoryPriority: Record<string, number> = {
    'fakir': 15, 'miskin': 12, 'riqab': 10, 'gharim': 8,
    'mualaf': 7, 'amil': 5, 'ibnu-sabil': 12, 'gharimin': 8
  };
  score += categoryPriority[data.category] || 5;
  
  // Map score to priority
  const priority = score >= 70 ? 'P1' : score >= 50 ? 'P2' : score >= 30 ? 'P3' : score >= 15 ? 'P4' : 'P5';
  
  // Suggest programme
  const programmeMap: Record<string, string> = {
    'P1': 'bantuan-segera',
    'P2': 'bantuan-makanan',
    'P3': 'program-keusahawanan',
    'P4': 'program-pendidikan',
    'P5': 'program-pemantapan'
  };
  
  return {
    priority,
    reason: reasons.join(', '),
    suggestedProgramme: programmeMap[priority],
    autoAssign: score >= 50
  };
}
```

#### 4.2 Auto-Assignment Logic

```typescript
// src/lib/auto-assign.ts

interface Volunteer {
  id: string;
  skills: string[];
  location: string;
  activeAssignments: number;
  maxAssignments: number;
}

interface Programme {
  id: string;
  name: string;
  location: string;
  requiredSkills: string[];
}

export function assignVolunteer(case_location: string, requiredSkill: string, volunteers: Volunteer[]): Volunteer | null {
  // Filter: available + matching skills + nearby location
  const eligible = volunteers
    .filter(v => v.activeAssignments < v.maxAssignments)
    .filter(v => v.skills.some(s => requiredSkill.includes(s)))
    .sort((a, b) => {
      // Prefer: same location first, then fewest assignments
      const aLocal = a.location === case_location ? 0 : 1;
      const bLocal = b.location === case_location ? 0 : 1;
      if (aLocal !== bLocal) return aLocal - bLocal;
      return a.activeAssignments - b.activeAssignments;
    });
  
  return eligible[0] || null;
}
```

#### 4.3 API Endpoint untuk Auto-Triage

```typescript
// src/app/api/v1/cases/auto-triage/route.ts

export async function POST(request: Request) {
  const body = await request.json();
  
  // 1. Run triage engine
  const triageResult = triageCase(body);
  
  // 2. If auto-assign, find matching volunteer
  let assignedVolunteer = null;
  if (triageResult.autoAssign) {
    const volunteers = await db.volunteer.findMany({ where: { status: 'active' } });
    assignedVolunteer = assignVolunteer(body.location, body.requiredSkill, volunteers);
  }
  
  // 3. Update case in database
  const updatedCase = await db.case.update({
    where: { id: body.caseId },
    data: {
      priority: triageResult.priority,
      triageReason: triageResult.reason,
      suggestedProgrammeId: triageResult.suggestedProgramme,
      assignedVolunteerId: assignedVolunteer?.id,
      status: triageResult.autoAssign ? 'diproses' : 'baru',
      triagedAt: new Date(),
      triagedBy: 'ai-agent'
    }
  });
  
  // 4. If high priority, send notification
  if (triageResult.priority === 'P1' || triageResult.priority === 'P2') {
    await sendNotification({
      type: 'urgent-case',
      caseId: updatedCase.id,
      priority: triageResult.priority,
      channel: 'telegram' // notify admin via Telegram
    });
  }
  
  return Response.json({ success: true, data: { triage: triageResult, assignedVolunteer } });
}
```

### UI Changes

Tambah di modul **Kes Bantuan**:
- Badge priority (P1–P5) dengan warna: 🔴 P1, 🟠 P2, 🟡 P3, 🔵 P4, ⚪ P5
- Butang "Auto-Triage" pada setiap kes baru
- Column "Triage Reason" yang explain kenapa priority tersebut
- Toggle "Auto-Assign" di settings

### Anggaran Masa: 2 minggu

---

## 5. Cadangan 3: Predictive Analytics untuk Agihan Zakat

### Status: 🟡 MEDIUM PRIORITY

### Masalah

Dashboard PUSPA hanya menunjukkan data historical — apa yang sudah berlaku. Tiada keupayaan untuk meramal keperluan asnaf bulan depan atau mengoptimumkan agihan zakat.

### Kajian Sokongan

Berdasarkan kajian akademik:
- *"Artificial Intelligence in Zakat Management: Opportunities and Challenges"* (ResearchGate, 2026) — AI predictive model boleh transform zakat dari "short-term relief" ke "sustainable empowerment instrument"
- *"Implementation of Artificial Intelligence in Zakat Management"* (eJournal, 2025, cited 3x) — AI-based predictive model untuk enhance zakat distribution
- *"AI in enhancing zakat's role in collection and distribution"* (UII Journal, 2026) — Conceptual model untuk AI integration dalam zakat management

### Penyelesaian

Bina **Predictive Analytics Engine** yang:
1. Forecast keperluan asnaf bulan depan
2. Optimasi agihan zakat berdasarkan pattern data
3. Alert jika dana tidak mencukupi untuk bulan hadapan

### Model yang Perlu Dibina

#### 5.1 Demand Forecasting

```typescript
// src/lib/predictive/demand-forecast.ts

interface MonthlyData {
  month: string;
  totalAsnaf: number;
  newCases: number;
  totalFundsAvailable: number;
  totalDisbursed: number;
  categoryBreakdown: Record<string, number>;
}

interface ForecastResult {
  nextMonth: {
    predictedNewCases: number;
    predictedFundRequired: number;
    predictedFundShortfall: number;
    confidenceLevel: number;
  };
  trend: 'increasing' | 'stable' | 'decreasing';
  recommendations: string[];
}

export function forecastDemand(historicalData: MonthlyData[]): ForecastResult {
  // Simple moving average + seasonal adjustment
  const recentMonths = historicalData.slice(-6); // Last 6 months
  
  // Calculate averages
  const avgNewCases = recentMonths.reduce((sum, d) => sum + d.newCases, 0) / recentMonths.length;
  const avgDisbursed = recentMonths.reduce((sum, d) => sum + d.totalDisbursed, 0) / recentMonths.length;
  const avgFundsAvailable = recentMonths.reduce((sum, d) => sum + d.totalFundsAvailable, 0) / recentMonths.length;
  
  // Trend detection (simple linear regression slope)
  const x = recentMonths.map((_, i) => i);
  const y = recentMonths.map(d => d.newCases);
  const slope = linearRegressionSlope(x, y);
  const trend = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable';
  
  // Predict next month
  const predictedNewCases = Math.round(avgNewCases * (1 + slope));
  const predictedFundRequired = avgDisbursed * (predictedNewCases / avgNewCases);
  const predictedFundShortfall = predictedFundRequired - avgFundsAvailable;
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (predictedFundShortfall > 0) {
    recommendations.push(`Jangkaan kekurangan dana RM ${Math.round(predictedFundShortfall)} bulan depan — perlu tingkatkan kutipan`);
  }
  if (trend === 'increasing') {
    recommendations.push('Trend kes meningkat — pertimbangkan tambah sukarelawan');
  }
  if (predictedNewCases > avgNewCases * 1.5) {
    recommendations.push('Lonjakan kes dijangka — activate emergency protocol');
  }
  
  return {
    nextMonth: {
      predictedNewCases,
      predictedFundRequired: Math.round(predictedFundRequired),
      predictedFundShortfall: Math.round(predictedFundShortfall),
      confidenceLevel: recentMonths.length >= 6 ? 0.85 : 0.65
    },
    trend,
    recommendations
  };
}

function linearRegressionSlope(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}
```

#### 5.2 Optimasi Agihan

```typescript
// src/lib/predictive/distribution-optimizer.ts

interface AsnafCategory {
  category: string;
  currentAllocation: number;
  demandScore: number;  // 0-100
  urgencyWeight: number;
}

interface OptimizedAllocation {
  category: string;
  recommendedAllocation: number;
  change: number;
  reason: string;
}

export function optimizeDistribution(
  totalBudget: number,
  categories: AsnafCategory[]
): OptimizedAllocation[] {
  // Weighted allocation based on demand + urgency
  const totalWeight = categories.reduce((sum, c) => sum + (c.demandScore * c.urgencyWeight), 0);
  
  return categories.map(cat => {
    const weight = cat.demandScore * cat.urgencyWeight;
    const recommendedAllocation = Math.round((weight / totalWeight) * totalBudget);
    const change = recommendedAllocation - cat.currentAllocation;
    
    let reason = '';
    if (change > 0) reason = `Perlu tambah RM ${change} — demand tinggi (${cat.demandScore}/100)`;
    else if (change < 0) reason = `Boleh kurangkan RM ${Math.abs(change)} — demand sederhana`;
    else reason = 'Peruntukan mencukupi';
    
    return { category: cat.category, recommendedAllocation, change, reason };
  });
}
```

### UI Changes

Tambah di modul **Dashboard** dan **Laporan Kewangan**:
- Section "Ramalan AI" dengan forecast cards
- Chart "Projected vs Actual" 
- Alert banner jika jangkaan kekurangan dana
- Tab "Optimasi Agihan" di Laporan Kewangan

### Anggaran Masa: 3 minggu

---

## 6. Cadangan 4: Blockchain & Smart Contracts untuk Ketelusan

### Status: 🟢 LOW PRIORITY (Long-term)

### Masalah

Compliance PUSPA hanya checklist manual. Tiada traceability end-to-end dari penderma ke penerima. Penderma tak tahu sama ada sumbangan mereka sampai ke asnaf.

### Kajian Sokongan

- *"Revolutionizing Financial Inclusion: A Blockchain-AI Model for Zakat and Waqf Management"* (BDIF, 2025) — Integrasi blockchain + AI untuk modernize zakat management
- *"Empowering Zakat Management Through the Viability of the Financial Technology"* (Springer, 2025) — Blockchain potential dalam enhancing zakat management di Malaysia
- *"Zakat digitalization, supported by AI and technologies such as blockchain and smart contracts"* (ResearchGate, 2026) — Strengthen oversight mechanisms dan reporting

### Penyelesaian

Implementasi **lightweight blockchain audit trail** untuk:
1. Record setiap transaksi zakat dari kutipan ke agihan
2. Smart contract logic untuk auto-release dana
3. Public verification untuk penderma

### Arkitektur

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐
│ Penderma │───▶│   Smart      │───▶│   Audit      │───▶│  Asnaf   │
│          │    │   Contract   │    │   Trail      │    │          │
│ Donasi   │    │ (Auto-release│    │ (Blockchain) │    │ Terima   │
│ RM 500   │    │  jika syarat)│    │ (Immutable)  │    │ RM 500   │
└──────────┘    └──────────────┘    └──────────────┘    └──────────┘
```

### Komponen

#### 6.1 Audit Trail Table

```prisma
model AuditTrail {
  id          String   @id @default(cuid())
  txHash      String   @unique  // Hash unik untuk setiap transaksi
  txType      String   // donation | disbursement | transfer | refund
  fromEntity  String   // ID penderma/kutipan
  toEntity    String   // ID asnaf/program
  amount      Float
  currency    String   @default("MYR")
  fundType    String   // zakat | sadaqah | waqf | infaq
  status      String   @default("pending") // pending | confirmed | verified
  blockNumber Int?
  metadata    String?  // JSON string untuk data tambahan
  verifiedAt  DateTime?
  createdAt   DateTime @default(now())
  
  // Relations
  donation    Donation?  @relation(fields: [fromEntity], references: [id])
  disbursement Disbursement? @relation(fields: [toEntity], references: [id])
}
```

#### 6.2 Smart Contract Logic (Business Rules)

```typescript
// src/lib/blockchain/smart-contract.ts

interface ContractCondition {
  type: 'kyc_verified' | 'programme_approved' | 'fund_sufficient' | 'admin_approved';
  met: boolean;
}

interface ContractResult {
  canRelease: boolean;
  conditions: ContractCondition[];
  reason?: string;
}

export function evaluateSmartContract(
  disbursementId: string,
  conditions: ContractCondition[]
): ContractResult {
  const allMet = conditions.every(c => c.met);
  const unmetConditions = conditions.filter(c => !c.met);
  
  if (allMet) {
    return {
      canRelease: true,
      conditions,
      reason: 'Semua syarat dipenuhi — dana boleh dilepaskan'
    };
  }
  
  return {
    canRelease: false,
    conditions,
    reason: `Syarat belum dipenuhi: ${unmetConditions.map(c => c.type).join(', ')}`
  };
}
```

### Anggaran Masa: 6–8 minggu (implementasi penuh)

> **Nota:** Untuk fasa awal, cukup dengan audit trail di database + hash verification. Full blockchain deployment boleh dilakukan kemudian.

---

## 7. Cadangan 5: Smart Onboarding Bot untuk Ahli Asnaf Baru

### Status: 🟡 MEDIUM PRIORITY

### Masalah

Pendaftaran ahli asnaf baru melalui form web yang panjang dan membingungkan. Asnaf sering tak lengkapkan borang dan perlu dihubungi semula.

### Penyelesaian

AI Onboarding Bot yang menemani asnaf baru melalui proses pendaftaran secara conversational — di WhatsApp atau di web.

### Aliran Onboarding

```
Bot: "Salam! 👋 Saya Pembantu PUSPA. Saya akan bantu anda mendaftar."
Bot: "Boleh bagi nama penuh anda?"
User: "Ahmad bin Hassan"
Bot: "Terima kasih, Ahmad. No. Kad Pengenalan?"
User: "850615-10-5231"
Bot: "✅ IC disahkan. Apakah kategori asnaf anda?"
Bot: [Menu pilihan: Fakir / Miskin / Amil / Mualaf / Gharimin / Riqab / Gharim / Ibnu Sabil]
User: "Miskin"
Bot: "Berapa pendapatan bulanan anda?"
User: "RM 800"
Bot: "Berapa orang tanggungan anda?"
User: "5"
Bot: "Ada tempat tinggal?"
User: "Sewa saja"
Bot: "Baik. Saya sudah ada semua maklumat. Ini ringkasan:"
Bot: "📝 Ringkasan Pendaftaran:"
Bot: "Nama: Ahmad bin Hassan"
Bot: "IC: 850615-10-5231"  
Bot: "Kategori: Miskin"
Bot: "Pendapatan: RM 800/bulan"
Bot: "Tanggungan: 5 orang"
Bot: "Tempat tinggal: Menyew"
Bot: ""
Bot: "Sahkan? [Ya / Tidak]"
User: "Ya"
Bot: "✅ Pendaftaran berjaya! No. ahli: AS-2026-0142"
Bot: "Admin kami akan menghubungi anda dalam 24 jam."
```

### Komponen yang Perlu Dibina

#### 7.1 Onboarding Flow Engine

```typescript
// src/lib/onboarding/flow-engine.ts

interface OnboardingStep {
  id: string;
  field: string;
  question: string;
  type: 'text' | 'ic' | 'phone' | 'choice' | 'number' | 'confirm';
  options?: string[];
  validation?: (value: string) => boolean;
  errorMessage?: string;
  required: boolean;
}

const ASNAF_ONBOARDING_FLOW: OnboardingStep[] = [
  {
    id: 'greeting',
    field: '_greeting',
    question: 'Salam! 👋 Saya Pembantu PUSPA. Saya akan bantu anda mendaftar sebagai ahli asnaf. Boleh bagi nama penuh anda?',
    type: 'text',
    required: true,
    validation: (v) => v.length >= 3,
    errorMessage: 'Nama terlalu pendek. Sila masukkan nama penuh.'
  },
  {
    id: 'ic_number',
    field: 'icNumber',
    question: 'Terima kasih! No. Kad Pengenalan anda? (format: XXXXXX-XX-XXXX)',
    type: 'ic',
    required: true,
    validation: (v) => /^\d{6}-\d{2}-\d{4}$/.test(v),
    errorMessage: 'Format IC tidak betul. Contoh: 850615-10-5231'
  },
  {
    id: 'phone',
    field: 'phone',
    question: 'No. telefon anda?',
    type: 'phone',
    required: true,
    validation: (v) => /^(\+?6?01\d{8,9})$/.test(v.replace(/[\s-]/g, '')),
    errorMessage: 'Format telefon tidak betul. Contoh: 0123456789'
  },
  {
    id: 'category',
    field: 'category',
    question: 'Apakah kategori asnaf anda?',
    type: 'choice',
    options: ['Fakir', 'Miskin', 'Amil', 'Mualaf', 'Gharimin', 'Riqab', 'Gharim', 'Ibnu Sabil'],
    required: true
  },
  {
    id: 'income',
    field: 'monthlyIncome',
    question: 'Berapa pendapatan bulanan anda? (dalam RM)',
    type: 'number',
    required: true,
    validation: (v) => !isNaN(Number(v)) && Number(v) >= 0,
    errorMessage: 'Sila masukkan nombor yang sah.'
  },
  {
    id: 'dependents',
    field: 'dependents',
    question: 'Berapa orang tanggungan anda?',
    type: 'number',
    required: true,
    validation: (v) => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 20,
    errorMessage: 'Sila masukkan nombor antara 0-20.'
  },
  {
    id: 'confirm',
    field: '_confirm',
    question: '',  // Will be dynamically generated with summary
    type: 'confirm',
    required: true
  }
];
```

#### 7.2 Session Manager

```typescript
// src/lib/onboarding/session-manager.ts

interface OnboardingSession {
  id: string;
  channel: 'whatsapp' | 'telegram' | 'web';
  currentStep: number;
  data: Record<string, string>;
  createdAt: Date;
  expiresAt: Date;  // 30 min idle timeout
}

export class OnboardingSessionManager {
  private sessions = new Map<string, OnboardingSession>();
  
  createSession(channel: 'whatsapp' | 'telegram' | 'web'): OnboardingSession {
    const session: OnboardingSession = {
      id: `OB-${Date.now()}`,
      channel,
      currentStep: 0,
      data: {},
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)  // 30 min
    };
    this.sessions.set(session.id, session);
    return session;
  }
  
  processMessage(sessionId: string, message: string): {
    response: string;
    isComplete: boolean;
    data?: Record<string, string>;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) return { response: 'Sesi telah tamat. Sila mula semula.', isComplete: false };
    
    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return { response: 'Sesi tamat kerana tiada aktiviti 30 minit. Sila mula semula.', isComplete: false };
    }
    
    const flow = ASNAF_ONBOARDING_FLOW;
    const currentStep = flow[session.currentStep];
    
    // Validate input
    if (currentStep.validation && !currentStep.validation(message)) {
      return { response: currentStep.errorMessage || 'Input tidak sah. Sila cuba lagi.', isComplete: false };
    }
    
    // Save data
    if (currentStep.field !== '_greeting' && currentStep.field !== '_confirm') {
      session.data[currentStep.field] = message;
    }
    
    // Handle confirm step
    if (currentStep.type === 'confirm') {
      if (message.toLowerCase() === 'ya') {
        return { response: '✅ Pendaftaran berjaya!', isComplete: true, data: session.data };
      } else {
        // Restart
        session.currentStep = 0;
        session.data = {};
        return { response: 'Baik, mari mula semula. ' + flow[0].question, isComplete: false };
      }
    }
    
    // Move to next step
    session.currentStep++;
    const nextStep = flow[session.currentStep];
    
    // Reset expiry timer
    session.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    
    // Generate dynamic question for confirm step
    if (nextStep.type === 'confirm') {
      const summary = Object.entries(session.data)
        .map(([key, val]) => `${key}: ${val}`)
        .join('\n');
      return {
        response: `📝 Ringkasan Pendaftaran:\n${summary}\n\nSahkan? [Ya / Tidak]`,
        isComplete: false
      };
    }
    
    return { response: nextStep.question, isComplete: false };
  }
}
```

### UI Changes

- Tambah "Onboarding Bot" widget di modul **Ahli Asnaf**
- Floating chat bubble untuk onboarding di web
- Dashboard card "Onboarding Progress" — berapa orang sedang dalam proses

### Anggaran Masa: 2 minggu

---

## 8. Cadangan 6: Workflow Automation Enhancement

### Status: 🟡 MEDIUM PRIORITY

### Masalah

Ops Conductor dan modul Automasi sedia ada masih basic. Tiada auto-escalation, scheduled reminders, atau auto-generated documents.

### Penyelesaian

Enhance workflow automation dengan:
1. **Auto-Escalation Rules** — Jika kes tak diproses dalam 48 jam, auto-assign ke admin
2. **Scheduled Reminders** — Auto remind tentang program mingguan
3. **Auto-Generated Documents** — Receipt, laporan, sijil sukarelawan

### Komponen

#### 8.1 Automation Rules Engine

```typescript
// src/lib/automation/rules-engine.ts

interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    event: string;        // 'case.created' | 'case.idle' | 'donation.received' | 'schedule.daily'
    condition?: string;   // e.g., 'idleHours > 48'
  };
  actions: AutomationAction[];
  enabled: boolean;
}

interface AutomationAction {
  type: 'notify' | 'assign' | 'update_status' | 'generate_document' | 'send_message';
  config: Record<string, any>;
}

const DEFAULT_RULES: AutomationRule[] = [
  {
    id: 'auto-escalate-idle-cases',
    name: 'Auto-Escalate Kes Idle',
    trigger: { event: 'case.idle', condition: 'idleHours > 48' },
    actions: [
      { type: 'notify', config: { channel: 'telegram', target: 'admin', message: 'Kes {caseId} idle lebih 48 jam' } },
      { type: 'update_status', config: { status: 'diperlukan-perhatian' } }
    ],
    enabled: true
  },
  {
    id: 'auto-donation-receipt',
    name: 'Auto-Generate Receipt Donasi',
    trigger: { event: 'donation.received' },
    actions: [
      { type: 'generate_document', config: { template: 'receipt-donasi', format: 'pdf' } },
      { type: 'send_message', config: { channel: 'whatsapp', target: 'donor', message: 'Terima kasih! Receipt anda: {receiptUrl}' } }
    ],
    enabled: true
  },
  {
    id: 'weekly-programme-reminder',
    name: 'Peringatan Program Mingguan',
    trigger: { event: 'schedule.daily', condition: 'dayOfWeek == 5' },  // Friday
    actions: [
      { type: 'notify', config: { channel: 'whatsapp', target: 'volunteers', message: 'Program esok: {programmeName}' } }
    ],
    enabled: true
  },
  {
    id: 'auto-volunteer-certificate',
    name: 'Auto-Generate Sijil Sukarelawan',
    trigger: { event: 'volunteer.hours.completed', condition: 'totalHours >= 40' },
    actions: [
      { type: 'generate_document', config: { template: 'sijil-sukarelawan', format: 'pdf' } },
      { type: 'notify', config: { channel: 'email', target: 'volunteer', message: 'Tahniah! Sijil anda sedia: {certificateUrl}' } }
    ],
    enabled: true
  }
];
```

#### 8.2 Cron-based Scheduler

```typescript
// mini-services/automation-scheduler/index.ts

import { db } from '@/lib/db';

async function runScheduledChecks() {
  const now = new Date();
  
  // Check idle cases
  const idleThreshold = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48 hours ago
  const idleCases = await db.case.findMany({
    where: {
      status: 'baru',
      createdAt: { lt: idleThreshold }
    }
  });
  
  for (const case_ of idleCases) {
    // Execute auto-escalation rule
    await executeRule('auto-escalate-idle-cases', { caseId: case_.id });
  }
  
  // Check upcoming programmes (next 24 hours)
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const upcomingProgrammes = await db.programme.findMany({
    where: {
      startDate: { gte: now, lt: tomorrow },
      status: 'aktif'
    }
  });
  
  for (const programme of upcomingProgrammes) {
    await executeRule('weekly-programme-reminder', { programmeId: programme.id });
  }
}

// Run every hour
setInterval(runScheduledChecks, 60 * 60 * 1000);
```

### Anggaran Masa: 2–3 minggu

---

## 9. Cadangan 7: ClawHub Skills Marketplace Integration

### Status: 🟢 LOW PRIORITY

### Masalah

Modul OpenClaw (MCP, Plugins, Agents, dll.) sedia ada tetapi belum dihubungkan ke real skills ecosystem. Tiada cara untuk install/manage skills dari ClawHub.

### Penyelesaian

Integrasikan ClawHub Skills marketplace ke dalam PUSPA, membolehkan admin install skills yang relevan terus dari dashboard.

### Skills yang Relevan untuk PUSPA

| Skill | Kategori | Fungsi |
|-------|----------|--------|
| `web-search` | Information | Carian maklumat asnaf, program kerajaan |
| `document-generator` | Productivity | Generate receipt, laporan, sijil |
| `calendar` | Productivity | Schedule program, set reminders |
| `email` | Communication | Hantar email kepada penderma/sukarelawan |
| `whatsapp-business` | Communication | Integrasi WhatsApp Business API |
| `pdf-reader` | Document | Baca dokumen yang diupload |
| `translator` | Language | Terjemah dokumen ke BM/EN |
| `spreadsheet` | Data | Export/import data Excel |

### Komponen yang Perlu Dibina

#### 9.1 ClawHub Browser UI

Tambah di modul **Sambungan** (openclaw-plugins):
- Search bar untuk cari skills di ClawHub
- Category filter (Communication, Productivity, Data, etc.)
- Install/Uninstall buttons
- Skill detail view (description, author, version, permissions)
- Installed skills list dengan status aktif/tidak aktif

#### 9.2 Skill Installation API

```typescript
// src/app/api/v1/openclaw/skills/install/route.ts

export async function POST(request: Request) {
  const { skillId } = await request.json();
  
  // 1. Fetch skill metadata from ClawHub
  const skillMeta = await fetchClawHubSkill(skillId);
  
  // 2. Security vetting
  const vettingResult = vetSkillSecurity(skillMeta);
  if (!vettingResult.safe) {
    return Response.json({ error: `Skill tidak selamat: ${vettingResult.reason}` }, { status: 400 });
  }
  
  // 3. Install skill to OpenClaw config
  await installSkillToGateway(skillMeta);
  
  // 4. Record in database
  await db.openClawSkill.create({
    data: {
      skillId: skillMeta.id,
      name: skillMeta.name,
      version: skillMeta.version,
      category: skillMeta.category,
      installedAt: new Date()
    }
  });
  
  return Response.json({ success: true, skill: skillMeta });
}
```

### Anggaran Masa: 1–2 minggu

---

## 10. Cadangan 8: Persistent Agent Memory

### Status: 🟢 LOW PRIORITY

### Masalah

AI chatbot PUSPA tiada memory antara sesi. Setiap kali user buka chat, ia mula dari awal. Tak ingat siapa user, apa yang pernah ditanya, atau apa yang sudah disyorkan.

### Kajian Sokongan

Berdasarkan dokumentasi OpenClaw Memory:
- `MEMORY.md` — Long-term memory: fakta tahan lama, preferensi, keputusan. Di-load setiap awal sesi
- Session store — Konteks perbualan terkini
- Memory search — Cari dalam memori berdasarkan relevance

### Penyelesaian

Implementasi **MEMORY.md pattern** dari OpenClaw untuk PUSPA:

### Komponen

#### 10.1 Memory Store

```typescript
// src/lib/agent/memory-store.ts

interface AgentMemory {
  userId: string;
  facts: MemoryFact[];
  preferences: Record<string, string>;
  lastInteraction: Date;
  totalInteractions: number;
}

interface MemoryFact {
  id: string;
  category: 'personal' | 'case' | 'programme' | 'donation' | 'preference';
  content: string;
  source: 'user' | 'system' | 'inference';
  confidence: number;  // 0-1
  createdAt: Date;
  lastAccessed: Date;
}

export class PuspaMemoryStore {
  // Generate MEMORY.md content for agent context
  generateMemoryContext(userId: string): string {
    const memory = this.getMemory(userId);
    
    let context = `# PUSPA Agent Memory — User: ${userId}\n\n`;
    context += `## Maklumat Peribadi\n`;
    context += `- Nama: ${memory.facts.find(f => f.category === 'personal' && f.content.includes('Nama:'))?.content || 'Tidak diketahui'}\n`;
    context += `- Kategori Asnaf: ${memory.preferences.kategoriAsnaf || 'Tidak diketahui'}\n`;
    context += `- Lokasi: ${memory.preferences.lokasi || 'Tidak diketahui'}\n\n`;
    
    context += `## Sejarah Interaksi\n`;
    context += `- Jumlah interaksi: ${memory.totalInteractions}\n`;
    context += `- Terakhir aktif: ${memory.lastInteraction.toLocaleDateString('ms-MY')}\n\n`;
    
    context += `## Kes Aktif\n`;
    const activeCases = memory.facts.filter(f => f.category === 'case');
    activeCases.forEach(f => { context += `- ${f.content}\n`; });
    
    context += `\n## Program yang Diminati\n`;
    const programmes = memory.facts.filter(f => f.category === 'programme');
    programmes.forEach(f => { context += `- ${f.content}\n`; });
    
    context += `\n## Preferensi\n`;
    Object.entries(memory.preferences).forEach(([k, v]) => { context += `- ${k}: ${v}\n`; });
    
    return context;
  }
  
  // Extract facts from conversation
  extractFacts(message: string, response: string): MemoryFact[] {
    const facts: MemoryFact[] = [];
    
    // Simple pattern matching for fact extraction
    const nameMatch = message.match(/nama saya (\w+)/i);
    if (nameMatch) {
      facts.push({
        id: `fact-${Date.now()}`,
        category: 'personal',
        content: `Nama: ${nameMatch[1]}`,
        source: 'user',
        confidence: 0.95,
        createdAt: new Date(),
        lastAccessed: new Date()
      });
    }
    
    // Add more extraction patterns...
    return facts;
  }
}
```

#### 10.2 API Endpoint

```typescript
// src/app/api/v1/ai/chat/route.ts — Enhanced with memory

export async function POST(request: Request) {
  const { message, sessionId, userId } = await request.json();
  
  // 1. Load user memory context
  const memoryStore = new PuspaMemoryStore();
  const memoryContext = memoryStore.generateMemoryContext(userId);
  
  // 2. Build enhanced prompt with memory
  const systemPrompt = `Anda adalah Pembantu AI PUSPA.\n\n## Konteks Pengguna\n${memoryContext}\n\nGunakan konteks ini untuk memberi jawapan yang personalized.`;
  
  // 3. Call LLM with memory-enhanced prompt
  const response = await callLLM(systemPrompt, message);
  
  // 4. Extract and save new facts from conversation
  const newFacts = memoryStore.extractFacts(message, response);
  for (const fact of newFacts) {
    await memoryStore.saveFact(userId, fact);
  }
  
  return Response.json({ response, memoryUpdated: newFacts.length > 0 });
}
```

### UI Changes

- Di AI Chat, tambah indicator "🧠 Memory Aktif" 
- Section "Kenal Saya" yang tunjukkan apa yang AI ingat tentang user
- Butang "Lupa Saya" untuk reset memory (PDPA compliance)

### Anggaran Masa: 1–2 minggu

---

## 11. Cadangan 9: Multi-Agent Architecture

### Status: 🟢 LOW PRIORITY (Long-term)

### Masalah

PUSPA kini ada satu AI chatbot sahaja yang handle semua jenis soalan. Ia tak specialise dan tak boleh delegate tugas.

### Kajian Sokongan

Berdasarkan OpenClaw Multi-Agent Routing:
- Run multiple isolated agents — each with its own workspace, state directory, dan session history
- Agent-to-agent communication untuk deep analysis
- Each agent boleh have dedicated Telegram bot + specialized skills

### Penyelesaian

Bina **4 specialized agents** untuk PUSPA:

### Arkitektur

```
┌─────────────────────────────────────────────────────┐
│                    PUSPA GATEWAY                     │
│              (OpenClaw Multi-Agent)                   │
├─────────────┬──────────────┬────────────┬───────────┤
│  AGENT      │  AGENT       │  AGENT     │  AGENT    │
│  KEWANGAN   │  OPERASI     │  COMPLIANCE│  ASNAF    │
│             │              │            │           │
│ • Zakat     │ • Program    │ • Audit    │ • Daftar  │
│ • Donasi    │ • Aktiviti   │ • PDPA     │ • Semak   │
│ • Pembayaran│ • Sukarelawan│ • ROS      │ • Bantuan │
│ • Penderma  │ • Agihan     │ • eKYC     │ • Tanya   │
│             │              │            │           │
│ Channel:    │ Channel:     │ Channel:   │ Channel:  │
│ Telegram    │ Slack        │ Email      │ WhatsApp  │
│ (Admin)     │ (Staf)       │ (Board)    │ (Asnaf)   │
└─────────────┴──────────────┴────────────┴───────────┘
```

### Konfigurasi

```yaml
# config/agents.yml
agents:
  - name: puspa-kewangan
    role: "Pakar Kewangan PUSPA"
    model: glm-4
    channels: [telegram]
    skills: [zakat-calculator, receipt-generator, fund-tracker]
    memory: true
    system_prompt: |
      Anda adalah Agent Kewangan PUSPA. Tugas:
      1. Kira zakat dan sahkan eligibility
      2. Process donasi dan generate receipt
      3. Track fund allocation dan distribution
      4. Jawab soalan tentang pembayaran
      Jika soalan bukan kewangan, redirect ke agent yang betul.
      
  - name: puspa-operasi
    role: "Pakar Operasi PUSPA"
    model: glm-4
    channels: [slack]
    skills: [calendar, volunteer-matcher, programme-tracker]
    memory: true
    system_prompt: |
      Anda adalah Agent Operasi PUSPA. Tugas:
      1. Schedule dan manage program
      2. Assign sukarelawan ke aktiviti
      3. Track agihan bulanan
      4. Coordinate sedekah jumaat
      
  - name: puspa-compliance
    role: "Pakar Compliance PUSPA"
    model: glm-4
    channels: [email]
    skills: [audit-trail, document-generator, pdpa-checker]
    memory: true
    system_prompt: |
      Anda adalah Agent Compliance PUSPA. Tugas:
      1. Audit trail dan reporting
      2. PDPA compliance check
      3. ROS reporting
      4. eKYC verification
      
  - name: puspa-asnaf
    role: "Pembantu Asnaf PUSPA"
    model: glm-4
    channels: [whatsapp, telegram]
    skills: [onboarding, case-tracker, programme-finder]
    memory: true
    system_prompt: |
      Anda adalah Pembantu Asnaf PUSPA. Tugas:
      1. Bantu asnaf mendaftar
      2. Semak status permohonan
      3. Beri maklumat program
      4. Bantu buat permohonan bantuan
      Bahasa: Bahasa Melayu utama. Gunakan bahasa mudah faham.
```

### Agent-to-Agent Communication

```
Asnaf (WhatsApp): "Saya nak tahu status pembayaran saya"
→ Agent Asnaf: (check memory → user ada case pending)
→ Agent Asnaf → Agent Kewangan: "Check payment status for case KS-2026-0042"
→ Agent Kewangan: (query database → payment approved)
→ Agent Kewangan → Agent Asnaf: "Payment RM 500 approved, will disburse by Friday"
→ Agent Asnaf → Asnaf: "Pembayaran RM 500 anda telah diluluskan. Akan diterima menjelang Jumaat."
```

### Anggaran Masa: 4–6 minggu

---

## 12. Cadangan 10: Real-time Notifications via WhatsApp/Telegram

### Status: 🔴 HIGH PRIORITY

### Masalah

Tiada notification system real-time. Admin tak tahu ada donasi baru, staf tak tahu ada kes urgent, asnaf tak tahu status permohonan.

### Penyelesaian

Bina **Notification Service** yang menghantar real-time alerts melalui WhatsApp dan Telegram.

### Jenis Notifikasi

| Event | Channel | Penerima | Mesej |
|-------|---------|----------|-------|
| Kes baharu (P1/P2) | Telegram | Admin | 🚨 Kes urgent baru: {title} |
| Donasi diterima | WhatsApp | Admin | 💰 Donasi RM {amount} dari {donor} |
| Pembayaran diluluskan | WhatsApp | Asnaf | ✅ Pembayaran RM {amount} diluluskan |
| Program esok | WhatsApp | Sukarelawan | 📅 Reminder: Program {name} esok |
| eKYC pending | Telegram | Admin | 🪪 {count} eKYC menunggu pengesahan |
| Compliance overdue | Email | Board | ⚠️ Item compliance overdue |

### Komponen

#### 12.1 Notification Service

```typescript
// src/lib/notifications/service.ts

interface Notification {
  id: string;
  type: string;
  channel: 'whatsapp' | 'telegram' | 'email' | 'in-app';
  recipient: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt: Date;
  sentAt?: Date;
}

export class NotificationService {
  async send(notification: Omit<Notification, 'id' | 'status' | 'createdAt'>): Promise<void> {
    const record = await db.notification.create({
      data: {
        type: notification.type,
        channel: notification.channel,
        recipient: notification.recipient,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        priority: notification.priority,
        status: 'pending'
      }
    });
    
    try {
      switch (notification.channel) {
        case 'whatsapp':
          await this.sendWhatsApp(notification.recipient, notification.message);
          break;
        case 'telegram':
          await this.sendTelegram(notification.recipient, notification.message);
          break;
        case 'email':
          await this.sendEmail(notification.recipient, notification.title, notification.message);
          break;
        case 'in-app':
          // Handled by WebSocket
          break;
      }
      
      await db.notification.update({
        where: { id: record.id },
        data: { status: 'sent', sentAt: new Date() }
      });
    } catch (error) {
      await db.notification.update({
        where: { id: record.id },
        data: { status: 'failed' }
      });
    }
  }
  
  private async sendWhatsApp(phone: string, message: string) {
    // WhatsApp Business API call
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.WA_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WA_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: message }
        })
      }
    );
    return response.json();
  }
  
  private async sendTelegram(chatId: string, message: string) {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      }
    );
    return response.json();
  }
  
  private async sendEmail(to: string, subject: string, body: string) {
    // Email service integration (e.g., Resend, SendGrid)
  }
}
```

#### 12.2 Notification Triggers (di API routes)

```typescript
// Contoh: di src/app/api/v1/donations/route.ts

export async function POST(request: Request) {
  // ... process donation ...
  
  // Send notification
  await notificationService.send({
    type: 'donation.received',
    channel: 'whatsapp',
    recipient: process.env.ADMIN_PHONE!,
    title: 'Donasi Baharu',
    message: `💰 Donasi RM ${amount} (${fundType}) diterima daripada ${donorName}`,
    priority: 'medium'
  });
  
  // ... return response ...
}
```

#### 12.3 Notification Preferences UI

Tambah di **Pentadbiran** → Settings:
- Toggle notifications per event type
- Choose channels (WhatsApp/Telegram/Email/In-App)
- Set quiet hours
- Group notification settings by role

### Prasyarat

- [ ] WhatsApp Business API setup
- [ ] Telegram Bot + Chat ID
- [ ] Email service (Resend/SendGrid)
- [ ] Notification table di Prisma schema

### Anggaran Masa: 1–2 minggu

---

## 13. Matriks Prioriti & Timeline

### Priority Matrix

| # | Cadangan | Priority | Effort | Impact | Fasa |
|---|----------|----------|--------|--------|------|
| 1 | Multi-Channel Communication | 🔴 HIGH | Medium | Very High | Fasa 1 |
| 10 | Real-time Notifications | 🔴 HIGH | Low | High | Fasa 1 |
| 2 | AI Agent Automation (Triage) | 🔴 HIGH | Medium | High | Fasa 1 |
| 5 | Smart Onboarding Bot | 🟡 MEDIUM | Medium | Medium | Fasa 2 |
| 6 | Workflow Automation | 🟡 MEDIUM | Medium | High | Fasa 2 |
| 3 | Predictive Analytics | 🟡 MEDIUM | High | High | Fasa 2 |
| 7 | ClawHub Skills Integration | 🟢 LOW | Low | Medium | Fasa 3 |
| 8 | Persistent Agent Memory | 🟢 LOW | Medium | Medium | Fasa 3 |
| 9 | Multi-Agent Architecture | 🟢 LOW | High | Very High | Fasa 3 |
| 4 | Blockchain Transparency | 🟢 LOW | Very High | High | Fasa 4 |

### Timeline

```
═══════════════════════════════════════════════════════════════════
FASA 1: Foundation (Q3 2026 — Jul-Sep)          ⏱ 8-10 minggu
═══════════════════════════════════════════════════════════════════
  ▸ Cadangan 1: Multi-Channel Communication          (3 minggu)
  ▸ Cadangan 10: Real-time Notifications             (2 minggu)
  ▸ Cadangan 2: AI Agent Automation / Triage         (3 minggu)
  ▸ Integration testing + deployment                 (2 minggu)

═══════════════════════════════════════════════════════════════════
FASA 2: Intelligence (Q4 2026 — Oct-Dec)        ⏱ 8-10 minggu
═══════════════════════════════════════════════════════════════════
  ▸ Cadangan 5: Smart Onboarding Bot                 (2 minggu)
  ▸ Cadangan 6: Workflow Automation Enhancement      (3 minggu)
  ▸ Cadangan 3: Predictive Analytics                 (3 minggu)
  ▸ User testing + iteration                         (2 minggu)

═══════════════════════════════════════════════════════════════════
FASA 3: Ecosystem (Q1 2027 — Jan-Mar)           ⏱ 8-10 minggu
═══════════════════════════════════════════════════════════════════
  ▸ Cadangan 7: ClawHub Skills Integration           (2 minggu)
  ▸ Cadangan 8: Persistent Agent Memory              (2 minggu)
  ▸ Cadangan 9: Multi-Agent Architecture             (6 minggu)
  ▸ Load testing + security audit                    (2 minggu)

═══════════════════════════════════════════════════════════════════
FASA 4: Trust (Q2 2027 — Apr-Jun)               ⏱ 8 minggu
═══════════════════════════════════════════════════════════════════
  ▸ Cadangan 4: Blockchain & Smart Contracts         (8 minggu)
  ▸ Public verification portal
  ▸ Third-party security audit
```

### Milestone Targets

| Milestone | Target | KPI |
|-----------|--------|-----|
| v2.2.0 | Fasa 1 Complete | Asnaf boleh WhatsApp PUSPA, auto-triage aktif |
| v2.5.0 | Fasa 2 Complete | Onboarding bot aktif, predictive analytics di dashboard |
| v3.0.0 | Fasa 3 Complete | Multi-agent aktif, ClawHub skills terinstall, memory persisten |
| v3.5.0 | Fasa 4 Complete | Blockchain audit trail, public verification |

---

## 14. Arkitektur Target (v3.0)

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUSPA v3.0                                │
│                   AI-Native Autonomous Platform                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    CHANNELS LAYER                        │    │
│  │  WhatsApp │ Telegram │ Discord │ Web │ Email │ Slack    │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                      │
│  ┌────────────────────────▼────────────────────────────────┐    │
│  │                  OPENCLAW GATEWAY                        │    │
│  │         (Port 3010 — Mini Service)                       │    │
│  │                                                          │    │
│  │  ┌──────────┬──────────┬───────────┬──────────┐         │    │
│  │  │  Agent   │  Agent   │  Agent    │  Agent   │         │    │
│  │  │Kewangan  │ Operasi  │Compliance │  Asnaf   │         │    │
│  │  │          │          │           │          │         │    │
│  │  │ • Zakat  │ • Program│ • Audit   │ • Daftar │         │    │
│  │  │ • Donasi │ • Agihan │ • PDPA    │ • Semak  │         │    │
│  │  │ • Bayar  │ • Aktiviti│ • eKYC  │ • Bantuan│         │    │
│  │  └────┬─────┴────┬─────┴─────┬────┴────┬─────┘         │    │
│  │       │          │           │         │                 │    │
│  │  ┌────▼──────────▼───────────▼─────────▼─────┐         │    │
│  │  │           SHARED MEMORY LAYER              │         │    │
│  │  │  MEMORY.md │ Session Store │ Vector DB    │         │    │
│  │  └────────────────────┬──────────────────────┘         │    │
│  └───────────────────────┼────────────────────────────────┘    │
│                          │                                       │
│  ┌───────────────────────▼────────────────────────────────┐    │
│  │                  PUSPA API LAYER                        │    │
│  │            (Next.js App Router — Port 3000)             │    │
│  │                                                          │    │
│  │  ┌──────────┬──────────┬───────────┬──────────┐         │    │
│  │  │ Members  │  Cases   │ Donations │Programme │         │    │
│  │  │ API      │  API     │ API       │   API    │         │    │
│  │  ├──────────┼──────────┼───────────┼──────────┤         │    │
│  │  │ Dashboard│ Reports  │ Compliance│   AI     │         │    │
│  │  │ API      │  API     │   API     │   API    │         │    │
│  │  ├──────────┼──────────┼───────────┼──────────┤         │    │
│  │  │Predictive│ Triage   │Automation │Notif.    │         │    │
│  │  │Analytics │ Engine   │ Rules     │Service   │         │    │
│  │  └──────────┴──────────┴───────────┴──────────┘         │    │
│  └───────────────────────┬────────────────────────────────┘    │
│                          │                                       │
│  ┌───────────────────────▼────────────────────────────────┐    │
│  │                  DATA LAYER                             │    │
│  │                                                          │    │
│  │  ┌──────────┬──────────┬───────────┐                    │    │
│  │  │ Prisma   │ Audit    │ Predictive│                    │    │
│  │  │ (SQLite) │ Trail    │ Models   │                    │    │
│  │  └──────────┴──────────┴───────────┘                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              AUTOMATION SCHEDULER                        │    │
│  │         (Mini Service — Port 3020)                       │    │
│  │  • Auto-triage (setiap 1 jam)                           │    │
│  │  • Auto-escalation (idle > 48 jam)                      │    │
│  │  • Programme reminders (harian)                          │    │
│  │  • Report generation (bulanan)                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 15. Sumber Rujukan

### OpenClaw
- [OpenClaw Official Site](https://openclaw.ai)
- [OpenClaw Documentation](https://docs.openclaw.ai)
- [OpenClaw GitHub Repository](https://github.com/openclaw/openclaw)
- [ClawHub Skills Marketplace](https://clawskills.sh)
- [Awesome OpenClaw Skills](https://github.com/VoltAgent/awesome-openclaw-skills)
- [OpenClaw Architecture — Simply Explained (Medium)](https://medium.com/@nimritakoul01/openclaw-architecture-simply-explained-fca2e9f15f27)
- [OpenClaw Security: Architecture and Hardening Guide (Nebius)](https://nebius.com/blog/posts/openclaw-security)
- [OpenClaw Tutorial 2026 (Meta-Intelligence)](https://www.meta-intelligence.tech/en/insight-openclaw-tutorial)
- [Z.AI Developer Document — OpenClaw](https://docs.z.ai/devpack/tool/openclaw)

### AI & Zakat Management
- *"Artificial Intelligence in Zakat Management: Opportunities and Challenges"* — ResearchGate, 2026
- *"Implementation of Artificial Intelligence in Zakat Management"* — eJournal, 2025 (Cited 3x)
- *"AI in enhancing zakat's role in collection and distribution"* — UII Journal, 2026
- *"The Role of AI in Accountability and Fair Distribution"* — IJAZ BAZNAS, 2026
- *"Empowering Asnaf through Zakat and Digital Transformation"* — RSIS International, 2025
- *"Revolutionizing Financial Inclusion: A Blockchain-AI Model for Zakat and Waqf Management"* — BDIF, 2025
- *"Empowering Zakat Management Through the Viability of the Financial Technology"* — Springer, 2025

### SaaS & AI Trends 2026
- *"25 AI SaaS Ideas for 2026 (Backed by Real Data)"* — BigIdeasDB
- *"AI SaaS Startup Ideas 2026: 10 High-Growth Opportunities"* — WeArePresta
- *"SaaS Application Development 2026: AI Trends & Best Practices"* — Spaculus
- *"AI and the SaaS industry in 2026"* — BetterCloud
- *"Top 8 AI Trends & Tools Powering SaaS Teams in 2026"* — DevLabs AngelHack

---

> **Dokumen ini disediakan oleh Z.ai Code**  
> **Tarikh:** April 2026  
> **Versi:** 1.0  
> **Untuk:** PUSPA — Pertubuhan Urus Peduli Asnaf KL & Selangor
