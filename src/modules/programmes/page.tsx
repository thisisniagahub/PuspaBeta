'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Heart, Search, Plus, Edit, Trash2, Calendar, MapPin, Users, DollarSign } from 'lucide-react'

interface Programme {
  id: string; name: string; description?: string; category: string; status: string
  startDate?: string; endDate?: string; location?: string; targetBeneficiaries?: number
  actualBeneficiaries: number; budget: number; totalSpent: number; notes?: string
}

const statusColor: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  suspended: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  planned: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
}
const categoryLabel: Record<string, string> = { food_aid: 'Bantuan Makanan', education: 'Pendidikan', skills_training: 'Latihan Kemahiran', healthcare: 'Kesihatan', financial_assistance: 'Bantuan Kewangan', community: 'Komuniti', emergency_relief: 'Bantuan Kecemasan', dawah: 'Dakwah' }

function fmtCurrency(n: number) { return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(n) }

const emptyForm = { name: '', description: '', category: 'food_aid', status: 'planned', startDate: '', endDate: '', location: '', targetBeneficiaries: 0, budget: 0, notes: '' }

export default function ProgrammesPage() {
  const [items, setItems] = useState<Programme[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Programme | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | boolean> = {}
      if (search) params.search = search
      if (statusFilter !== 'all') params.status = statusFilter
      if (categoryFilter !== 'all') params.category = categoryFilter
      const data = await api.get<Programme[]>('/programmes', params)
      setItems(Array.isArray(data) ? data : [])
    } catch { toast.error('Gagal memuatkan data program') } finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, []) 

  const handleSave = async () => {
    if (!form.name) { toast.error('Sila isi nama program'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.put('/programmes', { id: editing.id, ...form })
        toast.success('Program berjaya dikemas kini')
      } else {
        await api.post('/programmes', form)
        toast.success('Program berjaya ditambah')
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
    try { await api.delete('/programmes', { id: deletingId }); toast.success('Program berjaya dipadam'); setDeleteDialogOpen(false); setDeletingId(null); fetchItems() } catch { toast.error('Gagal memadam') }
  }

  const activeCount = items.filter(p => p.status === 'active').length
  const completedCount = items.filter(p => p.status === 'completed').length

  if (loading) return <div className="space-y-4 p-6"><div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-24 rounded-xl" />)}</div><div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-48 rounded-xl" />)}</div></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pengurusan Program</h1>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }} className="gap-2"><Plus className="h-4 w-4" /> Tambah Program</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { label: 'Jumlah Program', value: items.length, icon: Heart, color: '#7c3aed' },
          { label: 'Aktif', value: activeCount, icon: Calendar, color: '#059669' },
          { label: 'Selesai', value: completedCount, icon: Heart, color: '#0ea5e9' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cari program…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="active">Aktif</SelectItem><SelectItem value="completed">Selesai</SelectItem><SelectItem value="suspended">Digantung</SelectItem><SelectItem value="planned">Dirancang</SelectItem></SelectContent></Select>
        <Button variant="outline" onClick={fetchItems}>Cari</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">Tiada data program</div>
        ) : items.map(p => (
          <Card key={p.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0"><CardTitle className="text-base">{p.name}</CardTitle><CardDescription className="mt-1">{categoryLabel[p.category] || p.category}</CardDescription></div>
                <Badge className={statusColor[p.status] || ''}>{p.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {p.description && <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {p.location && <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{p.location}</div>}
                <div className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" />{p.actualBeneficiaries}/{p.targetBeneficiaries || '—'}</div>
                <div className="flex items-center gap-1 text-muted-foreground"><DollarSign className="h-3 w-3" />{fmtCurrency(p.budget)}</div>
                {p.startDate && <div className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" />{new Date(p.startDate).toLocaleDateString('ms-MY')}</div>}
              </div>
              <div className="flex items-center justify-end gap-1 pt-2 border-t">
                <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => { setEditing(p); setForm({ name: p.name, description: p.description || '', category: p.category, status: p.status, startDate: p.startDate?.split('T')[0] || '', endDate: p.endDate?.split('T')[0] || '', location: p.location || '', targetBeneficiaries: p.targetBeneficiaries || 0, budget: p.budget, notes: p.notes || '' }); setDialogOpen(true) }}><Edit className="h-3 w-3" /> Edit</Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-rose-600" title="Padam" onClick={() => openDeleteDialog(p.id)}><Trash2 className="h-3 w-3" /> Padam</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Program' : 'Tambah Program Baharu'}</DialogTitle><DialogDescription className="sr-only">Borang untuk menambah atau mengedit program</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Nama Program *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Penerangan</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Kategori</Label><Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}><SelectTrigger /><SelectContent>{Object.entries(categoryLabel).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}><SelectTrigger /><SelectContent><SelectItem value="planned">Dirancang</SelectItem><SelectItem value="active">Aktif</SelectItem><SelectItem value="completed">Selesai</SelectItem><SelectItem value="suspended">Digantung</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Tarikh Mula</Label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Tarikh Akhir</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
            </div>
            <div className="grid gap-2"><Label>Lokasi</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Sasaran Penerima</Label><Input type="number" value={form.targetBeneficiaries} onChange={e => setForm(p => ({ ...p, targetBeneficiaries: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label>Bajet (RM)</Label><Input type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: Number(e.target.value) }))} /></div>
            </div>
            <div className="grid gap-2"><Label>Catatan</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Padam Program</AlertDialogTitle>
            <AlertDialogDescription>
              Pasti mahu memadam program ini? Tindakan ini tidak boleh diundur.
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
