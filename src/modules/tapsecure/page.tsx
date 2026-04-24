'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Shield, Smartphone, Monitor, Tablet, Lock, Unlock, Activity, Trash2 } from 'lucide-react'

interface DeviceBinding { id: string; deviceName?: string; deviceType?: string; isPrimary: boolean; isTrusted: boolean; isActive: boolean; ipAddress?: string; lastUsedAt: string; boundAt: string }
interface SecuritySettings { id: string; biometricTransactions: boolean; boundDeviceOnly: boolean; sessionTimeout: number }
interface SecurityLog { id: string; action: string; method?: string; status: string; ipAddress?: string; createdAt: string }

const deviceIcon: Record<string, typeof Smartphone> = { mobile: Smartphone, desktop: Monitor, tablet: Tablet }

export default function TapSecurePage() {
  const [devices, setDevices] = useState<DeviceBinding[]>([])
  const [settings, setSettings] = useState<SecuritySettings | null>(null)
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [d, s, l] = await Promise.allSettled([
        api.get<DeviceBinding[]>('/tapsecure/devices'),
        api.get<SecuritySettings>('/tapsecure/settings'),
        api.get<SecurityLog[]>('/tapsecure/logs'),
      ])
      if (d.status === 'fulfilled') setDevices(Array.isArray(d.value) ? d.value : [])
      if (s.status === 'fulfilled') setSettings(s.value)
      if (l.status === 'fulfilled') setLogs(Array.isArray(l.value) ? l.value : [])
    } catch { toast.error('Gagal memuatkan data keselamatan') } finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, []) 

  const toggleSetting = async (key: keyof SecuritySettings, val: boolean | number) => {
    if (!settings) return
    try {
      await api.put('/tapsecure/settings', { ...settings, [key]: val })
      toast.success('Tetapan berjaya dikemas kini')
      fetchAll()
    } catch { toast.error('Gagal mengemas kini tetapan') }
  }

  const openDeleteDialog = (id: string) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    try { await api.delete('/tapsecure/devices', { id: deletingId }); toast.success('Peranti berjaya dibuang'); fetchAll() } catch { toast.error('Gagal membuang peranti') } finally { setDeleteDialogOpen(false); setDeletingId(null) }
  }

  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-48 rounded-xl" /><Skeleton className="h-48 rounded-xl" /><Skeleton className="h-48 rounded-xl" /></div>

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold">TapSecure — Peranti &amp; Keselamatan</h1>

      {/* Devices */}
      <Card>
        <CardHeader><div className="flex items-center gap-2"><Smartphone className="h-5 w-5" style={{ color: '#4B0082' }} /><CardTitle>Peranti Terikat</CardTitle></div><CardDescription>Maksimum 5 peranti boleh didaftarkan</CardDescription></CardHeader>
        <CardContent>
          {devices.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">Tiada peranti terikat</p> : (
            <div className="space-y-3">
              {devices.map(d => {
                const Icon = deviceIcon[d.deviceType || ''] || Smartphone
                return (
                  <div key={d.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Icon className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2"><p className="text-sm font-medium">{d.deviceName || 'Peranti Tidak Dikenali'}</p>{d.isPrimary && <Badge className="bg-purple-100 text-purple-800 text-[10px]">Utama</Badge>}</div>
                      <p className="text-xs text-muted-foreground">IP: {d.ipAddress || '—'} &bull; Terakhir: {new Date(d.lastUsedAt).toLocaleDateString('ms-MY')}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={d.isTrusted ? 'default' : 'secondary'} className="text-[10px]">{d.isTrusted ? 'Dipercayai' : 'Belum Disahkan'}</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => openDeleteDialog(d.id)} title="Buang"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader><div className="flex items-center gap-2"><Shield className="h-5 w-5" style={{ color: '#4B0082' }} /><CardTitle>Tetapan Keselamatan</CardTitle></div></CardHeader>
        <CardContent className="space-y-4">
          {settings ? (
            <>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><Label className="text-sm font-medium">Pengesahan Biometrik untuk Transaksi</Label><p className="text-xs text-muted-foreground">Memerlukan cap jari/IMEI untuk setiap transaksi</p></div>
                <Switch checked={settings.biometricTransactions} onCheckedChange={v => toggleSetting('biometricTransactions', v)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><Label className="text-sm font-medium">Peranti Terikat Sahaja</Label><p className="text-xs text-muted-foreground">Hanya benarkan akses dari peranti yang didaftarkan</p></div>
                <Switch checked={settings.boundDeviceOnly} onCheckedChange={v => toggleSetting('boundDeviceOnly', v)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><Label className="text-sm font-medium">Sesi Tamat Tempoh (minit)</Label><p className="text-xs text-muted-foreground">Auto log keluar selepas ketidakaktifan</p></div>
                <Badge variant="outline" className="text-sm">{settings.sessionTimeout} min</Badge>
              </div>
            </>
          ) : <p className="text-sm text-muted-foreground">Tiada tetapan keselamatan</p>}
        </CardContent>
      </Card>

      {/* Security Logs */}
      <Card>
        <CardHeader><div className="flex items-center gap-2"><Activity className="h-5 w-5" style={{ color: '#4B0082' }} /><CardTitle>Log Keselamatan</CardTitle></div></CardHeader>
        <CardContent>
          {logs.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">Tiada log</p> : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {logs.map(l => (
                <div key={l.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    {l.status === 'success' ? <Unlock className="h-4 w-4 text-emerald-500" /> : <Lock className="h-4 w-4 text-rose-500" />}
                    <div>
                      <p className="text-sm font-medium">{l.action}</p>
                      <p className="text-xs text-muted-foreground">{l.method || ''} &bull; {l.ipAddress || '—'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleString('ms-MY')}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buang Peranti</AlertDialogTitle>
            <AlertDialogDescription>
              Adakah anda pasti ingin membuang peranti ini? Peranti ini perlu didaftarkan semula untuk akses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Buang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
