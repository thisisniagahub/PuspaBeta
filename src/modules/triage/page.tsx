'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Siren, Activity, AlertTriangle, CheckCircle2, Clock, ArrowRight, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TriageResult {
  id: string
  caseId: string
  caseTitle: string
  priority: string
  score: number
  factors: { name: string; weight: number; value: number }[]
  status: string
  triagedAt: string
  triagedBy: string
}

const priorityConfig: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  P1: { label: 'P1 — Kritikal', color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-900/40', icon: AlertTriangle },
  P2: { label: 'P2 — Segera', color: 'text-orange-700', bg: 'bg-orange-100 dark:bg-orange-900/40', icon: Siren },
  P3: { label: 'P3 — Tinggi', color: 'text-yellow-700', bg: 'bg-yellow-100 dark:bg-yellow-900/40', icon: Activity },
  P4: { label: 'P4 — Sederhana', color: 'text-blue-700', bg: 'bg-blue-100 dark:bg-blue-900/40', icon: Clock },
  P5: { label: 'P5 — Rendah', color: 'text-gray-700', bg: 'bg-gray-100 dark:bg-gray-900/40', icon: CheckCircle2 },
}

const mockResults: TriageResult[] = [
  { id: '1', caseId: 'KS-2026-001', caseTitle: 'Bantuan Perubatan Kecemasan', priority: 'P1', score: 95, factors: [{ name: 'Kecederaan', weight: 40, value: 38 }, { name: 'Kewangan', weight: 30, value: 28 }, { name: 'Tanggungan', weight: 20, value: 19 }, { name: 'Umur', weight: 10, value: 10 }], status: 'triaged', triagedAt: '2026-03-04T08:30:00Z', triagedBy: 'Auto-Triage' },
  { id: '2', caseId: 'KS-2026-002', caseTitle: 'Bantuan Pendidikan Anak', priority: 'P3', score: 68, factors: [{ name: 'Kecederaan', weight: 40, value: 10 }, { name: 'Kewangan', weight: 30, value: 25 }, { name: 'Tanggungan', weight: 20, value: 18 }, { name: 'Umur', weight: 10, value: 15 }], status: 'triaged', triagedAt: '2026-03-04T09:15:00Z', triagedBy: 'Auto-Triage' },
  { id: '3', caseId: 'KS-2026-003', caseTitle: 'Bantuan Makanan Asas', priority: 'P2', score: 82, factors: [{ name: 'Kecederaan', weight: 40, value: 20 }, { name: 'Kewangan', weight: 30, value: 29 }, { name: 'Tanggungan', weight: 20, value: 20 }, { name: 'Umur', weight: 10, value: 13 }], status: 'triaged', triagedAt: '2026-03-04T10:00:00Z', triagedBy: 'Admin' },
  { id: '4', caseId: 'KS-2026-004', caseTitle: 'Pembayaran Sewa Rumah', priority: 'P4', score: 52, factors: [{ name: 'Kecederaan', weight: 40, value: 5 }, { name: 'Kewangan', weight: 30, value: 22 }, { name: 'Tanggungan', weight: 20, value: 15 }, { name: 'Umur', weight: 10, value: 10 }], status: 'triaged', triagedAt: '2026-03-04T11:30:00Z', triagedBy: 'Auto-Triage' },
  { id: '5', caseId: 'KS-2026-005', caseTitle: 'Sokongan Kemahiran Kerja', priority: 'P5', score: 30, factors: [{ name: 'Kecederaan', weight: 40, value: 2 }, { name: 'Kewangan', weight: 30, value: 12 }, { name: 'Tanggungan', weight: 20, value: 10 }, { name: 'Umur', weight: 10, value: 6 }], status: 'triaged', triagedAt: '2026-03-04T14:00:00Z', triagedBy: 'Auto-Triage' },
  { id: '6', caseId: 'KS-2026-006', caseTitle: 'Rawatan Dialisis', priority: 'P1', score: 92, factors: [{ name: 'Kecederaan', weight: 40, value: 37 }, { name: 'Kewangan', weight: 30, value: 27 }, { name: 'Tanggungan', weight: 20, value: 18 }, { name: 'Umur', weight: 10, value: 10 }], status: 'triaged', triagedAt: '2026-03-04T15:45:00Z', triagedBy: 'Auto-Triage' },
]

export default function TriagePage() {
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<TriageResult[]>([])
  const [activeTab, setActiveTab] = useState('results')
  const [triageForm, setTriageForm] = useState({ caseId: '', income: '', dependents: '', urgency: 'normal', description: '' })
  const [triageRunning, setTriageRunning] = useState(false)
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(mockResults)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const handleRunTriage = async () => {
    if (!triageForm.caseId) { toast.error('Sila pilih kes'); return }
    setTriageRunning(true)
    try {
      await new Promise(r => setTimeout(r, 1500))
      const newResult: TriageResult = {
        id: String(Date.now()),
        caseId: triageForm.caseId,
        caseTitle: 'Kes Baharu',
        priority: triageForm.urgency === 'urgent' ? 'P1' : triageForm.urgency === 'high' ? 'P2' : triageForm.urgency === 'normal' ? 'P3' : 'P4',
        score: Math.floor(Math.random() * 40) + 55,
        factors: [
          { name: 'Kecederaan', weight: 40, value: Math.floor(Math.random() * 35) + 5 },
          { name: 'Kewangan', weight: 30, value: Math.floor(Math.random() * 25) + 5 },
          { name: 'Tanggungan', weight: 20, value: Math.floor(Math.random() * 18) + 2 },
          { name: 'Umur', weight: 10, value: Math.floor(Math.random() * 10) + 1 },
        ],
        status: 'triaged',
        triagedAt: new Date().toISOString(),
        triagedBy: 'Auto-Triage',
      }
      setTriageResult(newResult)
      setResults(prev => [newResult, ...prev])
      toast.success('Triage berjaya dilaksanakan')
    } catch { toast.error('Gagal melaksanakan triage') } finally { setTriageRunning(false) }
  }

  const priorityCounts = results.reduce((acc, r) => { acc[r.priority] = (acc[r.priority] || 0) + 1; return acc }, {} as Record<string, number>)

  if (loading) return (
    <div className="space-y-4 p-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  )

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#4B008215' }}>
          <Siren className="h-5 w-5" style={{ color: '#4B0082' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Enjin Triage</h1>
          <p className="text-sm text-muted-foreground">Penilaian keutamaan kes bantuan secara automatik</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {(['P1', 'P2', 'P3', 'P4', 'P5'] as const).map(p => {
          const cfg = priorityConfig[p]
          const Icon = cfg.icon
          return (
            <Card key={p}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', cfg.bg)}>
                  <Icon className={cn('h-5 w-5', cfg.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{cfg.label.split(' — ')[1]}</p>
                  <p className="text-xl font-bold">{priorityCounts[p] || 0}</p>
                  <p className="text-[10px] font-semibold" style={{ color: '#4B0082' }}>{p}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="results">Keputusan Triage</TabsTrigger>
          <TabsTrigger value="auto">Auto-Triage</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Keputusan Triage Kes</CardTitle><CardDescription>Senarai kes yang telah dinilai keutamaan</CardDescription></CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>No. Kes</TableHead><TableHead>Tajuk</TableHead><TableHead>Keutamaan</TableHead><TableHead className="hidden md:table-cell">Skor</TableHead><TableHead className="hidden lg:table-cell">Dinilai Oleh</TableHead><TableHead className="hidden md:table-cell">Tarikh</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {results.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Tiada keputusan triage</TableCell></TableRow>
                    ) : results.map(r => {
                      const cfg = priorityConfig[r.priority]
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-mono text-xs">{r.caseId}</TableCell>
                          <TableCell className="font-medium">{r.caseTitle}</TableCell>
                          <TableCell><Badge className={cn(cfg.bg, cfg.color)}>{r.priority}</Badge></TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <Progress value={r.score} className="h-2 w-16" />
                              <span className="text-xs font-medium">{r.score}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{r.triagedBy}</TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{new Date(r.triagedAt).toLocaleDateString('ms-MY')}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Pecahan Skor Triage</CardTitle><CardDescription>Faktor penilaian terkini</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.slice(0, 3).map(r => (
                    <div key={r.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{r.caseId} — {r.caseTitle}</span>
                        <Badge className={cn(priorityConfig[r.priority].bg, priorityConfig[r.priority].color)}>{r.priority}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {r.factors.map(f => (
                          <div key={f.name} className="rounded-lg border p-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{f.name}</span>
                              <span className="font-medium">{f.value}/{f.weight}</span>
                            </div>
                            <Progress value={(f.value / f.weight) * 100} className="mt-1 h-1.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="auto" className="mt-4 space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Jalankan Auto-Triage</CardTitle><CardDescription>Masukkan maklumat kes untuk dinilai keutamaan</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Pilih Kes</Label>
                  <Select value={triageForm.caseId} onValueChange={v => setTriageForm(p => ({ ...p, caseId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih kes…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KS-2026-007">KS-2026-007 — Kes Baharu</SelectItem>
                      <SelectItem value="KS-2026-008">KS-2026-008 — Bantuan Kecemasan</SelectItem>
                      <SelectItem value="KS-2026-009">KS-2026-009 — Sokongan Keluarga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Pendapatan (RM)</Label><Input type="number" placeholder="0" value={triageForm.income} onChange={e => setTriageForm(p => ({ ...p, income: e.target.value }))} /></div>
                  <div className="grid gap-2"><Label>Tanggungan</Label><Input type="number" placeholder="0" value={triageForm.dependents} onChange={e => setTriageForm(p => ({ ...p, dependents: e.target.value }))} /></div>
                </div>
                <div className="grid gap-2">
                  <Label>Tahap Kecemasan</Label>
                  <Select value={triageForm.urgency} onValueChange={v => setTriageForm(p => ({ ...p, urgency: v }))}>
                    <SelectTrigger /><SelectContent>
                      <SelectItem value="urgent">Segera</SelectItem>
                      <SelectItem value="high">Tinggi</SelectItem>
                      <SelectItem value="normal">Biasa</SelectItem>
                      <SelectItem value="low">Rendah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2"><Label>Keterangan Tambahan</Label><Textarea placeholder="Terangkan situasi kes…" value={triageForm.description} onChange={e => setTriageForm(p => ({ ...p, description: e.target.value }))} /></div>
                <Button onClick={handleRunTriage} disabled={triageRunning} className="gap-2 w-full" style={{ backgroundColor: '#4B0082' }}>
                  {triageRunning ? <><Activity className="h-4 w-4 animate-spin" /> Menjalankan Triage…</> : <><Play className="h-4 w-4" /> Jalankan Triage</>}
                </Button>
              </CardContent>
            </Card>

            {triageResult && (
              <Card className="border-2" style={{ borderColor: '#4B008240' }}>
                <CardHeader><CardTitle className="text-base">Keputusan Triage</CardTitle><CardDescription>Keputusan penilaian automatik</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Keutamaan</span>
                    <Badge className={cn(priorityConfig[triageResult.priority].bg, priorityConfig[triageResult.priority].color, 'text-base px-3 py-1')}>
                      {triageResult.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Skor Keseluruhan</span>
                    <span className="text-2xl font-bold" style={{ color: '#4B0082' }}>{triageResult.score}%</span>
                  </div>
                  <Progress value={triageResult.score} className="h-3" />
                  <div className="pt-2 space-y-2">
                    <p className="text-sm font-medium">Pecahan Faktor</p>
                    {triageResult.factors.map(f => (
                      <div key={f.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{f.name} (Bobot: {f.weight}%)</span>
                          <span className="font-medium">{f.value}/{f.weight}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${(f.value / f.weight) * 100}%`, backgroundColor: '#4B0082' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                    <ArrowRight className="h-3 w-3" />
                    <span>Dinilai oleh {triageResult.triagedBy} pada {new Date(triageResult.triagedAt).toLocaleString('ms-MY')}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
