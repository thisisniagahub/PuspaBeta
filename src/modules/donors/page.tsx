'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Users, Search, Plus, Edit, Trash2, Eye, Heart, DollarSign, UserCheck } from 'lucide-react'

interface Donor {
  id: string; donorNumber: string; name: string; ic?: string; phone?: string; email?: string
  segment: string; totalDonated: number; donationCount: number; status: string
  firstDonationAt?: string; lastDonationAt?: string; notes?: string
}

const segmentColor: Record<string, string> = {
  major: 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary',
  regular: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  occasional: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  lapsed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
}
const segmentLabel: Record<string, string> = { major: 'Utama', regular: 'Biasa', occasional: 'Kadang-kala', lapsed: 'Tidak Aktif' }

function fmtCurrency(n: number) { return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(n) }

const emptyForm = { name: '', ic: '', phone: '', email: '', address: '', city: '', state: '', segment: 'occasional', preferredContact: 'email', isAnonymous: false, notes: '' }

export default function DonorsPage() {
  const [items, setItems] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Donor | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [viewDonor, setViewDonor] = useState<Donor | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | boolean> = {}
      if (search) params.search = search
      if (segmentFilter !== 'all') params.segment = segmentFilter
      if (statusFilter !== 'all') params.status = statusFilter
      const data = await api.get<Donor[]>('/donors', params)
      setItems(Array.isArray(data) ? data : [])
    } catch { toast.error('Gagal memuatkan data penderma') } finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, []) 

  const handleSave = async () => {
    if (!form.name) { toast.error('Sila isi nama penderma'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.put('/donors', { id: editing.id, ...form })
        toast.success('Penderma berjaya dikemas kini')
      } else {
        await api.post('/donors', form)
        toast.success('Penderma berjaya ditambah')
      }
      setDialogOpen(false); setEditing(null); setForm(emptyForm); fetchItems()
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Gagal menyimpan') } finally { setSaving(false) }
  }

  const openDeleteDialog = (id: string) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    try { await api.delete('/donors', { id: deletingId }); toast.success('Penderma berjaya dipadam'); setDeleteDialogOpen(false); setDeletingId(null); fetchItems() } catch { toast.error('Gagal memadam') }
  }

  const openEdit = (d: Donor) => {
    setEditing(d); setForm({ name: d.name, ic: d.ic || '', phone: d.phone || '', email: d.email || '', address: '', city: '', state: '', segment: d.segment, preferredContact: 'email', isAnonymous: false, notes: d.notes || '' }); setDialogOpen(true)
  }

  const totalDonated = items.reduce((s, d) => s + d.totalDonated, 0)
  const activeDonors = items.filter(d => d.status === 'active').length

  if (loading) return <div className="space-y-4 p-6"><div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-24 rounded-xl" />)}</div><Skeleton className="h-80 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pengurusan Penderma</h1>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }} className="gap-2"><Plus className="h-4 w-4" /> Tambah Penderma</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { label: 'Jumlah Penderma', value: items.length, icon: Users, color: '#7c3aed' },
          { label: 'Aktif', value: activeDonors, icon: UserCheck, color: '#059669' },
          { label: 'Jumlah Sumbangan', value: fmtCurrency(totalDonated), icon: DollarSign, color: '#d97706' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cari penderma…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Segmen" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Segmen</SelectItem><SelectItem value="major">Utama</SelectItem><SelectItem value="regular">Biasa</SelectItem><SelectItem value="occasional">Kadang-kala</SelectItem><SelectItem value="lapsed">Tidak Aktif</SelectItem></SelectContent></Select>
        <Button variant="outline" onClick={fetchItems}>Cari</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>No.</TableHead><TableHead>Nama</TableHead><TableHead className="hidden md:table-cell">Telefon</TableHead><TableHead>Segmen</TableHead><TableHead className="hidden md:table-cell">Jumlah Sumbangan</TableHead><TableHead className="hidden lg:table-cell">Kali Terakhir</TableHead><TableHead className="text-right">Tindakan</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Tiada data penderma</TableCell></TableRow>
            ) : items.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs">{d.donorNumber}</TableCell>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="hidden md:table-cell text-xs">{d.phone || '—'}</TableCell>
                <TableCell><Badge className={segmentColor[d.segment] || ''}>{segmentLabel[d.segment] || d.segment}</Badge></TableCell>
                <TableCell className="hidden md:table-cell font-semibold">{fmtCurrency(d.totalDonated)}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs">{d.lastDonationAt ? new Date(d.lastDonationAt).toLocaleDateString('ms-MY') : '—'}</TableCell>
                <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewDonor(d)}><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" title="Padam" onClick={() => openDeleteDialog(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Sheet */}
      <Sheet open={!!viewDonor} onOpenChange={() => setViewDonor(null)}>
        <SheetContent><SheetHeader><SheetTitle>Profil Penderma</SheetTitle><SheetDescription className="sr-only">Maklumat terperinci profil penderma</SheetDescription></SheetHeader>
          {viewDonor && <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <p className="text-lg font-bold">{viewDonor.name}</p>
              <p className="text-sm text-muted-foreground">{viewDonor.donorNumber}</p>
              <Badge className={segmentColor[viewDonor.segment] || ''}>{segmentLabel[viewDonor.segment] || viewDonor.segment}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Jumlah Sumbangan</p><p className="text-lg font-bold">{fmtCurrency(viewDonor.totalDonated)}</p></div>
              <div><p className="text-xs text-muted-foreground">Bilangan Donasi</p><p className="text-lg font-bold">{viewDonor.donationCount}</p></div>
            </div>
            {viewDonor.email && <div><p className="text-xs text-muted-foreground">E-mel</p><p className="text-sm">{viewDonor.email}</p></div>}
            {viewDonor.phone && <div><p className="text-xs text-muted-foreground">Telefon</p><p className="text-sm">{viewDonor.phone}</p></div>}
          </div>}
        </SheetContent>
      </Sheet>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Penderma' : 'Tambah Penderma Baharu'}</DialogTitle><DialogDescription className="sr-only">Borang untuk menambah atau mengedit penderma</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Nama *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>No. KP</Label><Input value={form.ic} onChange={e => setForm(p => ({ ...p, ic: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Telefon</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div className="grid gap-2"><Label>E-mel</Label><Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Segmen</Label><Select value={form.segment} onValueChange={v => setForm(p => ({ ...p, segment: v }))}><SelectTrigger /><SelectContent><SelectItem value="major">Utama</SelectItem><SelectItem value="regular">Biasa</SelectItem><SelectItem value="occasional">Kadang-kala</SelectItem><SelectItem value="lapsed">Tidak Aktif</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2"><Label>Catatan</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Padam Penderma</AlertDialogTitle>
            <AlertDialogDescription>
              Pasti mahu memadam penderma ini? Tindakan ini tidak boleh diundur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Padam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
