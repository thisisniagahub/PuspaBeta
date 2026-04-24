'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  GraduationCap, Rocket, Target, Users, Award, Building2,
  Calculator, TrendingUp, Settings, Calendar, RefreshCw,
  Mail, Link2, Sparkles, Globe, Briefcase,
  DollarSign, Heart, Star, Trophy, Clock, BookOpen,
  Monitor, Wifi, Coffee, ChevronRight,
  CheckCircle2, ArrowUpRight, Lightbulb, UserCheck,
  LayoutGrid, Smartphone, BarChart3
} from 'lucide-react'
import SplitText from '@/components/reactbits/SplitText'
import AnimatedContent from '@/components/reactbits/AnimatedContent'

// ═══════════════════════════════════════════════════════════════════════════════
// Data Constants
// ═══════════════════════════════════════════════════════════════════════════════

const CURRICULUM_PHASES = [
  {
    id: 'fasa1',
    title: 'Fasa 1: Asas Digital',
    subtitle: 'Minggu 1–4',
    icon: BookOpen,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800/50',
    weeks: [
      { week: 1, topic: 'Intro to AI & Internet', desc: 'Apa itu AI, browser, Google, email, ChatGPT', output: 'Setiap pelajar ada email & ChatGPT account' },
      { week: 2, topic: 'Prompt Engineering', desc: 'Cara "bercakap" dengan AI, tulis arahan yang berkesan', output: '20 prompt templates untuk kerja harian' },
      { week: 3, topic: 'Asas Web', desc: 'HTML/CSS basics through AI (bukan hafal, tapi faham konsep)', output: 'Satu halaman web peribadi' },
      { week: 4, topic: 'Tools Setup', desc: 'GitHub account, Cursor AI editor, Vercel account, Claude', output: 'Environment ready untuk Fasa 2' },
    ],
  },
  {
    id: 'fasa2',
    title: 'Fasa 2: Vibe Coding',
    subtitle: 'Minggu 5–8',
    icon: Rocket,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-200 dark:border-orange-800/50',
    weeks: [
      { week: 5, topic: 'First App with AI', desc: 'Buat landing page bisnes guna Cursor + Claude', output: 'Landing page hidup di Vercel' },
      { week: 6, topic: 'Dynamic Apps', desc: 'Forms, data collection, simple dashboard', output: 'App pengumpulan data' },
      { week: 7, topic: 'Full-Stack Basics', desc: 'Database, API, user input → guna AI 100%', output: 'Mini web app (kedai online / portfolio)' },
      { week: 8, topic: 'Deployment & Domain', desc: 'Go live, custom domain, share ke dunia', output: 'Projek live di internet' },
    ],
  },
  {
    id: 'fasa3',
    title: 'Fasa 3: Projek Kapten + Kerjaya',
    subtitle: 'Minggu 9–12',
    icon: Trophy,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    weeks: [
      { week: 9, topic: 'Capstone Project (Pt 1)', desc: 'Bina projek sebenar: website kedai, app NGO, portfolio, tool komuniti', output: 'Projek capstone 80% siap' },
      { week: 10, topic: 'Capstone Project (Pt 2)', desc: 'Refine, test, polish projek capstone', output: 'Projek capstone 100% siap' },
      { week: 11, topic: 'Portfolio & Freelance', desc: 'Setup Fiverr/Upwork, tulis proposal, pricing strategy', output: 'Profil freelance aktif' },
      { week: 12, topic: 'Demo Day + Graduation', desc: 'Present projek ke sponsor & media, sijil, networking', output: 'Graduation event 🎓' },
    ],
  },
]

const SPONSOR_TIERS = [
  {
    name: 'PLATINUM',
    amount: 'RM 50,000',
    icon: Trophy,
    color: 'text-primary',
    bg: 'bg-primary/5 dark:bg-primary/10',
    border: 'border-primary/30 dark:border-primary/50',
    benefits: [
      'Logo utama di semua material (banner, sijil, baju, website)',
      'Naming rights: "Program AI PUSPA x [Syarikat]"',
      '5 tempat untuk pekerja syarikat sebagai mentor',
      'Laporan impak eksklusif dengan data & video testimoni',
      'Peluang rekrut graduan program (first pick)',
      'Feature di media social PUSPA (100K+ reach)',
      'Booth di Demo Day',
      'CSR tax deduction receipt (LHDN s44(6))',
    ],
  },
  {
    name: 'GOLD',
    amount: 'RM 25,000',
    icon: Star,
    color: 'text-amber-700',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-300 dark:border-amber-700',
    benefits: [
      'Logo di banner & sijil',
      '3 tempat mentor',
      'Laporan impak',
      'Feature di media social',
      'CSR tax receipt',
    ],
  },
  {
    name: 'SILVER',
    amount: 'RM 10,000',
    icon: Award,
    color: 'text-slate-600',
    bg: 'bg-slate-50 dark:bg-slate-950/30',
    border: 'border-slate-300 dark:border-slate-600',
    benefits: [
      'Logo di sijil & website',
      '1 tempat mentor',
      'Ringkasan impak',
      'CSR tax receipt',
    ],
  },
  {
    name: 'COMMUNITY',
    amount: 'RM 5,000 / Barangan',
    icon: Heart,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-300 dark:border-emerald-700',
    benefits: [
      'Logo di website',
      'Thank you di social media',
      'Boleh sumbang: laptop terpakai, WiFi dongle, meja/kerusi, makanan',
      'CSR tax receipt',
    ],
  },
]

const POTENTIAL_SPONSORS = [
  { name: 'Google Malaysia', reason: 'Google.org grants, digital skills initiative, Gemini API credits', package: 'Platinum + API credits', approach: 'Apply Google.org Impact Challenge SEA' },
  { name: 'TM (Telekom Malaysia)', reason: '#TMCSR digital inclusion, broadband coverage asnaf', package: 'Gold + WiFi sponsorship', approach: 'Hubungi TM Foundation' },
  { name: 'Maxis', reason: 'eKelas program, digital literacy CSR', package: 'Gold', approach: 'Maxis Foundation CSR' },
  { name: 'MDEC', reason: 'Digital economy mandate, #MyDigitalWorkforce', package: 'Gold + program endorsement', approach: 'Government agency — surat rasmi' },
  { name: 'Khazanah Nasional', reason: 'Yayasan Hasanah social enterprise fund', package: 'Platinum', approach: 'Apply Hasanah Social Enterprise grant' },
  { name: 'PETRONAS', reason: 'Yayasan PETRONAS education & community', package: 'Gold', approach: 'YP Education Grant application' },
  { name: 'Axiata Foundation', reason: 'Digital inclusion across ASEAN', package: 'Silver/Gold', approach: 'Foundation grant application' },
  { name: 'Bank Islam', reason: 'Islamic finance CSR, asnaf empowerment', package: 'Silver + financial literacy module', approach: 'CSR department direct' },
  { name: 'CIMB Foundation', reason: 'Community Link CSR, youth employability', package: 'Gold', approach: 'CIMB Foundation proposal' },
  { name: 'Shopee Malaysia', reason: 'Tech CSR, e-commerce tie-in', package: 'Silver + e-commerce module', approach: 'Shopee MY CSR team' },
  { name: 'AWS (Amazon)', reason: 'AWS re/Start program, cloud credits', package: 'Silver + cloud hosting credits', approach: 'AWS ASEAN social impact team' },
  { name: 'Cursor / Anthropic', reason: 'Brand building in SEA, API credits', package: 'Community + tool licenses', approach: 'Developer relations team' },
]

const BUDGET_ITEMS = [
  { category: 'A. Peralatan', items: [
    { name: 'Laptop terpakai (refurbished)', unit: 'RM 800', qty: 30, total: 24000 },
    { name: 'Mouse + mousepad', unit: 'RM 30', qty: 30, total: 900 },
    { name: 'USB drive 32GB', unit: 'RM 20', qty: 30, total: 600 },
    { name: 'WiFi / Internet (3 bulan)', unit: 'RM 200', qty: 1, total: 600 },
  ], subtotal: 26100 },
  { category: 'B. Venue & Logistik', items: [
    { name: 'Sewa venue (jika tak ada)', unit: 'RM 1,500/bln', qty: 3, total: 4500 },
    { name: 'Meja + kerusi', unit: 'RM 50', qty: 30, total: 1500 },
    { name: 'Projector + whiteboard', unit: 'RM 500', qty: 1, total: 500 },
    { name: 'Extension cord + surge protector', unit: 'RM 80', qty: 5, total: 400 },
  ], subtotal: 6900 },
  { category: 'C. Makan & Minum', items: [
    { name: 'Makan tengahari / minum petang', unit: 'RM 10/pax/sesi', qty: 1260, total: 12600 },
  ], subtotal: 12600 },
  { category: 'D. Tenaga Pengajar', items: [
    { name: 'Lead Instructor (3 bulan)', unit: 'RM 4,000/bln', qty: 3, total: 12000 },
    { name: 'Assistant Instructor (2 orang)', unit: 'RM 2,000/bln', qty: 6, total: 12000 },
    { name: 'Guest speakers (4 sesi)', unit: 'RM 500/sesi', qty: 4, total: 2000 },
  ], subtotal: 26000 },
  { category: 'E. Bahan & Perisian', items: [
    { name: 'Cursor Pro license (3 bulan)', unit: 'RM 80/bln', qty: 90, total: 7200 },
    { name: 'Domain .my untuk pelajar', unit: 'RM 40', qty: 30, total: 1200 },
    { name: 'Baju program + beg', unit: 'RM 45', qty: 35, total: 1575 },
    { name: 'Sijil + bingkai', unit: 'RM 25', qty: 30, total: 750 },
    { name: 'Modul bercetak', unit: 'RM 30', qty: 30, total: 900 },
  ], subtotal: 11625 },
  { category: 'F. Marketing & Event', items: [
    { name: 'Demo Day event', unit: '—', qty: 1, total: 3000 },
    { name: 'Video dokumentari produksi', unit: '—', qty: 1, total: 2500 },
    { name: 'Social media marketing', unit: '—', qty: 3, total: 1500 },
  ], subtotal: 7000 },
]

const IMPACT_KPIS = {
  output: [
    { kpi: 'Kadar kehadiran', target: '≥ 80%' },
    { kpi: 'Kadar tamat program', target: '≥ 75% (22/30 pelajar)' },
    { kpi: 'Projek capstone siap', target: '100% yang tamat' },
    { kpi: 'Portfolio GitHub aktif', target: '100% graduan' },
    { kpi: 'Profil freelance aktif', target: '≥ 60% graduan' },
  ],
  outcome: [
    { kpi: 'Dapat kerja / freelance aktif', target: '≥ 40% graduan' },
    { kpi: 'Peningkatan pendapatan', target: '≥ RM 500/bulan tambahan' },
    { kpi: 'Terus guna AI tools', target: '≥ 70%' },
    { kpi: 'Ajar orang lain (multiplier)', target: '≥ 20%' },
  ],
  impact: [
    { kpi: 'Keluar dari status asnaf', target: '≥ 15% graduan' },
    { kpi: 'Pendapatan bulanan ≥ RM 2,000', target: '≥ 25% graduan' },
    { kpi: 'Buka bisnes digital sendiri', target: '≥ 10% graduan' },
  ],
}

const SCHEDULE_INFO = {
  sessionsPerWeek: 3,
  days: 'Selasa, Khamis, Sabtu',
  hoursPerSession: 3,
  timeSlots: '2pm–5pm atau 10am–1pm',
  totalSessions: 36,
  totalHours: 108,
  format: { handsOn: 60, guided: 30, theory: 10 },
}

const TEAM_ROLES = [
  { role: 'Program Director', count: 1, commitment: 'Full-time (3 bulan)' },
  { role: 'Lead Instructor', count: 1, commitment: '3 sesi/minggu' },
  { role: 'Assistant Instructor', count: 2, commitment: '3 sesi/minggu' },
  { role: 'Program Coordinator', count: 1, commitment: 'Admin, attendance, logistics' },
  { role: 'Mentor (industri)', count: '4–6', commitment: '2 jam/minggu (remote OK)' },
  { role: 'Video/Content Creator', count: 1, commitment: 'Part-time' },
]

const VENUE_OPTIONS = [
  { name: 'Pejabat PUSPA', cost: 'Percuma', note: 'Jika ada ruang' },
  { name: 'Dewan masjid', cost: 'Percuma / Nominal', note: 'Perlu booking' },
  { name: 'Pusat komuniti PPR', cost: 'Percuma', note: 'Perlu kebenaran JPN' },
  { name: 'Co-working space', cost: 'RM 1,000–2,000/bln', note: 'Partnership' },
  { name: 'Universiti tempatan', cost: 'MOU diperlukan', note: 'Lab komputer' },
]

const SCALE_PLAN = [
  { year: 'Year 1', batches: 2, graduates: 60, location: 'KL/Selangor' },
  { year: 'Year 2', batches: 4, graduates: 120, location: '+ Perak, Johor' },
  { year: 'Year 3', batches: 8, graduates: 240, location: '+ Online hybrid model' },
  { year: 'Year 5', batches: 20, graduates: '1,000+', location: 'National program' },
]

const PUSPACARE_MODULES = [
  { module: 'Programme', icon: Heart, desc: 'Daftar sebagai programme baru "Kelas AI & Vibe Coding Batch 1"' },
  { module: 'Members', icon: Users, desc: 'Track peserta (asnaf yang terpilih)' },
  { module: 'Volunteers', icon: UserCheck, desc: 'Track mentor & instructor sebagai sukarelawan' },
  { module: 'Donations', icon: DollarSign, desc: 'Track sponsorship masuk sebagai sumbangan' },
  { module: 'Disbursements', icon: Calculator, desc: 'Track perbelanjaan program' },
  { module: 'Activities', icon: Calendar, desc: 'Jadual kelas sebagai aktiviti kanban' },
  { module: 'Compliance', icon: Target, desc: 'Track semua KPI dalam compliance module' },
  { module: 'Gudang Barangan', icon: Monitor, desc: 'Laptop terpakai dari gudang boleh diagihkan ke pelajar' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Helper
// ═══════════════════════════════════════════════════════════════════════════════

function formatRM(amount: number): string {
  return `RM ${amount.toLocaleString('en-MY')}`
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string; color: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BeforeAfterCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        {
          title: 'Sebelum Program',
          icon: '❌',
          items: ['Pendapatan rendah / tiada kemahiran digital', 'Bergantung pada bantuan kebajikan', 'Tiada portfolio / CV digital', 'Terasing dari ekonomi digital'],
          color: 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20',
        },
        {
          title: 'Selepas Program',
          icon: '✅',
          items: ['Boleh buat freelance web dev (RM1,500–5,000/bulan)', 'Menjana pendapatan sendiri secara bermaruah', 'Portfolio GitHub + deployed projects', 'Connected ke gig economy global'],
          color: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20',
        },
      ].map((col) => (
        <Card key={col.title} className={`${col.color} border`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span>{col.icon}</span> {col.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {col.items.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab Content Components
// ═══════════════════════════════════════════════════════════════════════════════

function VisiTab() {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <Card className="overflow-hidden border-2 border-primary/20 dark:border-primary/30">
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">PUSPA x AI</h2>
              <p className="text-white/70 text-sm">Program Kelas AI & Vibe Coding Untuk Asnaf</p>
            </div>
          </div>
          <blockquote className="mt-4 border-l-4 border-white/40 pl-4 italic text-white/80">
            &ldquo;Dari Asnaf ke Digital Entrepreneur — Dikuasakan AI&rdquo;
          </blockquote>
          <p className="mt-2 text-white/70 text-sm italic">
            Code Your Way Out — AI-Powered Upskilling for the Underserved
          </p>
        </div>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            <strong>Misi:</strong> Memberi kemahiran teknologi AI kepada golongan asnaf supaya mereka boleh menjana pendapatan sendiri melalui pembangunan aplikasi web menggunakan AI — <Badge variant="secondary" className="ml-1">PERCUMA & DITAJA SEPENUHNYA</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Kenapa Vibe Coding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Kenapa AI & Vibe Coding?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <strong>Vibe Coding</strong> = guna AI tools (Cursor, Claude, Gemini) untuk buat aplikasi web <strong>tanpa perlu jadi programmer pakar</strong>. Trend global 2025–2026 yang mengubah landscape tech:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-3">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">❌ Dulu</p>
              <p className="text-xs text-muted-foreground mt-1">Perlu 4 tahun belajar CS → baru boleh buat app</p>
            </div>
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">✅ Sekarang</p>
              <p className="text-xs text-muted-foreground mt-1"><strong>2–3 bulan latihan</strong> + AI tools → dah boleh buat landing page, web app, dashboard</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Impak Untuk Asnaf
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BeforeAfterCard />
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Clock} label="Tempoh" value="12 Minggu" sub="108 jam" color="bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400" />
        <StatCard icon={Users} label="Peserta" value="30 Orang" sub="Per batch" color="bg-primary/10 dark:bg-primary/10 text-primary" />
        <StatCard icon={GraduationCap} label="Graduan Target" value="≥75%" sub="22/30 pelajar" color="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" />
        <StatCard icon={DollarSign} label="Bajet" value="≈RM 100K" sub="Per batch" color="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400" />
      </div>
    </div>
  )
}

function KurikulumTab() {
  return (
    <div className="space-y-6">
      {/* Schedule Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-blue-500" />
            Jadual Kelas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold">{SCHEDULE_INFO.sessionsPerWeek}</p>
              <p className="text-xs text-muted-foreground">Sesi/Minggu</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold">{SCHEDULE_INFO.hoursPerSession}j</p>
              <p className="text-xs text-muted-foreground">Jam/Sesi</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold">{SCHEDULE_INFO.totalSessions}</p>
              <p className="text-xs text-muted-foreground">Total Sesi</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold">{SCHEDULE_INFO.totalHours}j</p>
              <p className="text-xs text-muted-foreground">Total Jam</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{SCHEDULE_INFO.days}</Badge>
            <Badge variant="outline">{SCHEDULE_INFO.timeSlots}</Badge>
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium mb-2">Format Pembelajaran</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Hands-on</span>
                  <span className="font-medium">60%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Guided</span>
                  <span className="font-medium">30%</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Teori</span>
                  <span className="font-medium">10%</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Curriculum Phases */}
      {CURRICULUM_PHASES.map((phase) => {
        const PhaseIcon = phase.icon
        return (
          <Card key={phase.id} className={`${phase.border} border`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${phase.bg}`}>
                  <PhaseIcon className={`h-5 w-5 ${phase.color}`} />
                </div>
                <div>
                  <CardTitle className="text-base">{phase.title}</CardTitle>
                  <CardDescription>{phase.subtitle}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {phase.weeks.map((week) => (
                  <div key={week.week} className={`rounded-lg ${phase.bg} p-3`}>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="shrink-0 mt-0.5 text-xs">
                        Mg {week.week}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{week.topic}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{week.desc}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{week.output}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function PesertaTab() {
  return (
    <div className="space-y-6">
      {/* Profil Ideal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-primary" />
            Profil Peserta Ideal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Umur', value: '17–45 tahun', icon: Users },
              { label: 'Status', value: 'Asnaf berdaftar PUSPA / anak asnaf / pasangan asnaf', icon: Heart },
              { label: 'Pendidikan', value: 'Minimum SPM (fleksibel jika bermotivasi tinggi)', icon: GraduationCap },
              { label: 'Kemahiran', value: 'Boleh guna smartphone — itu sahaja!', icon: Smartphone },
              { label: 'Komitmen', value: 'Hadir minimum 80% kelas', icon: Clock },
              { label: 'Motivasi', value: 'Mahu belajar kemahiran baru untuk menjana pendapatan', icon: Sparkles },
            ].map((item) => {
              const ItemIcon = item.icon
              return (
                <div key={item.label} className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ItemIcon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                  </div>
                  <p className="text-sm">{item.value}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Saiz Kelas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={Users} label="Saiz Kelas" value="20–30" sub="Per batch" color="bg-primary/10 dark:bg-primary/10 text-primary" />
        <StatCard icon={RefreshCw} label="Batch/Tahun" value="2" sub="Mac-Jun & Sep-Dis" color="bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400" />
        <StatCard icon={UserCheck} label="Mentor Ratio" value="1:5" sub="1 mentor : 5 pelajar" color="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" />
      </div>

      {/* Proses Pemilihan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <LayoutGrid className="h-5 w-5 text-blue-500" />
            Proses Pemilihan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { step: 1, title: 'Borang Permohonan', desc: 'Online via PuspaCare app' },
              { step: 2, title: 'Temuduga Ringkas', desc: 'Motivasi, bukan teknikal' },
              { step: 3, title: 'Keutamaan', desc: 'Single parents, belia menganggur, OKU ringan, ketua keluarga' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/10 text-xs font-bold text-primary">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TajaanTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-5 w-5 text-amber-500" />
            4 Tier Penajaan
          </CardTitle>
          <CardDescription>Pilih pakej penajaan yang sesuai untuk syarikat anda</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SPONSOR_TIERS.map((tier) => {
          const TierIcon = tier.icon
          return (
            <Card key={tier.name} className={`${tier.border} border-2`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tier.bg}`}>
                      <TierIcon className={`h-4 w-4 ${tier.color}`} />
                    </div>
                    <CardTitle className="text-base">{tier.name}</CardTitle>
                  </div>
                  <Badge className={`${tier.bg} ${tier.color} border-0 font-bold`}>
                    {tier.amount}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {tier.benefits.map((b, i) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <CheckCircle2 className={`h-3.5 w-3.5 ${tier.color} shrink-0 mt-0.5`} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function PenajaTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-blue-500" />
            Senarai Potensi Penaja
          </CardTitle>
          <CardDescription>12 syarikat & organisasi yang sesuai untuk penajaan program</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        {POTENTIAL_SPONSORS.map((s, i) => (
          <Card key={s.name} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/10 text-sm font-bold text-primary">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold">{s.name}</p>
                    <Badge variant="outline" className="text-[10px]">{s.package}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.reason}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-blue-600 dark:text-blue-400">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>{s.approach}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategi Pendekatan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Rocket className="h-5 w-5 text-orange-500" />
            Strategi Pendekatan Penaja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                fasa: 'FASA 1 (Minggu 1–2): Sediakan Bahan',
                items: ['One-pager ringkasan program (BM + EN)', 'Proposal lengkap 10 halaman', 'Video pitch 3 minit (founder story + asnaf testimony)', 'Impact projection deck (10 slides)'],
                color: 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20',
              },
              {
                fasa: 'FASA 2 (Minggu 3–4): Outreach',
                items: ['Hantar email rasmi ke CSR department', 'Follow up WhatsApp / LinkedIn', 'Attend CSR networking events', 'Leverage PUSPA board member connections'],
                color: 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20',
              },
              {
                fasa: 'FASA 3 (Minggu 5–8): Closing',
                items: ['Meeting/pitch session dengan interested sponsors', 'Customize proposal per sponsor', 'Negotiate pakej & deliverables', 'Sign MOU / sponsorship agreement'],
                color: 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20',
              },
            ].map((f) => (
              <div key={f.fasa} className={`rounded-lg border p-3 ${f.color}`}>
                <p className="text-sm font-semibold mb-2">{f.fasa}</p>
                <ul className="space-y-1">
                  {f.items.map((item, i) => (
                    <li key={i} className="text-xs flex items-start gap-2 text-muted-foreground">
                      <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BajetTab() {
  const grandTotal = BUDGET_ITEMS.reduce((sum, cat) => sum + cat.subtotal, 0)
  const contingency = Math.round(grandTotal * 0.1)
  const totalKeseluruhan = grandTotal + contingency

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={Calculator} label="Jumlah Bajet" value={formatRM(grandTotal)} sub="Sebelum contingency" color="bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400" />
        <StatCard icon={DollarSign} label="Contingency 10%" value={formatRM(contingency)} sub="Buffer" color="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400" />
        <StatCard icon={TrendingUp} label="Total Keseluruhan" value={formatRM(totalKeseluruhan)} sub="≈ RM 100,000" color="bg-primary/10 dark:bg-primary/10 text-primary" />
      </div>

      {/* Budget Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-5 w-5 text-blue-500" />
            Bajet Terperinci — Per Batch (30 Pelajar)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {BUDGET_ITEMS.map((cat) => (
              <div key={cat.category} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold">{cat.category}</p>
                  <Badge variant="secondary" className="font-bold">{formatRM(cat.subtotal)}</Badge>
                </div>
                <div className="space-y-2">
                  {cat.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-muted-foreground">{item.unit}</span>
                        <span className="text-muted-foreground">×{item.qty}</span>
                        <span className="font-medium w-20 text-right">{formatRM(item.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <Separator className="my-4" />
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Grand Total</span>
              <span className="font-bold">{formatRM(grandTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Contingency 10%</span>
              <span className="font-medium text-amber-600">{formatRM(contingency)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base">
              <span className="font-bold">Total Keseluruhan</span>
              <span className="font-bold text-primary">{formatRM(totalKeseluruhan)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cara Jimat */}
      <Card className="border-emerald-200 dark:border-emerald-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-emerald-500" />
            Cara Kos Boleh Dikurangkan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { item: 'Laptop sumbangan (dari Gudang Barangan PUSPA)', save: 'RM 24,000' },
              { item: 'Venue masjid / dewan komuniti percuma', save: 'RM 4,500' },
              { item: 'Cursor free tier + Claude free', save: 'RM 7,200' },
              { item: 'Volunteer instructors', save: 'RM 12,000' },
            ].map((s) => (
              <div key={s.item} className="flex items-center justify-between rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5">
                <span className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  {s.item}
                </span>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-0 font-bold">
                  Jimat {s.save}
                </Badge>
              </div>
            ))}
            <div className="mt-3 rounded-lg border-2 border-dashed border-emerald-300 dark:border-emerald-700 p-3 text-center">
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                Minimum Viable Budget: RM 35,000–45,000
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ImpakTab() {
  return (
    <div className="space-y-6">
      {/* Output Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Output Metrics
          </CardTitle>
          <CardDescription>Semasa program berjalan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {IMPACT_KPIS.output.map((kpi) => (
              <div key={kpi.kpi} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{kpi.kpi}</span>
                <Badge variant="secondary" className="font-bold">{kpi.target}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Outcome Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            Outcome Metrics
          </CardTitle>
          <CardDescription>6 bulan selepas program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {IMPACT_KPIS.outcome.map((kpi) => (
              <div key={kpi.kpi} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{kpi.kpi}</span>
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-0 font-bold">{kpi.target}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-5 w-5 text-emerald-500" />
            Impact Metrics
          </CardTitle>
          <CardDescription>12 bulan selepas program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {IMPACT_KPIS.impact.map((kpi) => (
              <div key={kpi.kpi} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{kpi.kpi}</span>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-0 font-bold">{kpi.target}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LogistikTab() {
  return (
    <div className="space-y-6">
      {/* Venue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-primary" />
            Venue Cadangan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {VENUE_OPTIONS.map((v) => (
              <div key={v.name} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.note}</p>
                </div>
                <Badge variant="outline" className={v.cost.includes('Percuma') ? 'text-emerald-600 border-emerald-300' : ''}>
                  {v.cost}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Peralatan Per Pelajar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="h-5 w-5 text-blue-500" />
            Peralatan Per Pelajar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { item: '1× Laptop (min: 8GB RAM)', icon: Monitor },
              { item: '1× Mouse', icon: Settings },
              { item: 'Internet access (WiFi)', icon: Wifi },
              { item: 'Notebook + pen', icon: BookOpen },
              { item: 'Beg program + baju', icon: Briefcase },
              { item: 'Headphone (tutorial video)', icon: Coffee },
            ].map((eq) => {
              const EqIcon = eq.icon
              return (
                <div key={eq.item} className="flex items-center gap-2 rounded-lg border p-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-sm">{eq.item}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pasukan Pelaksana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-amber-500" />
            Pasukan Pelaksana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {TEAM_ROLES.map((r) => (
              <div key={r.role} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{r.role}</p>
                  <p className="text-xs text-muted-foreground">{r.commitment}</p>
                </div>
                <Badge variant="outline">×{r.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TimelineTab() {
  return (
    <div className="space-y-6">
      {[
        {
          title: 'BULAN 1–2: PERSIAPAN',
          icon: Settings,
          color: 'text-blue-600',
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          border: 'border-blue-200 dark:border-blue-800/50',
          items: [
            'Finalize kurikulum & modul',
            'Approach & close sponsors (minimum 2)',
            'Procurement laptop & peralatan',
            'Buka pendaftaran peserta',
            'Setup venue & internet',
            'Recruit instructors & mentors',
            'Marketing & PR blast',
          ],
        },
        {
          title: 'BULAN 3–5: PELAKSANAAN (12 MINGGU)',
          icon: Rocket,
          color: 'text-orange-600',
          bg: 'bg-orange-50 dark:bg-orange-950/30',
          border: 'border-orange-200 dark:border-orange-800/50',
          items: [
            'Minggu 1–4: Fasa 1 — Asas Digital',
            'Minggu 5–8: Fasa 2 — Vibe Coding',
            'Minggu 9–11: Fasa 3 — Capstone Project',
            'Minggu 12: Demo Day & Graduation',
          ],
        },
        {
          title: 'BULAN 6: POST-PROGRAM',
          icon: RefreshCw,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50 dark:bg-emerald-950/30',
          border: 'border-emerald-200 dark:border-emerald-800/50',
          items: [
            'Follow-up survey (1 bulan selepas)',
            'Alumni WhatsApp group setup',
            'Freelance job matching',
            'Impact report untuk sponsors',
            'Video highlight reel',
            'Plan Batch 2',
          ],
        },
      ].map((phase) => {
        const PhaseIcon = phase.icon
        return (
          <Card key={phase.title} className={`${phase.border} border`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${phase.bg}`}>
                  <PhaseIcon className={`h-5 w-5 ${phase.color}`} />
                </div>
                <CardTitle className="text-base">{phase.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {phase.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className={`h-4 w-4 ${phase.color} shrink-0 mt-0.5`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function SustainabilityTab() {
  return (
    <div className="space-y-6">
      {/* Alumni Network */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-primary" />
            Alumni Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              'WhatsApp group aktif untuk sokongan berterusan',
              'Monthly meetup (online/offline)',
              'Senior alumni jadi mentor untuk batch seterusnya',
              'Job board dalaman untuk freelance opportunities',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm rounded-lg border p-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            Revenue Model (Self-Sustaining)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { model: 'Sponsor retention', desc: 'Show strong impact data → sponsors renew' },
              { model: 'Corporate training', desc: 'Offer paid version untuk syarikat (subsidize asnaf version)' },
              { model: 'Freelance hub', desc: 'PUSPA ambil 10% commission dari projek freelance alumni' },
              { model: 'Government grants', desc: 'MDEC, HRDF, KBS boleh fund ongoing batches' },
              { model: 'Graduate success tax', desc: 'Alumni yang berjaya boleh contribute balik (voluntary)' },
            ].map((item) => (
              <div key={item.model} className="rounded-lg border p-3">
                <p className="text-sm font-semibold">{item.model}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scale Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Scale Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SCALE_PLAN.map((s) => (
              <div key={s.year} className="rounded-lg border-2 border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 p-4 text-center">
                <p className="text-lg font-bold text-primary">{s.year}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-2xl font-bold">{s.graduates}</p>
                  <p className="text-xs text-muted-foreground">graduan</p>
                  <p className="text-xs text-muted-foreground">{s.batches} batch</p>
                  <Separator className="my-2" />
                  <p className="text-xs font-medium">{s.location}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SuratTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-5 w-5 text-primary" />
            Template Surat Tajaan
          </CardTitle>
          <CardDescription>Template rasmi untuk dihantar kepada jabatan CSR syarikat penaja</CardDescription>
        </CardHeader>
      </Card>

      <Card className="font-mono">
        <CardContent className="p-6">
          <div className="space-y-4 text-xs leading-relaxed whitespace-pre-wrap">
            <p className="font-bold text-sm">PERTUBUHAN URUS PEDULI ASNAF (PUSPA)</p>
            <p>KL &amp; Selangor</p>
            <p>PPM-006-14-14032020</p>
            <Separator />
            <p>Tarikh: ___________</p>
            <br />
            <p>Kepada:</p>
            <p>Ketua Pegawai, Jabatan CSR</p>
            <p>[Nama Syarikat]</p>
            <p>[Alamat]</p>
            <br />
            <p>YBhg Tuan/Puan,</p>
            <br />
            <p className="font-bold">CADANGAN PENAJAAN: PROGRAM KELAS AI &amp; VIBE CODING UNTUK ASNAF</p>
            <br />
            <p>Dengan hormatnya, kami merujuk perkara di atas.</p>
            <br />
            <p>PUSPA, sebuah pertubuhan kebajikan berdaftar di bawah Akta Pertubuhan 1966, dengan ini mengundang [Nama Syarikat] untuk menjadi rakan penaja bagi program latihan kemahiran digital yang julung-julung kali dianjurkan untuk golongan asnaf di KL &amp; Selangor.</p>
            <br />
            <p className="font-bold">LATAR BELAKANG:</p>
            <p>Program ini bertujuan melengkapkan 30 orang asnaf dengan kemahiran pembangunan aplikasi web menggunakan teknologi AI (Artificial Intelligence) selama 12 minggu. Peserta akan belajar menggunakan alat AI terkini untuk membina laman web, aplikasi, dan portfolio digital yang membolehkan mereka menjana pendapatan melalui kerja bebas (freelance) dalam ekonomi digital.</p>
            <br />
            <p className="font-bold">IMPAK YANG DIJANGKA:</p>
            <p>• 75% peserta menamatkan program dengan projek siap</p>
            <p>• 40% graduan memperoleh pendapatan tambahan dalam tempoh 6 bulan</p>
            <p>• 15% graduan keluar dari status asnaf dalam tempoh 12 bulan</p>
            <br />
            <p className="font-bold">PAKEJ PENAJAAN:</p>
            <p>[Lampirkan jadual tier penajaan]</p>
            <br />
            <p>Sumbangan penajaan layak untuk potongan cukai di bawah Seksyen 44(6) Akta Cukai Pendapatan 1967 (kelulusan LHDN).</p>
            <br />
            <p>Bersama ini kami lampirkan proposal lengkap untuk makluman lanjut. Kami amat berharap dapat membentangkan cadangan ini secara terperinci dalam sesi perbincangan bersama pihak tuan/puan.</p>
            <br />
            <p>Sekian, terima kasih.</p>
            <br />
            <p>Yang benar,</p>
            <br />
            <p>________________________</p>
            <p>[Nama Pengerusi]</p>
            <p>Pengerusi PUSPA</p>
            <p>Tel: ___________</p>
            <p>Email: ___________</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function IntegrasiTab() {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 dark:border-primary/30">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/10 mx-auto mb-3">
              <Link2 className="h-7 w-7 text-primary dark:text-primary" />
            </div>
            <h3 className="text-lg font-bold">Integrasi PuspaCare</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Program ini boleh ditrack sepenuhnya dalam sistem PuspaCare
            </p>
            <blockquote className="mt-3 text-sm font-medium text-primary italic">
              &ldquo;Satu ekosistem, satu platform.&rdquo;
            </blockquote>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PUSPACARE_MODULES.map((m) => {
          const MIcon = m.icon
          return (
            <Card key={m.module}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 dark:bg-primary/10">
                    <MIcon className="h-4.5 w-4.5 text-primary dark:text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{m.module}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-5 w-5 text-blue-500" />
            Aliran Integrasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            {['Pendaftaran', 'Penilaian', 'Kelas', 'Penjejakan', 'Graduasi', 'Alumni'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="rounded-lg border-2 border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 px-3 py-2 font-medium text-primary">
                  {step}
                </div>
                {i < 5 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { id: 'visi', label: 'Visi', icon: Sparkles },
  { id: 'kurikulum', label: 'Kurikulum', icon: BookOpen },
  { id: 'peserta', label: 'Peserta', icon: Users },
  { id: 'tajaan', label: 'Tajaan', icon: Award },
  { id: 'penaja', label: 'Penaja', icon: Building2 },
  { id: 'bajet', label: 'Bajet', icon: Calculator },
  { id: 'impak', label: 'Impak', icon: TrendingUp },
  { id: 'logistik', label: 'Logistik', icon: Settings },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'sustain', label: 'Sustainability', icon: RefreshCw },
  { id: 'surat', label: 'Surat', icon: Mail },
  { id: 'integrasi', label: 'Integrasi', icon: Link2 },
] as const

type TabId = (typeof TABS)[number]['id']

export default function KelasAIPage() {
  const [activeTab, setActiveTab] = useState<TabId>('visi')

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <AnimatedContent distance={30} direction="vertical" duration={0.4}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-sm">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Kelas AI & Vibe Coding</h1>
            <SplitText text="Program Kelas AI & Vibe Coding Untuk Asnaf" className="text-sm text-muted-foreground" delay={30} tag="p" textAlign="left" animationFrom={{ opacity: 0, y: 20 }} animationTo={{ opacity: 1, y: 0 }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary border-0">
            Batch 1 — 2026
          </Badge>
          <Badge variant="outline" className="text-emerald-600 border-emerald-300">
            PERCUMA
          </Badge>
        </div>
      </div>
      </AnimatedContent>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} className="space-y-4">
        <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex h-auto w-max min-w-full gap-1 bg-muted/50 p-1 rounded-lg">
            {TABS.map((tab) => {
              const TabIcon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md whitespace-nowrap"
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        <TabsContent value="visi"><VisiTab /></TabsContent>
        <TabsContent value="kurikulum"><KurikulumTab /></TabsContent>
        <TabsContent value="peserta"><PesertaTab /></TabsContent>
        <TabsContent value="tajaan"><TajaanTab /></TabsContent>
        <TabsContent value="penaja"><PenajaTab /></TabsContent>
        <TabsContent value="bajet"><BajetTab /></TabsContent>
        <TabsContent value="impak"><ImpakTab /></TabsContent>
        <TabsContent value="logistik"><LogistikTab /></TabsContent>
        <TabsContent value="timeline"><TimelineTab /></TabsContent>
        <TabsContent value="sustain"><SustainabilityTab /></TabsContent>
        <TabsContent value="surat"><SuratTab /></TabsContent>
        <TabsContent value="integrasi"><IntegrasiTab /></TabsContent>
      </Tabs>
    </div>
  )
}
