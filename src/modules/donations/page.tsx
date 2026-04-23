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
import { HandCoins, Search, Plus, Edit, Trash2, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

interface Donation {
  id: string; donationNumber: string; donorName: string; donorIC?: string; donorEmail?: string
  donorPhone?: string; amount: number; status: string; method: string; fundType: string
  isAnonymous: boolean; notes?: string; donatedAt: string
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  failed: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
}

const fundLabels: Record<string, string> = { zakat: 'Zakat', sadaqah: 'Sadaqah', waqf: 'Wakaf', infaq: 'Infaq', donation_general: 'Am' }
const methodLabels: Record<string, string> = { cash: 'Tunai', bank_transfer: 'Pindahan Bank', online: 'Atas Talian', cheque: 'Cek', ewallet: 'E-Wallet' }

function fmtCurrency(n: number) { return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(n) }

const emptyForm = { donorName: '', donorIC: '', donorEmail: '', donorPhone: '', amount: 0, status: 'pending', method: 'cash', fundType: 'donation_general', isAnonymous: false, notes: '' }

export default function DonationsPage() {
  const [items, setItems] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [fundFilter, setFundFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Donation | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | boolean> = {}
      if (search) params.search = search
      if (statusFilter !== 'all') params.status = statusFilter
      if (fundFilter !== 'all') params.fundType = fundFilter
      if (methodFilter !== 'all') params.method = methodFilter
      const data = await api.get<Donation[]>('/donations', params)
      setItems(Array.isArray(data) ? data : [])
    } catch { toast.error('Gagal memuatkan data donasi') } finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, []) 

  const handleSave = async () => {
    if (!form.donorName || form.amount <= 0) { toast.error('Sila isi medan wajib'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.put('/donations', { id: editing.id, ...form })
        toast.success('Donasi berjaya dikemas kini')
      } else {
        await api.post('/donations', form)
        toast.success('Donasi berjaya ditambah')
      }
      setDialogOpen(false); setEditing(null); setForm(emptyForm); fetchItems()
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Gagal menyimpan') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Pasti mahu memadam donasi ini?')) return
    try { await api.delete('/donations', { id }); toast.success('Donasi berjaya dipadam'); fetchItems() } catch { toast.error('Gagal memadam') }
  }

  const openEdit = (d: Donation) => {
    setEditing(d); setForm({ donorName: d.donorName, donorIC: d.donorIC || '', donorEmail: d.donorEmail || '', donorPhone: d.donorPhone || '', amount: d.amount, status: d.status, method: d.method, fundType: d.fundType, isAnonymous: d.isAnonymous, notes: d.notes || '' }); setDialogOpen(true)
  }

  const totalAmount = items.reduce((s, d) => s + d.amount, 0)
  const pendingCount = items.filter(d => d.status === 'pending').length
  const confirmedCount = items.filter(d => d.status === 'confirmed').length

  if (loading) return <div className="space-y-4 p-6"><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-24 rounded-xl" />)}</div><Skeleton className="h-80 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pengurusan Donasi</h1>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }} className="gap-2"><Plus className="h-4 w-4" /> Tambah Donasi</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Jumlah Donasi', value: items.length, icon: HandCoins, color: '#7c3aed' },
          { label: 'Tertunggak', value: pendingCount, icon: Clock, color: '#d97706' },
          { label: 'Disahkan', value: confirmedCount, icon: CheckCircle, color: '#059669' },
          { label: 'Jumlah Amount', value: fmtCurrency(totalAmount), icon: DollarSign, color: '#0ea5e9' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cari penderma, no. donasi…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Status</SelectItem><SelectItem value="pending">Tertunggak</SelectItem><SelectItem value="confirmed">Disahkan</SelectItem><SelectItem value="failed">Gagal</SelectItem></SelectContent></Select>
        <Select value={fundFilter} onValueChange={setFundFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Jenis Dana" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Dana</SelectItem><SelectItem value="zakat">Zakat</SelectItem><SelectItem value="sadaqah">Sadaqah</SelectItem><SelectItem value="waqf">Wakaf</SelectItem><SelectItem value="infaq">Infaq</SelectItem><SelectItem value="donation_general">Am</SelectItem></SelectContent></Select>
        <Button variant="outline" onClick={fetchItems}>Cari</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>No. Donasi</TableHead><TableHead>Penderma</TableHead><TableHead>Jumlah</TableHead><TableHead className="hidden md:table-cell">Jenis Dana</TableHead><TableHead className="hidden lg:table-cell">Kaedah</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Tarikh</TableHead><TableHead className="text-right">Tindakan</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">Tiada data donasi</TableCell></TableRow>
            ) : items.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs">{d.donationNumber}</TableCell>
                <TableCell className="font-medium">{d.isAnonymous ? 'Anonim' : d.donorName}</TableCell>
                <TableCell className="font-semibold">{fmtCurrency(d.amount)}</TableCell>
                <TableCell className="hidden md:table-cell"><Badge variant="outline">{fundLabels[d.fundType] || d.fundType}</Badge></TableCell>
                <TableCell className="hidden lg:table-cell text-xs">{methodLabels[d.method] || d.method}</TableCell>
                <TableCell><Badge className={statusColor[d.status] || ''}>{d.status}</Badge></TableCell>
                <TableCell className="hidden md:table-cell text-xs">{new Date(d.donatedAt).toLocaleDateString('ms-MY')}</TableCell>
                <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => handleDelete(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Donasi' : 'Tambah Donasi Baharu'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Nama Penderma *</Label><Input value={form.donorName} onChange={e => setForm(p => ({ ...p, donorName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Jumlah (RM) *</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label>Jenis Dana</Label><Select value={form.fundType} onValueChange={v => setForm(p => ({ ...p, fundType: v }))}><SelectTrigger /><SelectContent><SelectItem value="zakat">Zakat</SelectItem><SelectItem value="sadaqah">Sadaqah</SelectItem><SelectItem value="waqf">Wakaf</SelectItem><SelectItem value="infaq">Infaq</SelectItem><SelectItem value="donation_general">Am</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Kaedah</Label><Select value={form.method} onValueChange={v => setForm(p => ({ ...p, method: v }))}><SelectTrigger /><SelectContent><SelectItem value="cash">Tunai</SelectItem><SelectItem value="bank_transfer">Pindahan Bank</SelectItem><SelectItem value="online">Atas Talian</SelectItem><SelectItem value="cheque">Cek</SelectItem><SelectItem value="ewallet">E-Wallet</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}><SelectTrigger /><SelectContent><SelectItem value="pending">Tertunggak</SelectItem><SelectItem value="confirmed">Disahkan</SelectItem><SelectItem value="failed">Gagal</SelectItem><SelectItem value="refunded">Dikembalikan</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label>Catatan</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
