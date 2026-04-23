'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Building2, MapPin, Users, Plus, Edit, Trash2, Save } from 'lucide-react'

interface OrgProfile { id: string; legalName: string; tradeName?: string; registrationNumber?: string; phone?: string; email?: string; website?: string; missionStatement?: string; visionStatement?: string }
interface Branch { id: string; name: string; code: string; city?: string; state?: string; phone?: string; isActive: boolean }

export default function AdminPage() {
  const [org, setOrg] = useState<OrgProfile | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [orgForm, setOrgForm] = useState({ legalName: '', tradeName: '', registrationNumber: '', phone: '', email: '', website: '', missionStatement: '', visionStatement: '' })
  const [branchDialog, setBranchDialog] = useState(false)
  const [branchForm, setBranchForm] = useState({ name: '', code: '', city: '', state: '', phone: '' })
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [o, b] = await Promise.allSettled([
        api.get<OrgProfile>('/organization'),
        api.get<Branch[]>('/branches'),
      ])
      if (o.status === 'fulfilled' && o.value) {
        setOrg(o.value)
        setOrgForm({ legalName: o.value.legalName || '', tradeName: o.value.tradeName || '', registrationNumber: o.value.registrationNumber || '', phone: o.value.phone || '', email: o.value.email || '', website: o.value.website || '', missionStatement: o.value.missionStatement || '', visionStatement: o.value.visionStatement || '' })
      }
      if (b.status === 'fulfilled') setBranches(Array.isArray(b.value) ? b.value : [])
    } catch { toast.error('Gagal memuatkan data') } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, []) 

  const saveOrg = async () => {
    setSaving(true)
    try { await api.put('/organization', orgForm); toast.success('Profil organisasi berjaya dikemas kini'); fetchData() } catch { toast.error('Gagal menyimpan') } finally { setSaving(false) }
  }

  const addBranch = async () => {
    if (!branchForm.name || !branchForm.code) { toast.error('Sila isi nama dan kod cawangan'); return }
    setSaving(true)
    try { await api.post('/branches', branchForm); toast.success('Cawangan berjaya ditambah'); setBranchDialog(false); setBranchForm({ name: '', code: '', city: '', state: '', phone: '' }); fetchData() } catch { toast.error('Gagal menambah') } finally { setSaving(false) }
  }

  const deleteBranch = async (id: string) => {
    if (!confirm('Padam cawangan ini?')) return
    try { await api.delete('/branches', { id }); toast.success('Cawangan berjaya dipadam'); fetchData() } catch { toast.error('Gagal memadam') }
  }

  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-60 rounded-xl" /><Skeleton className="h-48 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold">Pentadbiran</h1>

      {/* Org Profile */}
      <Card>
        <CardHeader><div className="flex items-center gap-2"><Building2 className="h-5 w-5" style={{ color: '#4B0082' }} /><CardTitle>Profil Organisasi</CardTitle></div><CardDescription>Maklumat rasmi organisasi</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2"><Label>Nama Undang-undang</Label><Input value={orgForm.legalName} onChange={e => setOrgForm(p => ({ ...p, legalName: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Nama Niaga</Label><Input value={orgForm.tradeName} onChange={e => setOrgForm(p => ({ ...p, tradeName: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>No. Pendaftaran</Label><Input value={orgForm.registrationNumber} onChange={e => setOrgForm(p => ({ ...p, registrationNumber: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Telefon</Label><Input value={orgForm.phone} onChange={e => setOrgForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>E-mel</Label><Input value={orgForm.email} onChange={e => setOrgForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Laman Web</Label><Input value={orgForm.website} onChange={e => setOrgForm(p => ({ ...p, website: e.target.value }))} /></div>
          </div>
          <div className="grid gap-2"><Label>Penyata Misi</Label><Textarea value={orgForm.missionStatement} onChange={e => setOrgForm(p => ({ ...p, missionStatement: e.target.value }))} /></div>
          <div className="grid gap-2"><Label>Penyata Visi</Label><Textarea value={orgForm.visionStatement} onChange={e => setOrgForm(p => ({ ...p, visionStatement: e.target.value }))} /></div>
          <Button onClick={saveOrg} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> Simpan Profil</Button>
        </CardContent>
      </Card>

      {/* Branches */}
      <Card>
        <CardHeader><div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><MapPin className="h-5 w-5" style={{ color: '#4B0082' }} /><CardTitle>Cawangan</CardTitle></div>
          <Button size="sm" className="gap-2" onClick={() => setBranchDialog(true)}><Plus className="h-4 w-4" /> Tambah</Button>
        </div></CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader><TableRow><TableHead>Kod</TableHead><TableHead>Nama</TableHead><TableHead className="hidden md:table-cell">Bandar</TableHead><TableHead className="hidden md:table-cell">Telefon</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Tindakan</TableHead></TableRow></TableHeader>
              <TableBody>
                {branches.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Tiada cawangan</TableCell></TableRow>
                ) : branches.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.code}</TableCell>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{b.city || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{b.phone || '—'}</TableCell>
                    <TableCell><Badge variant={b.isActive ? 'default' : 'secondary'}>{b.isActive ? 'Aktif' : 'Tidak Aktif'}</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => deleteBranch(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Management Placeholder */}
      <Card>
        <CardHeader><div className="flex items-center gap-2"><Users className="h-5 w-5" style={{ color: '#4B0082' }} /><CardTitle>Pengurusan Pengguna</CardTitle></div></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Pengurusan pengguna akan datang dalam versi akan datang.</p></CardContent>
      </Card>

      <Dialog open={branchDialog} onOpenChange={setBranchDialog}>
        <DialogContent><DialogHeader><DialogTitle>Tambah Cawangan</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Nama *</Label><Input value={branchForm.name} onChange={e => setBranchForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Kod *</Label><Input value={branchForm.code} onChange={e => setBranchForm(p => ({ ...p, code: e.target.value }))} placeholder="cth: KL, SEL" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Bandar</Label><Input value={branchForm.city} onChange={e => setBranchForm(p => ({ ...p, city: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Negeri</Label><Input value={branchForm.state} onChange={e => setBranchForm(p => ({ ...p, state: e.target.value }))} /></div>
            </div>
            <div className="grid gap-2"><Label>Telefon</Label><Input value={branchForm.phone} onChange={e => setBranchForm(p => ({ ...p, phone: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setBranchDialog(false)}>Batal</Button><Button onClick={addBranch} disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
