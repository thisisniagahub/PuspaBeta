'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ShieldCheck, ShieldAlert, Clock, CheckCircle2, XCircle, Eye } from 'lucide-react'

interface EKYCRecord {
  id: string; memberId: string; icName?: string; icNumber?: string
  status: string; livenessScore?: number; faceMatchScore?: number
  rejectionReason?: string; riskLevel?: string; verifiedAt?: string; createdAt: string
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
}

export default function EKYCPage() {
  const [items, setItems] = useState<EKYCRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number | boolean> = {}
      if (statusFilter !== 'all') params.status = statusFilter
      const data = await api.get<EKYCRecord[]>('/ekyc', params)
      setItems(Array.isArray(data) ? data : [])
    } catch { toast.error('Gagal memuatkan data eKYC') } finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, []) 

  const handleVerify = async (id: string) => {
    try { await api.post('/ekyc/verify', { id }); toast.success('Pengesahan berjaya'); fetchItems() } catch { toast.error('Gagal mengesahkan') }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Sebab penolakan:')
    if (!reason) return
    try { await api.post('/ekyc/reject', { id, rejectionReason: reason }); toast.success('Permohonan ditolak'); fetchItems() } catch { toast.error('Gagal menolak') }
  }

  const pendingCount = items.filter(i => i.status === 'pending').length
  const verifiedCount = items.filter(i => i.status === 'verified').length
  const rejectedCount = items.filter(i => i.status === 'rejected').length

  if (loading) return <div className="space-y-4 p-6"><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-24 rounded-xl" />)}</div><Skeleton className="h-80 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold">eKYC — Pengesahan Identiti</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Jumlah', value: items.length, icon: ShieldCheck, color: '#7c3aed' },
          { label: 'Menunggu', value: pendingCount, icon: Clock, color: '#d97706' },
          { label: 'Disahkan', value: verifiedCount, icon: CheckCircle2, color: '#059669' },
          { label: 'Ditolak', value: rejectedCount, icon: XCircle, color: '#e11d48' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>ID</TableHead><TableHead>Nama</TableHead><TableHead className="hidden md:table-cell">No. KP</TableHead><TableHead className="hidden md:table-cell">Skor</TableHead><TableHead>Status</TableHead><TableHead className="hidden lg:table-cell">Risiko</TableHead><TableHead className="text-right">Tindakan</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Tiada rekod eKYC</TableCell></TableRow>
            ) : items.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.id.slice(0,8)}</TableCell>
                <TableCell className="font-medium">{r.icName || '—'}</TableCell>
                <TableCell className="hidden md:table-cell text-xs">{r.icNumber || '—'}</TableCell>
                <TableCell className="hidden md:table-cell text-xs">
                  {r.livenessScore != null ? `${(r.livenessScore * 100).toFixed(0)}%` : '—'}
                </TableCell>
                <TableCell><Badge className={statusColor[r.status] || ''}>{r.status}</Badge></TableCell>
                <TableCell className="hidden lg:table-cell"><Badge variant="outline" className={r.riskLevel === 'high' ? 'text-rose-600' : r.riskLevel === 'medium' ? 'text-amber-600' : 'text-emerald-600'}>{r.riskLevel || '—'}</Badge></TableCell>
                <TableCell className="text-right">
                  {r.status === 'pending' && (
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => handleVerify(r.id)}><CheckCircle2 className="h-3 w-3" /> Sahkan</Button>
                      <Button size="sm" variant="destructive" className="h-7 gap-1 text-xs" onClick={() => handleReject(r.id)}><XCircle className="h-3 w-3" /> Tolak</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
