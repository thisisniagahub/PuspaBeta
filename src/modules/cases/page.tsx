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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { FileText, Search, Plus, Edit, Trash2, Eye, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Case {
  id: string; caseNumber: string; title: string; description?: string; status: string
  priority: string; category: string; amount: number; notes?: string; createdAt: string
}

const statusColor: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
  submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  verifying: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  verified: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  disbursed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  closed: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300',
  rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
}
const priorityColor: Record<string, string> = { urgent: 'text-rose-600', high: 'text-amber-600', normal: 'text-blue-600', low: 'text-gray-600' }

function fmtCurrency(n: number) { return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(n) }

const emptyForm = { title: '', description: '', status: 'draft', priority: 'normal', category: 'zakat', amount: 0, notes: '' }

export default function CasesPage() {
  const [items, setItems] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Case | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [viewCase, setViewCase] = useState<Case | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | boolean> = {}
      if (search) params.search = search
      if (statusFilter !== 'all') params.status = statusFilter
      if (priorityFilter !== 'all') params.priority = priorityFilter
      if (categoryFilter !== 'all') params.category = categoryFilter
      const data = await api.get<Case[]>('/cases', params)
      setItems(Array.isArray(data) ? data : [])
    } catch { toast.error('Gagal memuatkan data kes') } finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, [])

  const handleSave = async () => {
    if (!form.title) { toast.error('Sila isi tajuk kes'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.put('/cases', { id: editing.id, ...form })
        toast.success('Kes berjaya dikemas kini')
      } else {
        await api.post('/cases', form)
        toast.success('Kes berjaya ditambah')
      }
      setDialogOpen(false); setEditing(null); setForm(emptyForm); fetchItems()
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Gagal menyimpan') } finally { setSaving(false) }
  }

  const openDeleteDialog = (id: string) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try { await api.delete('/cases', { id: deletingId }); toast.success('Kes berjaya dipadam'); setDeleteDialogOpen(false); setDeletingId(null); fetchItems() } catch { toast.error('Gagal memadam') }
  }

  const openEdit = (c: Case) => {
    setEditing(c); setForm({ title: c.title, description: c.description || '', status: c.status, priority: c.priority, category: c.category, amount: c.amount, notes: c.notes || '' }); setDialogOpen(true)
  }

  const draftCount = items.filter(c => c.status === 'draft').length
  const waitingCount = items.filter(c => ['submitted', 'verifying'].includes(c.status)).length
  const approvedCount = items.filter(c => c.status === 'approved').length

  if (loading) return <div className="space-y-4 p-6"><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-24 rounded-xl" />)}</div><Skeleton className="h-80 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pengurusan Kes</h1>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }} className="gap-2"><Plus className="h-4 w-4" /> Tambah Kes</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Jumlah Kes', value: items.length, icon: FileText, color: '#7c3aed' },
          { label: 'Draf', value: draftCount, icon: Edit, color: '#6b7280' },
          { label: 'Menunggu', value: waitingCount, icon: Clock, color: '#d97706' },
          { label: 'Diluluskan', value: approvedCount, icon: CheckCircle2, color: '#059669' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cari kes…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="draft">Draf</SelectItem><SelectItem value="submitted">Dihantar</SelectItem><SelectItem value="verifying">Disahkan</SelectItem><SelectItem value="approved">Diluluskan</SelectItem><SelectItem value="rejected">Ditolak</SelectItem><SelectItem value="closed">Ditutup</SelectItem></SelectContent></Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Keutamaan" /></SelectTrigger><SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="urgent">Segera</SelectItem><SelectItem value="high">Tinggi</SelectItem><SelectItem value="normal">Biasa</SelectItem><SelectItem value="low">Rendah</SelectItem></SelectContent></Select>
        <Button variant="outline" onClick={fetchItems}>Cari</Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>No. Kes</TableHead><TableHead>Tajuk</TableHead><TableHead className="hidden md:table-cell">Kategori</TableHead><TableHead>Keutamaan</TableHead><TableHead className="hidden md:table-cell">Jumlah</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Tindakan</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Tiada data kes</TableCell></TableRow>
            ) : items.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.caseNumber}</TableCell>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell className="hidden md:table-cell"><Badge variant="outline">{c.category}</Badge></TableCell>
                <TableCell><span className={`text-sm font-medium ${priorityColor[c.priority] || ''}`}>{c.priority}</span></TableCell>
                <TableCell className="hidden md:table-cell">{fmtCurrency(c.amount)}</TableCell>
                <TableCell><Badge className={statusColor[c.status] || ''}>{c.status}</Badge></TableCell>
                <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewCase(c)} title="Lihat"><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)} title="Edit"><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => openDeleteDialog(c.id)} title="Padam"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-40" />
            <p className="text-lg font-medium">Tiada data kes</p>
            <p className="text-sm">Cuba ubah carian atau tapisan anda</p>
          </div>
        ) : items.map(c => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-muted-foreground">{c.caseNumber}</p>
                  <p className="font-semibold mt-0.5 truncate">{c.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`text-sm font-medium ${priorityColor[c.priority] || ''}`}>{c.priority}</span>
                    <Badge className={statusColor[c.status] || ''}>{c.status}</Badge>
                    <Badge variant="outline">{c.category}</Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium">{fmtCurrency(c.amount)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewCase(c)} title="Lihat"><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)} title="Edit"><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => openDeleteDialog(c.id)} title="Padam"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={!!viewCase} onOpenChange={() => setViewCase(null)}>
        <SheetContent><SheetHeader><SheetTitle>Butiran Kes</SheetTitle><SheetDescription className="sr-only">Maklumat terperinci kes bantuan</SheetDescription></SheetHeader>
          {viewCase && <div className="mt-6 space-y-4">
            <div><p className="text-lg font-bold">{viewCase.title}</p><p className="text-sm text-muted-foreground">{viewCase.caseNumber}</p></div>
            <div className="flex gap-2"><Badge className={statusColor[viewCase.status] || ''}>{viewCase.status}</Badge><Badge variant="outline">{viewCase.priority}</Badge><Badge variant="outline">{viewCase.category}</Badge></div>
            <div><p className="text-xs text-muted-foreground">Jumlah</p><p className="text-lg font-bold">{fmtCurrency(viewCase.amount)}</p></div>
            {viewCase.description && <div><p className="text-xs text-muted-foreground">Penerangan</p><p className="text-sm">{viewCase.description}</p></div>}
            {viewCase.notes && <div><p className="text-xs text-muted-foreground">Catatan</p><p className="text-sm">{viewCase.notes}</p></div>}
            <div><p className="text-xs text-muted-foreground">Dicipta</p><p className="text-sm">{new Date(viewCase.createdAt).toLocaleDateString('ms-MY')}</p></div>
          </div>}
        </SheetContent>
      </Sheet>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Kes' : 'Tambah Kes Baharu'}</DialogTitle><DialogDescription className="sr-only">Borang untuk menambah atau mengedit kes</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Tajuk *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Penerangan</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Kategori</Label><Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}><SelectTrigger /><SelectContent><SelectItem value="zakat">Zakat</SelectItem><SelectItem value="sedekah">Sedekah</SelectItem><SelectItem value="wakaf">Wakaf</SelectItem><SelectItem value="infak">Infak</SelectItem><SelectItem value="government_aid">Bantuan Kerajaan</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label>Keutamaan</Label><Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}><SelectTrigger /><SelectContent><SelectItem value="urgent">Segera</SelectItem><SelectItem value="high">Tinggi</SelectItem><SelectItem value="normal">Biasa</SelectItem><SelectItem value="low">Rendah</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Jumlah (RM)</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}><SelectTrigger /><SelectContent><SelectItem value="draft">Draf</SelectItem><SelectItem value="submitted">Dihantar</SelectItem><SelectItem value="approved">Diluluskan</SelectItem><SelectItem value="closed">Ditutup</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label>Catatan</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Padam Kes</AlertDialogTitle>
            <AlertDialogDescription>Pasti mahu memadam kes ini? Tindakan ini tidak boleh dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-600">Padam</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
