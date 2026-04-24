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
import { Switch } from '@/components/ui/switch'
import { Zap, Play, Clock, ArrowRight, Settings, Plus, ToggleLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutomationRule {
  id: string
  name: string
  description: string
  triggerEvent: string
  conditions: string
  actions: string[]
  enabled: boolean
  priority: number
  lastTriggered: string | null
  triggerCount: number
}

const triggerColors: Record<string, string> = {
  kes_baharu: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  kes_idle: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  donasi_terima: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  program_mingguan: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  sukarelawan_lulus: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',
  custom: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400',
}

const mockRules: AutomationRule[] = [
  { id: '1', name: 'Auto-Eskalasi Kes Idle', description: 'Eskalasi kes yang tidak dikemas kini selama 7 hari ke keutamaan lebih tinggi', triggerEvent: 'kes_idle', conditions: 'idle > 7 hari', actions: ['Tukar keutamaan ke P2', 'Hantar notifikasi ke pentadbir', 'Log audit'], enabled: true, priority: 1, lastTriggered: '2026-03-04T10:00:00Z', triggerCount: 23 },
  { id: '2', name: 'Resit Donasi Automatik', description: 'Jana dan hantar resit donasi secara automatik apabila donasi diterima', triggerEvent: 'donasi_terima', conditions: 'jumlah > 0', actions: ['Jana resit PDF', 'Hantar e-mel resit', 'Kemaskini status donasi'], enabled: true, priority: 2, lastTriggered: '2026-03-04T08:30:00Z', triggerCount: 156 },
  { id: '3', name: 'Peringatan Program Mingguan', description: 'Hantar peringatan program kepada peserta 24 jam sebelum program bermula', triggerEvent: 'program_mingguan', conditions: 'tarikh_mula - 1 hari', actions: ['Hantar WhatsApp peringatan', 'Hantar e-mel peringatan', 'Kemaskini senarai kehadiran'], enabled: true, priority: 3, lastTriggered: '2026-03-03T09:00:00Z', triggerCount: 89 },
  { id: '4', name: 'Sijil Sukarelawan Automatik', description: 'Jana sijil penghargaan sukarelawan apabila menyelesaikan program', triggerEvent: 'sukarelawan_lulus', conditions: 'jam_perkhidmatan >= 40', actions: ['Jana sijil PDF', 'Hantar e-mel sijil', 'Kemaskini profil sukarelawan'], enabled: false, priority: 4, lastTriggered: null, triggerCount: 12 },
  { id: '5', name: 'Notifikasi Kes Baharu', description: 'Hantar notifikasi serta-merta apabila kes baharu didaftarkan', triggerEvent: 'kes_baharu', conditions: 'semua', actions: ['Hantar notifikasi ke staf', 'Jalankan triage automatik', 'Cipta tugasan susulan'], enabled: true, priority: 1, lastTriggered: '2026-03-04T07:00:00Z', triggerCount: 45 },
]

const emptyForm = { name: '', description: '', triggerEvent: 'kes_baharu', conditions: '', actions: '', priority: 3 }

export default function AutomationRulesPage() {
  const [loading, setLoading] = useState(true)
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [activeTab, setActiveTab] = useState('list')
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setRules(mockRules)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
    const rule = rules.find(r => r.id === id)
    toast.success(rule?.enabled ? `Peraturan "${rule.name}" dinyahaktifkan` : `Peraturan "${rule.name}" diaktifkan`)
  }

  const handleAddRule = async () => {
    if (!form.name) { toast.error('Sila isi nama peraturan'); return }
    setSaving(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      const newRule: AutomationRule = {
        id: String(Date.now()), name: form.name, description: form.description,
        triggerEvent: form.triggerEvent, conditions: form.conditions,
        actions: form.actions.split('\n').filter(a => a.trim()),
        enabled: true, priority: form.priority, lastTriggered: null, triggerCount: 0,
      }
      setRules(prev => [newRule, ...prev])
      toast.success('Peraturan berjaya ditambah')
      setForm(emptyForm)
      setActiveTab('list')
    } catch { toast.error('Gagal menambah peraturan') } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
    </div>
  )

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#4B008215' }}>
          <Zap className="h-5 w-5" style={{ color: '#4B0082' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Peraturan Automasi</h1>
          <p className="text-sm text-muted-foreground">Automasi aliran kerja berasaskan peristiwa</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Jumlah Peraturan', value: rules.length, color: '#4B0082' },
          { label: 'Aktif', value: rules.filter(r => r.enabled).length, color: '#059669' },
          { label: 'Tidak Aktif', value: rules.filter(r => !r.enabled).length, color: '#6b7280' },
          { label: 'Jumlah Pencetus', value: rules.reduce((s, r) => s + r.triggerCount, 0), color: '#d97706' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
              <Zap className="h-5 w-5" style={{ color: s.color }} />
            </div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Senarai Peraturan</TabsTrigger>
          <TabsTrigger value="add">Tambah Peraturan</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {rules.map(rule => (
              <Card key={rule.id} className={cn(!rule.enabled && 'opacity-60')}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{rule.name}</h3>
                        <Badge className={triggerColors[rule.triggerEvent] || triggerColors.custom}>{rule.triggerEvent.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{rule.description}</p>
                    </div>
                    <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">Syarat:</span>
                      <Badge variant="outline" className="text-[10px]">{rule.conditions}</Badge>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <span className="font-medium text-muted-foreground shrink-0">Tindakan:</span>
                      <div className="flex flex-wrap gap-1">
                        {rule.actions.map((a, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] gap-0.5">
                            <ChevronRight className="h-2.5 w-2.5" />{a}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Keutamaan: {rule.priority}</span>
                      <span>Dicetus: {rule.triggerCount}×</span>
                    </div>
                    {rule.lastTriggered && (
                      <span className="text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-0.5" />
                        {new Date(rule.lastTriggered).toLocaleDateString('ms-MY')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="add" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Tambah Peraturan Baharu</CardTitle><CardDescription>Cipta peraturan automasi baharu</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2"><Label>Nama Peraturan *</Label><Input placeholder="cth: Auto-notifikasi pembayaran" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Penerangan</Label><Textarea placeholder="Terangkan tujuan peraturan ini…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Peristiwa Pencetus</Label>
                  <Select value={form.triggerEvent} onValueChange={v => setForm(p => ({ ...p, triggerEvent: v }))}>
                    <SelectTrigger /><SelectContent>
                      <SelectItem value="kes_baharu">Kes Baharu</SelectItem>
                      <SelectItem value="kes_idle">Kes Idle</SelectItem>
                      <SelectItem value="donasi_terima">Donasi Diterima</SelectItem>
                      <SelectItem value="program_mingguan">Program Mingguan</SelectItem>
                      <SelectItem value="sukarelawan_lulus">Sukarelawan Lulus</SelectItem>
                      <SelectItem value="custom">Peristiwa Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Keutamaan</Label>
                  <Select value={String(form.priority)} onValueChange={v => setForm(p => ({ ...p, priority: Number(v) }))}>
                    <SelectTrigger /><SelectContent>
                      <SelectItem value="1">1 — Tertinggi</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3 — Sederhana</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5 — Terendah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2"><Label>Syarat</Label><Input placeholder="cth: idle > 7 hari" value={form.conditions} onChange={e => setForm(p => ({ ...p, conditions: e.target.value }))} /></div>
              <div className="grid gap-2">
                <Label>Tindakan (satu per baris)</Label>
                <Textarea placeholder={"Hantar notifikasi\nJana dokumen\nKemaskini status"} rows={4} value={form.actions} onChange={e => setForm(p => ({ ...p, actions: e.target.value }))} />
              </div>
              <Button onClick={handleAddRule} disabled={saving} className="gap-2" style={{ backgroundColor: '#4B0082' }}>
                {saving ? 'Menyimpan…' : <><Plus className="h-4 w-4" /> Tambah Peraturan</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
