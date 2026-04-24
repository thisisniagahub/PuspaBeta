'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShieldCheck, Building2, Users, Handshake, Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react'

interface ComplianceItem { id: string; category: string; item: string; description?: string; isCompleted: boolean; completedAt?: string; evidenceUrl?: string; notes?: string }
interface OrgProfile { id: string; legalName: string; registrationNumber?: string; email?: string; phone?: string; website?: string; missionStatement?: string }
interface BoardMember { id: string; name: string; role: string; title?: string; isCurrent: boolean }
interface Partner { id: string; name: string; type: string; contactPerson?: string; verifiedStatus: string }

const categoryLabel: Record<string, string> = { registration: 'Pendaftaran', governance: 'Tadbir Urus', financial: 'Kewangan', programme: 'Program', transparency: 'Ketelusan' }

export default function CompliancePage() {
  const [items, setItems] = useState<ComplianceItem[]>([])
  const [org, setOrg] = useState<OrgProfile | null>(null)
  const [board, setBoard] = useState<BoardMember[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ category: 'registration', item: '', description: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [c, o, b, p] = await Promise.allSettled([
        api.get<ComplianceItem[]>('/compliance'),
        api.get<OrgProfile>('/organization'),
        api.get<BoardMember[]>('/board-members'),
        api.get<Partner[]>('/partners'),
      ])
      if (c.status === 'fulfilled') setItems(Array.isArray(c.value) ? c.value : [])
      if (o.status === 'fulfilled') setOrg(o.value)
      if (b.status === 'fulfilled') setBoard(Array.isArray(b.value) ? b.value : [])
      if (p.status === 'fulfilled') setPartners(Array.isArray(p.value) ? p.value : [])
    } catch { toast.error('Gagal memuatkan data compliance') } finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, []) 

  const handleToggle = async (item: ComplianceItem) => {
    try {
      await api.put('/compliance', { id: item.id, isCompleted: !item.isCompleted })
      toast.success(item.isCompleted ? 'Item ditanda belum selesai' : 'Item ditanda selesai')
      fetchAll()
    } catch { toast.error('Gagal mengemas kini') }
  }

  const handleAdd = async () => {
    if (!form.item) { toast.error('Sila isi nama item'); return }
    setSaving(true)
    try {
      await api.post('/compliance', form)
      toast.success('Item berjaya ditambah')
      setDialogOpen(false); setForm({ category: 'registration', item: '', description: '', notes: '' }); fetchAll()
    } catch { toast.error('Gagal menambah') } finally { setSaving(false) }
  }

  const openDeleteDialog = (id: string) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    try { await api.delete('/compliance', { id: deletingId }); toast.success('Item berjaya dipadam'); setDeleteDialogOpen(false); setDeletingId(null); fetchAll() } catch { toast.error('Gagal memadam') }
  }

  const completed = items.filter(i => i.isCompleted).length
  const pct = items.length > 0 ? Math.round((completed / items.length) * 100) : 0

  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-48 rounded-xl" /><Skeleton className="h-60 rounded-xl" /><Skeleton className="h-48 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compliance</h1>
        <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Tambah Item</Button>
      </div>

      {/* Org Profile */}
      {org && (
        <Card>
          <CardHeader><div className="flex items-center gap-2"><Building2 className="h-5 w-5" style={{ color: '#4B0082' }} /><CardTitle>Profil Organisasi</CardTitle></div></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div><p className="text-xs text-muted-foreground">Nama Undang-undang</p><p className="font-medium">{org.legalName}</p></div>
            <div><p className="text-xs text-muted-foreground">No. Pendaftaran</p><p className="font-medium">{org.registrationNumber || '—'}</p></div>
            <div><p className="text-xs text-muted-foreground">E-mel</p><p className="font-medium">{org.email || '—'}</p></div>
            <div><p className="text-xs text-muted-foreground">Telefon</p><p className="font-medium">{org.phone || '—'}</p></div>
            {org.missionStatement && <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">Misi</p><p className="text-sm">{org.missionStatement}</p></div>}
          </CardContent>
        </Card>
      )}

      {/* Compliance Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Senarai Semak Pematuhan</CardTitle><CardDescription>{completed} daripada {items.length} item selesai</CardDescription></div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" style={{ color: pct >= 80 ? '#059669' : pct >= 50 ? '#d97706' : '#e11d48' }} /><span className="text-2xl font-bold">{pct}%</span></div>
          </div>
          <Progress value={pct} className="h-2 mt-2" />
        </CardHeader>
        <CardContent>
          {Object.entries(categoryLabel).map(([cat, label]) => {
            const catItems = items.filter(i => i.category === cat)
            if (catItems.length === 0) return null
            return (
              <div key={cat} className="mb-4 last:mb-0">
                <h3 className="mb-2 text-sm font-semibold">{label}</h3>
                <div className="space-y-2">
                  {catItems.map(item => (
                    <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                      <button onClick={() => handleToggle(item)} className="mt-0.5 shrink-0">
                        {item.isCompleted ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm', item.isCompleted && 'line-through text-muted-foreground')}>{item.item}</p>
                        {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-rose-600" title="Padam" onClick={() => openDeleteDialog(item.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Board Members & Partners */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><div className="flex items-center gap-2"><Users className="h-5 w-5" style={{ color: '#4B0082' }} /><CardTitle>Ahli Lembaga</CardTitle></div></CardHeader>
          <CardContent>
            {board.length === 0 ? <p className="text-sm text-muted-foreground">Tiada ahli lembaga</p> : (
              <div className="space-y-2">
                {board.filter(b => b.isCurrent).map(b => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div><p className="text-sm font-medium">{b.name}</p><Badge variant="outline" className="text-[10px]">{b.role}</Badge></div>
                    {b.title && <span className="text-xs text-muted-foreground">{b.title}</span>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center gap-2"><Handshake className="h-5 w-5" style={{ color: '#4B0082' }} /><CardTitle>Rakan Kongsi</CardTitle></div></CardHeader>
          <CardContent>
            {partners.length === 0 ? <p className="text-sm text-muted-foreground">Tiada rakan kongsi</p> : (
              <div className="space-y-2">
                {partners.map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div><p className="text-sm font-medium">{p.name}</p><Badge variant="outline" className="text-[10px]">{p.type}</Badge></div>
                    <Badge variant="secondary" className="text-[10px]">{p.verifiedStatus}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Tambah Item Compliance</DialogTitle><DialogDescription className="sr-only">Borang untuk menambah item pematuhan baharu</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Kategori</Label><Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}><SelectTrigger /><SelectContent>{Object.entries(categoryLabel).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label>Item *</Label><Input value={form.item} onChange={e => setForm(p => ({ ...p, item: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Penerangan</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button><Button onClick={handleAdd} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Padam Item</AlertDialogTitle>
            <AlertDialogDescription>
              Padam item ini? Tindakan ini tidak boleh diundur.
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


