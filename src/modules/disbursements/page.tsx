'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowRightCircle, Search, Plus, Edit, Trash2, DollarSign, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'

interface Disbursement {
  id: string; disbursementNumber: string; amount: number; purpose: string
  status: string; recipientName: string; recipientIC?: string
  scheduledDate?: string; processedDate?: string; notes?: string; createdAt: string
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  processing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  failed: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
}

function fmtCurrency(n: number) { return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(n) }

const emptyForm = { amount: 0, purpose: '', status: 'pending', recipientName: '', recipientIC: '', recipientBank: '', recipientAcc: '', scheduledDate: '', notes: '' }

export default function DisbursementsPage() {
  const [items, setItems] = useState<Disbursement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Disbursement | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | boolean> = {}
      if (search) params.search = search
      if (statusFilter !== 'all') params.status = statusFilter
      const data = await api.get<Disbursement[]>('/disbursements', params)
      setItems(Array.isArray(data) ? data : [])
    } catch { toast.error('Gagal memuatkan data pembayaran') } finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, []) 

  const handleSave = async () => {
    if (!form.purpose || !form.recipientName || form.amount <= 0) { toast.error('Sila isi medan wajib'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.put('/disbursements', { id: editing.id, ...form })
        toast.success('Pembayaran berjaya dikemas kini')
      } else {
        await api.post('/disbursements', form)
        toast.success('Pembayaran berjaya ditambah')
      }
      setDialogOpen(false); setEditing(null); setForm(emptyForm); fetchItems()
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Gagal menyimpan') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Pasti mahu memadam pembayaran ini?')) return
    try { await api.delete('/disbursements', { id }); toast.success('Pembayaran berjaya dipadam'); fetchItems() } catch { toast.error('Gagal memadam') }
  }

  const totalAmount = items.reduce((s, d) => s + d.amount, 0)
  const pendingCount = items.filter(d => d.status === 'pending').length
  const completedCount = items.filter(d => d.status === 'completed').length

  if (loading) return <div className="space-y-4 p-6"><div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-24 rounded-xl" />)}</div><Skeleton className="h-80 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pengurusan Pembayaran</h1>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }} className="gap-2"><Plus className="h-4 w-4" /> Tambah Pembayaran</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { label: 'Jumlah Pembayaran', value: items.length, icon: ArrowRightCircle, color: '#7c3aed' },
          { label: 'Menunggu', value: pendingCount, icon: Clock, color: '#d97706' },
          { label: 'Jumlah Amount', value: fmtCurrency(totalAmount), icon: DollarSign, color: '#059669' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cari penerima, tujuan…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="pending">Menunggu</SelectItem><SelectItem value="approved">Diluluskan</SelectItem><SelectItem value="completed">Selesai</SelectItem><SelectItem value="failed">Gagal</SelectItem></SelectContent></Select>
        <Button variant="outline" onClick={fetchItems}>Cari</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>No.</TableHead><TableHead>Penerima</TableHead><TableHead>Tujuan</TableHead><TableHead>Jumlah</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Tarikh</TableHead><TableHead className="text-right">Tindakan</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Tiada data pembayaran</TableCell></TableRow>
            ) : items.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs">{d.disbursementNumber}</TableCell>
                <TableCell className="font-medium">{d.recipientName}</TableCell>
                <TableCell className="text-sm">{d.purpose}</TableCell>
                <TableCell className="font-semibold">{fmtCurrency(d.amount)}</TableCell>
                <TableCell><Badge className={statusColor[d.status] || ''}>{d.status}</Badge></TableCell>
                <TableCell className="hidden md:table-cell text-xs">{d.createdAt ? new Date(d.createdAt).toLocaleDateString('ms-MY') : '—'}</TableCell>
                <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(d); setForm({ amount: d.amount, purpose: d.purpose, status: d.status, recipientName: d.recipientName, recipientIC: d.recipientIC || '', recipientBank: '', recipientAcc: '', scheduledDate: d.scheduledDate?.split('T')[0] || '', notes: d.notes || '' }); setDialogOpen(true) }}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => handleDelete(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Pembayaran' : 'Tambah Pembayaran Baharu'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Nama Penerima *</Label><Input value={form.recipientName} onChange={e => setForm(p => ({ ...p, recipientName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Jumlah (RM) *</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}><SelectTrigger /><SelectContent><SelectItem value="pending">Menunggu</SelectItem><SelectItem value="approved">Diluluskan</SelectItem><SelectItem value="completed">Selesai</SelectItem><SelectItem value="failed">Gagal</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label>Tujuan *</Label><Input value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Catatan</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
