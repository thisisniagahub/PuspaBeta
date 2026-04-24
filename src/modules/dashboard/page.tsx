'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { api } from '@/lib/api'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users, Heart, HandCoins, UserCheck, ShieldCheck,
  FileText, DollarSign, UserPlus, Calendar, Activity,
  ArrowRight, TrendingUp, TrendingDown, Clock, CheckCircle2,
  ClipboardList, Package,
} from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

interface DashboardStats {
  totalMembers: number
  activeProgrammes: number
  totalDonations: number
  activeVolunteers: number
  complianceScore: number
  trendMembers: number
  trendProgrammes: number
  trendDonations: number
  trendVolunteers: number
  trendCompliance: number
}

interface MonthlyDonation { bulan: string; zakat: number; sadaqah: number; waqf: number; infaq: number; general: number }
interface MemberCategory { name: string; value: number; color: string }
interface RecentActivity { id: string; type: string; title: string; description: string; timestamp: string }
interface ComplianceItem { id: string; item: string; category: string; isCompleted: boolean }

const FUND_COLORS: Record<string, string> = { zakat: '#7c3aed', sadaqah: '#059669', waqf: '#d97706', infaq: '#2563eb', general: '#6b7280' }
const ACTIVITY_STYLES: Record<string, string> = {
  case: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  donation: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  member: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  programme: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Selamat Pagi'
  if (h >= 12 && h < 17) return 'Selamat Petang'
  if (h >= 17 && h < 20) return 'Selamat Petang'
  return 'Selamat Malam'
}

function fmtCurrency(n: number) {
  if (n == null || isNaN(n)) return 'RM 0'
  return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function fmtNum(n: number) {
  if (n == null || isNaN(n)) return '0'
  return new Intl.NumberFormat('ms-MY').format(n)
}

function complianceLabel(s: number) { return s >= 80 ? 'Sangat Baik' : s >= 50 ? 'Sederhana' : 'Perlu Perhatian' }

function activityIcon(t: string) {
  switch (t) {
    case 'case': return <FileText className="h-4 w-4" />
    case 'donation': return <HandCoins className="h-4 w-4" />
    case 'member': return <UserPlus className="h-4 w-4" />
    case 'programme': return <Package className="h-4 w-4" />
    default: return <Activity className="h-4 w-4" />
  }
}

interface StatCardProps { title: string; value: string; subtitle?: string; icon: React.ReactNode; accent: string; iconBg: string; trend?: number }

function StatCard({ title, value, subtitle, icon, accent, iconBg, trend }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="flex items-start gap-4 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: iconBg }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          {trend !== undefined && trend !== 0 && (
            <div className="mt-1 flex items-center gap-1">
              {trend > 0 ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
              <span className={cn('text-xs font-medium', trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              <span className="text-xs text-muted-foreground">vs bulan lepas</span>
            </div>
          )}
        </div>
      </CardContent>
      <div className="absolute left-0 top-0 h-1 w-full" style={{ backgroundColor: accent }} />
    </Card>
  )
}

interface BarTooltipItem { name: string; value: number; color: string; dataKey: string }

function MonthlyTooltip({ active, payload, label }: { active?: boolean; payload?: BarTooltipItem[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div className="space-y-1">
        {payload.map(e => (
          <div key={e.dataKey} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.color }} />
              <span className="capitalize">{e.name}</span>
            </span>
            <span className="font-medium">{fmtCurrency(e.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number }) {
  if (percent < 0.08) return null
  const RAD = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RAD)
  const y = cy + r * Math.sin(-midAngle * RAD)
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>{`${(percent * 100).toFixed(0)}%`}</text>
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <Card key={i}><CardContent className="flex items-center gap-4 p-4"><Skeleton className="h-12 w-12 rounded-xl" /><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-7 w-16" /></div></CardContent></Card>)}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent><Skeleton className="h-[320px] w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-36" /></CardHeader><CardContent><Skeleton className="h-[320px] w-full rounded-full" /></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex items-start gap-3"><Skeleton className="h-10 w-10 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-72" /></div></div>)}</div></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</div></CardContent></Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyDonation[]>([])
  const [memberData, setMemberData] = useState<MemberCategory[]>([])
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, m, md, a, c] = await Promise.allSettled([
          api.get<DashboardStats>('/dashboard/stats'),
          api.get<MonthlyDonation[]>('/dashboard/monthly-donations'),
          api.get<MemberCategory[]>('/dashboard/member-distribution'),
          api.get<RecentActivity[]>('/dashboard/activities'),
          api.get<ComplianceItem[]>('/compliance'),
        ])
        if (s.status === 'fulfilled') setStats(s.value)
        if (m.status === 'fulfilled') setMonthlyData(m.value)
        if (md.status === 'fulfilled') setMemberData(md.value)
        if (a.status === 'fulfilled') setActivities(a.value)
        if (c.status === 'fulfilled') setComplianceItems(Array.isArray(c.value) ? c.value : [])
      } catch { /* empty */ } finally { setLoading(false) }
    }
    load()
  }, [])

  const completedCount = useMemo(() => complianceItems.filter(i => i.isCompleted).length, [complianceItems])
  const compliancePct = complianceItems.length > 0 ? Math.round((completedCount / complianceItems.length) * 100) : 0
  const incompleteItems = useMemo(() => complianceItems.filter(i => !i.isCompleted), [complianceItems])

  // Pipeline data from API stats
  const pipelineSteps = useMemo(() => {
    const s = stats
    return [
      { label: 'Daftar Ahli', count: s ? fmtNum(s.totalMembers) : '—', icon: UserPlus, done: (s?.totalMembers ?? 0) > 0 },
      { label: 'Kes Bantuan', count: '—', icon: FileText, done: false },
      { label: 'Program', count: s ? String(s.activeProgrammes) : '—', icon: Heart, done: (s?.activeProgrammes ?? 0) > 0 },
      { label: 'Pembayaran', count: s ? fmtCurrency(s.totalDonations) : '—', icon: HandCoins, done: false },
      { label: 'Laporan', count: '—', icon: ClipboardList, done: false },
    ]
  }, [stats])

  if (loading) return <div className="p-4 sm:p-6 lg:p-8"><DashboardSkeleton /></div>

  const skor = stats?.complianceScore ?? 0

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4B0082] via-[#6B21A8] to-[#7C3AED] p-6 text-white shadow-xl shadow-purple-900/30 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-purple-400/10 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/95 shadow-lg ring-1 ring-white/50">
              <Image src="/puspa-logo-official.png" alt="PUSPA Logo" width={52} height={52} className="object-contain" priority />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{getGreeting()}, Admin</h1>
              <p className="mt-1 text-sm text-purple-100 sm:text-base">Ringkasan data dan statistik terkini organisasi anda.</p>
              <p className="mt-1 text-xs text-purple-200/70">Pertubuhan Urus Peduli Asnaf KL &amp; Selangor &bull; PPM-006-14-14032020</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            {[
              { icon: <Users className="h-4 w-4 text-white" />, val: fmtNum(stats?.totalMembers ?? 0), lbl: 'Ahli Asnaf' },
              { icon: <HandCoins className="h-4 w-4 text-white" />, val: fmtCurrency(stats?.totalDonations ?? 0), lbl: 'Jumlah Donasi' },
              { icon: <Heart className="h-4 w-4 text-white" />, val: String(stats?.activeProgrammes ?? 0), lbl: 'Program Aktif' },
              { icon: <UserCheck className="h-4 w-4 text-white" />, val: String(stats?.activeVolunteers ?? 0), lbl: 'Sukarelawan' },
            ].map(p => (
              <div key={p.lbl} className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 backdrop-blur-sm ring-1 ring-white/10 sm:px-4 sm:py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 sm:h-9 sm:w-9">{p.icon}</div>
                <div className="flex flex-col"><span className="text-base font-bold leading-tight sm:text-lg">{p.val}</span><span className="text-[10px] leading-tight text-purple-200 sm:text-[11px]">{p.lbl}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Jumlah Ahli Asnaf" value={fmtNum(stats?.totalMembers ?? 0)} icon={<Users className="h-6 w-6" />} accent="#7c3aed" iconBg="rgba(124,58,237,0.1)" trend={stats?.trendMembers} />
        <StatCard title="Program Aktif" value={String(stats?.activeProgrammes ?? 0)} subtitle="dalam pelaksanaan" icon={<Heart className="h-6 w-6" />} accent="#059669" iconBg="rgba(5,150,105,0.1)" trend={stats?.trendProgrammes} />
        <StatCard title="Jumlah Donasi" value={fmtCurrency(stats?.totalDonations ?? 0)} subtitle="setakat ini" icon={<HandCoins className="h-6 w-6" />} accent="#d97706" iconBg="rgba(217,119,6,0.1)" trend={stats?.trendDonations} />
        <StatCard title="Sukarelawan Aktif" value={fmtNum(stats?.activeVolunteers ?? 0)} subtitle="telah berdaftar" icon={<UserCheck className="h-6 w-6" />} accent="#0ea5e9" iconBg="rgba(14,165,233,0.1)" trend={stats?.trendVolunteers} />
        <StatCard title="Skor Compliance" value={`${skor}%`} subtitle={complianceLabel(skor)} icon={<ShieldCheck className="h-6 w-6" />} accent={skor >= 80 ? '#059669' : skor >= 50 ? '#d97706' : '#e11d48'} iconBg={skor >= 80 ? 'rgba(5,150,105,0.1)' : skor >= 50 ? 'rgba(217,119,6,0.1)' : 'rgba(225,29,72,0.1)'} trend={stats?.trendCompliance} />
      </div>

      {/* Tindakan Seterusnya */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList className="h-4 w-4" style={{ color: '#4B0082' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#4B0082' }}>Tindakan Seterusnya</h2>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Perlu perhatian</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Kes Menunggu', desc: 'Permohonan bantuan perlu disemak', icon: Clock, color: 'amber', view: 'cases' as const },
            { label: 'Donasi Baharu', desc: 'Sumbangan belum disahkan', icon: DollarSign, color: 'emerald', view: 'donations' as const },
            { label: 'eKYC Pending', desc: 'Pengesahan identiti menunggu', icon: ShieldCheck, color: 'blue', view: 'ekyc' as const },
            { label: 'Program Minggu Ini', desc: 'Program perlu dijalankan', icon: Calendar, color: 'purple', view: 'programmes' as const },
          ].map(a => (
            <button key={a.label} type="button" onClick={() => useAppStore.getState().setView(a.view)}
              className="group flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800">
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', a.color === 'amber' ? 'bg-amber-50 dark:bg-amber-950/40' : a.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-950/40' : a.color === 'blue' ? 'bg-blue-50 dark:bg-blue-950/40' : 'bg-purple-50 dark:bg-purple-950/40')}>
                <a.icon className={cn('h-4 w-4', a.color === 'amber' ? 'text-amber-600' : a.color === 'emerald' ? 'text-emerald-600' : a.color === 'blue' ? 'text-blue-600' : 'text-purple-600')} />
              </div>
              <div className="min-w-0 flex-1"><p className="text-sm font-medium group-hover:text-purple-700 transition-colors">{a.label}</p><p className="mt-0.5 text-xs text-muted-foreground">{a.desc}</p></div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Workflow */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4" style={{ color: '#4B0082' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#4B0082' }}>Pipeline Workflow</h2>
        </div>
        <div className="overflow-x-auto rounded-xl border bg-card p-4">
          <div className="flex items-center gap-1 min-w-[420px] sm:min-w-[600px]">
            {pipelineSteps.map((step, idx) => (
              <div key={step.label} className="flex flex-1 items-center gap-1">
                <div className={cn('flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 transition-all', step.done ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20' : 'border-border bg-muted/30')}>
                  <step.icon className={cn('h-4 w-4 shrink-0', step.done ? 'text-emerald-600' : 'text-muted-foreground')} />
                  <div className="min-w-0"><p className="truncate text-xs font-medium">{step.label}</p><p className="text-[10px] text-muted-foreground">{step.count}</p></div>
                  {step.done && <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />}
                </div>
                {idx < pipelineSteps.length - 1 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><div><CardTitle className="text-lg">Trend Sumbangan Bulanan</CardTitle><CardDescription>Pecahan mengikut jenis dana</CardDescription></div></CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <div className="flex h-[260px] sm:h-[340px] flex-col items-center justify-center text-muted-foreground">
                <HandCoins className="mb-2 h-10 w-10 opacity-40" /><p className="text-sm font-medium">Tiada data sumbangan</p>
              </div>
            ) : (
              <div className="h-[260px] sm:h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
                    <Tooltip content={<MonthlyTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} formatter={(v: string) => <span className="text-sm capitalize">{v}</span>} />
                    <Bar dataKey="zakat" stackId="a" fill={FUND_COLORS.zakat} />
                    <Bar dataKey="sadaqah" stackId="a" fill={FUND_COLORS.sadaqah} />
                    <Bar dataKey="waqf" stackId="a" fill={FUND_COLORS.waqf} />
                    <Bar dataKey="infaq" stackId="a" fill={FUND_COLORS.infaq} />
                    <Bar dataKey="general" stackId="a" fill={FUND_COLORS.general} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div><CardTitle className="text-lg">Pecahan Ahli</CardTitle><CardDescription>Taburan jenis keahlian</CardDescription></div></CardHeader>
          <CardContent>
            {memberData.length === 0 ? (
              <div className="flex h-[200px] sm:h-[240px] flex-col items-center justify-center text-muted-foreground">
                <Users className="mb-2 h-10 w-10 opacity-40" /><p className="text-sm font-medium">Tiada data ahli</p>
              </div>
            ) : (
              <>
                <div className="h-[200px] sm:h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={memberData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none" labelLine={false} label={PieLabel}>
                        {memberData.map((_, i) => <Cell key={i} fill={memberData[i].color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number, n: string) => [`${fmtNum(v)} orang`, n]} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', fontSize: '13px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {memberData.map(e => (
                    <div key={e.name} className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: e.color }} />
                      <div className="min-w-0"><p className="truncate text-xs text-muted-foreground">{e.name}</p><p className="text-sm font-semibold">{fmtNum(e.value)}</p></div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activities + Compliance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><div><CardTitle className="text-lg">Aktiviti Terkini</CardTitle><CardDescription>Kemas kini dan peristiwa terbaharu</CardDescription></div></CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Activity className="mb-2 h-10 w-10 opacity-40" /><p className="text-sm font-medium">Tiada aktiviti terkini</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activities.map(a => (
                  <div key={a.id} className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50">
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.case)}>
                      {activityIcon(a.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{new Date(a.timestamp).toLocaleDateString('ms-MY')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div><CardTitle className="text-lg">Compliance</CardTitle><CardDescription>Senarai semak pematuhan</CardDescription></div></CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kemajuan</span>
                <span className="font-semibold">{compliancePct}%</span>
              </div>
              <Progress value={compliancePct} className="h-2" />
            </div>
            {incompleteItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Semua item telah selesai</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {incompleteItems.slice(0, 8).map(item => (
                  <div key={item.id} className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    <div className="min-w-0">
                      <p className="text-sm">{item.item}</p>
                      <Badge variant="outline" className="mt-0.5 text-[10px]">{item.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
