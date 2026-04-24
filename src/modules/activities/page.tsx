'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Activity, Search, Plus, Edit, Trash2, Calendar, MapPin } from 'lucide-react'

interface ActivityItem {
  id: string; title: string; description?: string; type: string
  status: string; date?: string; location?: string; assignees?: string
  notes?: string; createdAt: string
}

const statusColor: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
}
const typeIcon: Record<string, string> = { task: '📋', event: '🎉', meeting: '🤝', fieldwork: '🏃' }

const columns = [
  { key: 'planned', label: 'Dirancang', color: 'border-t-gray-400' },
  { key: 'in_progress', label: 'Dalam Proses', color: 'border-t-blue-500' },
  { key: 'completed', label: 'Selesai', color: 'border-t-emerald-500' },
]

const emptyForm = { title: '', description: '', type: 'task', status: 'planned', date: '', location: '', assignees: '', notes: '' }

export default function ActivitiesPage() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ActivityItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | boolean> = {}
      if (search) params.search = search
      const data = await api.get<ActivityItem[]>('/activities', params)
      setItems(Array.isArray(data) ? data : [])
    } catch { toast.error('Gagal memuatkan data aktiviti') } finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, []) 

  const handleSave = async () => {
    if (!form.title) { toast.error('Sila isi tajuk aktiviti'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.put('/activities', { id: editing.id, ...form })
        toast.success('Aktiviti berjaya dikemas kini')
      } else {
        await api.post('/activities', form)
        toast.success('Aktiviti berjaya ditambah')
      }
      setDialogOpen(false); setEditing(null); setForm(emptyForm); fetchItems()
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Gagal menyimpan') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Pasti mahu memadam aktiviti ini?')) return
    try { await api.delete('/activities', { id }); toast.success('Aktiviti berjaya dipadam'); fetchItems() } catch { toast.error('Gagal memadam') }
  }

  if (loading) return <div className="space-y-4 p-6"><div className="grid grid-cols-1 gap-4 md:grid-cols-3">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-60 rounded-xl" />)}</div></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aktiviti</h1>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }} className="gap-2"><Plus className="h-4 w-4" /> Tambah Aktiviti</Button>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cari aktiviti…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map(col => {
          const colItems = items.filter(i => i.status === col.key)
          return (
            <div key={col.key} className="space-y-3">
              <div className={`rounded-t-lg border-t-4 ${col.color} bg-muted/50 p-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <Badge variant="secondary" className="text-xs">{colItems.length}</Badge>
                </div>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {colItems.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Tiada item</p>
                ) : colItems.map(item => (
                  <Card key={item.id} className="transition-shadow hover:shadow-md cursor-pointer" onClick={() => { setEditing(item); setForm({ title: item.title, description: item.description || '', type: item.type, status: item.status, date: item.date?.split('T')[0] || '', location: item.location || '', assignees: item.assignees || '', notes: item.notes || '' }); setDialogOpen(true) }}>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium">{item.title}</p>
                        <span className="text-xs">{typeIcon[item.type] || '📋'}</span>
                      </div>
                      {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {item.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(item.date).toLocaleDateString('ms-MY')}</span>}
                        {item.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>}
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); handleDelete(item.id) }}><Trash2 className="h-3 w-3 text-rose-600" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Aktiviti' : 'Tambah Aktiviti Baharu'}</DialogTitle><DialogDescription className="sr-only">Borang untuk menambah atau mengedit aktiviti</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Tajuk *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Penerangan</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Jenis</Label><Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}><SelectTrigger /><SelectContent><SelectItem value="task">Tugasan</SelectItem><SelectItem value="event">Acara</SelectItem><SelectItem value="meeting">Mesyuarat</SelectItem><SelectItem value="fieldwork">Kerja Lapangan</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}><SelectTrigger /><SelectContent><SelectItem value="planned">Dirancang</SelectItem><SelectItem value="in_progress">Dalam Proses</SelectItem><SelectItem value="completed">Selesai</SelectItem><SelectItem value="cancelled">Dibatalkan</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Tarikh</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Lokasi</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
            </div>
            <div className="grid gap-2"><Label>Pelaksana</Label><Input value={form.assignees} onChange={e => setForm(p => ({ ...p, assignees: e.target.value }))} placeholder="Nama dipisahkan koma" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
