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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Search, Plus, Upload, File, Trash2, Download } from 'lucide-react'

interface Document {
  id: string; title: string; description?: string; category: string
  fileName: string; fileSize: number; status: string; version: number
  uploadedBy?: string; createdAt: string
}

interface DocStat { category: string; count: number }

const categoryLabel: Record<string, string> = { registration: 'Pendaftaran', governance: 'Tadbir Urus', financial: 'Kewangan', compliance: 'Compliance', operations: 'Operasi', programme: 'Program' }

export default function DocumentsPage() {
  const [items, setItems] = useState<Document[]>([])
  const [stats, setStats] = useState<DocStat[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'operations', fileName: 'document.pdf', fileSize: 0 })
  const [saving, setSaving] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | boolean> = {}
      if (search) params.search = search
      if (categoryFilter !== 'all') params.category = categoryFilter
      const [docs, st] = await Promise.allSettled([
        api.get<Document[]>('/documents', params),
        api.get<DocStat[]>('/documents/stats'),
      ])
      if (docs.status === 'fulfilled') setItems(Array.isArray(docs.value) ? docs.value : [])
      if (st.status === 'fulfilled') setStats(Array.isArray(st.value) ? st.value : [])
    } catch { toast.error('Gagal memuatkan data dokumen') } finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, []) 

  const handleAdd = async () => {
    if (!form.title) { toast.error('Sila isi tajuk dokumen'); return }
    setSaving(true)
    try {
      await api.post('/documents', form)
      toast.success('Dokumen berjaya dimuat naik')
      setDialogOpen(false); setForm({ title: '', description: '', category: 'operations', fileName: 'document.pdf', fileSize: 0 }); fetchItems()
    } catch { toast.error('Gagal memuat naik') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Padam dokumen ini?')) return
    try { await api.delete('/documents', { id }); toast.success('Dokumen berjaya dipadam'); fetchItems() } catch { toast.error('Gagal memadam') }
  }

  const formatSize = (b: number) => b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : b >= 1024 ? `${(b / 1024).toFixed(1)} KB` : `${b} B`

  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dokumen</h1>
        <Button onClick={() => setDialogOpen(true)} className="gap-2"><Upload className="h-4 w-4" /> Muat Naik</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Jumlah Dokumen', value: items.length, icon: FileText, color: '#7c3aed' },
          { label: 'Kategori', value: stats.length, icon: File, color: '#059669' },
          { label: 'Saiz Total', value: formatSize(items.reduce((s, d) => s + d.fileSize, 0)), icon: Download, color: '#d97706' },
          { label: 'Versi Terkini', value: items.filter(d => d.version === items.reduce((mx, d2) => Math.max(mx, d2.version), 0)).length, icon: FileText, color: '#0ea5e9' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Cari dokumen…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Kategori" /></SelectTrigger><SelectContent><SelectItem value="all">Semua</SelectItem>{Object.entries(categoryLabel).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
        <Button variant="outline" onClick={fetchItems}>Cari</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Tajuk</TableHead><TableHead>Kategori</TableHead><TableHead className="hidden md:table-cell">Fail</TableHead><TableHead className="hidden md:table-cell">Saiz</TableHead><TableHead className="hidden lg:table-cell">Versi</TableHead><TableHead className="text-right">Tindakan</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Tiada dokumen</TableCell></TableRow>
            ) : items.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.title}</TableCell>
                <TableCell><Badge variant="outline">{categoryLabel[d.category] || d.category}</Badge></TableCell>
                <TableCell className="hidden md:table-cell text-xs">{d.fileName}</TableCell>
                <TableCell className="hidden md:table-cell text-xs">{formatSize(d.fileSize)}</TableCell>
                <TableCell className="hidden lg:table-cell">v{d.version}</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => handleDelete(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Muat Naik Dokumen</DialogTitle><DialogDescription className="sr-only">Borang untuk memuat naik dokumen baharu</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Tajuk *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Kategori</Label><Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}><SelectTrigger /><SelectContent>{Object.entries(categoryLabel).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label>Penerangan</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="rounded-lg border-2 border-dashed p-8 text-center"><Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">Simulasi muat naik fail</p><Button variant="outline" size="sm" className="mt-2" onClick={() => { setForm(p => ({ ...p, fileName: 'uploaded-doc.pdf', fileSize: 256000 })); toast.info('Fail dipilih (simulasi)') }}>Pilih Fail</Button></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button><Button onClick={handleAdd} disabled={saving}>{saving ? 'Menyimpan…' : 'Muat Naik'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
