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
import { Users, Search, Plus, Edit, Trash2, UserCheck, Clock } from 'lucide-react'

interface Volunteer {
  id: string; volunteerNumber: string; name: string; ic: string; phone: string
  email?: string; occupation?: string; skills?: string; availability?: string
  status: string; totalHours: number; joinedAt: string
}

const statusColor: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
  blacklisted: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
}

const emptyForm = { name: '', ic: '', phone: '', email: '', address: '', city: '', state: '', occupation: '', skills: '', availability: 'weekend', emergencyContact: '', emergencyPhone: '', status: 'active', notes: '' }

export default function VolunteersPage() {
  const [items, setItems] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Volunteer | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | boolean> = {}
      if (search) params.search = search
      if (statusFilter !== 'all') params.status = statusFilter
      const data = await api.get<Volunteer[]>('/volunteers', params)
      setItems(Array.isArray(data) ? data : [])
    } catch { toast.error('Gagal memuatkan data sukarelawan') } finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, []) 

  const handleSave = async () => {
    if (!form.name || !form.ic || !form.phone) { toast.error('Sila isi medan wajib'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.put('/volunteers', { id: editing.id, ...form })
        toast.success('Sukarelawan berjaya dikemas kini')
      } else {
        await api.post('/volunteers', form)
        toast.success('Sukarelawan berjaya ditambah')
      }
      setDialogOpen(false); setEditing(null); setForm(emptyForm); fetchItems()
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Gagal menyimpan') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Pasti mahu memadam sukarelawan ini?')) return
    try { await api.delete('/volunteers', { id }); toast.success('Sukarelawan berjaya dipadam'); fetchItems() } catch { toast.error('Gagal memadam') }
  }

  const activeCount = items.filter(v => v.status === 'active').length
  const totalHours = items.reduce((s, v) => s + v.totalHours, 0)

  if (loading) return <div className="space-y-4 p-6"><div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-24 rounded-xl" />)}</div><Skeleton className="h-80 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pengurusan Sukarelawan</h1>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }} className="gap-2"><Plus className="h-4 w-4" /> Tambah Sukarelawan</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { label: 'Jumlah Sukarelawan', value: items.length, icon: Users, color: '#7c3aed' },
          { label: 'Aktif', value: activeCount, icon: UserCheck, color: '#059669' },
          { label: 'Jumlah Jam', value: totalHours, icon: Clock, color: '#0ea5e9' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cari sukarelawan…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="active">Aktif</SelectItem><SelectItem value="inactive">Tidak Aktif</SelectItem><SelectItem value="blacklisted">Senarai Hitam</SelectItem></SelectContent></Select>
        <Button variant="outline" onClick={fetchItems}>Cari</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>No.</TableHead><TableHead>Nama</TableHead><TableHead className="hidden md:table-cell">Telefon</TableHead><TableHead className="hidden lg:table-cell">Kemahiran</TableHead><TableHead className="hidden md:table-cell">Jam</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Tindakan</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Tiada data sukarelawan</TableCell></TableRow>
            ) : items.map(v => (
              <TableRow key={v.id}>
                <TableCell className="font-mono text-xs">{v.volunteerNumber}</TableCell>
                <TableCell className="font-medium">{v.name}</TableCell>
                <TableCell className="hidden md:table-cell text-xs">{v.phone}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs">{v.skills || '—'}</TableCell>
                <TableCell className="hidden md:table-cell">{v.totalHours}j</TableCell>
                <TableCell><Badge className={statusColor[v.status] || ''}>{v.status}</Badge></TableCell>
                <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(v); setForm({ name: v.name, ic: v.ic, phone: v.phone, email: v.email || '', address: '', city: '', state: '', occupation: v.occupation || '', skills: v.skills || '', availability: v.availability || 'weekend', emergencyContact: '', emergencyPhone: '', status: v.status, notes: '' }); setDialogOpen(true) }}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => handleDelete(v.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Sukarelawan' : 'Tambah Sukarelawan Baharu'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Nama *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>No. KP *</Label><Input value={form.ic} onChange={e => setForm(p => ({ ...p, ic: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Telefon *</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div className="grid gap-2"><Label>E-mel</Label><Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Pekerjaan</Label><Input value={form.occupation} onChange={e => setForm(p => ({ ...p, occupation: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Kemahiran</Label><Input value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} placeholder="cth: memasak, mengajar, pandu" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Ketersediaan</Label><Select value={form.availability} onValueChange={v => setForm(p => ({ ...p, availability: v }))}><SelectTrigger /><SelectContent><SelectItem value="weekday">Hari Bekerja</SelectItem><SelectItem value="weekend">Hujung Minggu</SelectItem><SelectItem value="anytime">Bila-bila Masa</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}><SelectTrigger /><SelectContent><SelectItem value="active">Aktif</SelectItem><SelectItem value="inactive">Tidak Aktif</SelectItem></SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
