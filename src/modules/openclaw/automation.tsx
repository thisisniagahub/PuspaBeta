'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Workflow, Play, Pause, Clock, Plus, Trash2 } from 'lucide-react'

interface AutomationJob {
  id: string; title: string; description?: string; kind: string; expr?: string
  isEnabled: boolean; domain: string; lastRunAt?: string; nextRunAt?: string; lastResult?: string
}

export default function AutomationPage() {
  const [items, setItems] = useState<AutomationJob[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', kind: 'one_time', expr: '', domain: 'general' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<AutomationJob[]>('/ops/automations')
        if (Array.isArray(data) && data.length > 0) {
          setItems(data)
        } else {
          setItems([
            { id: '1', title: 'Laporan Mingguan Ahli', description: 'Jana ringkasan ahli asnaf setiap Isnin', kind: 'cron', expr: '0 9 * * 1', isEnabled: true, domain: 'reports', lastRunAt: new Date(Date.now() - 86400000).toISOString(), nextRunAt: new Date(Date.now() + 518400000).toISOString(), lastResult: 'success' },
            { id: '2', title: 'Peringatan Donasi Tertunggak', description: 'Hantar peringatan untuk donasi belum disahkan', kind: 'fixed_rate', expr: '86400', isEnabled: true, domain: 'reminders', lastRunAt: new Date().toISOString(), lastResult: 'success' },
            { id: '3', title: 'Backup Data Harian', description: 'Sandaran data pangkalan data setiap hari', kind: 'cron', expr: '0 2 * * *', isEnabled: false, domain: 'general', lastResult: 'failed' },
            { id: '4', title: 'Sync eKYC Pending', description: 'Semak status eKYC menunggu', kind: 'one_time', isEnabled: false, domain: 'cases' },
          ])
        }
      } catch { setItems([]) } finally { setLoading(false) }
    }
    load()
  }, [])

  const handleAdd = async () => {
    if (!form.title) { toast.error('Sila isi nama automasi'); return }
    setSaving(true)
    try {
      await api.post('/ops/automations', form)
      toast.success('Automasi berjaya ditambah')
      setDialogOpen(false); setForm({ title: '', description: '', kind: 'one_time', expr: '', domain: 'general' })
    } catch { toast.error('Gagal menambah') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Padam automasi ini?')) return
    try { await api.delete('/ops/automations', { id }); toast.success('Automasi berjaya dipadam') } catch { toast.error('Gagal memadam') }
  }

  const toggleAutomation = (id: string) => {
    setItems(prev => prev.map(a => a.id === id ? { ...a, isEnabled: !a.isEnabled } : a))
    toast.info('Status automasi dikemas kini')
  }

  const enabledCount = items.filter(a => a.isEnabled).length
  const kindLabel: Record<string, string> = { one_time: 'Sekali', fixed_rate: 'Kadar Tetap', cron: 'Cron' }

  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-60 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Workflow className="h-6 w-6" style={{ color: '#4B0082' }} />
          <h1 className="text-2xl font-bold">Automasi</h1>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Tambah</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(5,150,105,0.1)' }}><Play className="h-5 w-5 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Diaktifkan</p><p className="text-xl font-bold">{enabledCount}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(107,114,128,0.1)' }}><Pause className="h-5 w-5 text-gray-600" /></div>
          <div><p className="text-xs text-muted-foreground">Dilumpuhkan</p><p className="text-xl font-bold">{items.length - enabledCount}</p></div>
        </CardContent></Card>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Jenis</TableHead><TableHead className="hidden md:table-cell">Jadual</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Keputusan Terakhir</TableHead><TableHead className="hidden lg:table-cell">Larian Seterusnya</TableHead><TableHead>Aktif</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map(a => (
              <TableRow key={a.id}>
                <TableCell><div><p className="font-medium">{a.title}</p>{a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}</div></TableCell>
                <TableCell><Badge variant="outline">{kindLabel[a.kind] || a.kind}</Badge></TableCell>
                <TableCell className="hidden md:table-cell font-mono text-xs">{a.expr || '—'}</TableCell>
                <TableCell><Badge variant={a.lastResult === 'success' ? 'default' : a.lastResult === 'failed' ? 'destructive' : 'secondary'}>{a.lastResult || 'baru'}</Badge></TableCell>
                <TableCell className="hidden md:table-cell text-xs">{a.lastRunAt ? new Date(a.lastRunAt).toLocaleString('ms-MY') : '—'}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs">{a.nextRunAt ? new Date(a.nextRunAt).toLocaleString('ms-MY') : '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Switch checked={a.isEnabled} onCheckedChange={() => toggleAutomation(a.id)} />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600" onClick={() => handleDelete(a.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Tambah Automasi</DialogTitle><DialogDescription className="sr-only">Borang untuk menambah automasi baharu</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Nama *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Penerangan</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Jenis</Label><Select value={form.kind} onValueChange={v => setForm(p => ({ ...p, kind: v }))}><SelectTrigger /><SelectContent><SelectItem value="one_time">Sekali</SelectItem><SelectItem value="fixed_rate">Kadar Tetap</SelectItem><SelectItem value="cron">Cron</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label>Jadual</Label><Input value={form.expr} onChange={e => setForm(p => ({ ...p, expr: e.target.value }))} placeholder="0 9 * * 1" /></div>
            </div>
            <div className="grid gap-2"><Label>Domain</Label><Select value={form.domain} onValueChange={v => setForm(p => ({ ...p, domain: v }))}><SelectTrigger /><SelectContent><SelectItem value="general">Umum</SelectItem><SelectItem value="reports">Laporan</SelectItem><SelectItem value="reminders">Peringatan</SelectItem><SelectItem value="cases">Kes</SelectItem><SelectItem value="donors">Penderma</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button><Button onClick={handleAdd} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
